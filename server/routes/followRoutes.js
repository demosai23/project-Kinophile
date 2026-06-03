import express from 'express';
import {
  followUser, unfollowUser, getFollowStatus,
  getFollowers, getFollowing,
} from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:username', protect, followUser);
router.delete('/:username', protect, unfollowUser);
router.get('/:username/status', protect, getFollowStatus);
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);

export default router;