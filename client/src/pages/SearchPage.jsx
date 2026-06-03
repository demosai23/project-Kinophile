import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../api/movies.js';
import MovieCard from '../components/MovieCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await searchMovies(query, page);
        setResults(data.results || []);
        setTotal(data.total_results || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, page]);

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mb-10">
          <SearchBar isPage />
        </div>

        {query && (
          <div className="mb-6">
            <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Results for</span>
            <h1 className="font-display text-3xl text-white mt-1">"{query}"</h1>
            {total > 0 && <p className="text-neutral-500 font-mono text-sm mt-1">{total.toLocaleString()} films found</p>}
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-cinema-800 animate-pulse rounded-sm" />
            ))}
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-neutral-500 mb-2">No films found</p>
            <p className="text-neutral-600 font-mono text-sm">Try a different search term</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}

        {total > 20 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-ghost py-2 px-4 text-sm disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="font-mono text-sm text-neutral-400">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={results.length < 20}
              className="btn-ghost py-2 px-4 text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}