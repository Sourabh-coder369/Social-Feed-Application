const { successResponse, errorResponse } = require('../utils/response');

/**
 * Upload image file
 * POST /api/upload/image
 */
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', 400);
    }

    // Construct the URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    return successResponse(res, { 
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }, 'Image uploaded successfully', 201);
  } catch (error) {
    console.error('Upload image error:', error);
    return errorResponse(res, 'Failed to upload image', 500);
  }
}

module.exports = {
  uploadImage
};
