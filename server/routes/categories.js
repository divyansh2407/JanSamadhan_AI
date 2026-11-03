/**
 * JanSamadhan – Category Routes
 * Mounted at /api/categories
 */

const express = require('express');
const router = express.Router();

const {
  getCategories,
  createCategory,
} = require('../controllers/categoryController');

const { authenticate, authorize } = require('../middleware/auth');

// Public read route
router.get('/', getCategories);

// Protected admin creation route
router.post('/', authenticate, authorize('SUPER_ADMIN'), createCategory);

module.exports = router;
