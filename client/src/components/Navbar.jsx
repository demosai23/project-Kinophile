import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import SearchBar from './SearchBar.jsx';
import NotificationBell from './NotificationBell.jsx';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cinema-950/90 backdrop-blur-sm border-b border-cinema-800">
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="font-display text-xl italic text-white hover:text-brand-400 transition-colors shrink-0">
          Kinophile
        </Link>

        {/* Search — hidden on mobile */}
        <div className="flex-1 max-w-sm hidden md:block">
          <SearchBar />
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <Link to="/films" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">Films</Link>
          <Link to="/browse" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">Browse</Link>
          <DarkModeToggle />
          {isAuthenticated ? (
            <>
              <Link to="/users" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">People</Link>
              <Link to="/watchlist" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">Watchlist</Link>
              <Link to="/lists" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">Lists</Link>
              <Link to="/diary" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">Diary</Link>
              <NotificationBell />
              <Link to={`/u/${user?.username}`} className="text-sm font-body text-neutral-400 hover:text-white transition-colors">Profile</Link>
              <button onClick={handleLogout} className="text-sm font-body text-neutral-400 hover:text-brand-400 transition-colors">Sign out</button>
              <Link to={`/u/${user?.username}`}>
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                  alt={user?.username}
                  className="w-7 h-7 rounded-full object-cover border border-cinema-600 hover:border-brand-500 transition-colors"
                />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Join</Link>
            </>
          )}
        </div>

        {/* Mobile right side */}
        <div className="flex items-center gap-3 ml-auto md:hidden">
          <DarkModeToggle />
          {isAuthenticated && <NotificationBell />}
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-cinema-950 border-t border-cinema-800 px-6 py-4 space-y-4">
          {/* Mobile search */}
          <SearchBar />

          {/* Mobile links */}
          <div className="flex flex-col gap-3 pt-2">
            <Link to="/films" onClick={closeMenu} className="text-sm font-body text-neutral-400 hover:text-white transition-colors py-1">Films</Link>
            <Link to="/browse" onClick={closeMenu} className="text-sm font-body text-neutral-400 hover:text-white transition-colors py-1">Browse</Link>

            {isAuthenticated ? (
              <>
                <Link to="/users" onClick={closeMenu} className="text-sm font-body text-neutral-400 hover:text-white transition-colors py-1">People</Link>
                <Link to="/watchlist" onClick={closeMenu} className="text-sm font-body text-neutral-400 hover:text-white transition-colors py-1">Watchlist</Link>
                <Link to="/lists" onClick={closeMenu} className="text-sm font-body text-neutral-400 hover:text-white transition-colors py-1">Lists</Link>
                <Link to="/diary" onClick={closeMenu} className="text-sm font-body text-neutral-400 hover:text-white transition-colors py-1">Diary</Link>
                <Link to={`/u/${user?.username}`} onClick={closeMenu} className="text-sm font-body text-neutral-400 hover:text-white transition-colors py-1">Profile</Link>

                <div className="pt-2 border-t border-cinema-800 flex items-center gap-3">
                  <img
                    src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full object-cover border border-cinema-600"
                  />
                  <div>
                    <p className="text-sm font-body text-white">{user?.displayName || user?.username}</p>
                    <p className="text-xs font-mono text-neutral-500">@{user?.username}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-sm font-body text-red-400 hover:text-red-300 transition-colors py-1 text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link to="/login" onClick={closeMenu} className="btn-ghost text-sm py-2 px-4">Sign in</Link>
                <Link to="/register" onClick={closeMenu} className="btn-primary text-sm py-2 px-4">Join</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}