import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DarkModeToggle from './DarkModeToggle.jsx';
import SearchBar from './SearchBar.jsx';
import NotificationBell from './NotificationBell.jsx';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cinema-950/90 backdrop-blur-sm border-b border-cinema-800">
      <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
        <Link to="/" className="font-display text-xl italic text-white hover:text-brand-400 transition-colors shrink-0">
          Kinophile
        </Link>

        <div className="flex-1 max-w-sm">
          <SearchBar />
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <Link to="/films" className="text-sm font-body text-neutral-400 hover:text-white transition-colors hidden md:block">
            Films
          </Link>
          <Link to="/browse" className="text-sm font-body text-neutral-400 hover:text-white transition-colors hidden md:block">
            Browse
          </Link>

          <DarkModeToggle />

          {isAuthenticated ? (
            <>
              <Link to="/users" className="text-sm font-body text-neutral-400 hover:text-white transition-colors hidden md:block">
                People
              </Link>
              <Link to="/watchlist" className="text-sm font-body text-neutral-400 hover:text-white transition-colors hidden md:block">
                Watchlist
              </Link>
              <Link to="/lists" className="text-sm font-body text-neutral-400 hover:text-white transition-colors hidden md:block">
                Lists
              </Link>
              <Link to="/diary" className="text-sm font-body text-neutral-400 hover:text-white transition-colors hidden md:block">
                Diary
              </Link>
              <NotificationBell />
              <Link to={`/u/${user?.username}`} className="text-sm font-body text-neutral-400 hover:text-white transition-colors hidden md:block">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-body text-neutral-400 hover:text-brand-400 transition-colors hidden md:block"
              >
                Sign out
              </button>
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
              <Link to="/login" className="text-sm font-body text-neutral-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                Join
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}