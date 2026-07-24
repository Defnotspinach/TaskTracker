import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../store/authStore';
import { requestPasswordReset, confirmPasswordReset } from '../lib/api';
import { CheckCheck, Eye, EyeOff, CheckCircle, XCircle, X } from 'lucide-react';
import Spinner from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';

const schema = z.object({
  email:    z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignInPage() {
  const { signIn, loading } = useAuthStore();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);
  
  // Password reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState('email'); // 'email' | 'confirm'
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await signIn(data);
      navigate('/tasks');
    } catch (err) {
      setServerError(err.message);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!resetEmail) {
      showToast('Please enter your email', 'error');
      return;
    }

    setResetLoading(true);
    try {
      const response = await requestPasswordReset({ email: resetEmail });
      setResetToken(response.resetToken || '');
      setResetStep('confirm');
      showToast('Reset token generated!', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to request password reset', 'error');
    } finally {
      setResetLoading(false);
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

    setResetLoading(true);
    try {
      await confirmPasswordReset({ token: resetToken, newPassword });
      showToast('Password reset successfully! You can now sign in.', 'success');
      handleCloseResetModal();
    } catch (error) {
      showToast(error.message || 'Failed to reset password', 'error');
    } finally {
      setResetLoading(false);
    }
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setResetStep('email');
    setResetEmail('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-600 rounded-2xl mb-4 shadow-lg shadow-violet-200 dark:shadow-violet-900">
            <CheckCheck size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="card p-6">
          {serverError && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="you@example.com" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? <><Spinner /> Signing in...</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">Sign up</Link>
        </p>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-3">
          Demo: test@test.com / test1234
        </p>
      </div>

      {/* Password Reset Modal */}
      <Modal open={showResetModal} onClose={handleCloseResetModal} title="Reset Password">
        {resetStep === 'email' ? (
          <form onSubmit={handleRequestReset}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter your email address and we'll generate a reset token for you.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCloseResetModal}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {resetLoading ? 'Generating...' : 'Continue'}
              </button>
            </div>
          </form>
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
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                onClick={handleCloseResetModal}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resetLoading}
                className="flex-1 px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {resetLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Toast Notification */}
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
