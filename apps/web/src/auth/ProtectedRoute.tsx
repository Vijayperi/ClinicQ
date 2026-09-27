import { Navigate, Outlet, useLocation } from 'react-router';
import { Loading } from '../components/Loading';
import type { Role } from '../types';
import { homePathFor, useAuth } from './AuthContext';

// Wraps routes that need a logged-in user, optionally with a specific role.
export function ProtectedRoute({ role }: { role?: Role }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    // Remember where they were going, so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={homePathFor(user)} replace />;
  }

  return <Outlet />;
}
