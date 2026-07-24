import { useEffect, useState, useMemo } from 'react';
import { Search, Plus, SlidersHorizontal, X, LayoutGrid, List } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../store/categoryStore';
import { StatusBadge } from '../components/ui/Badge';
import TaskCard from '../components/tasks/TaskCard';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Spinner from '../components/ui/Spinner';
import { toast } from '../components/ui/Toast';

const COLUMNS = [
  { key: 'todo',        label: 'To Do'       },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'hold',        label: 'Hold'        },
  { key: 'testing',     label: 'Testing'     },
  { key: 'done',        label: 'Done'        },
];

const COL_COLORS = {
  todo:         'bg-gray-100   text-gray-700   dark:bg-gray-800 dark:text-gray-300',
  'in-progress':'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  hold:         'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  testing:      'bg-blue-100   text-blue-700   dark:bg-blue-950  dark:text-blue-300',
  done:         'bg-green-100  text-green-700  dark:bg-green-950 dark:text-green-300',
};

export default function TasksPage() {
  const { user } = useAuthStore();
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [view, setView]                   = useState('kanban');
  const [showFilters, setShowFilters]     = useState(false);

  const [createOpen, setCreateOpen]       = useState(false);
  const [editTask, setEditTask]           = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [saving, setSaving]               = useState(false);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
      fetchCategories(user.id);
    }
  }, [user]);

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !filterStatus || t.status === filterStatus;
      const matchCat    = !filterCategory || t.category === filterCategory;
      return matchSearch && matchStatus && matchCat;
    });
  }, [tasks, search, filterStatus, filterCategory]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createTask(user.id, data);
      setCreateOpen(false);
      toast.success('Task created');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (data) => {
    setSaving(true);
    try {
      await updateTask(user.id, editTask.id, data);
      setEditTask(null);
      toast.success('Task updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(user.id, deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = filterStatus || filterCategory;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-xs text-gray-500 dark:text-gray-500">{tasks.length} tasks total</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="input pl-9 w-52 text-sm"
              aria-label="Search tasks"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            aria-pressed={showFilters}
            className={`btn-secondary relative ${hasFilters ? 'border-violet-400 text-violet-600 dark:border-violet-600 dark:text-violet-400' : ''}`}
          >
            <SlidersHorizontal size={14} />
            Filter
            {hasFilters && <span className="absolute -top-1 -right-1 w-2 h-2 bg-violet-500 rounded-full" />}
          </button>

          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden" role="group" aria-label="View mode">
            <button
              onClick={() => setView('kanban')}
              aria-pressed={view === 'kanban'}
              title="Kanban view"
              className={`px-3 py-2 text-sm transition-colors ${view === 'kanban' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              title="List view"
              className={`px-3 py-2 text-sm transition-colors ${view === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <List size={14} />
            </button>
          </div>

          <button className="btn-primary" onClick={() => setCreateOpen(true)}>
            <Plus size={15} />
            Create task
          </button>
        </div>
      </div>

      {/* Filters bar */}
      {showFilters && (
        <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-wrap">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filter by:</span>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input text-sm w-36 py-1.5" aria-label="Filter by status">
            <option value="">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="hold">Hold</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input text-sm w-40 py-1.5" aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setFilterStatus(''); setFilterCategory(''); }}
              className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4 bg-gray-50 dark:bg-gray-950">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Spinner size="lg" className="text-violet-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-sm text-red-500">Failed to load tasks. {error}</p>
            <button className="btn-secondary" onClick={() => fetchTasks(user.id)}>Retry</button>
          </div>
        ) : view === 'kanban' ? (
          <KanbanBoard tasks={filtered} columns={COLUMNS} colColors={COL_COLORS} onEdit={setEditTask} onDelete={setDeleteTarget} />
        ) : (
          <ListView tasks={filtered} onEdit={setEditTask} onDelete={setDeleteTarget} />
        )}
      </div>

      {/* Modals */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Task">
        <TaskForm categories={categories} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} loading={saving} />
      </Modal>

      <Modal open={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TaskForm
          defaultValues={editTask}
          categories={categories}
          onSubmit={handleEdit}
          onCancel={() => setEditTask(null)}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}

function KanbanBoard({ tasks, columns, colColors, onEdit, onDelete }) {
  return (
    <div className="flex gap-3 min-w-max pb-4 items-start">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} className="w-64 flex-shrink-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-2 px-0.5">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {col.label}
              </span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md leading-none ${colColors[col.key]}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-1.5">
              {colTasks.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg py-6 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-600">No tasks</p>
                </div>
              ) : (
                colTasks.map(t => (
                  <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ tasks, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">No tasks found.</p>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Due</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {tasks.map(t => (
            <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{t.title}</td>
              <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.category}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{t.dueDate}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => onEdit(t)} aria-label="Edit task" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  </button>
                  <button onClick={() => onDelete(t)} aria-label="Delete task" className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
