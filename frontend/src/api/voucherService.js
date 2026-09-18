import axiosClient from './axiosClient';

/**
 * Voucher Service (Client & Admin APIs)
 */

/**
 * Get available active vouchers for store front
 */
export const getAvailableVouchers = async () => {
  const response = await axiosClient.get('/api/vouchers/available');
  return response.data;
};

/**
 * Apply voucher code to preview discount in cart / checkout
 * @param {string} code - Voucher code
 */
export const applyVoucher = async (code) => {
  const response = await axiosClient.post('/api/vouchers/apply', { code });
  return response.data;
};

/**
 * Admin: Get paginated list of vouchers with search and filter
 * @param {Object} params - { page, size, search, status }
 */
export const getAdminVouchers = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/vouchers', { params });
  return response.data;
};

/**
 * Admin: Get voucher by ID
 * @param {number|string} id
 */
export const getAdminVoucherById = async (id) => {
  const response = await axiosClient.get(`/api/admin/vouchers/${id}`);
  return response.data;
};

/**
 * Admin: Create a new voucher
 * @param {Object} data
 */
export const createAdminVoucher = async (data) => {
  const response = await axiosClient.post('/api/admin/vouchers', data);
  return response.data;
};

/**
 * Admin: Update an existing voucher
 * @param {number|string} id
 * @param {Object} data
 */
export const updateAdminVoucher = async (id, data) => {
  const response = await axiosClient.put(`/api/admin/vouchers/${id}`, data);
  return response.data;
};

/**
 * Admin: Delete or soft-deactivate a voucher
 * @param {number|string} id
 */
export const deleteAdminVoucher = async (id) => {
  const response = await axiosClient.delete(`/api/admin/vouchers/${id}`);
  return response.data;
};
