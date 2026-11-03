/**
 * JanSamadhan – Image Upload Controller
 * Accepts photographic evidence, strips EXIF metadata, and returns clean URL.
 */

const multer = require('multer');
const { saveImage, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } = require('../services/storageService');

// Multer in-memory storage configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 3, // Max 3 images per request
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG, and WebP are accepted.'));
    }
  },
});

const handleImageUpload = async (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'No image file uploaded. Please attach an image.',
      });
    }

    // Single file upload
    if (req.file) {
      const url = await saveImage(req.file);
      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Image uploaded and EXIF metadata sanitized successfully.',
        data: { url },
      });
    }

    // Multiple files upload
    const urls = await Promise.all(req.files.map((f) => saveImage(f)));
    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Images uploaded and EXIF metadata sanitized successfully.',
      data: { urls },
    });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'File size exceeds 5MB limit.',
      });
    }
    next(error);
  }
};

module.exports = {
  upload,
  handleImageUpload,
};

