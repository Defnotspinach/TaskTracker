import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, Flame, CheckCheck, Plus, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { useCategoryStore } from '../store/categoryStore';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

function StatCard({ icon: Icon, label, value, color, bg, darkBg }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${bg} ${darkBg}`}>
        <Icon size={17} className={color} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { tasks, loading, fetchTasks } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (user) {
      fetchTasks(user.id);
      fetchCategories(user.id);
    }
  }, [user]);

  const total      = tasks.length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const done       = tasks.filter(t => t.status === 'done').length;
  const critical   = tasks.filter(t => t.priority === 'critical' && t.status !== 'done').length;

  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
    .slice(0, 5);

  return (
    <div className="p-5 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Good morning, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Here's what's happening with your tasks today.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" className="text-violet-500" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <StatCard icon={CheckSquare} label="Total Tasks"  value={total}      color="text-violet-600 dark:text-violet-400" bg="bg-violet-50" darkBg="dark:bg-violet-950" />
            <StatCard icon={Clock}       label="In Progress"  value={inProgress} color="text-blue-600 dark:text-blue-400"     bg="bg-blue-50"   darkBg="dark:bg-blue-950"   />
            <StatCard icon={CheckCheck}  label="Completed"    value={done}       color="text-green-600 dark:text-green-400"   bg="bg-green-50"  darkBg="dark:bg-green-950"  />
            <StatCard icon={Flame}       label="Critical"     value={critical}   color="text-red-500 dark:text-red-400"       bg="bg-red-50"    darkBg="dark:bg-red-950"    />
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            {/* Recent tasks */}
            <div className="lg:col-span-2 card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
                <Link to="/tasks" className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={11} />
                </Link>
              </div>
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 dark:text-gray-600 mb-3">No tasks yet</p>
                  <Link to="/tasks" className="btn-primary text-xs">
                    <Plus size={13} /> Create your first task
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between py-2 gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">{t.category} · Due {t.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <PriorityBadge priority={t.priority} />
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Categories</h2>
                <Link to="/categories" className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                  Manage <ArrowRight size={11} />
                </Link>
              </div>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-6">No categories</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {categories.map(c => {
                    const count = tasks.filter(t => t.category === c.name).length;
                    return (
                      <div key={c.id} className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{c.name}</span>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
