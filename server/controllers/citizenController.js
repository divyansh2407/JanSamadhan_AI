/**
 * JanSamadhan – Citizen Dashboard Controller
 * Provides authenticated citizen analytics, personal reports, tracking timelines,
 * activity logs, notifications, and profile details.
 *
 * SECURITY:
 * - Every query enforces `reportedBy: req.user.id` or `recipientId: req.user.id`.
 * - Strictly prevents Insecure Direct Object Reference (IDOR) attacks.
 * - Anonymous reports are never mixed into registered user dashboard feeds.
 */

const { prisma } = require('../config/db');


/**
 * @route   GET /api/citizen/dashboard
 * @desc    Get aggregated metrics, recent reports, activity, and notification stats
 * @access  Private (CITIZEN, SUPER_ADMIN)
 */
const getCitizenDashboardSummary = async (req, res, next) => {
  try {
    const citizenId = req.user.id;

    // Aggregate statistics strictly for the authenticated citizen
    const [
      totalReports,
      pendingReports,
      inProgressReports,
      resolvedReports,
      recentReports,
      recentNotifications,
      unreadNotificationsCount,
    ] = await Promise.all([
      // 1. Total reports submitted by this citizen (excluding anonymous)
      prisma.problem.count({
        where: { reportedBy: citizenId, isAnonymous: false },
      }),
      // 2. Pending reports (SUBMITTED or ACKNOWLEDGED)
      prisma.problem.count({
        where: {
          reportedBy: citizenId,
          isAnonymous: false,
          status: { in: ['SUBMITTED', 'ACKNOWLEDGED'] },
        },
      }),
      // 3. In Progress reports
      prisma.problem.count({
        where: {
          reportedBy: citizenId,
          isAnonymous: false,
          status: 'IN_PROGRESS',
        },
      }),
      // 4. Resolved reports
      prisma.problem.count({
        where: {
          reportedBy: citizenId,
          isAnonymous: false,
          status: 'RESOLVED',
        },
      }),
      // 5. Five most recent reports with category and assigned department
      prisma.problem.findMany({
        where: { reportedBy: citizenId, isAnonymous: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, icon: true } },
          assignedDepartment: { select: { id: true, name: true, departmentCode: true } },
          images: { select: { id: true, imageUrl: true, stage: true } },
          statusHistory: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { toStatus: true, remarks: true, createdAt: true },
          },
        },
      }),
      // 6. Recent notifications
      prisma.notification.findMany({
        where: { recipientId: citizenId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      // 7. Unread notifications count
      prisma.notification.count({
        where: { recipientId: citizenId, isRead: false },
      }),
    ]);

    // Fetch recent activity on citizen's reports (status updates & assignments)
    const recentActivity = await prisma.problemStatusHistory.findMany({
      where: {
        problem: {
          reportedBy: citizenId,
          isAnonymous: false,
        },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role,
        },
        statistics: {
          totalReports,
          pendingReports,
          inProgressReports,
          resolvedReports,
        },
        recentReports,
        recentActivity: recentActivity.map((act) => ({
          id: act.id,
          problemId: act.problem.id,
          problemTitle: act.problem.title,
          categoryName: act.problem.category?.name,
          fromStatus: act.fromStatus,
          toStatus: act.toStatus,
          remarks: act.remarks,
          timestamp: act.createdAt,
        })),
        notifications: {
          unreadCount: unreadNotificationsCount,
          items: recentNotifications,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/citizen/reports
 * @desc    Get paginated, filtered list of citizen's own submitted reports
 * @access  Private (CITIZEN, SUPER_ADMIN)
 */
const getCitizenReports = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Strict boundary: Only non-anonymous reports belonging to the authenticated citizen
    const where = {
      reportedBy: citizenId,
      isAnonymous: false,
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { city: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const sortField = ['createdAt', 'updatedAt', 'title', 'status', 'severity'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

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
            select: { id: true, name: true, departmentCode: true, contactPhone: true },
          },
          images: { select: { id: true, imageUrl: true, stage: true } },
          _count: {
            select: { statusHistory: true, feedbacks: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasMore: pageNum < totalPages,
        },
        reports,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/citizen/reports/:id
 * @desc    Get detailed report with complete chronological status history
 * @access  Private (CITIZEN, SUPER_ADMIN)
 * @security IDOR Protection: Checks that problem belongs to authenticated citizen
 */
const getCitizenReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const citizenId = req.user.id;

    const report = await prisma.problem.findUnique({
      where: { id },
      include: {
        category: true,
        assignedDepartment: true,
        images: { orderBy: { createdAt: 'asc' } },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            fromStatus: true,
            toStatus: true,
            remarks: true,
            changedBy: true,
            createdAt: true,
          },
        },
        feedbacks: {
          where: { submittedBy: citizenId },
          orderBy: { createdAt: 'desc' },
        },
        verifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Civic report not found',
      });
    }

    // IDOR Protection: Ensure citizen owns this report
    if (report.reportedBy !== citizenId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Access denied. You are not authorized to view this report.',
      });
    }

    // Never show anonymous reports through the citizen dashboard
    if (report.isAnonymous) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Anonymous reports must be tracked using the public tracking portal.',
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/citizen/activity
 * @desc    Get full activity stream on citizen's reported issues
 * @access  Private (CITIZEN, SUPER_ADMIN)
 */
const getCitizenActivityStream = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      problem: {
        reportedBy: citizenId,
        isAnonymous: false,
      },
    };

    const [total, activities] = await Promise.all([
      prisma.problemStatusHistory.count({ where }),
      prisma.problemStatusHistory.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              category: { select: { name: true, icon: true } },
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/citizen/notifications
 * @desc    Get citizen's notifications with pagination
 * @access  Private (CITIZEN, SUPER_ADMIN)
 */
const getCitizenNotifications = async (req, res, next) => {
  try {
    const citizenId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, notifications, unreadCount] = await Promise.all([
      prisma.notification.count({ where: { recipientId: citizenId } }),
      prisma.notification.findMany({
        where: { recipientId: citizenId },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          relatedProblem: {
            select: { id: true, title: true, status: true },
          },
        },
      }),
      prisma.notification.count({ where: { recipientId: citizenId, isRead: false } }),
    ]);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        unreadCount,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/citizen/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private (CITIZEN, SUPER_ADMIN)
 */
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const citizenId = req.user.id;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Notification not found',
      });
    }

    if (notification.recipientId !== citizenId && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Access denied.',
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: { notification: updated },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/citizen/profile
 * @desc    Get citizen's profile info and civic contribution stats
 * @access  Private (CITIZEN, SUPER_ADMIN)
 */
const getCitizenProfile = async (req, res, next) => {
  try {
    const citizenId = req.user.id;

    const [user, totalReports, resolvedReports] = await Promise.all([
      prisma.user.findUnique({
        where: { id: citizenId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.problem.count({ where: { reportedBy: citizenId, isAnonymous: false } }),
      prisma.problem.count({
        where: { reportedBy: citizenId, isAnonymous: false, status: 'RESOLVED' },
      }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User profile not found',
      });
    }

    // Calculate profile completion percentage
    let completedFields = 2; // email and role are always present
    if (user.name && user.name.trim().length > 0) completedFields++;
    if (user.phone && user.phone.trim().length > 0) completedFields++;
    if (user.isVerified) completedFields++;
    const profileCompletionPercentage = Math.round((completedFields / 5) * 100);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      data: {
        profile: {
          ...user,
          totalReportsSubmitted: totalReports,
          resolvedReportsCount: resolvedReports,
          resolutionRate:
            totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0,
          profileCompletionPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCitizenDashboardSummary,
  getCitizenReports,
  getCitizenReportById,
  getCitizenActivityStream,
  getCitizenNotifications,
  markNotificationRead,
  getCitizenProfile,
};
