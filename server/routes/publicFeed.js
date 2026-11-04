/**
 * JanSamadhan – Public Civic Problem Transparency Routes
 * Mounted at /api/public/civic-feed
 */

const express = require('express');
const router = express.Router();
const {
  getPublicFeed,
  getPublicProblemDetails,
} = require('../controllers/publicFeedController');

// GET /api/public/civic-feed - Public transparency feed & city stats
router.get('/', getPublicFeed);

// GET /api/public/civic-feed/:id - Public details by UUID or trackingNumber
router.get('/:id', getPublicProblemDetails);

module.exports = router;

