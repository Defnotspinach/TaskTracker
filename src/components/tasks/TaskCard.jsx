import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../ui/Badge';

const CATEGORY_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  'bg-blue-100   text-blue-700   dark:bg-blue-950   dark:text-blue-300',
  'bg-green-100  text-green-700  dark:bg-green-950  dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'bg-pink-100   text-pink-700   dark:bg-pink-950   dark:text-pink-300',
];

const LEFT_ACCENT = [
  'border-l-violet-400 dark:border-l-violet-600',
  'border-l-blue-400   dark:border-l-blue-600',
  'border-l-green-400  dark:border-l-green-600',
  'border-l-orange-400 dark:border-l-orange-600',
  'border-l-pink-400   dark:border-l-pink-600',
];

function catIndex(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % CATEGORY_COLORS.length;
}

function formatDate(str) {
  if (!str) return '';
  return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(str, status) {
  if (!str || status === 'done') return false;
  return new Date(str) < new Date();
}

export default function TaskCard({ task, onClick, onEdit, onDelete }) {
  const idx     = catIndex(task.category);
  const overdue = isOverdue(task.dueDate, task.status);

  const handleActionClick = (e, fn) => {
    e.stopPropagation();
    fn(task);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${task.title}`}
      onClick={() => onClick?.(task)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.(task); }}
      className={`
        group relative cursor-pointer
        bg-white dark:bg-gray-900
        rounded-xl border border-gray-200 dark:border-gray-800
        border-l-[3px] ${LEFT_ACCENT[idx]}
        px-4 py-3.5
        hover:shadow-md hover:-translate-y-px dark:hover:shadow-black/30
        transition-all duration-150
        focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500
      `}
    >
      {/* Top row: badges + actions */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md leading-none ${CATEGORY_COLORS[idx]}`}>
            {task.category}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>

        {/* Action buttons — always visible on touch, hover on desktop */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={e => handleActionClick(e, onEdit)}
            aria-label="Edit task"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={e => handleActionClick(e, onDelete)}
            aria-label="Delete task"
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1.5">
        {task.title}
      </p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-500 line-clamp-2 leading-relaxed mb-2.5">
          {task.description}
        </p>
      )}

      {/* Bottom row: status + due date */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-gray-800">
        <StatusBadge status={task.status} />
        <div className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
          <Calendar size={11} />
          <span>{formatDate(task.dueDate)}{overdue ? ' · Overdue' : ''}</span>
        </div>
      </div>
    </div>
  );
}
