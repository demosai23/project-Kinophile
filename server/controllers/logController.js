import asyncHandler from 'express-async-handler';
import Log from '../models/Log.js';
import Watchlist from '../models/Watchlist.js';

// POST /api/logs — log a movie (or update existing log)
export const logMovie = asyncHandler(async (req, res) => {
  const { tmdbId, movieData, watchedAt, rating, liked } = req.body;

  if (!tmdbId) {
    res.status(400);
    throw new Error('tmdbId is required');
  }

  const existing = await Log.findOne({ userId: req.user.id, tmdbId });

  if (existing) {
    // Update existing log
    if (watchedAt !== undefined) existing.watchedAt = watchedAt;
    if (rating !== undefined) existing.rating = rating;
    if (liked !== undefined) existing.liked = liked;
    if (movieData !== undefined) existing.movieData = movieData;
    await existing.save();
    return res.json({ log: existing });
  }

  const log = await Log.create({
    userId: req.user.id,
    tmdbId,
    movieData,
    watchedAt: watchedAt || Date.now(),
    rating: rating || null,
    liked: liked || false,
  });

  // Remove from watchlist if it was there
  await Watchlist.deleteOne({ userId: req.user.id, tmdbId });

  res.status(201).json({ log });
});

// DELETE /api/logs/:tmdbId — remove a log entry
export const removeLog = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  await Log.deleteOne({ userId: req.user.id, tmdbId: Number(tmdbId) });
  res.json({ message: 'Log removed' });
});

// PATCH /api/logs/:tmdbId/rate — rate a movie
export const rateMovie = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 0.5 || rating > 5) {
    res.status(400);
    throw new Error('Rating must be between 0.5 and 5');
  }

  // Round to nearest 0.5
  const roundedRating = Math.round(rating * 2) / 2;

  let log = await Log.findOne({ userId: req.user.id, tmdbId: Number(tmdbId) });

  if (!log) {
    res.status(404);
    throw new Error('Log this movie first before rating');
  }

  log.rating = roundedRating;
  await log.save();

  res.json({ log });
});

// PATCH /api/logs/:tmdbId/like — toggle like
export const toggleLike = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;

  let log = await Log.findOne({ userId: req.user.id, tmdbId: Number(tmdbId) });

  if (!log) {
    res.status(404);
    throw new Error('Log this movie first before liking');
  }

  log.liked = !log.liked;
  await log.save();

  res.json({ log });
});

// GET /api/logs — get current user's logs
export const getMyLogs = asyncHandler(async (req, res) => {
  const logs = await Log.find({ userId: req.user.id })
    .sort({ watchedAt: -1 })
    .populate('review');
  res.json({ logs });
});

// GET /api/logs/check/:tmdbId — check if user has logged a movie
export const checkLog = asyncHandler(async (req, res) => {
  const { tmdbId } = req.params;
  const log = await Log.findOne({ userId: req.user.id, tmdbId: Number(tmdbId) }).populate('review');
  res.json({ log: log || null });
});

// GET /api/logs/user/:username — get a user's logs (public)
export const getUserLogs = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const logs = await Log.find({ userId: user._id })
    .sort({ watchedAt: -1 })
    .limit(50);
  res.json({ logs });
});