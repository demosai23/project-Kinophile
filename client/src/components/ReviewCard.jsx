import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toggleReviewLike } from '../api/activity.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from './StarRating.jsx';
import toast from 'react-hot-toast';

const IMG_W185 = 'https://image.tmdb.org/t/p/w185';

export default function ReviewCard({ review, showMovie = false }) {
  const { isAuthenticated, user } = useAuth();
  const [likeCount, setLikeCount] = useState(review.likes?.length || 0);
  const [liked, setLiked] = useState(
    review.likes?.some((id) => id === user?._id || id?.toString() === user?._id)
  );
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);

  const reviewer = review.userId;
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like reviews'); return; }
    try {
      const { data } = await toggleReviewLike(review._id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      toast.error('Error');
    }
  };

  return (
    <div className="bg-cinema-900 border border-cinema-700 rounded-sm p-5">
      <div className="flex items-start gap-4">
        {/* Movie poster (if showing on profile/feed) */}
        {showMovie && review.movieData?.poster_path && (
          <Link to={`/film/${review.tmdbId}`} className="shrink-0">
            <img
              src={`${IMG_W185}${review.movieData.poster_path}`}
              alt={review.movieData.title}
              className="w-12 rounded-sm border border-cinema-700"
            />
          </Link>
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              {showMovie && (
                <Link to={`/film/${review.tmdbId}`} className="font-display text-base text-white hover:text-brand-400 transition-colors block">
                  {review.movieData?.title}
                  {review.movieData?.release_date && (
                    <span className="font-mono text-xs text-neutral-500 ml-2">
                      {review.movieData.release_date.split('-')[0]}
                    </span>
                  )}
                </Link>
              )}
              <div className="flex items-center gap-2 mt-1">
                {reviewer && (
                  <Link to={`/u/${reviewer.username}`} className="flex items-center gap-2">
                    <img
                      src={reviewer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${reviewer.username}`}
                      alt={reviewer.username}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-sm font-body text-neutral-400 hover:text-white transition-colors">
                      {reviewer.displayName || reviewer.username}
                    </span>
                  </Link>
                )}
                <span className="text-neutral-600 text-xs">·</span>
                <span className="text-xs font-mono text-neutral-500">{date}</span>
              </div>
            </div>

            {review.rating && (
              <StarRating value={review.rating} readOnly size="sm" />
            )}
          </div>

          {/* Spoiler warning */}
          {review.containsSpoilers && !spoilerRevealed ? (
            <div className="bg-cinema-800 border border-cinema-600 rounded-sm p-3 mb-3">
              <p className="text-xs font-mono text-neutral-500 mb-2">⚠ This review contains spoilers</p>
              <button
                onClick={() => setSpoilerRevealed(true)}
                className="text-xs font-mono text-brand-400 hover:text-brand-300 transition-colors"
              >
                Reveal anyway →
              </button>
            </div>
          ) : (
            <p className="text-sm font-body text-neutral-300 leading-relaxed whitespace-pre-line">
              {review.body}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-mono transition-colors ${
                liked ? 'text-red-400' : 'text-neutral-500 hover:text-red-400'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount > 0 && likeCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}