const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Like a post
 * POST /api/posts/:id/like
 */
async function likePost(req, res) {
  try {
    const { id } = req.params; // post_id
    const { userId } = req.user;

    // Check if post exists
    const post = await db('Posts').where({ post_id: id }).first();
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    // Check if user already liked this post
    const existingLike = await db('Likes')
      .where({ user_id: userId, post_id: id, like_type: 'post' })
      .first();

    if (existingLike) {
      return errorResponse(res, 'Post already liked', 400);
    }

    // Insert like (trigger will update post's likes_count)
    const [likeId] = await db('Likes').insert({
      user_id: userId,
      post_id: id,
      comment_id: null,
      like_type: 'post'
    });

    // Send notification to post author (if not liking own post)
    if (post.user_id !== userId) {
      const [user] = await db('Users')
        .select('first_name', 'last_name')
        .where({ user_id: userId });
      
      await db.raw('CALL SendNotification(?, ?, ?)', [
        post.user_id,
        `${user.first_name} ${user.last_name} liked your post`,
        'like'
      ]);
    }

    return successResponse(res, { like_id: likeId }, 'Post liked successfully', 201);
  } catch (error) {
    console.error('Like post error:', error);
    return errorResponse(res, 'Failed to like post', 500);
  }
}

/**
 * Unlike a post
 * DELETE /api/posts/:id/like
 */
async function unlikePost(req, res) {
  try {
    const { id } = req.params; // post_id
    const { userId } = req.user;

    // Delete like (trigger will update post's likes_count)
    const deleted = await db('Likes')
      .where({ user_id: userId, post_id: id, like_type: 'post' })
      .del();

    if (!deleted) {
      return errorResponse(res, 'Like not found', 404);
    }

    return successResponse(res, null, 'Post unliked successfully');
  } catch (error) {
    console.error('Unlike post error:', error);
    return errorResponse(res, 'Failed to unlike post', 500);
  }
}

/**
 * Like a comment
 * POST /api/comments/:id/like
 */
async function likeComment(req, res) {
  try {
    const { id } = req.params; // comment_id
    const { userId } = req.user;

    // Check if comment exists
    const comment = await db('Comments').where({ comment_id: id }).first();
    if (!comment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    // Check if user already liked this comment
    const existingLike = await db('Likes')
      .where({ user_id: userId, comment_id: id, like_type: 'comment' })
      .first();

    if (existingLike) {
      return errorResponse(res, 'Comment already liked', 400);
    }

    // Insert like (trigger will update comment's likes_count)
    const [likeId] = await db('Likes').insert({
      user_id: userId,
      post_id: null,
      comment_id: id,
      like_type: 'comment'
    });

    // Send notification to comment author (if not liking own comment)
    if (comment.user_id !== userId) {
      const [user] = await db('Users')
        .select('first_name', 'last_name')
        .where({ user_id: userId });
      
      await db.raw('CALL SendNotification(?, ?, ?)', [
        comment.user_id,
        `${user.first_name} ${user.last_name} liked your comment`,
        'like'
      ]);
    }

    return successResponse(res, { like_id: likeId }, 'Comment liked successfully', 201);
  } catch (error) {
    console.error('Like comment error:', error);
    return errorResponse(res, 'Failed to like comment', 500);
  }
}

/**
 * Unlike a comment
 * DELETE /api/comments/:id/like
 */
async function unlikeComment(req, res) {
  try {
    const { id } = req.params; // comment_id
    const { userId } = req.user;

    // Delete like (trigger will update comment's likes_count)
    const deleted = await db('Likes')
      .where({ user_id: userId, comment_id: id, like_type: 'comment' })
      .del();

    if (!deleted) {
      return errorResponse(res, 'Like not found', 404);
    }

    return successResponse(res, null, 'Comment unliked successfully');
  } catch (error) {
    console.error('Unlike comment error:', error);
    return errorResponse(res, 'Failed to unlike comment', 500);
  }
}

module.exports = {
  likePost,
  unlikePost,
  likeComment,
  unlikeComment
};
