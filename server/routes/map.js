/**
 * JanSamadhan – Map Routes
 * Mounted at /api/map
 */

const express = require('express');
const router = express.Router();

const {
  getMapReports,
  getNearbyReports,
  getWardStatistics,
  getMapSummary,
} = require('../controllers/mapController');

const validate = require('../middleware/validate');
const {
  getMapReportsSchema,
  getNearbyReportsSchema,
} = require('../validators/mapValidators');

// GET /api/map/reports - Retrieve map-ready reports with bounding box and filters
router.get('/reports', validate(getMapReportsSchema, 'query'), getMapReports);

// GET /api/map/nearby - Discover nearby civic issues sorted by Haversine distance
router.get('/nearby', validate(getNearbyReportsSchema, 'query'), getNearbyReports);

// GET /api/map/wards - Ward-wise issue concentration statistics
router.get('/wards', getWardStatistics);

// GET /api/map/summary - High-level city-wide mapping metrics
router.get('/summary', getMapSummary);

module.exports = router;
