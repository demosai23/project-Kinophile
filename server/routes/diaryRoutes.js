import express from 'express';
import { getMyDiary, getUserDiary } from '../controllers/diaryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getMyDiary);
router.get('/:username', getUserDiary);

export default router;