import api from './axios.js';

export const createList = (data) => api.post('/lists', data);
export const getMyLists = () => api.get('/lists/my');
export const getUserLists = (username) => api.get(`/lists/user/${username}`);
export const getListById = (id) => api.get(`/lists/${id}`);
export const updateList = (id, data) => api.put(`/lists/${id}`, data);
export const deleteList = (id) => api.delete(`/lists/${id}`);
export const addMovieToList = (id, data) => api.post(`/lists/${id}/movies`, data);
export const removeMovieFromList = (id, tmdbId) => api.delete(`/lists/${id}/movies/${tmdbId}`);
export const reorderMovies = (id, orderedTmdbIds) => api.patch(`/lists/${id}/reorder`, { orderedTmdbIds });
export const toggleListLike = (id) => api.patch(`/lists/${id}/like`);
export const addComment = (id, body) => api.post(`/lists/${id}/comments`, { body });
export const deleteComment = (id, commentId) => api.delete(`/lists/${id}/comments/${commentId}`);