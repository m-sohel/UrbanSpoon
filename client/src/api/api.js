import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

const API = axios.create({
  baseURL,
});

// Automatically inject JWT Bearer token into outgoing requests if present
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urbanspoon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor for session expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If receiving 401 Unauthorized from a protected resource (not login/register)
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config?.url?.includes('/api/auth/login') &&
      !error.config?.url?.includes('/api/auth/register')
    ) {
      console.warn('[API Interceptor] Session token expired or unauthorized.');
      // Optional cleanup
      localStorage.removeItem('urbanspoon_token');
      localStorage.removeItem('urbanspoon_user');
    }
    return Promise.reject(error);
  }
);

export default API;
