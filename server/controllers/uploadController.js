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
    let files = [];
    if (req.file) {
      files.push(req.file);
    } else if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === 'object') {
      Object.values(req.files).forEach((item) => {
        if (Array.isArray(item)) files.push(...item);
        else if (item) files.push(item);
      });
    }

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'No image file uploaded. Please attach an image.',
      });
    }

    // Process and save images (stripping EXIF metadata)
    const urls = await Promise.all(files.map((f) => saveImage(f)));

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message:
        files.length > 1
          ? 'Images uploaded and EXIF metadata sanitized successfully.'
          : 'Image uploaded and EXIF metadata sanitized successfully.',
      data: {
        url: urls[0],
        urls,
      },
      url: urls[0],
      urls,
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

