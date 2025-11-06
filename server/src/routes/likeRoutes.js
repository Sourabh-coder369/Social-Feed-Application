const express = require('express');
const { param } = require('express-validator');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like a post
 * @access  Private
 */
router.post(
  '/posts/:id/like',
  authMiddleware,
  [param('id').isInt().withMessage('Valid post ID is required')],
  validate,
  likeController.likePost
);

/**
 * @route   DELETE /api/posts/:id/like
 * @desc    Unlike a post
 * @access  Private
 */
router.delete(
  '/posts/:id/like',
  authMiddleware,
  [param('id').isInt().withMessage('Valid post ID is required')],
  validate,
  likeController.unlikePost
);

/**
 * @route   POST /api/comments/:id/like
 * @desc    Like a comment
 * @access  Private
 */
router.post(
  '/comments/:id/like',
  authMiddleware,
  [param('id').isInt().withMessage('Valid comment ID is required')],
  validate,
  likeController.likeComment
);

/**
 * @route   DELETE /api/comments/:id/like
 * @desc    Unlike a comment
 * @access  Private
 */
router.delete(
  '/comments/:id/like',
  authMiddleware,
  [param('id').isInt().withMessage('Valid comment ID is required')],
  validate,
  likeController.unlikeComment
);

module.exports = router;
