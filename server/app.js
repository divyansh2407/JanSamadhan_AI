/**
 * JanSamadhan – Express Application
 * PostgreSQL / Prisma ORM Architecture
 * Configures middleware, security, REST API routes, and error handling.
 */

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const departmentRoutes = require('./routes/departments');
const categoryRoutes = require('./routes/categories');
const problemRoutes = require('./routes/problems');
const publicReportRoutes = require('./routes/publicReports');
const path = require('path');
const citizenRoutes = require('./routes/citizen');
const uploadRoutes = require('./routes/upload');
const aiRoutes = require('./routes/ai');
const mapRoutes = require('./routes/map');
const locationRoutes = require('./routes/location');
const governmentRoutes = require('./routes/government');
const collaborationRoutes = require('./routes/collaborations');
const proposalRoutes = require('./routes/proposals');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');




// Load environment variables
dotenv.config();

const app = express();

// ── CORS Configuration ───────────────────────────────────────────────────────
const allowedOrigins = (
  process.env.CLIENT_URL ||
  process.env.CORS_ORIGIN ||
  'http://localhost:5173'
)
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true, // Crucial for HTTP-only session cookies
  })
);

// ── Cookie Parsing ───────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files (Uploaded Evidence Photographs) ───────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/public/reports', publicReportRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);




// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Production Frontend Static Serving (SPA fallback) ───────────────────────
const clientDistPath = path.join(__dirname, '../client/dist');
const fs = require('fs');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
