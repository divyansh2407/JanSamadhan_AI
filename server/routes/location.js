/**
 * JanSamadhan – Location & Geocoding Routes
 * Mounted at /api/location
 */

const express = require('express');
const router = express.Router();

const { reverseGeocodeLocation } = require('../controllers/mapController');
const validate = require('../middleware/validate');
const { reverseGeocodeSchema } = require('../validators/mapValidators');

// GET /api/location/reverse-geocode - Convert coordinates to approximate landmark / street
router.get('/reverse-geocode', validate(reverseGeocodeSchema, 'query'), reverseGeocodeLocation);

module.exports = router;

