/**
 * JanSamadhan – User Dashboard Overview Controller (Section 3 & 8)
 * Provides personal complaint statistics and authenticated user overview.
 */

const { prisma } = require('../config/db');
const offlineStore = require('../config/offlineStore');

function isDbOffline(err) {
  return (
    err.code === 'P1001' ||
    err.name?.includes('Prisma') ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard metrics for authenticated user
 * @access  Private (Authenticated)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name || 'Citizen';

    try {
      const [
        totalReports,
        pendingReports,
        underReviewReports,
        inProgressReports,
        resolvedReports,
      ] = await Promise.all([
        // 1. Total reports submitted by this user
        prisma.problem.count({
          where: { reportedBy: userId, isAnonymous: false },
        }),
        // 2. Pending reports (SUBMITTED or ACKNOWLEDGED)
        prisma.problem.count({
          where: {
            reportedBy: userId,
            isAnonymous: false,
            status: { in: ['SUBMITTED', 'ACKNOWLEDGED'] },
          },
        }),
        // 3. Under Review
        prisma.problem.count({
          where: {
            reportedBy: userId,
            isAnonymous: false,
            status: 'UNDER_REVIEW',
          },
        }),
        // 4. In Progress
        prisma.problem.count({
          where: {
            reportedBy: userId,
            isAnonymous: false,
            status: 'IN_PROGRESS',
          },
        }),
        // 5. Resolved
        prisma.problem.count({
          where: {
            reportedBy: userId,
            isAnonymous: false,
            status: 'RESOLVED',
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        welcomeMessage: `Welcome back, ${userName}!`,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
        stats: {
          totalReports,
          pendingReports,
          underReviewReports,
          inProgressReports,
          resolvedReports,
        },
        statistics: {
          totalReports,
          pendingReports,
          underReviewReports,
          inProgressReports,
          resolvedReports,
        },
      });
    } catch (dbErr) {
      if (isDbOffline(dbErr)) {
        const stats = offlineStore.getUserStats(userId);
        return res.status(200).json({
          success: true,
          offline: true,
          welcomeMessage: `Welcome back, ${userName}!`,
          user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
          },
          stats,
          statistics: stats,
        });
      }
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
