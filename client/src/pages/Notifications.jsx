import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import toast from 'react-hot-toast';

const Notifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(50),
  });

  const markReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationCount']);
      toast.success('Marked as read');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notificationCount']);
      toast.success('Notification deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const notifications = data?.data?.notifications || [];
  const unreadCount = data?.data?.unread_count || 0;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'friend_request':
        return '👥';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markReadMutation.mutate(null)}
            className="btn btn-secondary"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.n_id}
              className={`card flex items-start justify-between ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-4 flex-1">
                <span className="text-2xl">
                  {getNotificationIcon(notification.notification_type)}
                </span>
                <div className="flex-1">
                  <p className="text-gray-900">{notification.content}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                {!notification.is_read && (
                  <button
                    onClick={() => markReadMutation.mutate([notification.n_id])}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(notification.n_id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
