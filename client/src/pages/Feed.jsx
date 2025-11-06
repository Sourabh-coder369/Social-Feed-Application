import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postService } from '../services';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import toast from 'react-hot-toast';

const Feed = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => postService.getAllPosts(page, limit),
  });

  const handlePostCreated = () => {
    setPage(1);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load posts');
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load posts</p>
      </div>
    );
  }

  const posts = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <CreatePost onPostCreated={handlePostCreated} />

      <div className="mt-8">
        {posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No posts yet. Be the first to post!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} onUpdate={refetch} />
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="flex items-center px-4">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;
