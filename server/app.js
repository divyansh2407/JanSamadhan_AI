/**
 * JanSamadhan – Express Application
 * Configures middleware, routes, and error handling.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');

// Load environment variables
dotenv.config();

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', healthRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
