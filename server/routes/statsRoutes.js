import express from 'express';
import { getFilmStats } from '../controllers/statsController.js';

const router = express.Router();

router.get('/film/:tmdbId', getFilmStats);

export default router;