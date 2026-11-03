/**
 * JanSamadhan – Server Entry Point (PostgreSQL / Prisma ORM)
 * Initializes database connection and starts Express HTTP server.
 */

const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize DB and start listening
const startServer = async () => {
  // Connect to PostgreSQL via Prisma
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('─────────────────────────────────────────');
    console.log('  JanSamadhan API Server (PostgreSQL / Prisma)');
    console.log('─────────────────────────────────────────');
    console.log(`  Environment : ${NODE_ENV}`);
    console.log(`  Port        : ${PORT}`);
    console.log(`  URL         : http://localhost:${PORT}`);
    console.log(`  Health      : http://localhost:${PORT}/api/health`);
    console.log(`  Auth Routes : http://localhost:${PORT}/api/auth`);
    console.log(`  User Routes : http://localhost:${PORT}/api/users`);
    console.log(`  Dept Routes : http://localhost:${PORT}/api/departments`);
    console.log(`  Cat Routes  : http://localhost:${PORT}/api/categories`);
    console.log(`  Prob Routes : http://localhost:${PORT}/api/problems`);
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

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
