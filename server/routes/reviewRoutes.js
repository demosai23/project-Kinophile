import express from 'express';
import {
  createReview,
  deleteReview,
  getMovieReviews,
  getUserReviews,
  toggleReviewLike,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);
router.get('/movie/:tmdbId', getMovieReviews);
router.get('/user/:username', getUserReviews);
router.patch('/:id/like', protect, toggleReviewLike);

export default router;