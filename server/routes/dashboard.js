/**
 * JanSamadhan – User Dashboard Routes (Section 8)
 * Mounted at /api/dashboard
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/dashboardController');

// ── Authenticated User Dashboard Stats ──────────────────────────────────────
router.get('/stats', authenticate, getDashboardStats);

module.exports = router;

