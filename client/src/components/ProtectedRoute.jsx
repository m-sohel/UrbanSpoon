import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <div className="card text-center" style={{ padding: 'var(--space-2xl)' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto var(--space-md)' }}></div>
          <p className="text-muted">Verifying authentication status...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Redirect to login page and remember where they came from
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Route requires admin role, but user is not admin -> Access Denied Screen
  if (adminOnly && !isAdmin) {
    return (
      <div className="page" style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
        <div className="card text-center animate-fade-in" style={{ maxWidth: '520px', padding: 'var(--space-2xl)' }} id="access-denied-box">
          <div style={{ fontSize: '3.5rem', marginBottom: 'var(--space-md)' }}>🔒</div>
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)', marginBottom: 'var(--space-sm)' }}>
            Access Restricted
          </span>
          <h2 className="section__title" style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-xs)' }}>
            Administrator Privileges Required
          </h2>
          <div className="divider divider--center"></div>
          <p className="section__subtitle" style={{ margin: '0 auto var(--space-lg)', fontSize: 'var(--text-sm)' }}>
            You are signed in as <strong>{user?.name || 'User'}</strong> (Role: <code style={{ color: 'var(--color-primary-400)' }}>{user?.role}</code>). The Admin Portal contains sensitive customer data protected under role-based access security.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn--outline btn--sm">
              Return Home
            </Link>
            <button
              className="btn btn--primary btn--sm"
              onClick={() => {
                logout();
              }}
            >
              Sign In with Admin Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
