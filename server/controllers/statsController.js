import asyncHandler from 'express-async-handler';
import Log from '../models/Log.js';
import Review from '../models/Review.js';

// GET /api/stats/film/:tmdbId — aggregated stats for a film
export const getFilmStats = asyncHandler(async (req, res) => {
  const tmdbId = Number(req.params.tmdbId);

  const [logs, reviews] = await Promise.all([
    Log.find({ tmdbId }),
    Review.find({ tmdbId }),
  ]);

  const watchCount = logs.length;
  const ratings = logs.filter((l) => l.rating).map((l) => l.rating);
  const likedCount = logs.filter((l) => l.liked).length;
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  res.json({
    tmdbId,
    watchCount,
    likedCount,
    avgRating,
    ratingCount: ratings.length,
    reviewCount: reviews.length,
  });
});