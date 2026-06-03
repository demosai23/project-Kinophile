import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMyDiary, getUserDiary } from '../api/stats.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';

const IMG_W185 = 'https://image.tmdb.org/t/p/w185';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DiaryPage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [diary, setDiary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [profileUser, setProfileUser] = useState(null);

  const isOwnDiary = !username || username === currentUser?.username;

  useEffect(() => {
    const load = async () => {
      try {
        if (isOwnDiary) {
          const { data } = await getMyDiary();
          setDiary(data.diary || {});
        } else {
          const { data } = await getUserDiary(username);
          setDiary(data.diary || {});
          setProfileUser(data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username]);

  // Get all years that have entries
  const years = [...new Set(
    Object.keys(diary).map((key) => parseInt(key.split('-')[0]))
  )].sort((a, b) => b - a);

  if (!years.includes(selectedYear) && years.length > 0) {
    // auto-select most recent year
  }

  // Filter diary entries for selected year
  const monthsWithEntries = Object.entries(diary)
    .filter(([key]) => key.startsWith(String(selectedYear)))
    .sort(([a], [b]) => b.localeCompare(a)); // newest month first

  const totalThisYear = monthsWithEntries.reduce(
    (sum, [, entries]) => sum + entries.length, 0
  );

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

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">
              {isOwnDiary ? 'Your' : `${profileUser?.displayName || username}'s`} diary
            </span>
            <h1 className="font-display text-4xl text-white mt-1">Film Diary</h1>
            {totalThisYear > 0 && (
              <p className="font-mono text-sm text-neutral-500 mt-1">
                {totalThisYear} film{totalThisYear !== 1 ? 's' : ''} in {selectedYear}
              </p>
            )}
          </div>

          {/* Year selector */}
          {years.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-all ${
                    selectedYear === year
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'border-cinema-600 text-neutral-400 hover:border-brand-500 hover:text-white'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Empty state */}
        {Object.keys(diary).length === 0 && (
          <div className="text-center py-20 border border-cinema-800 rounded-sm">
            <p className="font-display text-2xl text-neutral-500 mb-2">No films logged yet</p>
            <p className="text-neutral-600 font-mono text-sm mb-6">
              {isOwnDiary ? 'Mark films as watched to start your diary' : 'This user has no diary entries'}
            </p>
            {isOwnDiary && (
              <Link to="/films" className="btn-primary">Browse films</Link>
            )}
          </div>
        )}

        {/* No entries for selected year */}
        {Object.keys(diary).length > 0 && monthsWithEntries.length === 0 && (
          <div className="text-center py-16 border border-cinema-800 rounded-sm">
            <p className="font-display text-xl text-neutral-500">No films logged in {selectedYear}</p>
          </div>
        )}

        {/* Diary entries by month */}
        <div className="space-y-10">
          {monthsWithEntries.map(([key, entries]) => {
            const [year, month] = key.split('-');
            const monthName = MONTHS[parseInt(month) - 1];

            return (
              <section key={key}>
                {/* Month header */}
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="font-display text-xl text-white">{monthName}</h2>
                  <span className="font-mono text-xs text-neutral-600">{year}</span>
                  <div className="flex-1 h-px bg-cinema-800" />
                  <span className="font-mono text-xs text-neutral-600">
                    {entries.length} film{entries.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Entries */}
                <div className="space-y-2">
                  {entries.map((entry) => {
                    const watchedDate = new Date(entry.watchedAt);
                    const day = watchedDate.getDate();
                    const weekday = watchedDate.toLocaleDateString('en-US', { weekday: 'short' });

                    return (
                      <div
                        key={entry._id}
                        className="flex items-center gap-4 bg-cinema-900 border border-cinema-700 rounded-sm px-4 py-3 hover:border-cinema-600 transition-colors"
                      >
                        {/* Date */}
                        <div className="text-center shrink-0 w-10">
                          <p className="font-mono text-xs text-neutral-500 uppercase">{weekday}</p>
                          <p className="font-display text-lg text-white leading-none">{day}</p>
                        </div>

                        <div className="w-px h-10 bg-cinema-700 shrink-0" />

                        {/* Poster */}
                        <Link to={`/film/${entry.tmdbId}`} className="shrink-0">
                          <img
                            src={entry.movieData?.poster_path
                              ? `${IMG_W185}${entry.movieData.poster_path}`
                              : 'https://via.placeholder.com/40x60?text=?'}
                            alt={entry.movieData?.title}
                            className="w-9 rounded-sm border border-cinema-700"
                          />
                        </Link>

                        {/* Title + year */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/film/${entry.tmdbId}`}
                            className="font-display text-base text-white hover:text-brand-400 transition-colors truncate block"
                          >
                            {entry.movieData?.title}
                          </Link>
                          {entry.movieData?.release_date && (
                            <span className="font-mono text-xs text-neutral-500">
                              {entry.movieData.release_date.split('-')[0]}
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="shrink-0 flex items-center gap-3">
                          {entry.liked && (
                            <span className="text-red-400 text-sm">♥</span>
                          )}
                          {entry.rating ? (
                            <StarRating value={entry.rating} readOnly size="sm" />
                          ) : (
                            <span className="font-mono text-xs text-neutral-700">No rating</span>
                          )}
                          {entry.review && (
                            <span className="text-xs font-mono text-brand-600 border border-brand-800 px-1.5 py-0.5 rounded-sm">
                              Review
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}