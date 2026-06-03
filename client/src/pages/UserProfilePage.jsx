import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProfile, followUser, unfollowUser, getFollowStatus } from '../api/social.js';
import { useAuth } from '../context/AuthContext.jsx';
import MovieCard from '../components/MovieCard.jsx';
import ListCard from '../components/ListCard.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [lists, setLists] = useState([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('films');

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getProfile(username);
        setProfile(data.user);
        setStats(data.stats);
        setRecentLogs(data.recentLogs || []);
        setRecentReviews(data.recentReviews || []);
        setLists(data.lists || []);
        setFollowerCount(data.stats.followerCount);
        setFollowingCount(data.stats.followingCount);

        if (isAuthenticated && currentUser?.username !== username) {
          try {
            const statusRes = await getFollowStatus(username);
            setFollowing(statusRes.data.following);
          } catch {
            setFollowing(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, isAuthenticated]);

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(username);
        setFollowing(false);
        setFollowerCount((c) => c - 1);
        toast.success('Unfollowed');
      } else {
        await followUser(username);
        setFollowing(true);
        setFollowerCount((c) => c + 1);
        toast.success(`Following ${username}`);
      }
    } catch (err) {
      toast.error('Error');
    }
  };

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center pt-14">
        <p className="text-neutral-400 font-body">User not found</p>
      </div>
    );
  }

  const recentMovies = recentLogs.map((log) => ({
    id: log.tmdbId,
    title: log.movieData?.title,
    poster_path: log.movieData?.poster_path,
    release_date: log.movieData?.release_date,
    vote_average: null,
  }));

  return (
    <main className="min-h-screen bg-cinema-950 pt-20 pb-20">
      <div className="bg-cinema-900 border-b border-cinema-800">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-start gap-6">
            <img
              src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.username}`}
              alt={profile.username}
              className="w-20 h-20 rounded-full object-cover border-2 border-cinema-600 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-display text-2xl text-white">
                    {profile.displayName || profile.username}
                  </h1>
                  <p className="font-mono text-sm text-neutral-500">@{profile.username}</p>
                  {profile.bio && (
                    <p className="text-neutral-400 font-body text-sm mt-2 max-w-md">{profile.bio}</p>
                  )}
                  {profile.favoriteGenres?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {profile.favoriteGenres.map((g) => (
                        <span key={g} className="text-xs font-mono text-neutral-500 border border-cinema-700 px-2 py-0.5 rounded-sm">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isOwnProfile ? (
                  <Link to="/setup-profile" className="btn-ghost text-sm py-2 px-4">Edit profile</Link>
                ) : isAuthenticated ? (
                  <button
                    onClick={handleFollow}
                    className={`text-sm font-body px-4 py-2 rounded-sm border transition-all ${
                      following
                        ? 'border-cinema-600 text-neutral-400 hover:border-red-500 hover:text-red-400'
                        : 'btn-primary'
                    }`}
                  >
                    {following ? 'Unfollow' : 'Follow'}
                  </button>
                ) : null}
              </div>

              <div className="flex items-center gap-6 mt-4">
                <div className="text-center">
                  <p className="font-display text-xl text-white">{stats?.totalWatched || 0}</p>
                  <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Films</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl text-white">{stats?.watchedThisYear || 0}</p>
                  <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">This year</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl text-white">{lists.length}</p>
                  <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Lists</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl text-white">{followerCount}</p>
                  <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-display text-xl text-white">{followingCount}</p>
                  <p className="font-mono text-xs text-neutral-500 uppercase tracking-widest">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-6 border-t border-cinema-800">
            {['films', 'reviews', 'lists'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-sm font-mono uppercase tracking-widest transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'films' && (
          <div>
            {recentMovies.length === 0 ? (
              <p className="text-neutral-500 font-mono text-sm">No films watched yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {recentMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <p className="text-neutral-500 font-mono text-sm">No reviews yet.</p>
            ) : (
              recentReviews.map((review) => (
                <ReviewCard key={review._id} review={review} showMovie />
              ))
            )}
          </div>
        )}

        {activeTab === 'lists' && (
          <div>
            {lists.length === 0 ? (
              <p className="text-neutral-500 font-mono text-sm">No public lists yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lists.map((list) => (
                  <ListCard key={list._id} list={list} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}