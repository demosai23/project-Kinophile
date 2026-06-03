import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { username, email, password } = req.body;

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already in use');
  }

  const usernameExists = await User.findOne({ username: username.toLowerCase() });
  if (usernameExists) {
    res.status(400);
    throw new Error('Username already taken');
  }

  const user = await User.create({ username, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({ user, accessToken });
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !user.password) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  setRefreshTokenCookie(res, refreshToken);

  res.json({ user, accessToken });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error('No refresh token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    res.status(403);
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    res.status(403);
    throw new Error('Refresh token mismatch — please log in again');
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateModifiedOnly: true });

  setRefreshTokenCookie(res, newRefreshToken);

  res.json({ accessToken: newAccessToken });
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.id) {
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ message: 'Logged out successfully' });
});

export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save({ validateModifiedOnly: true });

  setRefreshTokenCookie(res, refreshToken);

  res.redirect(`${process.env.CLIENT_URL}/oauth/success?token=${accessToken}`);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ user });
});