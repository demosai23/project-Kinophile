import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById } from '../api/movies.js';
import { getMovieReviews } from '../api/activity.js';
import MovieActions from '../components/MovieActions.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import FilmStats from '../components/FilmStats.jsx';

const IMG_BASE = 'https://image.tmdb.org/t/p/original';
const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
const IMG_W185 = 'https://image.tmdb.org/t/p/w185';

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [movieRes, reviewRes] = await Promise.all([
          getMovieById(id),
          getMovieReviews(id),
        ]);
        setMovie(movieRes.data);
        setReviews(reviewRes.data.reviews || []);
      } catch (err) {
        setError('Film not found');
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center pt-14">
        <div className="flex flex-col items-center gap-4">
          <span className="font-display text-2xl text-brand-500 italic">Loading…</span>
          <div className="w-8 h-0.5 bg-brand-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center pt-14">
        <div className="text-center">
          <p className="text-neutral-400 font-body mb-4">{error || 'Something went wrong'}</p>
          <Link to="/" className="btn-ghost">Go home</Link>
        </div>
      </div>
    );
  }

  const year = movie.release_date?.split('-')[0] || '';
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;
  const director = movie.credits?.crew?.find((c) => c.job === 'Director');

  return (
    <main className="min-h-screen bg-cinema-950">
      {movie.backdrop_path && (
        <div className="relative h-[55vh] overflow-hidden">
          <img
            src={`${IMG_BASE}${movie.backdrop_path}`}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/50 to-cinema-950/20" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className={`flex gap-8 ${movie.backdrop_path ? '-mt-32 relative' : 'pt-24'}`}>
          <div className="hidden md:block shrink-0">
            <img
              src={movie.poster_path ? `${IMG_W500}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster'}
              alt={movie.title}
              className="w-48 rounded-sm border border-cinema-700 shadow-2xl"
            />
          </div>

          <div className="flex-1 pt-4">
            <h1 className="font-display text-4xl md:text-5xl text-white leading-tight">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-3 mt-3 mb-5">
              {year && <span className="font-mono text-sm text-neutral-400">{year}</span>}
              {runtime && <><span className="text-cinema-600">·</span><span className="font-mono text-sm text-neutral-400">{runtime}</span></>}
              {director && <><span className="text-cinema-600">·</span><span className="font-mono text-sm text-neutral-400">dir. {director.name}</span></>}
              {movie.vote_average > 0 && (
                <><span className="text-cinema-600">·</span>
                <span className="font-mono text-sm text-neutral-400">
                  ★ {movie.vote_average.toFixed(1)}
                  <span className="text-neutral-600 text-xs ml-1">TMDb</span>
                </span></>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {movie.genres?.map((g) => (
                <Link key={g.id} to={`/browse?genre=${g.id}`}
                  className="px-2.5 py-1 text-xs font-mono border border-cinema-600 text-neutral-400 hover:border-brand-500 hover:text-brand-400 transition-colors rounded-sm">
                  {g.name}
                </Link>
              ))}
            </div>

            <p className="text-neutral-300 font-body leading-relaxed text-base mb-5 max-w-2xl">{movie.overview}</p>

            {/* Kinophile aggregated stats */}
            <div className="mb-6 pb-6 border-b border-cinema-800">
              <p className="font-mono text-xs text-neutral-600 uppercase tracking-widest mb-2">Kinophile members</p>
              <FilmStats tmdbId={movie.id} />
            </div>

            {/* Phase 3 actions */}
            <MovieActions movie={movie} />

            {movie.trailer && (
              <button
                onClick={() => setShowTrailer(true)}
                className="mt-4 flex items-center gap-2 text-sm font-mono text-neutral-400 hover:text-brand-400 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Watch trailer
              </button>
            )}
          </div>
        </div>

        {showTrailer && movie.trailer && (
          <div className="fixed inset-0 bg-cinema-950/95 z-50 flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
            <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end mb-2">
                <button onClick={() => setShowTrailer(false)} className="text-neutral-400 hover:text-white font-mono text-sm">✕ Close</button>
              </div>
              <div className="aspect-video">
                <iframe src={`${movie.trailer}?autoplay=1`} title="Trailer" className="w-full h-full rounded-sm" allow="autoplay; encrypted-media" allowFullScreen />
              </div>
            </div>
          </div>
        )}

        {/* Cast */}
        {movie.credits?.cast?.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-xl text-white mb-5">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {movie.credits.cast.slice(0, 10).map((person) => (
                <div key={person.id} className="text-center">
                  <div className="aspect-square rounded-full overflow-hidden bg-cinema-800 border border-cinema-700 mb-2">
                    <img
                      src={person.profile_path ? `${IMG_W185}${person.profile_path}` : `https://api.dicebear.com/7.x/initials/svg?seed=${person.name}`}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs font-body text-neutral-300 leading-tight line-clamp-2">{person.name}</p>
                  <p className="text-xs font-mono text-neutral-500 leading-tight line-clamp-1 mt-0.5">{person.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Crew */}
        {movie.credits?.crew?.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-xl text-white mb-5">Crew</h2>
            <div className="flex flex-wrap gap-6">
              {movie.credits.crew.map((person) => (
                <div key={`${person.id}-${person.job}`}>
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{person.job}</p>
                  <p className="text-sm font-body text-neutral-200 mt-0.5">{person.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section className="mt-14">
          <h2 className="font-display text-xl text-white mb-5">
            Reviews
            {reviews.length > 0 && (
              <span className="font-mono text-sm text-neutral-500 ml-2">{reviews.length}</span>
            )}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-neutral-500 font-mono text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </section>

        {/* Details */}
        <section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-cinema-800 pt-8">
          {movie.original_language && (
            <div>
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Language</p>
              <p className="text-sm font-body text-neutral-200 mt-1 uppercase">{movie.original_language}</p>
            </div>
          )}
          {movie.status && (
            <div>
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Status</p>
              <p className="text-sm font-body text-neutral-200 mt-1">{movie.status}</p>
            </div>
          )}
          {movie.budget > 0 && (
            <div>
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Budget</p>
              <p className="text-sm font-body text-neutral-200 mt-1">${movie.budget.toLocaleString()}</p>
            </div>
          )}
          {movie.revenue > 0 && (
            <div>
              <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Revenue</p>
              <p className="text-sm font-body text-neutral-200 mt-1">${movie.revenue.toLocaleString()}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}