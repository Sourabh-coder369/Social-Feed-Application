import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { likeService, commentService, postService } from '../services';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import UserAvatar from './UserAvatar';

const PostCard = ({ post, onUpdate }) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);

  // Fetch comments when showComments is toggled
  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await postService.getPostById(post.post_id);
      setComments(response.data.comments || []);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await likeService.unlikePost(post.post_id);
        setLikesCount((prev) => prev - 1);
        setIsLiked(false);
      } else {
        await likeService.likePost(post.post_id);
        setLikesCount((prev) => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await commentService.addComment(post.post_id, comment);
      setComment('');
      setCommentsCount((prev) => prev + 1);
      toast.success('Comment added!');
      // Refresh comments to show the new one
      await fetchComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.deletePost(post.post_id);
      toast.success('Post deleted successfully');
      if (onUpdate) {
        onUpdate(); // Refresh the posts list
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card mb-4">
      {/* User Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="cursor-pointer hover:opacity-80"
            onClick={() => navigate(`/profile/${post.user_id}`)}
          >
            <UserAvatar 
              user={{
                profile_pic_URL: post.profile_pic_URL,
                first_name: post.first_name,
                last_name: post.last_name
              }} 
              size="sm"
            />
          </div>
          <div className="ml-3">
            <p 
              className="font-semibold text-gray-900 cursor-pointer hover:text-primary-600 transition-colors"
              onClick={() => navigate(`/profile/${post.user_id}`)}
            >
              {post.author_name || `${post.first_name} ${post.last_name}`}
            </p>
            <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
          </div>
        </div>
        
        {/* Delete button - only show if user owns the post */}
        {currentUser && currentUser.user_id === post.user_id && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Delete post"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="text-gray-800 mb-4">{post.content}</p>
      )}

      {/* Media */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post"
          className="w-full rounded-lg mb-4"
        />
      )}
      {post.video_url && (
        <video controls className="w-full rounded-lg mb-4">
          <source src={post.video_url} />
        </video>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6 mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 ${
            isLiked ? 'text-red-600' : 'text-gray-600'
          } hover:text-red-600`}
        >
          <svg
            className="w-6 h-6"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{commentsCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          {/* Existing Comments */}
          {loadingComments ? (
            <p className="text-gray-500 text-sm mb-4">Loading comments...</p>
          ) : comments.length > 0 ? (
            <div className="mb-4 space-y-3">
              {comments.map((c) => (
                <div key={c.comment_id} className="flex space-x-2">
                  <div 
                    className="cursor-pointer hover:opacity-80 flex-shrink-0"
                    onClick={() => navigate(`/profile/${c.user_id}`)}
                  >
                    <UserAvatar 
                      user={{
                        profile_pic_URL: c.profile_pic_URL,
                        first_name: c.first_name,
                        last_name: c.last_name
                      }} 
                      size="xs"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <p 
                        className="font-semibold text-sm text-gray-900 cursor-pointer hover:text-primary-600 transition-colors inline-block"
                        onClick={() => navigate(`/profile/${c.user_id}`)}
                      >
                        {c.author_name || `${c.first_name} ${c.last_name}`}
                      </p>
                      <p className="text-gray-800 text-sm">{c.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 ml-3">
                      {formatDate(c.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-4">No comments yet. Be the first to comment!</p>
          )}

          {/* Comment Input */}
          <form onSubmit={handleComment}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary">
                Post
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
