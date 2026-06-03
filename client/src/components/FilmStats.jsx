import { useEffect, useState } from 'react';
import { getFilmStats } from '../api/stats.js';

export default function FilmStats({ tmdbId }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFilmStats(tmdbId)
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tmdbId]);

  if (loading) {
    return <div className="h-8 w-48 bg-cinema-800 animate-pulse rounded-sm" />;
  }

  if (!stats || stats.watchCount === 0) {
    return (
      <p className="font-mono text-xs text-neutral-600">
        No Kinophile activity yet — be the first!
      </p>
    );
  }

  return (
    <div className="flex items-center gap-5 flex-wrap">
      {/* Kinophile average rating */}
      {stats.avgRating && (
        <div className="flex items-center gap-2">
          <span className="text-brand-500 font-mono text-lg font-medium">★ {stats.avgRating}</span>
          <div>
            <p className="font-mono text-xs text-neutral-300 leading-none">Kinophile avg</p>
            <p className="font-mono text-xs text-neutral-600 leading-none mt-0.5">{stats.ratingCount} rating{stats.ratingCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {stats.avgRating && <span className="text-cinema-700">|</span>}

      {/* Watch count */}
      <div>
        <p className="font-mono text-sm text-neutral-300">
          <span className="text-white font-medium">{stats.watchCount}</span> watched
        </p>
      </div>

      {/* Liked count */}
      {stats.likedCount > 0 && (
        <>
          <span className="text-cinema-700">|</span>
          <div>
            <p className="font-mono text-sm text-neutral-300">
              <span className="text-red-400 font-medium">♥ {stats.likedCount}</span> liked
            </p>
          </div>
        </>
      )}

      {/* Review count */}
      {stats.reviewCount > 0 && (
        <>
          <span className="text-cinema-700">|</span>
          <div>
            <p className="font-mono text-sm text-neutral-300">
              <span className="text-white font-medium">{stats.reviewCount}</span> review{stats.reviewCount !== 1 ? 's' : ''}
            </p>
          </div>
        </>
      )}
    </div>
  );
}