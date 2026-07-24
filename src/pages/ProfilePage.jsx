import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { requestPasswordReset, confirmPasswordReset } from '../lib/api';
import { User, Mail, Shield, Lock, Eye, EyeOff, CheckCircle, XCircle, X } from 'lucide-react';
import Modal from '../components/ui/Modal';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'confirm'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleRequestReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const response = await requestPasswordReset({ email: user.email });
      setResetToken(response.resetToken || '');
      setResetStep('confirm');
      showToast('Reset token generated! Enter your new password.', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to request password reset', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset({ token: resetToken, newPassword });
      showToast('Password reset successfully!', 'success');
      setShowResetModal(false);
      setResetStep('request');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showToast(error.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowResetModal(false);
    setResetStep('request');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

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

      <div className="mt-6">
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
        >
          <Lock size={18} />
          Reset Password
        </button>
      </div>

      {showResetModal && (
        <Modal open={showResetModal} onClose={handleCloseModal}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Reset Password
            </h2>

            {resetStep === 'request' ? (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Click the button below to generate a password reset token. In production, this would be sent via email.
                </p>
                <button
                  onClick={handleRequestReset}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Generating...' : 'Generate Reset Token'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmReset}>
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400 font-mono break-all">
                    Reset Token: {resetToken}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    (In production, this would be sent to your email)
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}

      {toast.show && (
        <div className="fixed bottom-4 right-4 z-[100] pointer-events-none">
          <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white min-w-[260px] animate-in slide-in-from-right-4 ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'
            }`}
          >
            {toast.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
            <span className="flex-1">{toast.message}</span>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })} 
              className="opacity-70 hover:opacity-100"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
