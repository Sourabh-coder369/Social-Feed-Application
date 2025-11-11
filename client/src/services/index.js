import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

export const userService = {
  getUserProfile: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  getUserPosts: async (userId, page = 1, limit = 10) => {
    const response = await api.get(`/api/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  },

  searchUsers: async (query, limit = 10) => {
    const response = await api.get('/api/users/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  updateProfilePicture: async (userId, profilePicUrl) => {
    const response = await api.put(`/api/users/${userId}/profile-picture`, {
      profilePicUrl,
    });
    return response.data;
  },
};

export const postService = {
  getAllPosts: async (page = 1, limit = 10) => {
    const response = await api.get('/api/posts', {
      params: { page, limit },
    });
    return response.data;
  },

  getPostById: async (postId) => {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
  },

  createPost: async (postData) => {
    const response = await api.post('/api/posts', postData);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  },

  getTopLikedPosts: async (limit = 10) => {
    const response = await api.get('/api/posts/top/liked', {
      params: { limit },
    });
    return response.data;
  },
};

export const commentService = {
  addComment: async (postId, content) => {
    const response = await api.post(`/api/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  },

  replyToComment: async (commentId, content) => {
    const response = await api.post(`/api/comments/${commentId}/reply`, {
      content,
    });
    return response.data;
  },
};

export const likeService = {
  likePost: async (postId) => {
    const response = await api.post(`/api/posts/${postId}/like`);
    return response.data;
  },

  unlikePost: async (postId) => {
    const response = await api.delete(`/api/posts/${postId}/like`);
    return response.data;
  },

  likeComment: async (commentId) => {
    const response = await api.post(`/api/comments/${commentId}/like`);
    return response.data;
  },

  unlikeComment: async (commentId) => {
    const response = await api.delete(`/api/comments/${commentId}/like`);
    return response.data;
  },
};

export const friendService = {
  getFriends: async () => {
    const response = await api.get('/api/friends');
    return response.data;
  },

  getFriendRequests: async () => {
    const response = await api.get('/api/friends/requests');
    return response.data;
  },

  sendFriendRequest: async (recipientId) => {
    const response = await api.post('/api/friends/request', { recipientId });
    return response.data;
  },

  acceptFriendRequest: async (friendshipId) => {
    const response = await api.post(`/api/friends/${friendshipId}/accept`);
    return response.data;
  },

  removeFriend: async (friendshipId) => {
    const response = await api.delete(`/api/friends/${friendshipId}`);
    return response.data;
  },
};

export const notificationService = {
  getNotifications: async (limit = 50) => {
    const response = await api.get('/api/notifications', {
      params: { limit },
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/api/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationIds = undefined) => {
    // If no IDs provided, send an empty body so validator treats the field as absent
    const payload = Array.isArray(notificationIds) ? { notificationIds } : {};
    const response = await api.post('/api/notifications/mark-read', payload);
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  },
};

export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const followerService = {
  followUser: async (userId) => {
    const response = await api.post(`/api/followers/${userId}/follow`);
    return response.data;
  },

  unfollowUser: async (userId) => {
    const response = await api.delete(`/api/followers/${userId}/unfollow`);
    return response.data;
  },

  getFollowers: async (userId) => {
    const response = await api.get(`/api/followers/${userId}/followers`);
    return response.data;
  },

  getFollowing: async (userId) => {
    const response = await api.get(`/api/followers/${userId}/following`);
    return response.data;
  },

  checkFollowStatus: async (userId) => {
    const response = await api.get(`/api/followers/${userId}/check`);
    return response.data;
  },

  getFollowerStats: async (userId) => {
    const response = await api.get(`/api/followers/${userId}/stats`);
    return response.data;
  },
};
