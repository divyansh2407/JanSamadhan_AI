/**
 * JanSamadhan – Reports & Complaints Controller (Sections 4, 5, 8)
 * Handles complaint registration, unique non-sequential tracking ID generation,
 * user-specific report listing, single report tracking, and email dispatch.
 */

const crypto = require('crypto');
const { prisma } = require('../config/db');
const offlineStore = require('../config/offlineStore');
const { sendComplaintConfirmationEmail } = require('../services/emailService');
const { analyzeProblemAsync } = require('../services/aiAnalysisService');

function isDbOffline(err) {
  return (
    err.code === 'P1001' ||
    err.name?.includes('Prisma') ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}

/**
 * Generates a unique, non-sequential tracking ID (e.g. JS-2026-A8F42K9)
 * and verifies uniqueness in database to avoid collisions.
 */
async function generateUniqueTrackingId() {
  const currentYear = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Unambiguous alphanumeric

  for (let attempt = 0; attempt < 5; attempt++) {
    let code = '';
    const bytes = crypto.randomBytes(7);
    for (let i = 0; i < 7; i++) {
      code += chars[bytes[i] % chars.length];
    }
    const trackingId = `JS-${currentYear}-${code}`;

    try {
      const existing = await prisma.problem.findUnique({
        where: { trackingNumber: trackingId },
        select: { id: true },
      });
      if (!existing) {
        return trackingId;
      }
    } catch (err) {
      if (isDbOffline(err)) {
        return trackingId;
      }
      return trackingId;
    }
  }

  // Fallback high-entropy code
  return `JS-${currentYear}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

/**
 * @route   POST /api/reports
 * @desc    Submit a civic complaint (Authenticated)
 * @access  Private
 */
const submitReport = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      category: categoryNameInput,
      city = 'Pune',
      ward = '',
      wardId,
      location,
      address,
      landmark,
      state = 'Maharashtra',
      pincode = '411001',
      latitude,
      longitude,
      imageUrl,
      imageUrls = [],
      severity = 'MEDIUM',
      priority = 'MEDIUM',
    } = req.body;

    const reporterId = req.user.id;
    const reporterEmail = req.user.email;
    const reporterName = req.user.name;

    // 1. Validation
    const errors = [];
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      errors.push('Problem title must be at least 5 characters long');
    }
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      errors.push('Problem description must be at least 10 characters long');
    }

    const fullLocation = (location || address || '').trim();
    if (!fullLocation) {
      errors.push('Location or address description is required');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    // 2. Resolve Category
    let resolvedCategoryId = categoryId;
    let resolvedCategoryName = categoryNameInput || 'Civic Infrastructure';

    try {
      if (resolvedCategoryId) {
        let cat = await prisma.problemCategory.findUnique({
          where: { id: resolvedCategoryId },
        });
        if (cat) {
          resolvedCategoryName = cat.name;
        } else {
          // If ID was an offline slug (e.g. 'cat-electricity'), match by name or fallback to active category
          cat = await prisma.problemCategory.findFirst({
            where: { isActive: true },
          });
          if (cat) {
            resolvedCategoryId = cat.id;
            resolvedCategoryName = cat.name;
          }
        }
      } else {
        // Resolve by name or fallback to first active category
        const cat = await prisma.problemCategory.findFirst({
          where: categoryNameInput
            ? { name: { contains: categoryNameInput.trim(), mode: 'insensitive' } }
            : { isActive: true },
        });
        if (cat) {
          resolvedCategoryId = cat.id;
          resolvedCategoryName = cat.name;
        } else {
          // Create default category if none exists
          const defaultCat = await prisma.problemCategory.create({
            data: {
              name: categoryNameInput?.trim() || 'General Civic Issues',
              description: 'General public infrastructure issues',
              icon: 'AlertCircle',
            },
          });
          resolvedCategoryId = defaultCat.id;
          resolvedCategoryName = defaultCat.name;
        }
      }
    } catch (catErr) {
      if (!isDbOffline(catErr)) throw catErr;
      resolvedCategoryId = resolvedCategoryId || 'cat-fallback-01';
    }

    // 3. Generate Non-Sequential Unique Tracking ID
    const trackingId = await generateUniqueTrackingId();

    // 4. Save to PostgreSQL via Prisma transaction
    let newProblem;
    try {
      newProblem = await prisma.$transaction(async (tx) => {
        const problem = await tx.problem.create({
          data: {
            trackingNumber: trackingId,
            title: title.trim(),
            description: description.trim(),
            categoryId: resolvedCategoryId,
            reportedBy: reporterId,
            isAnonymous: false,
            address: fullLocation,
            landmark: landmark ? landmark.trim() : null,
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
            wardId: wardId || null,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity?.toUpperCase())
              ? severity.toUpperCase()
              : 'MEDIUM',
            priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority?.toUpperCase())
              ? priority.toUpperCase()
              : 'MEDIUM',
            status: 'SUBMITTED',
            isVerified: false,
          },
          include: {
            category: true,
          },
        });

        // Initial immutable status history entry
        await tx.problemStatusHistory.create({
          data: {
            problemId: problem.id,
            fromStatus: 'SUBMITTED',
            toStatus: 'SUBMITTED',
            changedBy: reporterId,
            remarks: 'Complaint registered by citizen via JanSamadhan platform',
          },
        });

        // Store evidence images
        const allImages = [];
        if (imageUrl) allImages.push(imageUrl);
        if (Array.isArray(imageUrls)) {
          imageUrls.forEach((u) => {
            if (u && !allImages.includes(u)) allImages.push(u);
          });
        }

        for (const img of allImages) {
          await tx.problemImage.create({
            data: {
              problemId: problem.id,
              imageUrl: img,
              stage: 'INTAKE',
              caption: 'Citizen uploaded evidence photo',
            },
          });
        }

        return problem;
      });
    } catch (dbErr) {
      if (isDbOffline(dbErr)) {
        // High-fidelity fallback for offline DB mode
        newProblem = offlineStore.createProblem({
          trackingNumber: trackingId,
          title: title.trim(),
          description: description.trim(),
          categoryId: resolvedCategoryId,
          category: resolvedCategoryName,
          reportedBy: reporterId,
          isAnonymous: false,
          address: fullLocation,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          latitude,
          longitude,
          imageUrl,
          imageUrls,
          status: 'SUBMITTED',
        });
      } else {
        throw dbErr;
      }
    }

    // 5. Trigger automated Grok AI analysis asynchronously
    if (newProblem && newProblem.id) {
      try {
        analyzeProblemAsync(newProblem.id);
      } catch (aiErr) {
        console.warn('[AI Triage] Async analysis failed:', aiErr.message);
      }
    }

    // 6. Trigger Email Confirmation Notification (Section 6)
    sendComplaintConfirmationEmail({
      recipientEmail: reporterEmail,
      recipientName: reporterName,
      problemId: newProblem.id,
      trackingId,
      title: title.trim(),
      category: resolvedCategoryName,
      location: `${fullLocation}, ${city}`,
      status: 'SUBMITTED',
    }).catch((emailErr) => {
      console.error('[EmailService] Confirmation email trigger error:', emailErr.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Civic complaint registered successfully. Confirmation email dispatched.',
      trackingId,
      trackingNumber: trackingId,
      report: newProblem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/my-reports
 * @desc    Get authenticated citizen's submitted complaints
 * @access  Private (Strict IDOR Protected)
 */
const getMyReports = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      categoryId,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Strict boundary: Only non-anonymous reports of the authenticated user
    const where = {
      reportedBy: userId,
      isAnonymous: false,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = categoryId;
    } else if (category) {
      where.category = {
        name: { contains: category.trim(), mode: 'insensitive' },
      };
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { trackingNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    const sortField = ['createdAt', 'updatedAt', 'title', 'status', 'severity'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    try {
      const [total, reports] = await Promise.all([
        prisma.problem.count({ where }),
        prisma.problem.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { [sortField]: sortOrder },
          include: {
            category: { select: { id: true, name: true, icon: true } },
            assignedDepartment: {
              select: { id: true, name: true, departmentCode: true, contactEmail: true },
            },
            images: { select: { id: true, imageUrl: true, stage: true } },
            statusHistory: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: { toStatus: true, remarks: true, createdAt: true },
            },
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
          reports: reports.map((r) => ({
            ...r,
            trackingId: r.trackingNumber,
          })),
        },
        reports: reports.map((r) => ({
          ...r,
          trackingId: r.trackingNumber,
        })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    } catch (dbErr) {
      if (isDbOffline(dbErr)) {
        const offlineReports = offlineStore.getUserProblems(userId, {
          search,
          status,
          categoryId: categoryId || category,
          order,
        });
        const total = offlineReports.length;
        const paged = offlineReports.slice(skip, skip + limitNum);
        return res.status(200).json({
          success: true,
          offline: true,
          data: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
            reports: paged.map((r) => ({
              ...r,
              trackingId: r.trackingNumber,
            })),
          },
          reports: paged.map((r) => ({
            ...r,
            trackingId: r.trackingNumber,
          })),
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
          },
        });
      }
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/:trackingId
 * @desc    Get detailed complaint by tracking number or UUID
 * @access  Private (Owner, Government, SuperAdmin)
 */
const getReportByTrackingId = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    try {
      const report = await prisma.problem.findFirst({
        where: {
          OR: [{ trackingNumber: trackingId }, { id: trackingId }],
        },
        include: {
          category: true,
          assignedDepartment: true,
          images: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
          },
          aiAnalyses: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          reporter: {
            select: { id: true, name: true, role: true },
          },
        },
      });

      if (!report) {
        return res.status(404).json({
          success: false,
          message: `Complaint with tracking ID '${trackingId}' not found`,
        });
      }

      // Authorization check: Owner or Government/Admin
      const isOwner = req.user && report.reportedBy === req.user.id;
      const isPrivileged =
        req.user && ['GOVERNMENT', 'SUPER_ADMIN', 'EXPERT'].includes(req.user.role);

      if (!isOwner && !isPrivileged && !report.isAnonymous) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view this complaint',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...report,
          trackingId: report.trackingNumber,
        },
        report: {
          ...report,
          trackingId: report.trackingNumber,
        },
      });
    } catch (dbErr) {
      if (isDbOffline(dbErr)) {
        const report = offlineStore.findProblem(trackingId);
        if (!report) {
          return res.status(404).json({
            success: false,
            message: `Complaint with tracking ID '${trackingId}' not found`,
          });
        }

        const isOwner = req.user && report.reportedBy === req.user.id;
        const isPrivileged =
          req.user && ['GOVERNMENT', 'SUPER_ADMIN', 'EXPERT'].includes(req.user.role);

        if (!isOwner && !isPrivileged && !report.isAnonymous) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: You do not have permission to view this complaint',
          });
        }

        return res.status(200).json({
          success: true,
          offline: true,
          data: {
            ...report,
            trackingId: report.trackingNumber,
          },
          report: {
            ...report,
            trackingId: report.trackingNumber,
          },
        });
      }
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/reports/track/:trackingId
 * @desc    Public tracking view for citizens (Zero PII, no reporter email/phone)
 * @access  Public
 */
const trackReportPublic = async (req, res, next) => {
  try {
    const { trackingId } = req.params;

    try {
      const problem = await prisma.problem.findFirst({
        where: {
          OR: [{ trackingNumber: trackingId }, { id: trackingId }],
        },
        include: {
          category: { select: { id: true, name: true, icon: true } },
          assignedDepartment: { select: { id: true, name: true, departmentCode: true } },
          statusHistory: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              fromStatus: true,
              toStatus: true,
              remarks: true,
              createdAt: true,
            },
          },
          images: { select: { id: true, imageUrl: true, stage: true, caption: true } },
        },
      });

      if (!problem) {
        return res.status(404).json({
          success: false,
          message: `No civic complaint found with tracking ID '${trackingId}'`,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          trackingId: problem.trackingNumber,
          trackingNumber: problem.trackingNumber,
          title: problem.title,
          description: problem.description,
          categoryName: problem.category?.name,
          categoryIcon: problem.category?.icon,
          status: problem.status,
          severity: problem.severity,
          city: problem.city,
          address: problem.address,
          landmark: problem.landmark,
          submissionDate: problem.createdAt,
          assignedDepartment: problem.assignedDepartment?.name || 'Department Triage Pending',
          statusHistory: problem.statusHistory,
          images: problem.images,
        },
      });
    } catch (dbErr) {
      if (isDbOffline(dbErr)) {
        const problem = offlineStore.findProblem(trackingId);
        if (!problem) {
          return res.status(404).json({
            success: false,
            message: `No civic complaint found with tracking ID '${trackingId}'`,
          });
        }

        return res.status(200).json({
          success: true,
          offline: true,
          data: {
            trackingId: problem.trackingNumber,
            trackingNumber: problem.trackingNumber,
            title: problem.title,
            description: problem.description,
            categoryName: problem.category?.name || 'Civic Infrastructure',
            categoryIcon: problem.category?.icon || 'AlertCircle',
            status: problem.status,
            severity: problem.severity,
            city: problem.city,
            address: problem.address,
            landmark: problem.landmark,
            submissionDate: problem.createdAt,
            assignedDepartment:
              problem.assignedDepartment?.name || 'Department Triage Pending',
            statusHistory: problem.statusHistory || [],
            images: problem.images || [],
          },
        });
      }
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReport,
  getMyReports,
  getReportByTrackingId,
  trackReportPublic,
  generateUniqueTrackingId,
};
