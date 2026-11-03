/**
 * JanSamadhan – Centralized Error Handler Middleware
 * Must be registered LAST in the Express middleware chain (app.use in app.js).
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Check for Prisma connection failure (e.g. P1001)
  const isDbConnectionError =
    err.code === 'P1001' ||
    (err.message && err.message.includes("Can't reach database server"));

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (isDbConnectionError) {
    statusCode = 503;
    message = 'Database service unavailable. Please check your PostgreSQL server connection.';
  }

  const response = {
    success: false,
    statusCode,
    message,
  };

  // Include stack trace only in development if not a routine connection offline notice
  if (process.env.NODE_ENV === 'development' && !isDbConnectionError) {
    response.stack = err.stack;
  }

  console.error(`[ERROR] ${statusCode} – ${err.message}`);

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
