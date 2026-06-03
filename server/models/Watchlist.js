import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tmdbId: {
      type: Number,
      required: true,
    },
    movieData: {
      title: String,
      poster_path: String,
      release_date: String,
    },
  },
  { timestamps: true }
);

// One entry per user per movie
watchlistSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;