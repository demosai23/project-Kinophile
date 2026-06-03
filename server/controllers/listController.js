import asyncHandler from 'express-async-handler';
import List from '../models/List.js';

// POST /api/lists — create a list
export const createList = asyncHandler(async (req, res) => {
  const { name, description, isPublic } = req.body;
  if (!name) { res.status(400); throw new Error('Name is required'); }

  const list = await List.create({
    userId: req.user.id,
    name,
    description: description || '',
    isPublic: isPublic !== undefined ? isPublic : true,
    movies: [],
  });

  res.status(201).json({ list });
});

// GET /api/lists/my — get current user's lists
export const getMyLists = asyncHandler(async (req, res) => {
  const lists = await List.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ lists });
});

// GET /api/lists/user/:username — get a user's public lists
export const getUserLists = asyncHandler(async (req, res) => {
  const User = (await import('../models/User.js')).default;
  const user = await User.findOne({ username: req.params.username });
  if (!user) { res.status(404); throw new Error('User not found'); }

  const query = { userId: user._id };
  // Only show private lists to the owner
  if (!req.user || req.user.id !== user._id.toString()) {
    query.isPublic = true;
  }

  const lists = await List.find(query).sort({ createdAt: -1 });
  res.json({ lists });
});

// GET /api/lists/:id — get a single list
export const getListById = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id)
    .populate('userId', 'username displayName avatar')
    .populate('comments.userId', 'username displayName avatar');

  if (!list) { res.status(404); throw new Error('List not found'); }

  // Allow owner to see private lists, block others
  if (!list.isPublic) {
    if (!req.user || list.userId._id.toString() !== req.user.id) {
      res.status(403);
      throw new Error('This list is private');
    }
  }

  res.json({ list });
});

// PUT /api/lists/:id — edit list name/description/visibility
export const updateList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }
  if (list.userId.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }

  const { name, description, isPublic } = req.body;
  if (name !== undefined) list.name = name;
  if (description !== undefined) list.description = description;
  if (isPublic !== undefined) list.isPublic = isPublic;

  await list.save();
  res.json({ list });
});

// DELETE /api/lists/:id
export const deleteList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }
  if (list.userId.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }

  await list.deleteOne();
  res.json({ message: 'List deleted' });
});

// POST /api/lists/:id/movies — add a movie to a list
export const addMovieToList = asyncHandler(async (req, res) => {
  const { tmdbId, movieData } = req.body;
  if (!tmdbId) { res.status(400); throw new Error('tmdbId is required'); }

  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }
  if (list.userId.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }

  const alreadyIn = list.movies.find((m) => m.tmdbId === Number(tmdbId));
  if (alreadyIn) return res.json({ list, added: false });

  const order = list.movies.length + 1;
  list.movies.push({ tmdbId: Number(tmdbId), movieData, order });
  await list.save();

  res.json({ list, added: true });
});

// DELETE /api/lists/:id/movies/:tmdbId — remove a movie
export const removeMovieFromList = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }
  if (list.userId.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }

  list.movies = list.movies
    .filter((m) => m.tmdbId !== Number(req.params.tmdbId))
    .map((m, i) => ({ ...m.toObject(), order: i + 1 }));

  await list.save();
  res.json({ list });
});

// PATCH /api/lists/:id/reorder — reorder movies
export const reorderMovies = asyncHandler(async (req, res) => {
  const { orderedTmdbIds } = req.body; // array of tmdbIds in new order
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }
  if (list.userId.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }

  const reordered = orderedTmdbIds.map((tmdbId, index) => {
    const movie = list.movies.find((m) => m.tmdbId === Number(tmdbId));
    return { ...movie.toObject(), order: index + 1 };
  });

  list.movies = reordered;
  await list.save();
  res.json({ list });
});

// PATCH /api/lists/:id/like — toggle like
export const toggleListLike = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }

  const userId = req.user.id;
  const alreadyLiked = list.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    list.likes = list.likes.filter((id) => id.toString() !== userId);
  } else {
    list.likes.push(userId);
  }

  await list.save();
  res.json({ liked: !alreadyLiked, likeCount: list.likes.length });
});

// POST /api/lists/:id/comments — add a comment
export const addComment = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body) { res.status(400); throw new Error('Comment body is required'); }

  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }

  list.comments.push({ userId: req.user.id, body });
  await list.save();

  // Populate the new comment's user
  await list.populate('comments.userId', 'username displayName avatar');
  const newComment = list.comments[list.comments.length - 1];

  res.status(201).json({ comment: newComment });
});

// DELETE /api/lists/:id/comments/:commentId
export const deleteComment = asyncHandler(async (req, res) => {
  const list = await List.findById(req.params.id);
  if (!list) { res.status(404); throw new Error('List not found'); }

  const comment = list.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }
  if (comment.userId.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }

  comment.deleteOne();
  await list.save();
  res.json({ message: 'Comment deleted' });
});