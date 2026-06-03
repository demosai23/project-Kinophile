import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrending, getPopular } from '../api/movies.js';
import { getFeed } from '../api/social.js';
import MovieCard from '../components/MovieCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const IMG_BASE = 'https://image.tmdb.org/t/p/original';
const IMG_W185 = 'https://image.tmdb.org/t/p/w185';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [hero, setHero] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tRes, pRes] = await Promise.all([getTrending(), getPopular()]);
        const tMovies = tRes.data.results || [];
        const pMovies = pRes.data.results || [];
        setTrending(tMovies);
        setPopular(pMovies);
        setHero(tMovies.find((m) => m.backdrop_path) || tMovies[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    setFeedLoading(true);
    getFeed()
      .then(({ data }) => setFeed(data.feed || []))
      .catch(console.error)
      .finally(() => setFeedLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-display text-2xl text-brand-500 italic">Kinophile</span>
          <div className="w-8 h-0.5 bg-brand-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-950">
      {hero && (
        <section className="relative h-[85vh] overflow-hidden">
          <img src={`${IMG_BASE}${hero.backdrop_path}`} alt={hero.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-cinema-950 via-cinema-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-transparent" />
          <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
            <div className="max-w-xl">
              <p className="font-mono text-xs text-brand-500 uppercase tracking-widest mb-4">
                {isAuthenticated ? 'Trending this week' : 'Track the films you love'}
              </p>
              <h1 className="font-display text-5xl md:text-6xl text-white leading-tight mb-4">
                {isAuthenticated ? hero.title : 'Kinophile'}
              </h1>
              <p className="text-neutral-300 font-body text-lg leading-relaxed mb-8 line-clamp-3">
                {isAuthenticated ? hero.overview : "Track films you've watched. Save films you want to see. Share what's good."}
              </p>
              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <Link to={`/film/${hero.id}`} className="btn-primary">View film</Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary">Get started — it's free</Link>
                    <Link to="/login" className="btn-ghost">Sign in</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* Activity feed */}
        {isAuthenticated && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">People you follow</span>
                <h2 className="font-display text-2xl text-white mt-1">Activity Feed</h2>
              </div>
            </div>
            {feedLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-cinema-800 animate-pulse rounded-sm" />
                ))}
              </div>
            ) : feed.length === 0 ? (
              <div className="bg-cinema-900 border border-cinema-700 rounded-sm p-8 text-center">
                <p className="font-display text-lg text-neutral-500 mb-2">Nothing here yet</p>
                <p className="text-neutral-600 font-mono text-sm mb-4">Follow other users to see their activity</p>
                <Link to="/users" className="btn-ghost text-sm py-2 px-4">Find people to follow</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {feed.map((item, index) => (
                  <FeedItem key={index} item={item} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">This week</span>
              <h2 className="font-display text-2xl text-white mt-1">Trending Films</h2>
            </div>
            <Link to="/films" className="text-sm font-mono text-neutral-400 hover:text-brand-400 transition-colors">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {trending.slice(0, 12).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {/* Popular */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">All time</span>
              <h2 className="font-display text-2xl text-white mt-1">Popular Films</h2>
            </div>
            <Link to="/browse" className="text-sm font-mono text-neutral-400 hover:text-brand-400 transition-colors">Browse by genre →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {popular.slice(0, 12).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        {!isAuthenticated && (
          <section className="border border-cinema-700 rounded-sm p-10 text-center">
            <h2 className="font-display text-3xl text-white mb-3">Start tracking your films</h2>
            <p className="text-neutral-400 font-body mb-6">Join thousands of film lovers on Kinophile.</p>
            <Link to="/register" className="btn-primary">Create a free account</Link>
          </section>
        )}
      </div>
    </main>
  );
}

function FeedItem({ item }) {
  const { type, data } = item;
  const user = data.userId;
  const date = new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (!user) return null;

  return (
    <div className="flex items-center gap-4 bg-cinema-900 border border-cinema-700 rounded-sm px-4 py-3">
      <Link to={`/u/${user.username}`}>
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
          alt={user.username}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body text-neutral-300">
          <Link to={`/u/${user.username}`} className="text-white hover:text-brand-400 transition-colors font-medium">
            {user.displayName || user.username}
          </Link>{' '}
          {type === 'log' && (
            <>watched <Link to={`/film/${data.tmdbId}`} className="text-brand-400 hover:text-brand-300">{data.movieData?.title}</Link>
              {data.rating && <span className="text-neutral-500 ml-1">· {data.rating} stars</span>}
            </>
          )}
          {type === 'review' && (
            <>reviewed <Link to={`/film/${data.tmdbId}`} className="text-brand-400 hover:text-brand-300">{data.movieData?.title}</Link></>
          )}
          {type === 'list' && (
            <>created a list <Link to={`/lists/${data._id}`} className="text-brand-400 hover:text-brand-300">{data.name}</Link></>
          )}
        </p>
        {type === 'review' && data.body && (
          <p className="text-xs font-body text-neutral-500 mt-0.5 line-clamp-1">{data.body}</p>
        )}
      </div>
      {(type === 'log' || type === 'review') && data.movieData?.poster_path && (
        <Link to={`/film/${data.tmdbId}`} className="shrink-0">
          <img src={`${IMG_W185}${data.movieData.poster_path}`} alt={data.movieData.title} className="w-8 rounded-sm" />
        </Link>
      )}
      <span className="font-mono text-xs text-neutral-600 shrink-0">{date}</span>
    </div>
  );
}