/**
 * JanSamadhan – User Routes
 * Mounted at /api/users
 */

const express = require('express');
const router = express.Router();

const {
  getMyProfile,
  getUserById,
  updateMyProfile,
} = require('../controllers/userController');

const { authenticate } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticate);

router.get('/me', getMyProfile);
router.patch('/me', updateMyProfile);
router.get('/:id', getUserById);

module.exports = router;
