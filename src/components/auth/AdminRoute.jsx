import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function AdminRoute({ children }) {
  const { loading, authed, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-lavender-500 text-sm">
        Loading…
      </div>
    );
  }

  if (!authed) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
