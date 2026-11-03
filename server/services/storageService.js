/**
 * JanSamadhan – Secure Storage & EXIF Sanitization Service
 * Handles file validation, safe filename generation, and metadata scrubbing.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOADS_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, '../public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Strips EXIF metadata from JPEG buffers by parsing markers and removing APP1 (0xFFE1) segments
 * This removes embedded GPS coordinates, camera serial numbers, and device identifiers.
 */
function stripExifMetadata(buffer) {
  try {
    // If JPEG image, strip APP1 (EXIF) markers
    if (buffer.length > 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      const cleanChunks = [Buffer.from([0xff, 0xd8])];
      let offset = 2;

      while (offset < buffer.length) {
        if (buffer[offset] !== 0xff) break;
        const marker = buffer[offset + 1];

        // 0xFFDA is Start of Scan (image data begins)
        if (marker === 0xda) {
          cleanChunks.push(buffer.subarray(offset));
          break;
        }

        const length = buffer.readUInt16BE(offset + 2);
        // APP1 marker (0xFFE1) contains EXIF metadata - skip it!
        if (marker !== 0xe1) {
          cleanChunks.push(buffer.subarray(offset, offset + 2 + length));
        }

        offset += 2 + length;
      }

      return Buffer.concat(cleanChunks);
    }

    // For PNG/WebP or other formats, return buffer directly
    return buffer;
  } catch (err) {
    console.warn('EXIF strip fallback:', err.message);
    return buffer;
  }
}

/**
 * Saves an uploaded image file securely to disk
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} Public URL of stored image
 */
async function saveImage(file) {
  if (!file) throw new Error('No file provided');

  // 1. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    throw new Error('Unsupported file type. Only JPEG, PNG, and WebP are allowed.');
  }

  // 2. Validate file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file extension.');
  }

  // 3. Validate size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 5MB limit.');
  }

  // 4. Strip EXIF metadata
  const cleanBuffer = stripExifMetadata(file.buffer);

  // 5. Generate secure random filename
  const safeFilename = `img_${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`;
  const targetPath = path.join(UPLOADS_DIR, safeFilename);

  // 6. Write sanitized buffer to disk
  await fs.promises.writeFile(targetPath, cleanBuffer);

  // Return public web URL
  return `/uploads/${safeFilename}`;
}

function validateImageMime(file) {
  if (!file || !file.mimetype) return false;
  const mimeValid = ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase());
  const ext = file.originalname ? path.extname(file.originalname).toLowerCase() : '';
  const extValid = !ext || ALLOWED_EXTENSIONS.includes(ext);
  return mimeValid && extValid;
}

module.exports = {
  saveImage,
  stripExifMetadata,
  validateImageMime,
  UPLOADS_DIR,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
