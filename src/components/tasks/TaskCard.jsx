import { Calendar, Pencil, Trash2 } from 'lucide-react';
import { PriorityBadge } from '../ui/Badge';

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

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(str) {
  if (!str) return false;
  return new Date(str) < new Date();
}

export default function TaskCard({ task, onEdit, onDelete }) {
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2.5 hover:shadow-sm dark:hover:shadow-black/20 transition-shadow group">

      {/* Row 1: category + priority badges, action buttons */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <span className={`shrink-0 text-xs font-medium px-1.5 py-0.5 rounded-md leading-none ${catColor(task.category)}`}>
            {task.category}
          </span>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Edit task"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Row 2: title */}
      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
        {task.title}
      </p>

      {/* Row 3: description — only if present, single line */}
      {task.description && (
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mb-1.5">
          {task.description}
        </p>
      )}

      {/* Row 4: due date */}
      <div className={`flex items-center gap-1 text-xs pt-1.5 border-t border-gray-100 dark:border-gray-800 ${overdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-gray-600'}`}>
        <Calendar size={10} />
        <span>{formatDate(task.dueDate)}{overdue ? ' · Overdue' : ''}</span>
      </div>

    </div>
  );
}
