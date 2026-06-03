import express from 'express';
import { addComment, deleteComment, getReviewComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);
router.get('/review/:reviewId', getReviewComments);

export default router;