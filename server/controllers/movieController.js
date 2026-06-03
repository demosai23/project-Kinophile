import asyncHandler from 'express-async-handler';
import fetch from 'node-fetch';

const TMDB_BASE = process.env.TMDB_BASE_URL;
const TMDB_KEY = process.env.TMDB_API_KEY;

const tmdb = async (endpoint, params = {}) => {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.append('api_key', TMDB_KEY);
  url.searchParams.append('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = new Error(`TMDb error: ${res.status}`);
    err.statusCode = res.status;
    throw err;
  }
  return res.json();
};

// GET /api/movies/search?query=inception&page=1
export const searchMovies = asyncHandler(async (req, res) => {
  const { query, page = 1 } = req.query;
  if (!query || query.trim() === '') {
    return res.json({ results: [], total_results: 0, total_pages: 0 });
  }
  const data = await tmdb('/search/movie', { query, page });
  res.json(data);
});

// GET /api/movies/trending
export const getTrending = asyncHandler(async (req, res) => {
  const data = await tmdb('/trending/movie/week');
  res.json(data);
});

// GET /api/movies/genres
export const getGenres = asyncHandler(async (req, res) => {
  const data = await tmdb('/genre/movie/list');
  res.json(data);
});

// GET /api/movies/discover?genre=28&page=1&sort_by=popularity.desc
export const discoverMovies = asyncHandler(async (req, res) => {
  const { genre, page = 1, sort_by = 'popularity.desc' } = req.query;
  const params = { page, sort_by };
  if (genre) params.with_genres = genre;
  const data = await tmdb('/discover/movie', params);
  res.json(data);
});

// GET /api/movies/:id
export const getMovieById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [details, credits, videos] = await Promise.all([
    tmdb(`/movie/${id}`),
    tmdb(`/movie/${id}/credits`),
    tmdb(`/movie/${id}/videos`),
  ]);

  const trailer = videos.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  ) || videos.results?.[0] || null;

  res.json({
    ...details,
    credits: {
      cast: credits.cast?.slice(0, 15) || [],
      crew: credits.crew?.filter((c) => ['Director', 'Producer', 'Screenplay'].includes(c.job)).slice(0, 5) || [],
    },
    trailer: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
  });
});

// GET /api/movies/popular
export const getPopular = asyncHandler(async (req, res) => {
  const data = await tmdb('/movie/popular');
  res.json(data);
});