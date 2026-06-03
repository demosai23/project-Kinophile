import mongoose from 'mongoose';

const logSchema = new mongoose.Schema(
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
    // Store basic movie info so we don't have to call TMDb every time
    movieData: {
      title: String,
      poster_path: String,
      release_date: String,
      genres: [{ id: Number, name: String }],
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      min: 0.5,
      max: 5,
      default: null, // null = watched but not rated
    },
    liked: {
      type: Boolean,
      default: false,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
  },
  { timestamps: true }
);

// One log per user per movie
logSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

const Log = mongoose.model('Log', logSchema);

export default Log;