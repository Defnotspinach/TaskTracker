const PRIORITY_COLORS = {
  low:      'bg-blue-50   text-blue-600   dark:bg-blue-950   dark:text-blue-400',
  medium:   'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  high:     'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
  critical: 'bg-red-50    text-red-600    dark:bg-red-950    dark:text-red-400',
};

const STATUS_COLORS = {
  todo:         'bg-gray-100   text-gray-600   dark:bg-gray-800 dark:text-gray-400',
  'in-progress':'bg-violet-50  text-violet-600 dark:bg-violet-950 dark:text-violet-400',
  hold:         'bg-yellow-50  text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  done:         'bg-green-50   text-green-600  dark:bg-green-950 dark:text-green-400',
  testing:      'bg-blue-50    text-blue-600   dark:bg-blue-950  dark:text-blue-400',
};

const STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  hold: 'Hold',
  done: 'Done',
  testing: 'Testing',
};

export function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md leading-none capitalize ${PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
