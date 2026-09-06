import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('urbanspoon_token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('urbanspoon_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify stored token on app boot
  useEffect(() => {
    const verifyToken = async () => {
      const savedToken = localStorage.getItem('urbanspoon_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get('/api/auth/me');
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('urbanspoon_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('[AuthContext] Stored token invalid or expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (email, password, expectedRole = null) => {
    try {
      const payload = { email, password };
      if (expectedRole) {
        payload.role = expectedRole;
      }
      const res = await API.post('/api/auth/login', payload);
      const { token: receivedToken, user: receivedUser } = res.data;

      // Ensure that if user attempted admin login, the received user is indeed admin
      if (expectedRole === 'admin' && receivedUser.role !== 'admin') {
        return {
          success: false,
          message: 'Access denied: This account does not possess administrator privileges.',
        };
      }

      localStorage.setItem('urbanspoon_token', receivedToken);
      localStorage.setItem('urbanspoon_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message };
    }
  };


  const register = async (name, email, password) => {
    try {
      const res = await API.post('/api/auth/register', { name, email, password });
      const { token: receivedToken, user: receivedUser } = res.data;

      localStorage.setItem('urbanspoon_token', receivedToken);
      localStorage.setItem('urbanspoon_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('urbanspoon_token');
    localStorage.removeItem('urbanspoon_user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user && user.role === 'admin'),
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
