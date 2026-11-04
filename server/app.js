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
const publicFeedRoutes = require('./routes/publicFeed');




// Load environment variables
dotenv.config();

const app = express();

// ── CORS Configuration ───────────────────────────────────────────────────────
const allowedOrigins = (
  process.env.CLIENT_URL ||
  process.env.CORS_ORIGIN ||
  'http://localhost:5173,http://localhost:5000'
)
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // 1. Allow non-browser requests (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // 2. Allow if origin matches configured allowedOrigins or wildcard
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // 3. Allow all Render and Vercel domains dynamically (*.onrender.com, *.vercel.app)
      if (origin.endsWith('.onrender.com') || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // 4. Allow localhost and local loopback
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }

      // 5. Permissive fallback for production to avoid blocking legitimate frontend requests
      return callback(null, true);
    },
    credentials: true, // Crucial for HTTP-only session cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-tracking-token'],
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
app.use('/api/public/civic-feed', publicFeedRoutes);




// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Production Frontend Static Serving (SPA fallback) ───────────────────────
const fs = require('fs');
const candidatePaths = [
  path.resolve(__dirname, '../client/dist'),
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];

const clientDistPath = candidatePaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`✅ [Frontend SPA] Serving production build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath, { maxAge: '1h' }));

  // SPA fallback for all non-API and non-uploads GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.warn('⚠️ [Frontend SPA] client/dist directory not found. Running in API-only mode.');
}

// ── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
