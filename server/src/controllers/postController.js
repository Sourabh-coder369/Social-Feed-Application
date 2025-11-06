const db = require('../db');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

/**
 * Get all posts (paginated)
 * GET /api/posts
 */
async function getAllPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get posts with author information
    const posts = await db('Posts as p')
      .leftJoin('Users as u', 'p.user_id', 'u.user_id')
      .select(
        'p.post_id',
        'p.user_id',
        'p.content',
        'p.image_url',
        'p.video_url',
        'p.created_at',
        'p.likes_count',
        'p.comments_count',
        'u.first_name',
        'u.last_name',
        'u.profile_pic_URL',
        db.raw('CONCAT(u.first_name, " ", u.last_name) as author_name')
      )
      .orderBy('p.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count: total }] = await db('Posts').count('* as count');

    return paginatedResponse(res, posts, page, limit, total);
  } catch (error) {
    console.error('Get all posts error:', error);
    return errorResponse(res, 'Failed to get posts', 500);
  }
}

/**
 * Get single post by ID with comments
 * GET /api/posts/:id
 */
async function getPostById(req, res) {
  try {
    const { id } = req.params;

    // Get post with author
    const post = await db('Posts as p')
      .leftJoin('Users as u', 'p.user_id', 'u.user_id')
      .select(
        'p.*',
        'u.first_name',
        'u.last_name',
        'u.profile_pic_URL',
        db.raw('CONCAT(u.first_name, " ", u.last_name) as author_name')
      )
      .where('p.post_id', id)
      .first();

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    // Get comments for this post with user info
    const comments = await db('Comments as c')
      .leftJoin('Users as u', 'c.user_id', 'u.user_id')
      .select(
        'c.*',
        'u.first_name',
        'u.last_name',
        'u.profile_pic_URL',
        db.raw('CONCAT(u.first_name, " ", u.last_name) as author_name')
      )
      .where('c.post_id', id)
      .orderBy('c.created_at', 'asc');

    return successResponse(res, {
      ...post,
      comments
    });
  } catch (error) {
    console.error('Get post error:', error);
    return errorResponse(res, 'Failed to get post', 500);
  }
}

/**
 * Create a new post
 * POST /api/posts
 */
async function createPost(req, res) {
  try {
    const { userId } = req.user;
    const { content, imageUrl, videoUrl } = req.body;

    // Validate that content is provided
    if (!content || content.trim() === '') {
      return errorResponse(res, 'Post content is required', 400);
    }

    // Insert post (trigger will update user's post_count)
    const [postId] = await db('Posts').insert({
      user_id: userId,
      content: content.trim(),
      image_url: imageUrl || null,
      video_url: videoUrl || null
    });

    // Get created post
    const post = await db('Posts as p')
      .leftJoin('Users as u', 'p.user_id', 'u.user_id')
      .select(
        'p.*',
        'u.first_name',
        'u.last_name',
        'u.profile_pic_URL'
      )
      .where('p.post_id', postId)
      .first();

    return successResponse(res, post, 'Post created successfully', 201);
  } catch (error) {
    console.error('Create post error:', error);
    return errorResponse(res, 'Failed to create post', 500);
  }
}

/**
 * Delete a post
 * DELETE /api/posts/:id
 */
async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Check if post exists and belongs to user
    const post = await db('Posts')
      .where({ post_id: id })
      .first();

    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    if (post.user_id !== userId) {
      return errorResponse(res, 'Not authorized to delete this post', 403);
    }

    // Delete post (trigger will update user's post_count, cascade will delete comments and likes)
    await db('Posts').where({ post_id: id }).del();

    return successResponse(res, null, 'Post deleted successfully');
  } catch (error) {
    console.error('Delete post error:', error);
    return errorResponse(res, 'Failed to delete post', 500);
  }
}

/**
 * Get top liked posts using stored procedure
 * GET /api/posts/top/liked
 */
async function getTopLikedPosts(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Call GetTopLikedPosts stored procedure
    const [posts] = await db.raw('CALL GetTopLikedPosts(?)', [limit]);

    return successResponse(res, posts[0]); // First result set from procedure
  } catch (error) {
    console.error('Get top liked posts error:', error);
    return errorResponse(res, 'Failed to get top posts', 500);
  }
}

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  getTopLikedPosts
};
