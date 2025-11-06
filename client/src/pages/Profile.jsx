import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState, useRef } from 'react';
import { userService, uploadService } from '../services';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import UserAvatar from '../components/UserAvatar';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const isOwnProfile = currentUser?.user_id === parseInt(userId);

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userService.getUserProfile(userId),
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', userId],
    queryFn: () => userService.getUserPosts(userId, 1, 20),
  });

  const updateProfilePicMutation = useMutation({
    mutationFn: ({ userId, profilePicUrl }) =>
      userService.updateProfilePicture(userId, profilePicUrl),
    onSuccess: (response) => {
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        storedUser.profile_pic_URL = response.data.profile_pic_URL;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries(['profile', userId]);
      queryClient.invalidateQueries(['userPosts']);
      
      // Force a page reload to update navbar and other components
      window.location.reload();
      
      setIsUploading(false);
      setUploadError('');
    },
    onError: (error) => {
      setUploadError(error.response?.data?.message || 'Failed to update profile picture');
      setIsUploading(false);
    },
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Upload image
      const uploadResponse = await uploadService.uploadImage(file);
      const imageUrl = uploadResponse.data.url;

      // Update profile picture
      await updateProfilePicMutation.mutateAsync({
        userId: currentUser.user_id,
        profilePicUrl: imageUrl,
      });
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Failed to upload image');
      setIsUploading(false);
    }
  };

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
          <div className="relative">
            <UserAvatar user={user} size="lg" />
            {isOwnProfile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50"
                title="Change profile picture"
              >
                {isUploading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.first_name} {user?.last_name}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
            {uploadError && (
              <p className="text-red-600 text-sm mt-2">{uploadError}</p>
            )}
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
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user?.post_count || 0}</p>
            <p className="text-gray-600">Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{user?.followers_count || 0}</p>
            <p className="text-gray-600">Followers</p>
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
