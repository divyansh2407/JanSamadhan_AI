/**
 * JanSamadhan – Reports & Complaints Routes (Section 8)
 * Mounted at /api/reports
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  submitReport,
  getMyReports,
  getReportByTrackingId,
  trackReportPublic,
} = require('../controllers/reportController');

// ── Public Tracking Route ───────────────────────────────────────────────────
router.get('/track/:trackingId', trackReportPublic);

// ── Authenticated User Reports Routes ───────────────────────────────────────
router.get('/my-reports', authenticate, getMyReports);
router.post('/', authenticate, submitReport);
router.get('/:trackingId', authenticate, getReportByTrackingId);

module.exports = router;
