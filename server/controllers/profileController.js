import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Log from '../models/Log.js';
import Review from '../models/Review.js';
import List from '../models/List.js';
import Follow from '../models/Follow.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) { res.status(404); throw new Error('User not found'); }

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01`);

  const [
    totalWatched,
    watchedThisYear,
    recentLogs,
    recentReviews,
    lists,
    followerCount,
    followingCount,
  ] = await Promise.all([
    Log.countDocuments({ userId: user._id }),
    Log.countDocuments({ userId: user._id, watchedAt: { $gte: startOfYear } }),
    Log.find({ userId: user._id }).sort({ watchedAt: -1 }).limit(8),
    Review.find({ userId: user._id }).sort({ createdAt: -1 }).limit(4),
    List.find({ userId: user._id, isPublic: true }).sort({ createdAt: -1 }).limit(6),
    Follow.countDocuments({ followingId: user._id }),
    Follow.countDocuments({ followerId: user._id }),
  ]);

  res.json({
    user,
    stats: { totalWatched, watchedThisYear, followerCount, followingCount },
    recentLogs,
    recentReviews,
    lists,
  });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ users: [] });

  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: 'i' } },
      { displayName: { $regex: q, $options: 'i' } },
    ],
  })
    .select('username displayName avatar bio')
    .limit(10);

  res.json({ users });
});