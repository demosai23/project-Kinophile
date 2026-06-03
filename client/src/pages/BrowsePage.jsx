import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGenres, discoverMovies } from '../api/movies.js';
import MovieCard from '../components/MovieCard.jsx';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest' },
  { value: 'release_date.asc', label: 'Oldest' },
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeGenre = searchParams.get('genre') || '';
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGenres().then(({ data }) => setGenres(data.genres || []));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await discoverMovies(activeGenre, page, sortBy);
        setMovies(data.results || []);
        setTotal(data.total_results || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeGenre, page, sortBy]);

  const handleGenre = (id) => {
    setPage(1);
    if (String(id) === activeGenre) {
      setSearchParams({});
    } else {
      setSearchParams({ genre: id });
    }
  };

  const activeGenreName = genres.find((g) => String(g.id) === activeGenre)?.name || 'All Films';

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">Explore</span>
          <h1 className="font-display text-4xl text-white mt-1">{activeGenreName}</h1>
          {total > 0 && <p className="text-neutral-500 font-mono text-sm mt-1">{total.toLocaleString()} films</p>}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setSearchParams({}); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-all duration-150 ${
              !activeGenre
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'bg-transparent border-cinema-600 text-neutral-400 hover:border-brand-600 hover:text-neutral-200'
            }`}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g.id}
              onClick={() => handleGenre(g.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-all duration-150 ${
                String(g.id) === activeGenre
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-transparent border-cinema-600 text-neutral-400 hover:border-brand-600 hover:text-neutral-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Sort by</span>
          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setSortBy(opt.value); setPage(1); }}
                className={`px-3 py-1 text-xs font-mono rounded-sm border transition-all ${
                  sortBy === opt.value
                    ? 'border-brand-500 text-brand-400'
                    : 'border-cinema-700 text-neutral-500 hover:border-cinema-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
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
              disabled={movies.length < 18}
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