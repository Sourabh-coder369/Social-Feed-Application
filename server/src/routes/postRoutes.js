const express = require('express');
const { body, param, query } = require('express-validator');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   GET /api/posts/top/liked
 * @desc    Get top liked posts
 * @access  Public
 */
router.get(
  '/top/liked',
  [query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')],
  validate,
  postController.getTopLikedPosts
);

/**
 * @route   GET /api/posts
 * @desc    Get all posts (paginated)
 * @access  Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  validate,
  postController.getAllPosts
);

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post
 * @access  Public
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('Valid post ID is required')],
  validate,
  postController.getPostById
);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post(
  '/',
  authMiddleware,
  validate,
  postController.createPost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Valid post ID is required')],
  validate,
  postController.deletePost
);

module.exports = router;
