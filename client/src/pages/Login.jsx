import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isAdmin } = useAuth();

  // Detect if redirected from an admin-only path
  const isFromAdmin = location.state?.from?.pathname?.includes('/admin');

  // Role prompt state: 'user' or 'admin'
  const [loginRole, setLoginRole] = useState(isFromAdmin ? 'admin' : 'user');
  const [isRegister, setIsRegister] = useState(Boolean(location.state?.isRegister));

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect appropriately
  useEffect(() => {
    if (isAuthenticated) {
      const destination = isAdmin ? '/admin' : (location.state?.from?.pathname || '/');
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  const handleRoleChange = (role) => {
    setLoginRole(role);
    setError('');
    // Admins don't have public self-registration
    if (role === 'admin') {
      setIsRegister(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setError(res.message);
        setLoading(false);
      } else {
        navigate('/', { replace: true });
      }
    } else {
      // Login with expected role
      const res = await login(email, password, loginRole);
      if (!res.success) {
        setError(res.message);
        setLoading(false);
      } else {
        // If logged in as admin, land directly on Admin Dashboard
        if (res.user?.role === 'admin' || loginRole === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      }
    }
  };

  return (
    <div className="page login-page" id="page-login">
      <div className="container login-container">
        <div className="login-card card animate-fade-in">
          {/* Header */}
          <div className="login-card__header text-center">
            <span className="section__label">
              {loginRole === 'admin' ? 'Administrative Access' : 'Urban Spoon Member'}
            </span>
            <h1 className="login-title">
              {loginRole === 'admin'
                ? 'Admin Sign In'
                : isRegister
                ? 'Create an Account'
                : 'Customer Sign In'}
            </h1>
            <div className="divider divider--center"></div>
            <p className="login-subtitle text-muted">
              {loginRole === 'admin'
                ? 'Sign in with staff administrator credentials to access the management dashboard'
                : isRegister
                ? 'Register to manage table reservations and preferences'
                : 'Sign in to your customer account'}
            </p>
          </div>

          {/* Role Selection Prompt */}
          <div className="login-role-prompt" id="login-role-prompt">
            <span className="login-role-label">Sign in as:</span>
            <div className="login-role-buttons">
              <button
                type="button"
                className={`login-role-btn ${loginRole === 'user' ? 'login-role-btn--active' : ''}`}
                onClick={() => handleRoleChange('user')}
                id="role-btn-user"
              >
                👤 Customer
              </button>
              <button
                type="button"
                className={`login-role-btn ${loginRole === 'admin' ? 'login-role-btn--active' : ''}`}
                onClick={() => handleRoleChange('admin')}
                id="role-btn-admin"
              >
                🛡️ Administrator
              </button>
            </div>
          </div>

          {/* Admin Security Banner */}
          {loginRole === 'admin' && (
            <div className="login-admin-notice animate-fade-in" id="login-admin-notice">
              <span className="admin-notice-icon">🔒</span>
              <span>
                Staff credentials required. Upon verified authentication, the <strong>Admin Dashboard</strong> will load.
              </span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="login-error-banner animate-fade-in" id="login-error-box">
              <span className="login-error__icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Customer Tabs (Sign In vs Register) - Only shown for Customers */}
          {loginRole === 'user' && (
            <div className="login-tabs">
              <button
                type="button"
                className={`login-tab ${!isRegister ? 'login-tab--active' : ''}`}
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
                id="tab-sign-in"
              >
                Sign In
              </button>
              <button
                type="button"
                className={`login-tab ${isRegister ? 'login-tab--active' : ''}`}
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
                id="tab-sign-up"
              >
                Register
              </button>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} id="auth-form">
            {isRegister && loginRole === 'user' && (
              <div className="form-group">
                <label className="form-label" htmlFor="register-name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="register-name"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">
                {loginRole === 'admin' ? 'Administrator Email' : 'Email Address'}
              </label>
              <input
                type="email"
                id="auth-email"
                className="form-input"
                placeholder={loginRole === 'admin' ? 'admin@urbanspoon.com' : 'name@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-password">
                Password
              </label>
              <input
                type="password"
                id="auth-password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={`btn btn--primary login-submit-btn ${loginRole === 'admin' ? 'login-submit-btn--admin' : ''}`}
              disabled={loading}
              id="auth-submit-btn"
            >
              {loading ? (
                <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
              ) : loginRole === 'admin' ? (
                '🛡️ Access Admin Dashboard'
              ) : isRegister ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="login-card__footer text-center">
            <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              Protected by JWT Role-Based Access Control (RBAC).
            </p>
            <Link to="/" className="login-back-link">
              ← Return to Urban Spoon Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
