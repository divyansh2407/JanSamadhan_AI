/**
 * JanSamadhan – Citizen Dashboard Routes
 * Mounted at /api/citizen
 *
 * All routes require authentication and are restricted to CITIZEN or SUPER_ADMIN roles.
 */

const express = require('express');
const router = express.Router();

const {
  getCitizenDashboardSummary,
  getCitizenReports,
  getCitizenReportById,
  getCitizenActivityStream,
  getCitizenNotifications,
  markNotificationRead,
  getCitizenProfile,
} = require('../controllers/citizenController');

const { authenticate, authorize } = require('../middleware/auth');

// All citizen routes require authentication and CITIZEN / SUPER_ADMIN role
router.use(authenticate);
router.use(authorize('CITIZEN', 'SUPER_ADMIN'));

// Aggregated Dashboard Summary
router.get('/dashboard', getCitizenDashboardSummary);

// Citizen Personal Reports Feed (Paginated, Searchable, Filterable)
router.get('/reports', getCitizenReports);

// Single Report Detail & Chronological Timeline (IDOR Protected)
router.get('/reports/:id', getCitizenReportById);

// Citizen Activity Stream
router.get('/activity', getCitizenActivityStream);

// Citizen Notifications
router.get('/notifications', getCitizenNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// Citizen Profile Details & Civic Scorecard
router.get('/profile', getCitizenProfile);

module.exports = router;
