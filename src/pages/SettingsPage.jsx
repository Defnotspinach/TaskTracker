import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Moon, Globe } from 'lucide-react';
import { useState } from 'react';

function Toggle({ on, onToggle, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${on ? 'bg-violet-600' : 'bg-gray-200 dark:bg-gray-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

function SettingRow({ icon: Icon, iconBg, iconColor, label, description, children }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { logout } = useAuthStore();
  const { dark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest]     = useState(true);

  return (
    <div className="p-6 lg:p-8 max-w-xl mx-auto">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="card overflow-hidden mb-6">
        <SettingRow
          icon={Bell}
          iconBg="bg-gray-100 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Notifications"
          description="Receive task reminders and updates"
        >
          <Toggle on={notifications} onToggle={() => setNotifications(v => !v)} />
        </SettingRow>

        <SettingRow
          icon={Moon}
          iconBg={dark ? 'bg-violet-100 dark:bg-violet-950' : 'bg-gray-100 dark:bg-gray-800'}
          iconColor={dark ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400'}
          label="Dark mode"
          description="Switch to dark color scheme"
        >
          <Toggle on={dark} onToggle={toggleTheme} />
        </SettingRow>

        <SettingRow
          icon={Globe}
          iconBg="bg-gray-100 dark:bg-gray-800"
          iconColor="text-gray-500 dark:text-gray-400"
          label="Email digest"
          description="Weekly summary of your tasks"
        >
          <Toggle on={emailDigest} onToggle={() => setEmailDigest(v => !v)} />
        </SettingRow>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Danger zone</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">These actions are irreversible.</p>
          <button
            onClick={() => { logout(); navigate('/signin'); }}
            className="btn-danger w-full"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
