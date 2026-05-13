import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

export default function ProtectedRoute({ children }) {
  const { loading, authed } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lavender-500 text-sm">Loading…</div>
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
