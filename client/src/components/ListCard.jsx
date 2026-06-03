import { Link } from 'react-router-dom';

const IMG_W185 = 'https://image.tmdb.org/t/p/w185';

export default function ListCard({ list, showOwner = false }) {
  const firstPosters = list.movies
    ?.slice(0, 4)
    .map((m) => m.movieData?.poster_path)
    .filter(Boolean) || [];

  const date = new Date(list.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <Link
      to={`/lists/${list._id}`}
      className="group block bg-cinema-900 border border-cinema-700 hover:border-brand-500 rounded-sm p-4 transition-all duration-200"
    >
      {/* Poster stack */}
      <div className="flex gap-1 mb-4 h-24 overflow-hidden">
        {firstPosters.length > 0 ? (
          firstPosters.map((path, i) => (
            <div key={i} className="flex-1 overflow-hidden rounded-sm">
              <img
                src={`${IMG_W185}${path}`}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))
        ) : (
          <div className="w-full h-full bg-cinema-800 rounded-sm flex items-center justify-center">
            <span className="font-mono text-xs text-neutral-600">No films yet</span>
          </div>
        )}
        {/* Fill empty slots */}
        {firstPosters.length > 0 && firstPosters.length < 4 &&
          Array.from({ length: 4 - firstPosters.length }).map((_, i) => (
            <div key={`empty-${i}`} className="flex-1 bg-cinema-800 rounded-sm" />
          ))
        }
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-base text-white group-hover:text-brand-400 transition-colors truncate">
            {list.name}
          </h3>
          {list.description && (
            <p className="text-xs font-body text-neutral-500 mt-0.5 line-clamp-2">{list.description}</p>
          )}
        </div>
        {!list.isPublic && (
          <span className="shrink-0 text-xs font-mono text-neutral-600 border border-cinema-700 px-1.5 py-0.5 rounded-sm">
            Private
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3">
        <span className="font-mono text-xs text-neutral-500">{list.movies?.length || 0} films</span>
        {list.likes?.length > 0 && (
          <>
            <span className="text-cinema-600">·</span>
            <span className="font-mono text-xs text-neutral-500">♥ {list.likes.length}</span>
          </>
        )}
        <span className="text-cinema-600">·</span>
        <span className="font-mono text-xs text-neutral-500">{date}</span>
      </div>
    </Link>
  );
}