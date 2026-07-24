import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Tag, User, Settings, LogOut, CheckCheck, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-center w-7 h-7 bg-violet-600 rounded-lg flex-shrink-0">
          <CheckCheck size={14} className="text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">task tracker</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
              }`
            }
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5 px-3 py-1.5 mb-0.5">
          <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-gray-700 dark:text-gray-300"
        onClick={() => setMobileOpen(v => !v)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={`lg:hidden fixed left-0 top-0 bottom-0 w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
