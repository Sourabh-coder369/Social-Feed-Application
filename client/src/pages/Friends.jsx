import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendService, userService } from '../services';
import toast from 'react-hot-toast';
import UserAvatar from '../components/UserAvatar';

const Friends = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const { data: friendsData, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: friendService.getFriends,
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: friendService.getFriendRequests,
  });

  const acceptMutation = useMutation({
    mutationFn: friendService.acceptFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['friendRequests']);
      toast.success('Friend request accepted!');
    },
  });

  const removeMutation = useMutation({
    mutationFn: friendService.removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['friendRequests']);
      toast.success('Removed successfully');
    },
  });

  const sendRequestMutation = useMutation({
    mutationFn: (recipientId) => friendService.sendFriendRequest(recipientId),
    onSuccess: () => {
      toast.success('Friend request sent!');
      setSearchQuery('');
      setSearchResults([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to send request');
    },
  });

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await userService.searchUsers(searchQuery.trim());
        setSearchResults(response.data || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendRequestToUser = (userId) => {
    sendRequestMutation.mutate(userId);
  };

  if (friendsLoading || requestsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const friends = friendsData?.data || [];
  const requests = requestsData?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Friends</h1>

      {/* Send Friend Request */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Send Friend Request</h2>
        
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people by name..."
            className="input w-full"
          />
          
          {/* Search Results */}
          {searching && (
            <div className="mt-2 text-center text-gray-600">
              <span className="inline-block animate-spin">🔍</span> Searching...
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <UserAvatar 
                      user={{
                        profile_pic_URL: user.profile_pic_URL,
                        first_name: user.full_name?.split(' ')[0],
                        last_name: user.full_name?.split(' ')[1]
                      }} 
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequestToUser(user.user_id)}
                    disabled={sendRequestMutation.isPending}
                    className="btn btn-primary btn-sm"
                  >
                    {sendRequestMutation.isPending ? '...' : 'Send Request'}
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
            <div className="mt-2 text-center text-gray-600">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Friend Requests */}
      {requests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.friendship_id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <UserAvatar 
                      user={{
                        profile_pic_URL: request.profile_pic_URL,
                        first_name: request.first_name,
                        last_name: request.last_name
                      }} 
                      size="md"
                    />
                    <div>
                      <p className="font-semibold">
                        {request.first_name} {request.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{request.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptMutation.mutate(request.friendship_id)}
                      className="btn btn-primary"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(request.friendship_id)}
                      className="btn btn-secondary"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Your Friends ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No friends yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <div key={friend.friendship_id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <UserAvatar 
                      user={{
                        profile_pic_URL: friend.profile_pic_URL,
                        first_name: friend.first_name,
                        last_name: friend.last_name
                      }} 
                      size="md"
                    />
                    <div>
                      <p className="font-semibold">
                        {friend.first_name} {friend.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{friend.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMutation.mutate(friend.friendship_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
