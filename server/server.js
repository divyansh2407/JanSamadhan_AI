/**
 * JanSamadhan – Server Entry Point
 * Starts the Express HTTP server.
 */

const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log('─────────────────────────────────────────');
  console.log('  JanSamadhan API Server');
  console.log('─────────────────────────────────────────');
  console.log(`  Environment : ${NODE_ENV}`);
  console.log(`  Port        : ${PORT}`);
  console.log(`  URL         : http://localhost:${PORT}`);
  console.log(`  Health      : http://localhost:${PORT}/api/health`);
  console.log('─────────────────────────────────────────');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received – shutting down gracefully…');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => process.exit(1));
});
