/**
 * JanSamadhan – Image Upload Route
 * Mounted at /api/upload
 */

const express = require('express');
const router = express.Router();

const { upload, handleImageUpload } = require('../controllers/uploadController');
const { publicReportRateLimiter } = require('../middleware/rateLimiter');

// POST /api/upload (Supports single 'image' or array 'images')
router.post(
  '/',
  publicReportRateLimiter,
  (req, res, next) => {
    upload.array('images', 3)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: err.message,
        });
      }
      next();
    });
  },
  handleImageUpload
);

module.exports = router;
