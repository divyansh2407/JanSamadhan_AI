/**
 * JanSamadhan – Analytics Routes (Stage 13)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getOverview,
  getIssuesByCategory,
  getIssuesByStatus,
  getDepartmentPerformance,
  getCollaborationStats,
  getProposalStats,
  getImpactMetrics,
} = require('../controllers/analyticsController');

// All analytics endpoints require authentication
router.get('/overview', authenticate, getOverview);
router.get('/issues/by-category', authenticate, getIssuesByCategory);
router.get('/issues/by-status', authenticate, getIssuesByStatus);
router.get('/departments/performance', authenticate, getDepartmentPerformance);
router.get('/collaborations', authenticate, getCollaborationStats);
router.get('/proposals', authenticate, getProposalStats);
router.get('/impact', authenticate, getImpactMetrics);

module.exports = router;

