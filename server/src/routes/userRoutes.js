const express = require('express');
const { param, query, body } = require('express-validator');
const userController = require('../controllers/userController');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/search
 * @desc    Search users by name
 * @access  Public
 */
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validate,
  userController.searchUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile
 * @access  Public
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('Valid user ID is required')],
  validate,
  userController.getUserProfile
);

/**
 * @route   GET /api/users/:id/posts
 * @desc    Get user posts (paginated)
 * @access  Public
 */
router.get(
  '/:id/posts',
  [
    param('id').isInt().withMessage('Valid user ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  userController.getUserPosts
);

/**
 * @route   PUT /api/users/:id/profile-picture
 * @desc    Update user profile picture
 * @access  Private
 */
router.put(
  '/:id/profile-picture',
  authMiddleware,
  [
    param('id').isInt().withMessage('Valid user ID is required'),
    body('profilePicUrl').notEmpty().withMessage('Profile picture URL is required')
  ],
  validate,
  userController.updateProfilePicture
);

module.exports = router;
