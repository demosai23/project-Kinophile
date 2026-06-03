import express from 'express';
import {
  addToWatchlist,
  removeFromWatchlist,
  getMyWatchlist,
  checkWatchlist,
} from '../controllers/watchlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyWatchlist);
router.post('/', protect, addToWatchlist);
router.get('/check/:tmdbId', protect, checkWatchlist);
router.delete('/:tmdbId', protect, removeFromWatchlist);

export default router;