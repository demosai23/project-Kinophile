import asyncHandler from 'express-async-handler';
import Follow from '../models/Follow.js';
import Log from '../models/Log.js';
import Review from '../models/Review.js';
import List from '../models/List.js';

export const getFeed = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const following = await Follow.find({ followerId: req.user.id }).select('followingId');
  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return res.json({ feed: [], hasMore: false });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [logs, reviews, lists] = await Promise.all([
    Log.find({ userId: { $in: followingIds }, createdAt: { $gte: since } })
      .populate('userId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(50),
    Review.find({ userId: { $in: followingIds }, createdAt: { $gte: since } })
      .populate('userId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(50),
    List.find({ userId: { $in: followingIds }, isPublic: true, createdAt: { $gte: since } })
      .populate('userId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  const feed = [
    ...logs.map((l) => ({ type: 'log', data: l, createdAt: l.createdAt })),
    ...reviews.map((r) => ({ type: 'review', data: r, createdAt: r.createdAt })),
    ...lists.map((l) => ({ type: 'list', data: l, createdAt: l.createdAt })),
  ]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(skip, skip + limit);

  res.json({ feed, hasMore: feed.length === limit });
});