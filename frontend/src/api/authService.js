import axiosClient from './axiosClient';

/**
 * Auth API service — all auth-related API calls go through here.
 * Components never call axios directly.
 */

/**
 * Register a new user account.
 * @param {Object} data - { fullName, email, phone, password }
 * @returns {Object} - { token, tokenType, user }
 */
export const registerUser = async (data) => {
  const response = await axiosClient.post('/api/auth/register', data);
  return response.data;
};

/**
 * Login with email and password.
 * @param {Object} data - { email, password }
 * @returns {Object} - { token, tokenType, user }
 */
export const loginUser = async (data) => {
  const response = await axiosClient.post('/api/auth/login', data);
  return response.data;
};

/**
 * Fetch the current authenticated user's profile.
 * Requires a valid JWT token in localStorage.
 * @returns {Object} - UserResponse { id, fullName, email, phone, role }
 */
export const getCurrentUser = async () => {
  const response = await axiosClient.get('/api/users/me');
  return response.data;
};
