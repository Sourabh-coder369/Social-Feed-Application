/**
 * Standard response format for success
 */
function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * Standard response format for errors
 */
function errorResponse(res, message = 'An error occurred', statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details })
  });
}

/**
 * Paginated response format
 */
function paginatedResponse(res, data, page, limit, total) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse
};
