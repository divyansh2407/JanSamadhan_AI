/**
 * JanSamadhan – Health Check Route
 * GET /api/health
 */

const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

router.get('/health', async (req, res) => {
  const dbHealth = await getDBStatus();

  res.status(200).json({
    success: true,
    message: 'JanSamadhan API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      provider: 'postgresql',
      connected: dbHealth.isConnected,
      status: dbHealth.status,
    },
  });
});

module.exports = router;
