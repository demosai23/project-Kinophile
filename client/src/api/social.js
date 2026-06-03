import api from './axios.js';

// Follow
export const followUser = (username) => api.post(`/follow/${username}`);
export const unfollowUser = (username) => api.delete(`/follow/${username}`);
export const getFollowStatus = (username) => api.get(`/follow/${username}/status`);
export const getFollowers = (username) => api.get(`/follow/${username}/followers`);
export const getFollowing = (username) => api.get(`/follow/${username}/following`);

// Comments on reviews
export const addReviewComment = (reviewId, body) => api.post('/comments', { reviewId, body });
export const deleteReviewComment = (id) => api.delete(`/comments/${id}`);
export const getReviewComments = (reviewId) => api.get(`/comments/review/${reviewId}`);

// Feed
export const getFeed = (page = 1) => api.get(`/feed?page=${page}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markAllRead = () => api.patch('/notifications/read');
export const markOneRead = (id) => api.patch(`/notifications/${id}/read`);

// Profile
export const getProfile = (username) => api.get(`/profile/${username}`);
export const searchUsers = (q) => api.get(`/profile/search?q=${encodeURIComponent(q)}`);