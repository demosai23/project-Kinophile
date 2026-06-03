import asyncHandler from 'express-async-handler';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const followUser = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) { res.status(404); throw new Error('User not found'); }
  if (target._id.toString() === req.user.id) { res.status(400); throw new Error('Cannot follow yourself'); }

  const existing = await Follow.findOne({ followerId: req.user.id, followingId: target._id });
  if (existing) return res.json({ following: true, message: 'Already following' });

  await Follow.create({ followerId: req.user.id, followingId: target._id });

  await Notification.create({
    recipientId: target._id,
    senderId: req.user.id,
    type: 'follow',
    refId: req.user.id,
    refModel: 'User',
    message: 'started following you',
  });

  res.status(201).json({ following: true });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) { res.status(404); throw new Error('User not found'); }
  await Follow.deleteOne({ followerId: req.user.id, followingId: target._id });
  res.json({ following: false });
});

export const getFollowStatus = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) { res.status(404); throw new Error('User not found'); }

  const following = await Follow.findOne({ followerId: req.user.id, followingId: target._id });
  const followerCount = await Follow.countDocuments({ followingId: target._id });
  const followingCount = await Follow.countDocuments({ followerId: target._id });

  res.json({ following: !!following, followerCount, followingCount });
});

export const getFollowers = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) { res.status(404); throw new Error('User not found'); }

  const follows = await Follow.find({ followingId: target._id })
    .populate('followerId', 'username displayName avatar')
    .sort({ createdAt: -1 });

  res.json({ followers: follows.map((f) => f.followerId) });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) { res.status(404); throw new Error('User not found'); }

  const follows = await Follow.find({ followerId: target._id })
    .populate('followingId', 'username displayName avatar')
    .sort({ createdAt: -1 });

  res.json({ following: follows.map((f) => f.followingId) });
});