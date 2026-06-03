import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAllRead } from '../api/social.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = () => {
      getNotifications()
        .then(({ data }) => {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(console.error);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      await markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className="relative text-neutral-400 hover:text-white transition-colors p-1">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-xs font-mono w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-80 bg-cinema-900 border border-cinema-700 rounded-sm shadow-xl z-50">
          <div className="px-4 py-3 border-b border-cinema-700">
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">Notifications</span>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-neutral-600 font-mono text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <NotificationItem key={n._id} notification={n} onClose={() => setOpen(false)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification: n, onClose }) {
  const sender = n.senderId;
  const getLink = () => {
    if (n.type === 'follow') return `/u/${sender?.username}`;
    if (n.type === 'list_like' || n.type === 'list_comment') return `/lists/${n.refId}`;
    return '/';
  };

  return (
    <Link
      to={getLink()}
      onClick={onClose}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-cinema-800 transition-colors border-b border-cinema-800 last:border-0 ${
        !n.read ? 'bg-cinema-800/50' : ''
      }`}
    >
      {sender && (
        <img
          src={sender.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${sender.username}`}
          alt={sender.username}
          className="w-7 h-7 rounded-full shrink-0 mt-0.5"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-body text-neutral-300 leading-snug">
          <span className="text-white font-medium">{sender?.displayName || sender?.username}</span>{' '}{n.message}
        </p>
        <p className="text-xs font-mono text-neutral-600 mt-0.5">
          {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
      {!n.read && <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-1.5" />}
    </Link>
  );
}