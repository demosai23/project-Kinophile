import api from './axios.js';

export const getFilmStats = (tmdbId) => api.get(`/stats/film/${tmdbId}`);
export const getMyDiary = () => api.get('/diary');
export const getUserDiary = (username) => api.get(`/diary/${username}`);