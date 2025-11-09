const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Follow a user
 * POST /api/followers/follow/:userId
 */
async function followUser(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    console.log('Follow request - Current user:', currentUserId, 'Target user:', userId);

    // Check if trying to follow self
    if (parseInt(userId) === currentUserId) {
      console.log('Error: User trying to follow self');
      return errorResponse(res, 'You cannot follow yourself', 400);
    }

    // Check if user exists
    const userExists = await db('Users').where({ user_id: userId }).first();
    if (!userExists) {
      console.log('Error: Target user not found');
      return errorResponse(res, 'User not found', 404);
    }

    // Check if already following
    const existingFollow = await db('Followers')
      .where({
        user_id: currentUserId,
        followed_user_id: userId
      })
      .first();

    if (existingFollow) {
      console.log('Error: Already following this user');
      return errorResponse(res, 'You are already following this user', 400);
    }

    // Create follow relationship
    await db('Followers').insert({
      user_id: currentUserId,
      followed_user_id: userId
    });

    console.log('✓ Follow relationship created');

    // Get current user info for notification
    const currentUserInfo = await db('Users')
      .where({ user_id: currentUserId })
      .select('first_name', 'last_name')
      .first();

    // Create notification for the followed user
    await db('Notifications').insert({
      user_id: userId,
      notification_type: 'other',
      content: `${currentUserInfo.first_name} ${currentUserInfo.last_name} started following you`
    });

    console.log('✓ Notification created');

    return successResponse(res, null, 'Successfully followed user');
  } catch (error) {
    console.error('Follow user error:', error);
    return errorResponse(res, 'Failed to follow user', 500);
  }
}

/**
 * Unfollow a user
 * DELETE /api/followers/unfollow/:userId
 */
async function unfollowUser(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const deleted = await db('Followers')
      .where({
        user_id: currentUserId,
        followed_user_id: userId
      })
      .del();

    if (deleted === 0) {
      return errorResponse(res, 'You are not following this user', 400);
    }

    return successResponse(res, null, 'Successfully unfollowed user');
  } catch (error) {
    console.error('Unfollow user error:', error);
    return errorResponse(res, 'Failed to unfollow user', 500);
  }
}

/**
 * Get followers of a user
 * GET /api/followers/:userId/followers
 */
async function getFollowers(req, res) {
  try {
    const { userId } = req.params;

    const followers = await db('Followers')
      .join('Users', 'Followers.user_id', 'Users.user_id')
      .where('Followers.followed_user_id', userId)
      .select(
        'Users.user_id',
        'Users.first_name',
        'Users.last_name',
        'Users.email',
        'Users.profile_pic_URL',
        'Followers.created_at as followed_at'
      )
      .orderBy('Followers.created_at', 'desc');

    return successResponse(res, followers);
  } catch (error) {
    console.error('Get followers error:', error);
    return errorResponse(res, 'Failed to get followers', 500);
  }
}

/**
 * Get users that a user is following
 * GET /api/followers/:userId/following
 */
async function getFollowing(req, res) {
  try {
    const { userId } = req.params;

    const following = await db('Followers')
      .join('Users', 'Followers.followed_user_id', 'Users.user_id')
      .where('Followers.user_id', userId)
      .select(
        'Users.user_id',
        'Users.first_name',
        'Users.last_name',
        'Users.email',
        'Users.profile_pic_URL',
        'Followers.created_at as followed_at'
      )
      .orderBy('Followers.created_at', 'desc');

    return successResponse(res, following);
  } catch (error) {
    console.error('Get following error:', error);
    return errorResponse(res, 'Failed to get following', 500);
  }
}

/**
 * Check if current user is following another user
 * GET /api/followers/check/:userId
 */
async function checkFollowStatus(req, res) {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;

    const isFollowing = await db('Followers')
      .where({
        user_id: currentUserId,
        followed_user_id: userId
      })
      .first();

    return successResponse(res, { isFollowing: !!isFollowing });
  } catch (error) {
    console.error('Check follow status error:', error);
    return errorResponse(res, 'Failed to check follow status', 500);
  }
}

/**
 * Get follower/following counts for a user
 * GET /api/followers/:userId/stats
 */
async function getFollowerStats(req, res) {
  try {
    const { userId } = req.params;

    const [followersCount] = await db('Followers')
      .where('followed_user_id', userId)
      .count('* as count');

    const [followingCount] = await db('Followers')
      .where('user_id', userId)
      .count('* as count');

    return successResponse(res, {
      followers_count: followersCount.count,
      following_count: followingCount.count
    });
  } catch (error) {
    console.error('Get follower stats error:', error);
    return errorResponse(res, 'Failed to get follower stats', 500);
  }
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowStatus,
  getFollowerStats
};
