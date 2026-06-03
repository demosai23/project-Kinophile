import asyncHandler from 'express-async-handler';
import Watchlist from '../models/Watchlist.js';

// POST /api/watchlist — add to watchlist
export const addToWatchlist = asyncHandler(async (req, res) => {
  const { tmdbId, movieData } = req.body;

  if (!tmdbId) {
    res.status(400);
    throw new Error('tmdbId is required');
  }

  const existing = await Watchlist.findOne({ userId: req.user.id, tmdbId });
  if (existing) {
    return res.json({ watchlist: existing, added: false });
  }

  const entry = await Watchlist.create({
    userId: req.user.id,
    tmdbId,
    movieData,
  });

  res.status(201).json({ watchlist: entry, added: true });
});

// DELETE /api/watchlist/:tmdbId — remove from watchlist
export const removeFromWatchlist = asyncHandler(async (req, res) => {
  await Watchlist.deleteOne({
    userId: req.user.id,
    tmdbId: Number(req.params.tmdbId),
  });
  res.json({ message: 'Removed from watchlist' });
});

// GET /api/watchlist — get current user's watchlist
export const getMyWatchlist = asyncHandler(async (req, res) => {
  const items = await Watchlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ watchlist: items });
});

// GET /api/watchlist/check/:tmdbId — check if movie is on watchlist
export const checkWatchlist = asyncHandler(async (req, res) => {
  const item = await Watchlist.findOne({
    userId: req.user.id,
    tmdbId: Number(req.params.tmdbId),
  });
  res.json({ onWatchlist: !!item });
});