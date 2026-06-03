import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyLists, createList, deleteList } from '../api/lists.js';
import ListCard from '../components/ListCard.jsx';
import toast from 'react-hot-toast';

export default function MyListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyLists()
      .then(({ data }) => setLists(data.lists || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data } = await createList(form);
      setLists((prev) => [data.list, ...prev]);
      setForm({ name: '', description: '', isPublic: true });
      setShowCreate(false);
      toast.success('List created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating list');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this list?')) return;
    try {
      await deleteList(id);
      setLists((prev) => prev.filter((l) => l._id !== id));
      toast.success('List deleted');
    } catch (err) {
      toast.error('Error deleting list');
    }
  };

  return (
    <main className="min-h-screen bg-cinema-950 pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-xs text-brand-500 uppercase tracking-widest">Your collection</span>
            <h1 className="font-display text-4xl text-white mt-1">Lists</h1>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New list
          </button>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-cinema-950/95 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md bg-cinema-900 border border-cinema-700 rounded-sm p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-xl text-white">New list</h2>
                <button onClick={() => setShowCreate(false)} className="text-neutral-500 hover:text-white font-mono text-sm">✕</button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="label">List name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Best A24 Films"
                    maxLength={100}
                    className="input-field"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Description <span className="normal-case text-neutral-600">(optional)</span></label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What's this list about?"
                    rows={3}
                    maxLength={500}
                    className="input-field resize-none"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => setForm((p) => ({ ...p, isPublic: e.target.checked }))}
                    className="accent-brand-500"
                  />
                  <span className="text-sm font-body text-neutral-400">Make this list public</span>
                </label>
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={saving || !form.name.trim()} className="btn-primary">
                    {saving ? 'Creating...' : 'Create list'}
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="text-sm text-neutral-500 hover:text-neutral-300 font-body">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lists grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-cinema-800 animate-pulse rounded-sm" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-neutral-500 mb-2">No lists yet</p>
            <p className="text-neutral-600 font-mono text-sm mb-6">Create your first list to organize films</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">Create a list</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <div key={list._id} className="relative group/item">
                <ListCard list={list} />
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <Link
                    to={`/lists/${list._id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-cinema-800 border border-cinema-600 text-neutral-400 hover:text-white px-2 py-1 text-xs font-mono rounded-sm transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDelete(list._id); }}
                    className="bg-cinema-800 border border-cinema-600 text-neutral-400 hover:text-red-400 px-2 py-1 text-xs font-mono rounded-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}