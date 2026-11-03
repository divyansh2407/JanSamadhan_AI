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
const validate = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/userValidators');

// All user routes require authentication
router.use(authenticate);

router.get('/me', getMyProfile);
router.patch('/me', validate(updateProfileSchema), updateMyProfile);
router.get('/:id', getUserById);


module.exports = router;

