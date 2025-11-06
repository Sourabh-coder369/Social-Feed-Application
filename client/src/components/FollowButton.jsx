import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followerService } from '../services';
import toast from 'react-hot-toast';

const FollowButton = ({ userId, size = 'sm' }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check follow status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await followerService.checkFollowStatus(userId);
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error('Error checking follow status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [userId]);

  const followMutation = useMutation({
    mutationFn: followerService.followUser,
    onSuccess: () => {
      setIsFollowing(true);
      queryClient.invalidateQueries(['profile', userId]);
      toast.success('Following user');
    },
    onError: (error) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to follow user';
      toast.error(message);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: followerService.unfollowUser,
    onSuccess: () => {
      setIsFollowing(false);
      queryClient.invalidateQueries(['profile', userId]);
      toast.success('Unfollowed user');
    },
    onError: (error) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to unfollow user';
      toast.error(message);
    },
  });

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  if (loading) {
    return (
      <button
        disabled
        className={`btn btn-secondary btn-${size}`}
      >
        ...
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={followMutation.isPending || unfollowMutation.isPending}
      className={`btn ${isFollowing ? 'btn-secondary' : 'btn-secondary'} btn-${size}`}
    >
      {followMutation.isPending || unfollowMutation.isPending
        ? '...'
        : isFollowing
        ? 'Unfollow'
        : 'Follow'}
    </button>
  );
};

export default FollowButton;
