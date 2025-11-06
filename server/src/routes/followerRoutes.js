const express = require('express');
const { param } = require('express-validator');
const followerController = require('../controllers/followerController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   POST /api/followers/:userId/follow
 * @desc    Follow a user
 * @access  Private
 */
router.post(
  '/:userId/follow',
  authMiddleware,
  [param('userId').isInt().withMessage('Valid user ID is required')],
  validate,
  followerController.followUser
);

/**
 * @route   DELETE /api/followers/:userId/unfollow
 * @desc    Unfollow a user
 * @access  Private
 */
router.delete(
  '/:userId/unfollow',
  authMiddleware,
  [param('userId').isInt().withMessage('Valid user ID is required')],
  validate,
  followerController.unfollowUser
);

/**
 * @route   GET /api/followers/:userId/check
 * @desc    Check if current user is following another user
 * @access  Private
 */
router.get(
  '/:userId/check',
  authMiddleware,
  [param('userId').isInt().withMessage('Valid user ID is required')],
  validate,
  followerController.checkFollowStatus
);

/**
 * @route   GET /api/followers/:userId/stats
 * @desc    Get follower/following counts
 * @access  Public
 */
router.get(
  '/:userId/stats',
  [param('userId').isInt().withMessage('Valid user ID is required')],
  validate,
  followerController.getFollowerStats
);

/**
 * @route   GET /api/followers/:userId/followers
 * @desc    Get followers of a user
 * @access  Public
 */
router.get(
  '/:userId/followers',
  [param('userId').isInt().withMessage('Valid user ID is required')],
  validate,
  followerController.getFollowers
);

/**
 * @route   GET /api/followers/:userId/following
 * @desc    Get users that a user is following
 * @access  Public
 */
router.get(
  '/:userId/following',
  [param('userId').isInt().withMessage('Valid user ID is required')],
  validate,
  followerController.getFollowing
);

module.exports = router;
