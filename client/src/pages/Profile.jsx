import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { userService, followerService } from '../services';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import UserAvatar from '../components/UserAvatar';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const isOwnProfile = currentUser?.user_id === parseInt(userId);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userService.getUserProfile(userId),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => userService.getUserPosts(userId, 1, 20),
  });

  // Check if current user is following this profile
  const { data: followStatusData } = useQuery({
    queryKey: ['followStatus', userId],
    queryFn: () => followerService.checkFollowStatus(userId),
    enabled: !!currentUser && !isOwnProfile,
  });

  const followMutation = useMutation({
    mutationFn: followerService.followUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['followStatus', userId]);
      queryClient.invalidateQueries(['profile', userId]);
      toast.success('Following user');
    },
    onError: (error) => {
      console.error('Follow error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to follow user';
      toast.error(message);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: followerService.unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['followStatus', userId]);
      queryClient.invalidateQueries(['profile', userId]);
      toast.success('Unfollowed user');
    },
    onError: (error) => {
      console.error('Unfollow error:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to unfollow user';
      toast.error(message);
    },
  });

  if (profileLoading || postsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const user = profileData?.data;
  const posts = postsData?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="flex items-center space-x-6">
          <div>
            <UserAvatar user={user} size="lg" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-gray-500">User ID: {user?.user_id}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(user?.user_id);
                  const toast = document.createElement('div');
                  toast.textContent = 'User ID copied!';
                  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2000);
                }}
                className="text-xs text-primary-600 hover:text-primary-700 underline cursor-pointer"
              >
                Copy
              </button>
            </div>
            <p className="text-gray-500 mt-1">Age: {user?.age} years old</p>
            
            {/* Follow Button */}
            {!isOwnProfile && currentUser && (
              <div className="mt-4">
                {followStatusData?.data?.isFollowing ? (
                  <button
                    onClick={() => unfollowMutation.mutate(userId)}
                    disabled={unfollowMutation.isPending}
                    className="btn btn-secondary"
                  >
                    {unfollowMutation.isPending ? 'Unfollowing...' : 'Unfollow'}
                  </button>
                ) : (
                  <button
                    onClick={() => followMutation.mutate(userId)}
                    disabled={followMutation.isPending}
                    className="btn btn-primary"
                  >
                    {followMutation.isPending ? 'Following...' : 'Follow'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user?.post_count || 0}</p>
            <p className="text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user?.followers_count || 0}</p>
            <p className="text-gray-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user?.following_count || 0}</p>
            <p className="text-gray-600">Following</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user?.total_likes || 0}</p>
            <p className="text-gray-600">Total Likes</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Posts</h2>
        {posts.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No posts yet</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.post_id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default Profile;
