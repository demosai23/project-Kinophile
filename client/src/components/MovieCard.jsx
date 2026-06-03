import { Link } from 'react-router-dom';

const IMG_BASE = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER = 'https://via.placeholder.com/500x750?text=No+Poster';

export default function MovieCard({ movie }) {
  const poster = movie.poster_path
    ? `${IMG_BASE}${movie.poster_path}`
    : PLACEHOLDER;

  const year = movie.release_date?.split('-')[0] || '';
  const rating = movie.vote_average?.toFixed(1) || 'N/A';

  return (
    <Link
      to={`/film/${movie.id}`}
      className="group relative block overflow-hidden rounded-sm bg-cinema-900 border border-cinema-700 hover:border-brand-500 transition-all duration-300"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-2 right-2 bg-cinema-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded-sm">
        <span className="text-brand-400 text-xs font-mono font-medium">★ {rating}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <h3 className="font-display text-sm text-white leading-tight line-clamp-2">{movie.title}</h3>
        {year && <span className="text-xs font-mono text-neutral-400 mt-0.5 block">{year}</span>}
      </div>
    </Link>
  );
}