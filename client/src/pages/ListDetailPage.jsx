import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  getListById, removeMovieFromList, reorderMovies,
  toggleListLike, addComment, deleteComment,
} from '../api/lists.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const IMG_W185 = 'https://image.tmdb.org/t/p/w185';

export default function ListDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [movies, setMovies] = useState([]);

  const isOwner = user && list?.userId?._id === user._id;

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getListById(id);
        setList(data.list);
        setMovies([...data.list.movies].sort((a, b) => a.order - b.order));
        setLikeCount(data.list.likes?.length || 0);
        setLiked(data.list.likes?.some((lid) => lid === user?._id || lid?.toString() === user?._id));
      } catch (err) {
        toast.error('List not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Sign in to like lists'); return; }
    try {
      const { data } = await toggleListLike(id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (err) {
      toast.error('Error');
    }
  };

  const handleRemoveMovie = async (tmdbId) => {
    try {
      const { data } = await removeMovieFromList(id, tmdbId);
      setMovies([...data.list.movies].sort((a, b) => a.order - b.order));
      toast.success('Removed from list');
    } catch (err) {
      toast.error('Error removing film');
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const newMovies = [...movies];
    const [moved] = newMovies.splice(result.source.index, 1);
    newMovies.splice(result.destination.index, 0, moved);
    setMovies(newMovies);

    try {
      await reorderMovies(id, newMovies.map((m) => m.tmdbId));
    } catch (err) {
      toast.error('Error saving order');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!isAuthenticated) { toast.error('Sign in to comment'); return; }
    setSubmitting(true);
    try {
      const { data } = await addComment(id, comment);
      setList((prev) => ({ ...prev, comments: [...(prev.comments || []), data.comment] }));
      setComment('');
    } catch (err) {
      toast.error('Error posting comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      setList((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      toast.error('Error deleting comment');
    }
  };

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
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              {!list.isPublic && (
                <span className="text-xs font-mono text-neutral-600 border border-cinema-700 px-1.5 py-0.5 rounded-sm mb-2 inline-block">
                  Private
                </span>
              )}
              <h1 className="font-display text-4xl text-white">{list.name}</h1>
              {list.description && (
                <p className="text-neutral-400 font-body mt-2 max-w-xl">{list.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {list.userId && (
                  <Link to={`/u/${list.userId.username}`} className="flex items-center gap-2">
                    <img
                      src={list.userId.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${list.userId.username}`}
                      alt={list.userId.username}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sm font-body text-neutral-400 hover:text-white transition-colors">
                      {list.userId.displayName || list.userId.username}
                    </span>
                  </Link>
                )}
                <span className="text-neutral-600">·</span>
                <span className="font-mono text-xs text-neutral-500">{movies.length} films</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isOwner && (
                <Link to={`/lists/${id}/edit`} className="btn-ghost text-sm py-2 px-4">Edit</Link>
              )}
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-body border transition-all ${
                  liked
                    ? 'bg-red-500/20 border-red-500 text-red-400'
                    : 'border-cinema-600 text-neutral-300 hover:border-red-500 hover:text-red-400'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {likeCount > 0 ? likeCount : ''} {liked ? 'Liked' : 'Like'}
              </button>
            </div>
          </div>
        </div>

        {/* Movies */}
        <section className="mb-12">
          {isOwner && movies.length > 1 && (
            <p className="font-mono text-xs text-neutral-600 mb-4">Drag films to reorder</p>
          )}

          {movies.length === 0 ? (
            <div className="text-center py-16 border border-cinema-800 rounded-sm">
              <p className="font-display text-xl text-neutral-500 mb-2">No films in this list yet</p>
              {isOwner && (
                <Link to={`/lists/${id}/edit`} className="btn-primary mt-4 inline-block">Add films</Link>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={isOwner ? handleDragEnd : () => {}}>
              <Droppable droppableId="movies">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {movies.map((movie, index) => (
                      <Draggable
                        key={String(movie.tmdbId)}
                        draggableId={String(movie.tmdbId)}
                        index={index}
                        isDragDisabled={!isOwner}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-4 bg-cinema-900 border rounded-sm p-3 transition-colors ${
                              snapshot.isDragging
                                ? 'border-brand-500 shadow-lg shadow-brand-500/10'
                                : 'border-cinema-700'
                            }`}
                          >
                            {/* Drag handle */}
                            {isOwner && (
                              <div
                                {...provided.dragHandleProps}
                                className="text-neutral-600 hover:text-neutral-400 transition-colors cursor-grab active:cursor-grabbing shrink-0"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="9" cy="6" r="1.5" />
                                  <circle cx="15" cy="6" r="1.5" />
                                  <circle cx="9" cy="12" r="1.5" />
                                  <circle cx="15" cy="12" r="1.5" />
                                  <circle cx="9" cy="18" r="1.5" />
                                  <circle cx="15" cy="18" r="1.5" />
                                </svg>
                              </div>
                            )}

                            {/* Number */}
                            <span className="font-mono text-sm text-neutral-600 w-6 text-right shrink-0">
                              {index + 1}
                            </span>

                            {/* Poster */}
                            <Link to={`/film/${movie.tmdbId}`} className="shrink-0">
                              <img
                                src={movie.movieData?.poster_path
                                  ? `${IMG_W185}${movie.movieData.poster_path}`
                                  : 'https://via.placeholder.com/60x90?text=?'}
                                alt={movie.movieData?.title}
                                className="w-10 rounded-sm"
                              />
                            </Link>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/film/${movie.tmdbId}`}
                                className="font-display text-base text-white hover:text-brand-400 transition-colors truncate block"
                              >
                                {movie.movieData?.title}
                              </Link>
                              {movie.movieData?.release_date && (
                                <span className="font-mono text-xs text-neutral-500">
                                  {movie.movieData.release_date.split('-')[0]}
                                </span>
                              )}
                            </div>

                            {/* Remove */}
                            {isOwner && (
                              <button
                                onClick={() => handleRemoveMovie(movie.tmdbId)}
                                className="text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </section>

        {/* Comments */}
        <section>
          <h2 className="font-display text-xl text-white mb-5">
            Comments
            {list.comments?.length > 0 && (
              <span className="font-mono text-sm text-neutral-500 ml-2">{list.comments.length}</span>
            )}
          </h2>

          {isAuthenticated && (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment..."
                rows={3}
                maxLength={1000}
                className="input-field resize-none mb-2"
              />
              <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary text-sm py-2">
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </form>
          )}

          {list.comments?.length === 0 ? (
            <p className="text-neutral-600 font-mono text-sm">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {list.comments?.map((c) => (
                <div key={c._id} className="bg-cinema-900 border border-cinema-700 rounded-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 mb-2">
                      {c.userId && (
                        <Link to={`/u/${c.userId.username}`} className="flex items-center gap-2">
                          <img
                            src={c.userId.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${c.userId.username}`}
                            alt={c.userId.username}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm font-body text-neutral-400 hover:text-white transition-colors">
                            {c.userId.displayName || c.userId.username}
                          </span>
                        </Link>
                      )}
                      <span className="text-neutral-600 text-xs">·</span>
                      <span className="text-xs font-mono text-neutral-500">
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                    {user && c.userId?._id === user._id && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-xs font-mono text-neutral-600 hover:text-red-400 transition-colors shrink-0"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-body text-neutral-300 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}