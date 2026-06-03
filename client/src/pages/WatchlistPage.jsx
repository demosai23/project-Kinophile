import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyWatchlist } from '../api/activity.js';
import MovieCard from '../components/MovieCard.jsx';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyWatchlist()
      .then(({ data }) => setWatchlist(data.watchlist || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const movies = watchlist.map((item) => ({
    id: item.tmdbId,
    title: item.movieData?.title,
    poster_path: item.movieData?.poster_path,
    release_date: item.movieData?.release_date,
    vote_average: null,
  }));

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">Your list</span>
          <h1 className="font-display text-4xl text-white mt-1">Watchlist</h1>
          {watchlist.length > 0 && (
            <p className="text-neutral-500 font-mono text-sm mt-1">{watchlist.length} films</p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-cinema-800 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-neutral-500 mb-2">Your watchlist is empty</p>
            <p className="text-neutral-600 font-mono text-sm mb-6">Add films you want to watch</p>
            <Link to="/films" className="btn-primary">Browse films</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}