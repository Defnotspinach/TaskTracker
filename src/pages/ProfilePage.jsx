import { useAuthStore } from '../store/authStore';
import { User, Mail, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile</h1>

      <div className="card p-6 mb-6 text-center">
        <div className="w-20 h-20 bg-violet-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          {user?.avatar}
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <User size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Full name</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <Mail size={16} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Email address</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="w-9 h-9 bg-green-50 dark:bg-green-950 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Authentication</p>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">JWT · Active session</p>
          </div>
        </div>
      </div>
    </div>
  );
}
