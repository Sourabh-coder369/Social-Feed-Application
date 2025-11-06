const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user profile by ID
 * GET /api/users/:id
 */
async function getUserProfile(req, res) {
  try {
    const { id } = req.params;

    // Get user with age using GetUserAge function
    const [userResult] = await db.raw(`
      SELECT 
        u.*,
        GetUserAge(u.user_id) as age,
        GetTotalLikesForUser(u.user_id) as total_likes
      FROM Users u
      WHERE u.user_id = ?
    `, [id]);

    const user = userResult[0];

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Get phone numbers
    const phoneNumbers = await db('PhoneNumbers')
      .where({ user_id: id })
      .select('phone_number');

    // Get follower counts
    const [followersCount] = await db('Followers')
      .where('followed_user_id', id)
      .count('* as count');

    const [followingCount] = await db('Followers')
      .where('user_id', id)
      .count('* as count');

    // Remove password hash from response
    delete user.password_hash;

    return successResponse(res, {
      ...user,
      phone_numbers: phoneNumbers.map(p => p.phone_number),
      followers_count: followersCount.count,
      following_count: followingCount.count
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return errorResponse(res, 'Failed to get user profile', 500);
  }
}

/**
 * Get user posts (paginated) using stored procedure
 * GET /api/users/:id/posts
 */
async function getUserPosts(req, res) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Call GetUserPosts stored procedure
    const [posts] = await db.raw('CALL GetUserPosts(?, ?, ?)', [id, page, limit]);

    // Get total count for pagination
    const [totalResult] = await db('Posts')
      .where({ user_id: id })
      .count('* as count');
    
    const total = totalResult.count;

    return res.status(200).json({
      success: true,
      data: posts[0], // First result set from procedure
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    return errorResponse(res, 'Failed to get user posts', 500);
  }
}

/**
 * Search users by name
 * GET /api/users/search?q=searchQuery
 */
async function searchUsers(req, res) {
  try {
    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    if (!q || q.trim() === '') {
      return successResponse(res, []);
    }

    const searchTerm = `%${q.trim()}%`;

    // Search users by first name, last name, or full name
    const users = await db('Users')
      .select(
        'user_id',
        'first_name',
        'last_name',
        'email',
        'profile_pic_URL',
        db.raw('CONCAT(first_name, " ", last_name) as full_name')
      )
      .where(function() {
        this.where('first_name', 'LIKE', searchTerm)
          .orWhere('last_name', 'LIKE', searchTerm)
          .orWhere(db.raw('CONCAT(first_name, " ", last_name)'), 'LIKE', searchTerm);
      })
      .limit(limit);

    return successResponse(res, users);
  } catch (error) {
    console.error('Search users error:', error);
    return errorResponse(res, 'Failed to search users', 500);
  }
}

/**
 * Update user profile picture
 * PUT /api/users/:id/profile-picture
 */
async function updateProfilePicture(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { profilePicUrl } = req.body;

    // Check if user is updating their own profile
    if (parseInt(id) !== userId) {
      return errorResponse(res, 'Not authorized to update this profile', 403);
    }

    if (!profilePicUrl) {
      return errorResponse(res, 'Profile picture URL is required', 400);
    }

    // Update profile picture
    await db('Users')
      .where({ user_id: id })
      .update({ profile_pic_URL: profilePicUrl });

    return successResponse(res, { profile_pic_URL: profilePicUrl }, 'Profile picture updated successfully');
  } catch (error) {
    console.error('Update profile picture error:', error);
    return errorResponse(res, 'Failed to update profile picture', 500);
  }
}

module.exports = {
  getUserProfile,
  getUserPosts,
  searchUsers,
  updateProfilePicture
};
