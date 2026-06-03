import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { displayName, bio, favoriteGenres } = req.body;

  if (displayName !== undefined) user.displayName = displayName;
  if (bio !== undefined) user.bio = bio;

  if (favoriteGenres !== undefined) {
    try {
      user.favoriteGenres = typeof favoriteGenres === 'string'
        ? JSON.parse(favoriteGenres)
        : favoriteGenres;
    } catch {
      user.favoriteGenres = [];
    }
  }

  if (req.file) {
    user.avatar = req.file.path;
  }

  await user.save({ validateModifiedOnly: true });

  res.json({ user });
});