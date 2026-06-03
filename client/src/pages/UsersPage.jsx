import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers, followUser, unfollowUser } from '../api/social.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { isAuthenticated, user: currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await searchUsers(query);
        setResults(data.users || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">Discover</span>
          <h1 className="font-display text-4xl text-white mt-1">Find People</h1>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or name..."
          className="input-field mb-6"
          autoFocus
        />

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-cinema-800 animate-pulse rounded-sm" />
            ))}
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <p className="text-neutral-500 font-mono text-sm text-center py-8">No users found</p>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            {results.map((u) => (
              <UserRow
                key={u._id}
                user={u}
                isCurrentUser={currentUser?.username === u.username}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function UserRow({ user, isCurrentUser, isAuthenticated }) {
  const [following, setFollowing] = useState(false);

  const handleFollow = async () => {
    try {
      if (following) {
        await unfollowUser(user.username);
        setFollowing(false);
      } else {
        await followUser(user.username);
        setFollowing(true);
        toast.success(`Following ${user.username}`);
      }
    } catch (err) {
      toast.error('Error');
    }
  };

  return (
    <div className="flex items-center gap-4 bg-cinema-900 border border-cinema-700 rounded-sm px-4 py-3">
      <Link to={`/u/${user.username}`}>
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
          alt={user.username}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/u/${user.username}`} className="font-body text-white hover:text-brand-400 transition-colors font-medium block">
          {user.displayName || user.username}
        </Link>
        <p className="font-mono text-xs text-neutral-500">@{user.username}</p>
        {user.bio && <p className="text-xs font-body text-neutral-600 mt-0.5 truncate">{user.bio}</p>}
      </div>
      {!isCurrentUser && isAuthenticated && (
        <button
          onClick={handleFollow}
          className={`shrink-0 text-sm font-body px-3 py-1.5 rounded-sm border transition-all ${
            following
              ? 'border-cinema-600 text-neutral-400 hover:border-red-500 hover:text-red-400'
              : 'border-brand-500 text-brand-400 hover:bg-brand-500 hover:text-white'
          }`}
        >
          {following ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </div>
  );
}