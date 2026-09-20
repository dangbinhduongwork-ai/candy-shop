import axios from 'axios';

/**
 * Centralized Axios instance for all API calls.
 * - Base URL points to the Spring Boot backend
 * - Request interceptor auto-attaches JWT token from localStorage
 * - Response interceptor handles 401 Unauthorized globally
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// === REQUEST INTERCEPTOR ===
// Automatically attach Bearer token to every request if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// === RESPONSE INTERCEPTOR ===
// Handle 401 Unauthorized or 403 Account Locked globally: clear token and redirect to login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || '';

    if (status === 401 || (status === 403 && (message.includes('khóa') || message.includes('locked') || message.includes('LOCKED')))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (status === 403 && (message.includes('khóa') || message.includes('locked'))) {
        alert(message || 'Tài khoản của bạn đã bị khóa bởi quản trị viên.');
      }
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
