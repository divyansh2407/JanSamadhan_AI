/**
 * JanSamadhan – AI Analysis Controller
 * Exposes endpoints for triggering analysis, fetching recommendations,
 * and recording human officer review actions.
 */

const { prisma } = require('../config/db');
const {
  analyzeProblem,
  getLatestAnalysis,
  getAnalysisHistory,
  reviewAnalysis,
} = require('../services/aiAnalysisService');

/**
 * Trigger manual or force re-analysis of a problem report
 * POST /api/ai/analyze/:reportId
 * Restricted to: GOVERNMENT, SUPER_ADMIN
 */
const triggerAnalysis = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    const { forceReanalyze = false } = req.body || {};

    const problem = await prisma.problem.findUnique({
      where: { id: reportId },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Problem report not found',
      });
    }

    const analysis = await analyzeProblem(reportId, {
      forceReanalyze,
      reviewerId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Grok AI analysis completed successfully',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest AI analysis for a problem report
 * GET /api/ai/analysis/:reportId
 * Access: GOVERNMENT, SUPER_ADMIN, or the problem's citizen reporter
 */
const getAnalysis = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id: reportId },
      select: { id: true, reportedBy: true, isAnonymous: true },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Problem report not found',
      });
    }

    // Role check: If citizen, ensure they own the report
    if (req.user.role === 'CITIZEN' && problem.reportedBy !== req.user.id) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'Access denied: You can only view analysis for your own submitted reports',
      });
    }

    let analysis = await getLatestAnalysis(reportId);

    // If no analysis exists yet, automatically queue and generate one
    if (!analysis) {
      analysis = await analyzeProblem(reportId, { forceReanalyze: false });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'AI analysis retrieved successfully',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get full historical analysis logs for a report
 * GET /api/ai/analysis/:reportId/history
 * Restricted to: GOVERNMENT, SUPER_ADMIN
 */
const getAnalysisHistoryList = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const problem = await prisma.problem.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Problem report not found',
      });
    }

    const history = await getAnalysisHistory(reportId);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'AI analysis history retrieved successfully',
      data: {
        totalRuns: history.length,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review AI recommendations (Accept, Edit, or Reject)
 * PATCH /api/ai/analysis/:analysisId/review
 * Restricted to: GOVERNMENT, SUPER_ADMIN
 */
const reviewAIAnalysis = async (req, res, next) => {
  try {
    const { analysisId } = req.params;
    const reviewData = req.body;

    const updated = await reviewAnalysis(analysisId, reviewData, req.user);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: `AI recommendation successfully marked as ${reviewData.action}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerAnalysis,
  getAnalysis,
  getAnalysisHistoryList,
  reviewAIAnalysis,
};
