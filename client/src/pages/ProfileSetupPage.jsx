import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Science Fiction', 'Thriller', 'War', 'Western',
];

export default function ProfileSetupPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    displayName: user?.displayName || '',
    bio: '',
    favoriteGenres: [],
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const toggleGenre = (genre) => {
    setForm((prev) => {
      const already = prev.favoriteGenres.includes(genre);
      if (already) {
        return { ...prev, favoriteGenres: prev.favoriteGenres.filter((g) => g !== genre) };
      }
      if (prev.favoriteGenres.length >= 5) {
        toast.error('Pick up to 5 genres');
        return prev;
      }
      return { ...prev, favoriteGenres: [...prev.favoriteGenres, genre] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('displayName', form.displayName);
      formData.append('bio', form.bio);
      formData.append('favoriteGenres', JSON.stringify(form.favoriteGenres));
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data.user);
      toast.success('Profile saved!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cinema-950 px-4 py-24">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">Step 2 of 2</span>
          <h1 className="font-display text-3xl text-white mt-2">Set up your profile</h1>
          <p className="text-neutral-500 text-sm mt-1">You can always change this later.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="label">Profile photo</label>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={handleAvatarClick}
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cinema-600 hover:border-brand-500 transition-colors group"
              >
                <img
                  src={avatarPreview || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-cinema-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-mono">Change</span>
                </div>
              </button>
              <div>
                <button type="button" onClick={handleAvatarClick} className="btn-ghost text-sm py-2 px-4">
                  Upload photo
                </button>
                <p className="text-neutral-600 text-xs font-mono mt-1">JPG, PNG, WebP · Max 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
          <div>
            <label className="label">Display name</label>
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              placeholder="How you appear to others"
              maxLength={50}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell people about your taste in films…"
              maxLength={300}
              rows={3}
              className="input-field resize-none"
            />
            <p className="text-neutral-600 text-xs font-mono mt-1 text-right">
              {form.bio.length}/300
            </p>
          </div>
          <div>
            <label className="label">Favorite genres <span className="normal-case text-neutral-600">(pick up to 5)</span></label>
            <div className="flex flex-wrap gap-2 mt-3">
              {ALL_GENRES.map((genre) => {
                const active = form.favoriteGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-all duration-150 ${
                      active
                        ? 'bg-brand-500 border-brand-500 text-white'
                        : 'bg-transparent border-cinema-600 text-neutral-400 hover:border-brand-600 hover:text-neutral-200'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : 'Save profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-neutral-500 hover:text-neutral-300 font-body transition-colors"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}