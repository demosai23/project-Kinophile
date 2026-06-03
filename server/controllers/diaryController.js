import asyncHandler from 'express-async-handler';
import Log from '../models/Log.js';
import User from '../models/User.js';

// GET /api/diary — current user's diary grouped by month
export const getMyDiary = asyncHandler(async (req, res) => {
  const logs = await Log.find({ userId: req.user.id })
    .sort({ watchedAt: -1 });

  const diary = {};

  logs.forEach((log) => {
    const date = new Date(log.watchedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!diary[key]) diary[key] = [];
    diary[key].push({
      _id: log._id,
      tmdbId: log.tmdbId,
      movieData: log.movieData,
      watchedAt: log.watchedAt,
      rating: log.rating,
      liked: log.liked,
      review: log.review,
    });
  });

  res.json({ diary });
});

// GET /api/diary/:username — public diary for a user
export const getUserDiary = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) { res.status(404); throw new Error('User not found'); }

  const logs = await Log.find({ userId: user._id })
    .sort({ watchedAt: -1 });

  const diary = {};

  logs.forEach((log) => {
    const date = new Date(log.watchedAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!diary[key]) diary[key] = [];
    diary[key].push({
      _id: log._id,
      tmdbId: log.tmdbId,
      movieData: log.movieData,
      watchedAt: log.watchedAt,
      rating: log.rating,
      liked: log.liked,
    });
  });

  res.json({ diary, user });
});