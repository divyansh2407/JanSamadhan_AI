/**
 * JanSamadhan – Anonymous Public Report Routes
 * Mounted at /api/public/reports
 */

const express = require('express');
const router = express.Router();

const {
  submitAnonymousReport,
  trackAnonymousReport,
} = require('../controllers/publicReportController');

const validate = require('../middleware/validate');
const {
  submitAnonymousReportSchema,
} = require('../validators/anonymousReportValidators');
const { publicReportRateLimiter } = require('../middleware/rateLimiter');

// POST /api/public/reports - Anonymous submission (rate-limited, validated)
router.post(
  '/',
  publicReportRateLimiter,
  validate(submitAnonymousReportSchema),
  submitAnonymousReport
);

// GET /api/public/reports/:trackingId - Track status with X-Tracking-Token
router.get('/:trackingId', trackAnonymousReport);

module.exports = router;
