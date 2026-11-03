/**
 * JanSamadhan – Protected Route Component
 * Guard for authenticated and role-restricted routes.
 */

import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading, getDashboardPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-civic-bg flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-green animate-spin mb-4" />
        <p className="text-sm font-medium text-civic-secondary">
          Verifying security credentials…
        </p>
      </div>
    );
  }

  // Unauthenticated user -> redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization check
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-civic-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-civic-border p-8 shadow-card text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5 text-rose-600">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-100 text-rose-800 mb-3">
            HTTP 403 – Access Denied
          </span>
          <h1 className="text-xl font-bold text-navy mb-2">Insufficient Role Privileges</h1>
          <p className="text-sm text-civic-secondary mb-6 leading-relaxed">
            Your account role is <strong className="text-navy">[{user.role}]</strong>. This area requires one of the following roles:{' '}
            <strong className="text-navy">[{allowedRoles.join(', ')}]</strong>.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to={getDashboardPath(user.role)}
              className="btn-primary justify-center text-sm"
            >
              Go to My {user.role.replace('_', ' ')} Dashboard
            </Link>
            <Link
              to="/"
              className="btn-secondary justify-center text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
