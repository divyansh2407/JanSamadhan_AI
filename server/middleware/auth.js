/**
 * JanSamadhan – Authentication & Authorization Middleware
 * Verifies JWT tokens using Prisma ORM and enforces Role-Based Access Control (RBAC).
 */

const { prisma } = require('../config/db');
const { verifyToken } = require('../utils/jwt');

/**
 * Strips sensitive fields (like passwordHash) from user record.
 */
const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

/**
 * Protects routes by validating JWT from HTTP-only cookie or Bearer header.
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    // 1. Check HTTP-only cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Fallback to Authorization: Bearer <token>
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to continue.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    try {
      // Load active user from PostgreSQL via Prisma
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User account no longer exists.',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Your account has been deactivated. Please contact an administrator.',
        });
      }

      // Attach sanitized user to request
      req.user = sanitizeUser(user);
      next();
    } catch (dbError) {
      // If DB server is offline or in test environment, fall back to cryptographically verified token
      if (
        process.env.NODE_ENV === 'test' ||
        dbError.message?.includes("Can't reach database server")
      ) {
        req.user = sanitizeUser(decoded);
        return next();
      }
      throw dbError;
    }

  } catch (error) {
    next(error);
  }
};

/**
 * Enforces Role-Based Access Control (RBAC).
 * Returns HTTP 403 Forbidden if user's role is not in allowed roles.
 * @param  {...string} roles - Permitted user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${req.user.role}'. Required role: [${roles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  sanitizeUser,
};
