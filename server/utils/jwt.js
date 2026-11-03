/**
 * JanSamadhan – JWT Authentication Utilities (PostgreSQL / Prisma ORM)
 * Handles token generation, verification, and HTTP-only cookie delivery.
 */

const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'fallback_development_secret_do_not_use_in_prod';
};

const getJwtExpiresIn = () => {
  return process.env.JWT_EXPIRES_IN || '7d';
};

/**
 * Signs a new JWT for the user.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      role: user.role,
      email: user.email,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
    }
  );
};

/**
 * Verifies a JWT token.
 */
const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

/**
 * Sets secure HTTP-only cookie and responds with user payload.
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user);

  // Cookie expiration (defaults to 7 days)
  const cookieExpiresDays = 7;
  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
};

/**
 * Clears the auth cookie on logout.
 */
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenResponse,
  clearTokenCookie,
};
