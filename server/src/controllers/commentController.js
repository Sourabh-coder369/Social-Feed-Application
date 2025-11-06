const db = require('../db');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Add comment to a post
 * POST /api/posts/:id/comments
 */
async function addCommentToPost(req, res) {
  try {
    const { id } = req.params; // post_id
    const { userId } = req.user;
    const { content } = req.body;

    // Check if post exists
    const post = await db('Posts').where({ post_id: id }).first();
    if (!post) {
      return errorResponse(res, 'Post not found', 404);
    }

    // Insert comment (trigger will update post's comments_count)
    const [commentId] = await db('Comments').insert({
      post_id: id,
      user_id: userId,
      content,
      reply_to: null
    });

    // Get created comment with user info
    const comment = await db('Comments as c')
      .leftJoin('Users as u', 'c.user_id', 'u.user_id')
      .select(
        'c.*',
        'u.first_name',
        'u.last_name',
        'u.profile_pic_URL'
      )
      .where('c.comment_id', commentId)
      .first();

    // Send notification to post author (if not commenting on own post)
    if (post.user_id !== userId) {
      const [user] = await db('Users')
        .select('first_name', 'last_name')
        .where({ user_id: userId });
      
      await db.raw('CALL SendNotification(?, ?, ?)', [
        post.user_id,
        `${user.first_name} ${user.last_name} commented on your post`,
        'comment'
      ]);
    }

    return successResponse(res, comment, 'Comment added successfully', 201);
  } catch (error) {
    console.error('Add comment error:', error);
    return errorResponse(res, 'Failed to add comment', 500);
  }
}

/**
 * Reply to a comment
 * POST /api/comments/:id/reply
 */
async function replyToComment(req, res) {
  try {
    const { id } = req.params; // comment_id to reply to
    const { userId } = req.user;
    const { content } = req.body;

    // Check if parent comment exists
    const parentComment = await db('Comments').where({ comment_id: id }).first();
    if (!parentComment) {
      return errorResponse(res, 'Comment not found', 404);
    }

    // Insert reply (trigger will update post's comments_count)
    const [commentId] = await db('Comments').insert({
      post_id: parentComment.post_id,
      user_id: userId,
      content,
      reply_to: id
    });

    // Get created comment with user info
    const comment = await db('Comments as c')
      .leftJoin('Users as u', 'c.user_id', 'u.user_id')
      .select(
        'c.*',
        'u.first_name',
        'u.last_name',
        'u.profile_pic_URL'
      )
      .where('c.comment_id', commentId)
      .first();

    // Send notification to parent comment author (if not replying to own comment)
    if (parentComment.user_id !== userId) {
      const [user] = await db('Users')
        .select('first_name', 'last_name')
        .where({ user_id: userId });
      
      await db.raw('CALL SendNotification(?, ?, ?)', [
        parentComment.user_id,
        `${user.first_name} ${user.last_name} replied to your comment`,
        'comment'
      ]);
    }

    return successResponse(res, comment, 'Reply added successfully', 201);
  } catch (error) {
    console.error('Reply to comment error:', error);
    return errorResponse(res, 'Failed to add reply', 500);
  }
}

module.exports = {
  addCommentToPost,
  replyToComment
};
