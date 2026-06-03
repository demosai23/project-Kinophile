import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Log from '../models/Log.js';

// POST /api/reviews — create or update a review
export const createReview = asyncHandler(async (req, res) => {
  const { tmdbId, movieData, body, rating, containsSpoilers } = req.body;

  if (!tmdbId || !body) {
    res.status(400);
    throw new Error('tmdbId and body are required');
  }

  const existing = await Review.findOne({ userId: req.user.id, tmdbId });

  if (existing) {
    existing.body = body;
    if (rating !== undefined) existing.rating = rating;
    if (containsSpoilers !== undefined) existing.containsSpoilers = containsSpoilers;
    if (movieData !== undefined) existing.movieData = movieData;
    await existing.save();
    return res.json({ review: existing });
  }

  // Make sure user has a log for this movie first
  let log = await Log.findOne({ userId: req.user.id, tmdbId });
  if (!log) {
    log = await Log.create({
      userId: req.user.id,
      tmdbId,
      movieData,
      rating: rating || null,
    });
  } else if (rating) {
    log.rating = rating;
    await log.save();
  }

  const review = await Review.create({
    userId: req.user.id,
    tmdbId,
    movieData,
    logId: log._id,
    body,
    rating: rating || log.rating || null,
    containsSpoilers: containsSpoilers || false,
  });

  // Link review to log
  log.review = review._id;
  await log.save();

  res.status(201).json({ review });
});

// DELETE /api/reviews/:id
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (review.userId.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Unlink from log
  await Log.findByIdAndUpdate(review.logId, { review: null });
  await review.deleteOne();

  res.json({ message: 'Review deleted' });
});

// GET /api/reviews/movie/:tmdbId — reviews for a movie
export const getMovieReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ tmdbId: Number(req.params.tmdbId) })
    .populate('userId', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ reviews });
});

// GET /api/reviews/user/:username — reviews by a user
export const getUserReviews = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  const reviews = await Review.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ reviews });
});

// PATCH /api/reviews/:id/like — toggle like on a review
export const toggleReviewLike = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const userId = req.user.id;
  const alreadyLiked = review.likes.includes(userId);

  if (alreadyLiked) {
    review.likes = review.likes.filter((id) => id.toString() !== userId);
  } else {
    review.likes.push(userId);
  }

  await review.save();
  res.json({ review, liked: !alreadyLiked, likeCount: review.likes.length });
});