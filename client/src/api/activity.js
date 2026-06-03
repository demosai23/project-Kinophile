import api from './axios.js';

// ─── Logs ────────────────────────────────────────────────────────────────────
export const logMovie = (data) => api.post('/logs', data);
export const removeLog = (tmdbId) => api.delete(`/logs/${tmdbId}`);
export const rateMovie = (tmdbId, rating) => api.patch(`/logs/${tmdbId}/rate`, { rating });
export const toggleLike = (tmdbId) => api.patch(`/logs/${tmdbId}/like`);
export const getMyLogs = () => api.get('/logs');
export const checkLog = (tmdbId) => api.get(`/logs/check/${tmdbId}`);
export const getUserLogs = (username) => api.get(`/logs/user/${username}`);

// ─── Reviews ─────────────────────────────────────────────────────────────────
export const createReview = (data) => api.post('/reviews', data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const getMovieReviews = (tmdbId) => api.get(`/reviews/movie/${tmdbId}`);
export const getUserReviews = (username) => api.get(`/reviews/user/${username}`);
export const toggleReviewLike = (id) => api.patch(`/reviews/${id}/like`);

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const addToWatchlist = (data) => api.post('/watchlist', data);
export const removeFromWatchlist = (tmdbId) => api.delete(`/watchlist/${tmdbId}`);
export const getMyWatchlist = () => api.get('/watchlist');
export const checkWatchlist = (tmdbId) => api.get(`/watchlist/check/${tmdbId}`);