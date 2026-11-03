/**
 * JanSamadhan – Rate Limiting Middleware
 * Protects authentication endpoints from brute-force attempts.
 */

const memoryStore = new Map();

/**
 * Creates an in-memory rate limiter middleware.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default 15 mins)
 * @param {number} options.max - Maximum requests allowed per window (default 30)
 * @param {string} options.message - Error message when rate limit exceeded
 */
const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 30, message = 'Too many requests, please try again later.' } = {}) => {
  return (req, res, next) => {
    // In dev / test bypass if explicitly set
    if (process.env.DISABLE_RATE_LIMIT === 'true') {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const record = memoryStore.get(ip);

    if (!record) {
      memoryStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > record.resetTime) {
      // Window expired, reset
      memoryStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds: retryAfter,
      });
    }

    next();
  };
};

module.exports = {
  rateLimit,
};
