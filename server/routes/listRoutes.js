import express from 'express';
import {
  createList, getMyLists, getUserLists, getListById,
  updateList, deleteList, addMovieToList, removeMovieFromList,
  reorderMovies, toggleListLike, addComment, deleteComment,
} from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createList);
router.get('/my', protect, getMyLists);
router.get('/user/:username', getUserLists);
router.get('/:id', protect, getListById);  // protect added so req.user is available
router.put('/:id', protect, updateList);
router.delete('/:id', protect, deleteList);
router.post('/:id/movies', protect, addMovieToList);
router.delete('/:id/movies/:tmdbId', protect, removeMovieFromList);
router.patch('/:id/reorder', protect, reorderMovies);
router.patch('/:id/like', protect, toggleListLike);
router.post('/:id/comments', protect, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;