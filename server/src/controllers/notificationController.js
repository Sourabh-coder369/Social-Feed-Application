const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user notifications
 * GET /api/notifications
 */
async function getNotifications(req, res) {
  try {
    const { userId } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    // Get notifications
    const notifications = await db('Notifications')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit);

    // Get unread count using function
    const [unreadResult] = await db.raw('SELECT GetUnreadNotifications(?) as unread_count', [userId]);
    const unreadCount = unreadResult[0].unread_count;

    return successResponse(res, {
      notifications,
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 'Failed to get notifications', 500);
  }
}

/**
 * Get unread notifications count
 * GET /api/notifications/unread-count
 */
async function getUnreadCount(req, res) {
  try {
    const { userId } = req.user;

    // Use GetUnreadNotifications function
    const [result] = await db.raw('SELECT GetUnreadNotifications(?) as unread_count', [userId]);
    const unreadCount = result[0].unread_count;

    return successResponse(res, { unread_count: unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    return errorResponse(res, 'Failed to get unread count', 500);
  }
}

/**
 * Mark notifications as read
 * POST /api/notifications/mark-read
 */
async function markNotificationsAsRead(req, res) {
  try {
    const { userId } = req.user;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      // Mark all as read
      await db('Notifications')
        .where({ user_id: userId, is_read: false })
        .update({ is_read: true });
    } else {
      // Mark specific notifications as read
      await db('Notifications')
        .whereIn('n_id', notificationIds)
        .where({ user_id: userId })
        .update({ is_read: true });
    }

    return successResponse(res, null, 'Notifications marked as read');
  } catch (error) {
    console.error('Mark notifications as read error:', error);
    return errorResponse(res, 'Failed to mark notifications as read', 500);
  }
}

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
async function deleteNotification(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Delete notification (only if belongs to user)
    const deleted = await db('Notifications')
      .where({ n_id: id, user_id: userId })
      .del();

    if (!deleted) {
      return errorResponse(res, 'Notification not found', 404);
    }

    return successResponse(res, null, 'Notification deleted');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse(res, 'Failed to delete notification', 500);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationsAsRead,
  deleteNotification
};
