process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import passport from 'passport';
import connectDB from './config/db.js';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import logRoutes from './routes/logRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import listRoutes from './routes/listRoutes.js';
import followRoutes from './routes/followRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';

console.log('ENV CHECK:', {
  MONGO_URI: process.env.MONGO_URI ? 'set' : 'MISSING',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ? 'set' : 'MISSING',
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,
});

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/diary', diaryRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'Kinophile API is running' }));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Kinophile server running on port ${PORT}`);
});