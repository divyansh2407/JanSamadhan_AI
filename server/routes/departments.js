/**
 * JanSamadhan – Department Routes
 * Mounted at /api/departments
 */

const express = require('express');
const router = express.Router();

const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
} = require('../controllers/departmentController');

const { authenticate, authorize } = require('../middleware/auth');

// Public read routes
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Admin / Government protected modification routes
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'GOVERNMENT'),
  createDepartment
);

router.patch(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'GOVERNMENT'),
  updateDepartment
);

module.exports = router;
