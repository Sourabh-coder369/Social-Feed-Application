import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { notificationService, friendService } from '../services';
import UserAvatar from './UserAvatar';

const Navbar = () => {
  const { user, logout } = useAuth();

  // Fetch unread notifications count
  const { data: notificationCountData } = useQuery({
    queryKey: ['notificationCount'],
    queryFn: notificationService.getUnreadCount,
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch friend requests count
  const { data: friendRequestsData } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: friendService.getFriendRequests,
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadNotifications = notificationCountData?.data?.count || 0;
  const pendingRequests = friendRequestsData?.data?.length || 0;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Social Feed
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium"
              >
                Feed
              </Link>
              <Link
                to="/friends"
                className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium relative"
              >
                Friends
                {pendingRequests > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingRequests}
                  </span>
                )}
              </Link>
              <Link
                to="/notifications"
                className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium relative"
              >
                Notifications
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <Link
                  to={`/profile/${user.user_id}`}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <div className="flex items-center space-x-2">
                    <UserAvatar user={user} size="xs" />
                    <span className="hidden sm:inline">{user.first_name}</span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="btn btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
