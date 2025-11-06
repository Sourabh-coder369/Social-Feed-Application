const express = require('express');
const { body, param } = require('express-validator');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   POST /api/posts/:id/comments
 * @desc    Add comment to a post
 * @access  Private
 */
router.post(
  '/:id/comments',
  authMiddleware,
  [
    param('id').isInt().withMessage('Valid post ID is required'),
    body('content').trim().notEmpty().withMessage('Comment content is required')
  ],
  validate,
  commentController.addCommentToPost
);

/**
 * @route   POST /api/comments/:id/reply
 * @desc    Reply to a comment
 * @access  Private
 */
router.post(
  '/:id/reply',
  authMiddleware,
  [
    param('id').isInt().withMessage('Valid comment ID is required'),
    body('content').trim().notEmpty().withMessage('Reply content is required')
  ],
  validate,
  commentController.replyToComment
);

module.exports = router;
