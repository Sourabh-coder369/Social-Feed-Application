const express = require('express');
const { body, param } = require('express-validator');
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   GET /api/friends
 * @desc    Get user's friends
 * @access  Private
 */
router.get('/', authMiddleware, friendController.getFriends);

/**
 * @route   GET /api/friends/requests
 * @desc    Get pending friend requests
 * @access  Private
 */
router.get('/requests', authMiddleware, friendController.getFriendRequests);

/**
 * @route   POST /api/friends/request
 * @desc    Send friend request
 * @access  Private
 */
router.post(
  '/request',
  authMiddleware,
  [body('recipientId').isInt().withMessage('Valid recipient ID is required')],
  validate,
  friendController.sendFriendRequest
);

/**
 * @route   POST /api/friends/:id/accept
 * @desc    Accept friend request
 * @access  Private
 */
router.post(
  '/:id/accept',
  authMiddleware,
  [param('id').isInt().withMessage('Valid friendship ID is required')],
  validate,
  friendController.acceptFriendRequest
);

/**
 * @route   DELETE /api/friends/:id
 * @desc    Remove friend / Reject request
 * @access  Private
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Valid friendship ID is required')],
  validate,
  friendController.removeFriend
);

module.exports = router;
