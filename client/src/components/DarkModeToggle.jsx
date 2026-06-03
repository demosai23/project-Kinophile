import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('kinophile-theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('kinophile-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('kinophile-theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="text-neutral-400 hover:text-white transition-colors p-1"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}