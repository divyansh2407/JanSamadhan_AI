/**
 * JanSamadhan – AI Analysis Routes
 * Mounted at /api/ai
 */

const express = require('express');
const router = express.Router();

const {
  triggerAnalysis,
  getAnalysis,
  getAnalysisHistoryList,
  reviewAIAnalysis,
} = require('../controllers/aiController');

const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  triggerAnalysisSchema,
  reviewAnalysisSchema,
} = require('../validators/aiAnalysisValidators');

// All AI routes require authentication
router.use(authenticate);

// POST /api/ai/analyze/:reportId - Trigger manual or force re-analysis (Gov/Admin only)
router.post(
  '/analyze/:reportId',
  authorize('GOVERNMENT', 'SUPER_ADMIN'),
  validate(triggerAnalysisSchema),
  triggerAnalysis
);

// GET /api/ai/analysis/:reportId - Get latest analysis for a report (Gov, Admin, or Citizen owner)
router.get('/analysis/:reportId', getAnalysis);

// GET /api/ai/analysis/:reportId/history - Get complete analysis audit trail (Gov/Admin only)
router.get(
  '/analysis/:reportId/history',
  authorize('GOVERNMENT', 'SUPER_ADMIN'),
  getAnalysisHistoryList
);

// PATCH /api/ai/analysis/:analysisId/review - Officer review action (Gov/Admin only)
router.patch(
  '/analysis/:analysisId/review',
  authorize('GOVERNMENT', 'SUPER_ADMIN'),
  validate(reviewAnalysisSchema),
  reviewAIAnalysis
);

module.exports = router;
