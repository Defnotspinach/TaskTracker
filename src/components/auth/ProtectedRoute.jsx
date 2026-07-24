import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Spinner from '../ui/Spinner';

export default function ProtectedRoute() {
  const { user, initialized } = useAuthStore();

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" className="text-violet-600" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/signin" replace />;
}
