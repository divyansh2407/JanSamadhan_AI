/**
 * JanSamadhan – Problem Management Controller (PostgreSQL / Prisma ORM)
 * Comprehensive civic issue submission, triage, filtering, and role-based updates.
 */

const { prisma } = require('../config/db');

const VALID_STATUSES = ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const VALID_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

/**
 * @route   GET /api/problems
 * @desc    Get all problems with pagination, filtering, and sorting
 * @access  Public (or Authenticated)
 */
const getProblems = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      categoryId,
      status,
      severity,
      priority,
      city,
      reportedBy,
      myReports,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (categoryId) where.categoryId = categoryId;
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      where.status = status.toUpperCase();
    }
    if (severity && VALID_SEVERITIES.includes(severity.toUpperCase())) {
      where.severity = severity.toUpperCase();
    }
    if (priority && VALID_PRIORITIES.includes(priority.toUpperCase())) {
      where.priority = priority.toUpperCase();
    }
    if (city) {
      where.city = { contains: city.trim(), mode: 'insensitive' };
    }

    // Filter by reporter
    if (myReports === 'true' && req.user) {
      where.reportedBy = req.user.id;
    } else if (reportedBy) {
      where.reportedBy = reportedBy;
    }

    // Safe sorting fields
    const validSortFields = ['createdAt', 'updatedAt', 'severity', 'priority', 'status', 'city'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, problems] = await Promise.all([
      prisma.problem.count({ where }),
      prisma.problem.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortField]: sortOrder },
        include: {
          category: {
            select: { id: true, name: true, icon: true },
          },
          reporter: {
            select: { id: true, name: true, role: true, email: true },
          },
          assignedDepartment: {
            select: { id: true, name: true, departmentCode: true, city: true },
          },
          _count: {
            select: {
              solutionProposals: true,
              implementationTasks: true,
              feedbacks: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      problems,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/problems/:id
 * @desc    Get detailed civic problem report by ID
 * @access  Public (or Authenticated)
 */
const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
        reporter: {
          select: { id: true, name: true, email: true, phone: true, role: true },
        },

        assignedDepartment: true,
        aiAnalyses: {
          orderBy: { createdAt: 'desc' },
        },
        solutionProposals: {
          include: {
            submitter: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        implementationTasks: {
          include: {
            assignee: {
              select: { id: true, name: true, role: true },
            },
            assignedDepartment: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        feedbacks: {
          include: {
            submitter: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem report with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      problem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/problems
 * @desc    Submit a new civic problem report
 * @access  Private (Authenticated users / CITIZEN)
 */
const createProblem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      address,
      city,
      state,
      pincode,
      wardId,
      latitude,
      longitude,
      severity = 'MEDIUM',
      priority = 'MEDIUM',
      imageUrl,
    } = req.body;


    // Validation
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }
    if (!categoryId) {
      errors.push('A valid categoryId is required');
    }
    if (!address || !city || !state || !pincode) {
      errors.push('Address, city, state, and 6-digit pincode are required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    // Verify category exists
    const category = await prisma.problemCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Specified category does not exist',
      });
    }

    const validatedSeverity = VALID_SEVERITIES.includes(severity?.toUpperCase())
      ? severity.toUpperCase()
      : 'MEDIUM';
    const validatedPriority = VALID_PRIORITIES.includes(priority?.toUpperCase())
      ? priority.toUpperCase()
      : 'MEDIUM';

    const newProblem = await prisma.$transaction(async (tx) => {
      const problem = await tx.problem.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          categoryId,
          reportedBy: req.user.id,
          isAnonymous: false,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          wardId: wardId || null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          severity: validatedSeverity,
          priority: validatedPriority,
          status: 'SUBMITTED',
          isVerified: false,
        },
        include: {
          category: true,
          reporter: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      if (imageUrl) {
        await tx.problemImage.create({
          data: {
            problemId: problem.id,
            imageUrl,
            stage: 'INTAKE',
            caption: 'Citizen uploaded evidence',
          },
        });
      }

      await tx.problemStatusHistory.create({
        data: {
          problemId: problem.id,
          fromStatus: 'SUBMITTED',
          toStatus: 'SUBMITTED',
          changedBy: req.user.id,
          remarks: 'Registered citizen problem submitted.',
        },
      });

      return problem;
    });

    res.status(201).json({
      success: true,
      message: 'Civic problem reported successfully',
      problem: newProblem,
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/problems/:id
 * @desc    Update problem (Author can update description/address; Authority can update status/priority/department)
 * @access  Private
 */
const updateProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem report with ID ${id} not found`,
      });
    }

    const isAuthor = problem.reportedBy === user.id;
    const isGovOrAdmin = ['GOVERNMENT', 'SUPER_ADMIN'].includes(user.role);

    if (!isAuthor && !isGovOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this report',
      });
    }

    const updateData = {};

    // Citizen author updates (only permitted if still in SUBMITTED state)
    if (isAuthor) {
      if (problem.status !== 'SUBMITTED') {
        return res.status(400).json({
          success: false,
          message: 'Citizens can only edit reports while they are in SUBMITTED status',
        });
      }

      const { title, description, address, city, state, pincode, latitude, longitude } = req.body;
      if (title) updateData.title = title.trim();
      if (description) updateData.description = description.trim();
      if (address) updateData.address = address.trim();
      if (city) updateData.city = city.trim();
      if (state) updateData.state = state.trim();
      if (pincode) updateData.pincode = pincode.trim();
      if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
      if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    }

    // Administrative updates (Government / Super Admin)
    if (isGovOrAdmin) {
      const { status, priority, severity, assignedDepartmentId, isVerified } = req.body;

      if (status && VALID_STATUSES.includes(status.toUpperCase())) {
        updateData.status = status.toUpperCase();
      }
      if (priority && VALID_PRIORITIES.includes(priority.toUpperCase())) {
        updateData.priority = priority.toUpperCase();
      }
      if (severity && VALID_SEVERITIES.includes(severity.toUpperCase())) {
        updateData.severity = severity.toUpperCase();
      }
      if (isVerified !== undefined) {
        updateData.isVerified = Boolean(isVerified);
      }
      if (assignedDepartmentId !== undefined) {
        if (assignedDepartmentId) {
          const dept = await prisma.department.findUnique({ where: { id: assignedDepartmentId } });
          if (!dept) {
            return res.status(404).json({
              success: false,
              message: 'Assigned department does not exist',
            });
          }
          updateData.assignedDepartmentId = assignedDepartmentId;
        } else {
          updateData.assignedDepartmentId = null;
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid update fields provided for your role permissions',
      });
    }

    const updated = await prisma.problem.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        assignedDepartment: true,
        reporter: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Problem report updated successfully',
      problem: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/problems/:id
 * @desc    Delete problem report (Author if SUBMITTED, or SUPER_ADMIN)
 * @access  Private
 */
const deleteProblem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const problem = await prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: `Problem report with ID ${id} not found`,
      });
    }

    const isAuthor = problem.reportedBy === user.id;
    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    if (!isSuperAdmin && (!isAuthor || problem.status !== 'SUBMITTED')) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own report while it is in SUBMITTED status',
      });
    }

    await prisma.problem.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Problem report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
};

