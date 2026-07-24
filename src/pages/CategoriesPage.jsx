import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCategoryStore } from '../store/categoryStore';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore();

  const [newName, setNewName]         = useState('');
  const [creating, setCreating]       = useState(false);
  const [editId, setEditId]           = useState(null);
  const [editName, setEditName]       = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]       = useState(false);

  useEffect(() => {
    if (user) fetchCategories(user.id);
  }, [user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createCategory(user.id, newName.trim());
      setNewName('');
      toast.success('Category created');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateCategory(user.id, id, editName.trim());
      setEditId(null);
      toast.success('Category updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(user.id, deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Organize your tasks with custom categories</p>
      </div>

      {/* Create form */}
      <div className="card p-4 mb-6">
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="New category name..."
            className="input flex-1"
            maxLength={50}
            aria-label="New category name"
          />
          <button type="submit" className="btn-primary flex-shrink-0" disabled={creating || !newName.trim()}>
            {creating ? <Spinner /> : <Plus size={15} />}
            Add
          </button>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-violet-500" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-sm text-red-500 mb-3">Failed to load categories.</p>
          <button className="btn-secondary" onClick={() => fetchCategories(user.id)}>Retry</button>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Tag size={20} className="text-gray-400 dark:text-gray-600" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No categories yet. Create one above.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center gap-3 px-4 py-3 ${i < categories.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}
            >
              <div className="w-7 h-7 bg-violet-50 dark:bg-violet-950 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tag size={13} className="text-violet-500 dark:text-violet-400" />
              </div>

              {editId === cat.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleEdit(cat.id); if (e.key === 'Escape') setEditId(null); }}
                    className="input flex-1 py-1.5 text-sm"
                    maxLength={50}
                    aria-label="Edit category name"
                  />
                  <button onClick={() => handleEdit(cat.id)} aria-label="Save" className="p-1.5 rounded-lg bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditId(null)} aria-label="Cancel" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                      aria-label={`Edit ${cat.name}`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      aria-label={`Delete ${cat.name}`}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
