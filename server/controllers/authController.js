/**
 * JanSamadhan – Authentication Controller (PostgreSQL / Prisma ORM)
 * Handles citizen registration, login, session validation, and logout.
 */

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');
const offlineStore = require('../config/offlineStore');
const { sendTokenResponse, clearTokenCookie } = require('../utils/jwt');
const { sanitizeUser } = require('../middleware/auth');
const {
  validateRegistrationInput,
  validateLoginInput,
} = require('../utils/validators');

function isDbOffline(err) {
  return (
    err.code === 'P1001' ||
    err.name?.includes('Prisma') ||
    (err.message && err.message.includes("Can't reach database server"))
  );
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new citizen account
 * @access  Public
 * @note    SECURITY: Public registration is strictly restricted to CITIZEN role.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input fields
    const validation = validateRegistrationInput({ name, email, phone, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Prevent duplicate email registration
    let existingUser = null;
    try {
      existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (err) {
      if (isDbOffline(err)) {
        existingUser = offlineStore.findUserByEmail(normalizedEmail);
      } else {
        throw err;
      }
    }

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // SECURITY: Never trust role from frontend in public registration
    let newUser;
    try {
      newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone ? phone.trim() : null,
          passwordHash,
          role: 'CITIZEN', // STRICT ENFORCEMENT
        },
      });
    } catch (createErr) {
      if (isDbOffline(createErr)) {
        newUser = offlineStore.createUser({
          name: name.trim(),
          email: normalizedEmail,
          phone: phone ? phone.trim() : null,
          passwordHash,
          role: 'CITIZEN',
        });
      } else {
        throw createErr;
      }
    }

    sendTokenResponse(
      sanitizeUser(newUser),
      201,
      res,
      'Registration successful. Welcome to JanSamadhan!'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & issue session token / cookie
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    const validation = validateLoginInput({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.errors[0],
        errors: validation.errors,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Look up user from PostgreSQL (or offline store)
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (err) {
      if (isDbOffline(err)) {
        user = offlineStore.findUserByEmail(normalizedEmail);
      } else {
        throw err;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // Check account active state
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    sendTokenResponse(sanitizeUser(user), 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Log out current user & clear HTTP-only cookie
 * @access  Public
 */
const logout = async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user's profile
 * @access  Private (Authenticated)
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
