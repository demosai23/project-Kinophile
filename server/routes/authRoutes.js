import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  googleCallback,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3–30 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/logout', logout);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
    session: false
  }),
  googleCallback
);

export default router;