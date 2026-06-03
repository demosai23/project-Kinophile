import express from 'express';
import {
  searchMovies,
  getTrending,
  getGenres,
  discoverMovies,
  getMovieById,
  getPopular,
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/search', searchMovies);
router.get('/trending', getTrending);
router.get('/popular', getPopular);
router.get('/genres', getGenres);
router.get('/discover', discoverMovies);
router.get('/:id', getMovieById);

export default router;