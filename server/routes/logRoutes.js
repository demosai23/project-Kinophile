import express from 'express';
import {
  logMovie,
  removeLog,
  rateMovie,
  toggleLike,
  getMyLogs,
  checkLog,
  getUserLogs,
} from '../controllers/logController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyLogs);
router.post('/', protect, logMovie);
router.get('/check/:tmdbId', protect, checkLog);
router.get('/user/:username', getUserLogs);
router.delete('/:tmdbId', protect, removeLog);
router.patch('/:tmdbId/rate', protect, rateMovie);
router.patch('/:tmdbId/like', protect, toggleLike);

export default router;