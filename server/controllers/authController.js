/**
 * JanSamadhan – Authentication Controller
 * Handles user registration, login, session validation, and logout.
 */

const User = require('../models/User');
const { sendTokenResponse, clearTokenCookie } = require('../utils/jwt');
const {
  validateRegistrationInput,
  validateLoginInput,
} = require('../utils/validators');

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
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // SECURITY: Never trust role from frontend in public registration
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      role: 'CITIZEN', // STRICT ENFORCEMENT
    });

    sendTokenResponse(
      newUser,
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

    // Look up user including password hash for verification
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
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

    sendTokenResponse(user, 200, res, 'Login successful.');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Log out current user & clear HTTP-only cookie
 * @access  Public (or Authenticated)
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

