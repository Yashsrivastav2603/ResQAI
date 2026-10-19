import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="skeleton" style={{ margin: 40 }} />;
  if (!user) return <Navigate to="/signin" replace />;
  if (role && user.role !== role) return <Navigate to="/home" replace />;
  return <Outlet />;
}
