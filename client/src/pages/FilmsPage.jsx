import { useEffect, useState } from 'react';
import { getTrending } from '../api/movies.js';
import MovieCard from '../components/MovieCard.jsx';

export default function FilmsPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrending()
      .then(({ data }) => setMovies(data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">This week</span>
          <h1 className="font-display text-4xl text-white mt-1">Trending Films</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-cinema-800 animate-pulse rounded-sm" />
            ))}
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