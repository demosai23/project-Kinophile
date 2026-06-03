import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListById, updateList, addMovieToList, removeMovieFromList } from '../api/lists.js';
import { searchMovies } from '../api/movies.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const IMG_W185 = 'https://image.tmdb.org/t/p/w185';

export default function EditListPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [movies, setMovies] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Search
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getListById(id);
        if (data.list.userId._id !== user?._id) {
          toast.error('Not authorized');
          navigate('/lists');
          return;
        }
        setList(data.list);
        setMovies([...data.list.movies].sort((a, b) => a.order - b.order));
        setForm({
          name: data.list.name,
          description: data.list.description || '',
          isPublic: data.list.isPublic,
        });
      } catch (err) {
        toast.error('List not found');
        navigate('/lists');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Debounced search
  useEffect(() => {
    if (debounceRef[0]) clearTimeout(debounceRef[0]);
    if (!query.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await searchMovies(query);
        setSearchResults(data.results?.slice(0, 6) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 400);
    debounceRef[0] = timer;
  }, [query]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await updateList(id, form);
      toast.success('List updated!');
      navigate(`/lists/${id}`);
    } catch (err) {
      toast.error('Error updating list');
    } finally {
      setSaving(false);
    }
  };

  const handleAddMovie = async (movie) => {
    try {
      const { data } = await addMovieToList(id, {
        tmdbId: movie.id,
        movieData: {
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
        },
      });
      if (data.added) {
        setMovies([...data.list.movies].sort((a, b) => a.order - b.order));
        toast.success(`Added ${movie.title}`);
      } else {
        toast.error('Already in list');
      }
    } catch (err) {
      toast.error('Error adding film');
    }
  };

  const handleRemoveMovie = async (tmdbId) => {
    try {
      const { data } = await removeMovieFromList(id, tmdbId);
      setMovies([...data.list.movies].sort((a, b) => a.order - b.order));
    } catch (err) {
      toast.error('Error removing film');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center pt-14">
        <div className="w-8 h-0.5 bg-brand-500 animate-pulse" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center gap-3 mb-8">
          <Link to={`/lists/${id}`} className="text-neutral-500 hover:text-white font-mono text-sm transition-colors">← Back</Link>
          <span className="text-neutral-700">/</span>
          <span className="font-mono text-sm text-neutral-400">Edit list</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left — list info */}
          <div>
            <h2 className="font-display text-2xl text-white mb-6">List details</h2>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="label">List name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  maxLength={100}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  maxLength={500}
                  className="input-field resize-none"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPublic}
                  onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                  className="accent-brand-500"
                />
                <span className="text-sm font-body text-neutral-400">Public list</span>
              </label>
              <button type="submit" disabled={saving || !form.name.trim()} className="btn-primary">
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </form>

            {/* Current films */}
            <div className="mt-8">
              <h3 className="font-display text-lg text-white mb-4">Films in list ({movies.length})</h3>
              {movies.length === 0 ? (
                <p className="text-neutral-600 font-mono text-sm">No films yet. Search to add some.</p>
              ) : (
                <div className="space-y-2">
                  {movies.map((movie, index) => (
                    <div key={movie.tmdbId} className="flex items-center gap-3 bg-cinema-900 border border-cinema-700 rounded-sm p-2">
                      <span className="font-mono text-xs text-neutral-600 w-5 text-right">{index + 1}</span>
                      <img
                        src={movie.movieData?.poster_path ? `${IMG_W185}${movie.movieData.poster_path}` : 'https://via.placeholder.com/40x60?text=?'}
                        alt={movie.movieData?.title}
                        className="w-8 rounded-sm shrink-0"
                      />
                      <span className="flex-1 text-sm font-body text-neutral-300 truncate">{movie.movieData?.title}</span>
                      <button
                        onClick={() => handleRemoveMovie(movie.tmdbId)}
                        className="text-neutral-600 hover:text-red-400 transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — search and add films */}
          <div>
            <h2 className="font-display text-2xl text-white mb-6">Add films</h2>
            <div className="relative mb-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a film..."
                className="input-field pr-10"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((movie) => {
                  const alreadyIn = movies.some((m) => m.tmdbId === movie.id);
                  return (
                    <div key={movie.id} className="flex items-center gap-3 bg-cinema-900 border border-cinema-700 rounded-sm p-2">
                      <img
                        src={movie.poster_path ? `${IMG_W185}${movie.poster_path}` : 'https://via.placeholder.com/40x60?text=?'}
                        alt={movie.title}
                        className="w-8 rounded-sm shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body text-neutral-200 truncate">{movie.title}</p>
                        {movie.release_date && (
                          <p className="text-xs font-mono text-neutral-500">{movie.release_date.split('-')[0]}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddMovie(movie)}
                        disabled={alreadyIn}
                        className={`shrink-0 text-xs font-mono px-2 py-1 rounded-sm border transition-all ${
                          alreadyIn
                            ? 'border-cinema-700 text-neutral-600 cursor-not-allowed'
                            : 'border-brand-500 text-brand-400 hover:bg-brand-500 hover:text-white'
                        }`}
                      >
                        {alreadyIn ? 'Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}