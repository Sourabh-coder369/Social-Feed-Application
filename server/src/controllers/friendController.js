const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user's friends list
 * GET /api/friends
 */
async function getFriends(req, res) {
  try {
    const { userId } = req.user;

    // Get accepted friendships (both directions)
    const friends = await db.raw(`
      SELECT DISTINCT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.profile_pic_URL,
        f.created_at as friends_since,
        f.friendship_id
      FROM Friends f
      INNER JOIN Users u ON (
        (f.user_id = ? AND f.recipient_id = u.user_id) OR
        (f.recipient_id = ? AND f.user_id = u.user_id)
      )
      WHERE (f.user_id = ? OR f.recipient_id = ?)
        AND f.status = 'accepted'
        AND f.is_accepted = TRUE
      ORDER BY f.created_at DESC
    `, [userId, userId, userId, userId]);

    return successResponse(res, friends[0]);
  } catch (error) {
    console.error('Get friends error:', error);
    return errorResponse(res, 'Failed to get friends', 500);
  }
}

/**
 * Get pending friend requests
 * GET /api/friends/requests
 */
async function getFriendRequests(req, res) {
  try {
    const { userId } = req.user;

    // Get pending requests where user is the recipient
    const requests = await db('Friends as f')
      .leftJoin('Users as u', 'f.user_id', 'u.user_id')
      .select(
        'f.friendship_id',
        'f.user_id',
        'f.created_at',
        'u.first_name',
        'u.last_name',
        'u.email',
        'u.profile_pic_URL'
      )
      .where('f.recipient_id', userId)
      .where('f.status', 'pending')
      .where('f.is_accepted', false)
      .orderBy('f.created_at', 'desc');

    return successResponse(res, requests);
  } catch (error) {
    console.error('Get friend requests error:', error);
    return errorResponse(res, 'Failed to get friend requests', 500);
  }
}

/**
 * Send friend request
 * POST /api/friends/request
 */
async function sendFriendRequest(req, res) {
  try {
    const { userId } = req.user;
    const { recipientId } = req.body;

    // Validate recipient exists
    const recipient = await db('Users').where({ user_id: recipientId }).first();
    if (!recipient) {
      return errorResponse(res, 'User not found', 404);
    }

    // Cannot send request to self
    if (userId === recipientId) {
      return errorResponse(res, 'Cannot send friend request to yourself', 400);
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await db('Friends')
      .where(function() {
        this.where({ user_id: userId, recipient_id: recipientId })
          .orWhere({ user_id: recipientId, recipient_id: userId });
      })
      .first();

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return errorResponse(res, 'Already friends', 400);
      } else if (existingFriendship.status === 'pending') {
        return errorResponse(res, 'Friend request already sent', 400);
      } else if (existingFriendship.status === 'blocked') {
        return errorResponse(res, 'Cannot send friend request', 403);
      }
    }

    // Insert friend request
    const [friendshipId] = await db('Friends').insert({
      user_id: userId,
      recipient_id: recipientId,
      status: 'pending',
      is_accepted: false
    });

    // Send notification
    const [user] = await db('Users')
      .select('first_name', 'last_name')
      .where({ user_id: userId });
    
    await db.raw('CALL SendNotification(?, ?, ?)', [
      recipientId,
      `${user.first_name} ${user.last_name} sent you a friend request`,
      'friend_request'
    ]);

    return successResponse(res, { friendship_id: friendshipId }, 'Friend request sent', 201);
  } catch (error) {
    console.error('Send friend request error:', error);
    return errorResponse(res, 'Failed to send friend request', 500);
  }
}

/**
 * Accept friend request
 * POST /api/friends/:id/accept
 */
async function acceptFriendRequest(req, res) {
  try {
    const { id } = req.params; // friendship_id
    const { userId } = req.user;

    // Get friendship
    const friendship = await db('Friends').where({ friendship_id: id }).first();
    if (!friendship) {
      return errorResponse(res, 'Friend request not found', 404);
    }

    // Verify user is the recipient
    if (friendship.recipient_id !== userId) {
      return errorResponse(res, 'Not authorized to accept this request', 403);
    }

    // Verify request is pending
    if (friendship.status !== 'pending') {
      return errorResponse(res, 'Friend request is not pending', 400);
    }

    // Update friendship
    await db('Friends')
      .where({ friendship_id: id })
      .update({
        status: 'accepted',
        is_accepted: true
      });

    // Send notification to requester
    const [user] = await db('Users')
      .select('first_name', 'last_name')
      .where({ user_id: userId });
    
    await db.raw('CALL SendNotification(?, ?, ?)', [
      friendship.user_id,
      `${user.first_name} ${user.last_name} accepted your friend request`,
      'friend_request'
    ]);

    return successResponse(res, null, 'Friend request accepted');
  } catch (error) {
    console.error('Accept friend request error:', error);
    return errorResponse(res, 'Failed to accept friend request', 500);
  }
}

/**
 * Reject/Remove friend
 * DELETE /api/friends/:id
 */
async function removeFriend(req, res) {
  try {
    const { id } = req.params; // friendship_id
    const { userId } = req.user;

    // Get friendship
    const friendship = await db('Friends').where({ friendship_id: id }).first();
    if (!friendship) {
      return errorResponse(res, 'Friendship not found', 404);
    }

    // Verify user is part of this friendship
    if (friendship.user_id !== userId && friendship.recipient_id !== userId) {
      return errorResponse(res, 'Not authorized to remove this friendship', 403);
    }

    // Delete friendship
    await db('Friends').where({ friendship_id: id }).del();

    return successResponse(res, null, 'Friend removed successfully');
  } catch (error) {
    console.error('Remove friend error:', error);
    return errorResponse(res, 'Failed to remove friend', 500);
  }
}

module.exports = {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend
};
