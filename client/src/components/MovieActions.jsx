import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  logMovie, removeLog, toggleLike, rateMovie,
  checkLog, addToWatchlist, removeFromWatchlist,
  checkWatchlist, createReview,
} from '../api/activity.js';
import StarRating from './StarRating.jsx';
import toast from 'react-hot-toast';

export default function MovieActions({ movie }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [log, setLog] = useState(null);
  const [onWatchlist, setOnWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const movieData = {
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
  };

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    const load = async () => {
      try {
        const [logRes, wlRes] = await Promise.all([
          checkLog(movie.id),
          checkWatchlist(movie.id),
        ]);
        setLog(logRes.data.log);
        setOnWatchlist(wlRes.data.onWatchlist);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [movie.id, isAuthenticated]);

  const requireAuth = () => {
    toast.error('Sign in to do this');
    navigate('/login');
  };

  const handleLog = async () => {
    if (!isAuthenticated) return requireAuth();
    try {
      if (log) {
        await removeLog(movie.id);
        setLog(null);
        toast.success('Removed from watched');
      } else {
        const { data } = await logMovie({ tmdbId: movie.id, movieData });
        setLog(data.log);
        setOnWatchlist(false);
        toast.success('Marked as watched!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleRate = async (rating) => {
    if (!isAuthenticated) return requireAuth();
    if (!log) { toast.error('Log the movie first'); return; }
    try {
      const { data } = await rateMovie(movie.id, rating);
      setLog(data.log);
      toast.success(rating ? `Rated ${rating} \u2605` : 'Rating removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return requireAuth();
    if (!log) { toast.error('Log the movie first'); return; }
    try {
      const { data } = await toggleLike(movie.id);
      setLog(data.log);
      toast.success(data.log.liked ? 'Liked!' : 'Like removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  const handleWatchlist = async () => {
    if (!isAuthenticated) return requireAuth();
    try {
      if (onWatchlist) {
        await removeFromWatchlist(movie.id);
        setOnWatchlist(false);
        toast.success('Removed from watchlist');
      } else {
        await addToWatchlist({ tmdbId: movie.id, movieData });
        setOnWatchlist(true);
        toast.success('Added to watchlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  if (loading) return <div className="h-12 bg-cinema-800 animate-pulse rounded-sm w-64" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleLog}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-body border transition-all duration-200 ${
            log
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-cinema-600 text-neutral-300 hover:border-brand-500 hover:text-brand-400'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={log ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {log ? 'Watched' : 'Mark as watched'}
        </button>

        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-body border transition-all duration-200 ${
            log?.liked
              ? 'bg-red-500/20 border-red-500 text-red-400'
              : 'border-cinema-600 text-neutral-300 hover:border-red-500 hover:text-red-400'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={log?.liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {log?.liked ? 'Liked' : 'Like'}
        </button>

        {!log && (
          <button
            onClick={handleWatchlist}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-body border transition-all duration-200 ${
              onWatchlist
                ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                : 'border-cinema-600 text-neutral-300 hover:border-brand-500 hover:text-brand-400'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={onWatchlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {onWatchlist ? 'On watchlist' : 'Add to watchlist'}
          </button>
        )}

        {log && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-body border border-cinema-600 text-neutral-300 hover:border-brand-500 hover:text-brand-400 transition-all duration-200"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {log?.review ? 'Edit review' : 'Write review'}
          </button>
        )}
      </div>

      {log && (
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Your rating</span>
          <StarRating value={log.rating || 0} onChange={handleRate} size="md" />
          {log.rating && (
            <button onClick={() => handleRate(0)} className="text-xs font-mono text-neutral-600 hover:text-neutral-400 transition-colors">
              Clear
            </button>
          )}
        </div>
      )}

      {showReviewModal && (
        <ReviewModal
          movie={movie}
          log={log}
          onClose={() => setShowReviewModal(false)}
          onSaved={(review) => {
            setLog((prev) => ({ ...prev, review }));
            setShowReviewModal(false);
          }}
        />
      )}
    </div>
  );
}

function ReviewModal({ movie, log, onClose, onSaved }) {
  const [body, setBody] = useState(log?.review?.body || '');
  const [spoiler, setSpoiler] = useState(log?.review?.containsSpoilers || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const { data } = await createReview({
        tmdbId: movie.id,
        movieData: {
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
        },
        body,
        rating: log?.rating || null,
        containsSpoilers: spoiler,
      });
      toast.success('Review saved!');
      onSaved(data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-cinema-950/95 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-cinema-900 border border-cinema-700 rounded-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-white">Review — {movie.title}</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono text-sm">X Close</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your thoughts about this film..."
              rows={6}
              maxLength={10000}
              className="input-field resize-none"
              autoFocus
            />
            <p className="text-neutral-600 text-xs font-mono mt-1 text-right">{body.length}/10000</p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={spoiler}
              onChange={(e) => setSpoiler(e.target.checked)}
              className="accent-brand-500"
            />
            <span className="text-sm font-body text-neutral-400">Contains spoilers</span>
          </label>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading || !body.trim()} className="btn-primary">
              {loading ? 'Saving...' : 'Save review'}
            </button>
            <button type="button" onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-300 font-body">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}