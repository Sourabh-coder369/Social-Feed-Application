import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { followerService } from '../services';
import { useAuth } from '../context/AuthContext';

const Following = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('followers'); // 'followers' or 'following'

  // Get followers
  const { data: followersData, isLoading: followersLoading, error: followersError } = useQuery({
    queryKey: ['followers', user?.user_id],
    queryFn: () => followerService.getFollowers(user?.user_id),
    enabled: !!user?.user_id,
  });

  // Get following
  const { data: followingData, isLoading: followingLoading, error: followingError } = useQuery({
    queryKey: ['following', user?.user_id],
    queryFn: () => followerService.getFollowing(user?.user_id),
    enabled: !!user?.user_id,
  });

  const followers = followersData?.data || [];
  const following = followingData?.data || [];

  // Debug logging
  console.log('User:', user);
  console.log('User ID:', user?.user_id);
  console.log('Followers data:', followersData);
  console.log('Following data:', followingData);
  console.log('Followers array:', followers);
  console.log('Following array:', following);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const UserCard = ({ user }) => (
    <div
      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleUserClick(user.user_id)}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
        {user.first_name?.[0]}{user.last_name?.[0]}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">
          {user.first_name} {user.last_name}
        </h3>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Following</h1>
          <p className="text-gray-600">
            See who follows you and who you're following
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'followers'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Followers
                  {followers.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {followers.length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'following'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Following
                  {following.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {following.length}
                    </span>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'followers' && (
            <>
              {followersLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : followers.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No followers yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    When people follow you, they'll appear here
                  </p>
                </div>
              ) : (
                followers.map((follower) => (
                  <UserCard key={follower.user_id} user={follower} />
                ))
              )}
            </>
          )}

          {activeTab === 'following' && (
            <>
              {followingLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : following.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Not following anyone yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Search for users to follow them
                  </p>
                  <button
                    onClick={() => navigate('/friends')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Find People
                  </button>
                </div>
              ) : (
                following.map((user) => (
                  <UserCard key={user.user_id} user={user} />
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Following;
