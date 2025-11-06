const express = require('express');
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image file
 * @access  Private
 */
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  uploadController.uploadImage
);

module.exports = router;
