import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ onResults, isPage = false }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!onResults) return;
    clearTimeout(debounceRef.current);
    if (!query.trim()) { onResults([]); return; }
    debounceRef.current = setTimeout(() => { onResults(query); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search films…"
        className={`w-full bg-cinema-800 border border-cinema-600 text-neutral-100
          placeholder-neutral-500 font-body text-sm
          focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500
          transition-colors duration-200 pr-10
          ${isPage ? 'px-5 py-4 rounded-sm text-base' : 'px-4 py-2.5 rounded-sm'}`}
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-400 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}