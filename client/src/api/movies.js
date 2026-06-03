import api from './axios.js';

export const searchMovies = (query, page = 1) =>
  api.get(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`);

export const getTrending = () => api.get('/movies/trending');

export const getPopular = () => api.get('/movies/popular');

export const getGenres = () => api.get('/movies/genres');

export const discoverMovies = (genre, page = 1, sort_by = 'popularity.desc') =>
  api.get(`/movies/discover?genre=${genre}&page=${page}&sort_by=${sort_by}`);

export const getMovieById = (id) => api.get(`/movies/${id}`);