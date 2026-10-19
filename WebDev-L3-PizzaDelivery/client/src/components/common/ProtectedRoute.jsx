import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children, requireAdmin = false, requireVerified = false }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-crimson-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-charcoal-400 text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If trying to access admin, send to admin login
    if (requireAdmin || location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin access check
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto text-center">
        <div className="glass-card p-8 border-red-500/20">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-charcoal-300 text-sm mb-6">
            You do not have administrative permissions to view this control panel.
          </p>
          <Link to="/" className="btn-primary w-full">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Email verification check
  if (requireVerified && !user?.isVerified && user?.role !== 'admin') {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto text-center">
        <div className="glass-card p-8 border-amber-500/20">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-white mb-2">Verification Required</h2>
          <p className="text-charcoal-300 text-sm mb-6">
            Please verify your email address to unlock checkout and ordering features. Check your inbox for the activation link.
          </p>
          <Link to="/verify-email" className="btn-primary w-full">
            Go to Verification Page
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
