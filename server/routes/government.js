/**
 * JanSamadhan – Government Routes (Stages 9 & 10)
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getVerificationQueue,
  getProblemDetail,
  verifyProblem,
  assignDepartment,
  assignOfficer,
  addInternalNote,
  getDepartments,
  getOfficers,
  getAuditLogs,
  updateProblemStatus,
} = require('../controllers/governmentController');

const govAuth = [authenticate, authorize('GOVERNMENT', 'SUPER_ADMIN')];

router.get('/dashboard', ...govAuth, getDashboardStats);
router.get('/queue', ...govAuth, getVerificationQueue);
router.get('/departments', ...govAuth, getDepartments);
router.get('/officers', ...govAuth, getOfficers);
router.get('/audit-logs', ...govAuth, getAuditLogs);
router.get('/problems/:id', ...govAuth, getProblemDetail);
router.post('/problems/:id/verify', ...govAuth, verifyProblem);
router.post('/problems/:id/assign-department', ...govAuth, assignDepartment);
router.post('/problems/:id/assign-officer', ...govAuth, assignOfficer);
router.post('/problems/:id/notes', ...govAuth, addInternalNote);
router.post('/problems/:id/status', ...govAuth, updateProblemStatus);

module.exports = router;
