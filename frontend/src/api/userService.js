import axiosClient from './axiosClient';

/**
 * User API Service for profile operations, password modification, and avatar uploads.
 */

/**
 * Get current authenticated user's profile.
 * @returns {Promise<Object>} UserResponse
 */
export const getUserProfile = async () => {
  const response = await axiosClient.get('/api/users/me');
  return response.data;
};

/**
 * Update basic user profile (fullName, phone, address).
 * @param {Object} data - { fullName, phone, address }
 * @returns {Promise<Object>} Updated UserResponse
 */
export const updateUserProfile = async (data) => {
  const response = await axiosClient.put('/api/users/me', data);
  return response.data;
};

/**
 * Change current user's password with old password verification.
 * @param {Object} data - { oldPassword, newPassword }
 * @returns {Promise<Object>} { message }
 */
export const changePassword = async (data) => {
  const response = await axiosClient.put('/api/users/me/password', data);
  return response.data;
};

/**
 * Upload and update user avatar image.
 * @param {FormData} formData - FormData containing 'file'
 * @returns {Promise<Object>} Updated UserResponse with new avatarUrl
 */
export const uploadAvatar = async (formData) => {
  const response = await axiosClient.post('/api/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
