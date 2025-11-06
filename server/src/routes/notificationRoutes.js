const express = require('express');
const { body, param, query } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get(
  '/',
  authMiddleware,
  [query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')],
  validate,
  notificationController.getNotifications
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notifications count
 * @access  Private
 */
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

/**
 * @route   POST /api/notifications/mark-read
 * @desc    Mark notifications as read
 * @access  Private
 */
router.post(
  '/mark-read',
  authMiddleware,
  [body('notificationIds').optional().isArray().withMessage('Notification IDs must be an array')],
  validate,
  notificationController.markNotificationsAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage('Valid notification ID is required')],
  validate,
  notificationController.deleteNotification
);

module.exports = router;
