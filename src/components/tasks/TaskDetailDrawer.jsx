import { useEffect } from 'react';
import { X, Pencil, Trash2, Calendar, Tag, Flag, CircleDot, AlignLeft } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../ui/Badge';

const CATEGORY_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-blue-100   text-blue-700   dark:bg-blue-950   dark:text-blue-300',
  'bg-green-100  text-green-700  dark:bg-green-950  dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'bg-pink-100   text-pink-700   dark:bg-pink-950   dark:text-pink-300',
];

function catColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

function formatDateLong(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

function isOverdue(str, status) {
  if (!str || status === 'done') return false;
  return new Date(str) < new Date();
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2 w-28 shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-400 dark:text-gray-500 shrink-0" />
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</span>
      </div>
      <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">{children}</div>
    </div>
  );
}

export default function TaskDetailDrawer({ task, onClose, onEdit, onDelete }) {
  const open = !!task;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const overdue = task ? isOverdue(task.dueDate, task.status) : false;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col transition-transform duration-250 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {task && (
          <>
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${catColor(task.category)}`}>
                  {task.category}
                </span>
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onEdit(task); onClose(); }}
                  aria-label="Edit task"
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => { onDelete(task); onClose(); }}
                  aria-label="Delete task"
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Title */}
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-1">
                {task.title}
              </h2>

              {/* Overdue banner */}
              {overdue && (
                <div className="mt-2 mb-4 px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium text-red-600 dark:text-red-400">
                  ⚠ This task is overdue
                </div>
              )}

              {/* Detail rows */}
              <div className="mt-4 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <DetailRow icon={CircleDot} label="Status">
                  <StatusBadge status={task.status} />
                </DetailRow>
                <DetailRow icon={Flag} label="Priority">
                  <PriorityBadge priority={task.priority} />
                </DetailRow>
                <DetailRow icon={Tag} label="Category">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${catColor(task.category)}`}>
                    {task.category}
                  </span>
                </DetailRow>
                <DetailRow icon={Calendar} label="Due date">
                  <span className={overdue ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
                    {formatDateLong(task.dueDate)}
                  </span>
                </DetailRow>
              </div>

              {/* Description */}
              <div className="mt-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlignLeft size={13} className="text-gray-400 dark:text-gray-500" />
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Description</span>
                </div>
                {task.description ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-600 italic">No description provided.</p>
                )}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <button
                className="btn-primary flex-1"
                onClick={() => { onEdit(task); onClose(); }}
              >
                <Pencil size={14} />
                Edit task
              </button>
              <button
                className="btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
