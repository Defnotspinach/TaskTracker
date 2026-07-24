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
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${darkBg}`}>
        <Icon size={22} className={color} />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
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
    .slice(0, 8);

  return (
    <div className="h-full flex flex-col p-6 gap-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good morning, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your tasks today.
        </p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" className="text-violet-500" />
        </div>
      ) : (
        <>
          {/* Stats row — equal width, fill full row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={CheckSquare} label="Total Tasks"  value={total}      color="text-violet-600 dark:text-violet-400" bg="bg-violet-50" darkBg="dark:bg-violet-950" />
            <StatCard icon={Clock}       label="In Progress"  value={inProgress} color="text-blue-600 dark:text-blue-400"     bg="bg-blue-50"   darkBg="dark:bg-blue-950"   />
            <StatCard icon={CheckCheck}  label="Completed"    value={done}       color="text-green-600 dark:text-green-400"   bg="bg-green-50"  darkBg="dark:bg-green-950"  />
            <StatCard icon={Flame}       label="Critical"     value={critical}   color="text-red-500 dark:text-red-400"       bg="bg-red-50"    darkBg="dark:bg-red-950"    />
          </div>

          {/* Bottom panels — fill remaining height */}
          <div className="flex-1 grid lg:grid-cols-3 gap-4 min-h-0">

            {/* Recent Tasks — grows to fill */}
            <div className="lg:col-span-2 card flex flex-col min-h-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Recent Tasks</h2>
                <Link to="/tasks" className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                  View all <ArrowRight size={13} />
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <p className="text-sm text-gray-400 dark:text-gray-600">No tasks yet</p>
                  <Link to="/tasks" className="btn-primary">
                    <Plus size={14} /> Create your first task
                  </Link>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {recentTasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between px-5 py-3.5 gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{t.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t.category} · Due {t.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge priority={t.priority} />
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Categories — grows to fill */}
            <div className="card flex flex-col min-h-0">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Categories</h2>
                <Link to="/categories" className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                  Manage <ArrowRight size={13} />
                </Link>
              </div>

              {categories.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-gray-400 dark:text-gray-600">No categories</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {categories.map(c => {
                    const count = tasks.filter(t => t.category === c.name).length;
                    return (
                      <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.name}</span>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">{count}</span>
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
