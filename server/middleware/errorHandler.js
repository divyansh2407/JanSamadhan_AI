/**
 * JanSamadhan – Centralized Error Handler Middleware
 * Must be registered LAST in the Express middleware chain (app.use in app.js).
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Determine HTTP status – default to 500
  const statusCode = err.statusCode || err.status || 500;

  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} – ${err.message}`);

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
