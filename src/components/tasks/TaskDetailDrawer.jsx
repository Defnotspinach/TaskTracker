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
  return new Date(str).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

function isOverdue(str, status) {
  if (!str || status === 'done') return false;
  return new Date(str) < new Date();
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-2 w-24 shrink-0">
        <Icon size={13} className="text-gray-400 dark:text-gray-500 shrink-0" />
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function TaskDetailModal({ task, onClose, onEdit, onDelete }) {
  const open = !!task;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md leading-none ${catColor(task.category)}`}>
              {task.category}
            </span>
            <PriorityBadge priority={task.priority} />
          </div>
          <div className="flex items-center gap-0.5">
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
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-2">
          {/* Title */}
          <h2
            id="task-detail-title"
            className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-3"
          >
            {task.title}
          </h2>

          {/* Overdue banner */}
          {overdue && (
            <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
              <span>⚠</span> This task is overdue
            </div>
          )}

          {/* Detail rows */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4">
            <DetailRow icon={CircleDot} label="Status">
              <StatusBadge status={task.status} />
            </DetailRow>
            <DetailRow icon={Flag} label="Priority">
              <PriorityBadge priority={task.priority} />
            </DetailRow>
            <DetailRow icon={Tag} label="Category">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md leading-none ${catColor(task.category)}`}>
                {task.category}
              </span>
            </DetailRow>
            <DetailRow icon={Calendar} label="Due date">
              <span className={`text-sm font-medium ${overdue ? 'text-red-500 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
                {formatDateLong(task.dueDate)}
              </span>
            </DetailRow>
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlignLeft size={12} className="text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">Description</span>
            </div>
            {task.description ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-600 italic">No description provided.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
          <button
            className="btn-primary flex-1"
            onClick={() => { onEdit(task); onClose(); }}
          >
            <Pencil size={13} />
            Edit task
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
