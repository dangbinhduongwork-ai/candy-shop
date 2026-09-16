import axios from 'axios';

/**
 * Centralized Axios instance for all API calls.
 * - Base URL points to the Spring Boot backend
 * - Request interceptor auto-attaches JWT token from localStorage
 * - Response interceptor handles 401 Unauthorized globally
 */
const axiosClient = axios.create({
  baseURL: 'http://localhost:8080',
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
// Handle 401 globally: clear token and redirect to login
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
