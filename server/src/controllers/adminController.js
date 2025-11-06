const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get admin statistics
 * GET /api/admin/stats
 */
async function getAdminStats(req, res) {
  try {
    // Get counts
    const [userCount] = await db('Users').count('* as count');
    const [postCount] = await db('Posts').count('* as count');
    const [commentCount] = await db('Comments').count('* as count');
    const [likeCount] = await db('Likes').count('* as count');
    const [friendshipCount] = await db('Friends')
      .where({ status: 'accepted' })
      .count('* as count');

    // Get total likes on all posts
    const [totalPostLikes] = await db('Posts')
      .sum('likes_count as total')
      .first();

    // Get most active users
    const topUsers = await db('Users')
      .select('user_id', 'first_name', 'last_name', 'post_count', 'followers_count')
      .orderBy('post_count', 'desc')
      .limit(10);

    // Get recent activity
    const recentPosts = await db('Posts')
      .count('* as count')
      .where('created_at', '>=', db.raw('DATE_SUB(NOW(), INTERVAL 7 DAY)'))
      .first();

    const stats = {
      total_users: userCount.count,
      total_posts: postCount.count,
      total_comments: commentCount.count,
      total_likes: likeCount.count,
      total_friendships: friendshipCount.count,
      total_post_likes: totalPostLikes.total || 0,
      top_users: topUsers,
      recent_posts_7_days: recentPosts.count
    };

    return successResponse(res, stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    return errorResponse(res, 'Failed to get statistics', 500);
  }
}

module.exports = {
  getAdminStats
};
