import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
    logId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Log',
      default: null,
    },
    body: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    rating: {
      type: Number,
      min: 0.5,
      max: 5,
      default: null,
    },
    containsSpoilers: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  { timestamps: true }
);

// One review per user per movie
reviewSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;