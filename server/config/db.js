/**
 * JanSamadhan – PostgreSQL Database Connection via Prisma ORM
 * Provides a singleton Prisma client instance and health verification utilities.
 */

const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
} else {
  // Prevent multiple client instances in development during hot-reload
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.prisma;
}

let isConnected = false;

/**
 * Verifies active connectivity to the PostgreSQL database.
 */
const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn(
      '⚠️  DATABASE_URL is not set in environment variables. PostgreSQL operations will fail.'
    );
    return false;
  }

  try {
    await prisma.$connect();
    isConnected = true;
    console.log('✅ PostgreSQL Database connected successfully via Prisma ORM');
    return true;
  } catch (error) {
    isConnected = false;
    console.error(`❌ PostgreSQL Connection Error: ${error.message}`);
    console.warn(
      '💡 Tip: Configure a valid PostgreSQL DATABASE_URL in server/.env (e.g. Supabase, Neon, or local PostgreSQL)'
    );
    return false;
  }
};

/**
 * Gracefully disconnects Prisma client.
 */
const disconnectDB = async () => {
  if (prisma) {
    await prisma.$disconnect();
    isConnected = false;
  }
};

/**
 * Returns current database health status.
 */
const getDBStatus = async () => {
  try {
    if (!isConnected) {
      await prisma.$connect();
      isConnected = true;
    }
    // Simple ping query
    await prisma.$queryRaw`SELECT 1`;
    return { isConnected: true, status: 'healthy' };
  } catch (err) {
    return { isConnected: false, status: 'unreachable', error: err.message };
  }
};

module.exports = prisma;
module.exports.prisma = prisma;
module.exports.connectDB = connectDB;
module.exports.disconnectDB = disconnectDB;
module.exports.getDBStatus = getDBStatus;

