import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Ordered array of movies
    movies: [
      {
        tmdbId: { type: Number, required: true },
        movieData: {
          title: String,
          poster_path: String,
          release_date: String,
        },
        order: { type: Number, required: true },
      },
    ],
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        body: { type: String, required: true, maxlength: 1000 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const List = mongoose.model('List', listSchema);

export default List;