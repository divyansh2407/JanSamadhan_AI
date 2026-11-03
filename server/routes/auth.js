/**
 * JanSamadhan – Authentication Routes
 * Mounted at /api/auth
 */

const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
} = require('../controllers/authController');

const { authenticate, authorize } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/authValidators');

// Rate-limited authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
});

// ── Public Routes ────────────────────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);


// ── Authenticated Routes ─────────────────────────────────────────────────────
router.get('/me', authenticate, getMe);

// ── Role Authorization Test Routes (RBAC verification) ──────────────────────
router.get('/test/citizen', authenticate, authorize('CITIZEN', 'SUPER_ADMIN'), (req, res) => {
  res.json({ success: true, message: 'CITIZEN access granted', user: req.user.email });
});

router.get('/test/government', authenticate, authorize('GOVERNMENT', 'SUPER_ADMIN'), (req, res) => {
  res.json({ success: true, message: 'GOVERNMENT access granted', user: req.user.email });
});

router.get('/test/university', authenticate, authorize('UNIVERSITY', 'SUPER_ADMIN'), (req, res) => {
  res.json({ success: true, message: 'UNIVERSITY access granted', user: req.user.email });
});

router.get('/test/expert', authenticate, authorize('EXPERT', 'SUPER_ADMIN'), (req, res) => {
  res.json({ success: true, message: 'EXPERT access granted', user: req.user.email });
});

router.get('/test/industry', authenticate, authorize('INDUSTRY', 'SUPER_ADMIN'), (req, res) => {
  res.json({ success: true, message: 'INDUSTRY access granted', user: req.user.email });
});

router.get('/test/admin', authenticate, authorize('SUPER_ADMIN'), (req, res) => {
  res.json({ success: true, message: 'SUPER_ADMIN access granted', user: req.user.email });
});

module.exports = router;

