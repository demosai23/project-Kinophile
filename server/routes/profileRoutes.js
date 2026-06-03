import express from 'express';
import { getProfile, searchUsers } from '../controllers/profileController.js';

const router = express.Router();

router.get('/search', searchUsers);
router.get('/:username', getProfile);

export default router;