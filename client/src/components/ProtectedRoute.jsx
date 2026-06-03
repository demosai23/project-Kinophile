import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-cinema-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="font-display text-2xl text-brand-500 italic">Kinophile</span>
          <div className="w-8 h-0.5 bg-brand-500 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}