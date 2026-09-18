import axiosClient from './axiosClient';

/**
 * Customer Management Service (Admin only)
 */

/**
 * Fetch paginated customer list with optional search and status filter.
 * @param {Object} params - { search, status, page, size, sortBy, direction }
 */
export const getCustomers = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/customers', { params });
  return response.data;
};

/**
 * Fetch aggregate customer statistics & top spenders.
 */
export const getCustomerStats = async () => {
  const response = await axiosClient.get('/api/admin/customers/stats');
  return response.data;
};

/**
 * Fetch detailed profile and recent order history of a specific customer.
 * @param {number|string} id - Customer User ID
 */
export const getCustomerById = async (id) => {
  const response = await axiosClient.get(`/api/admin/customers/${id}`);
  return response.data;
};

/**
 * Update customer status (ACTIVE or LOCKED).
 * @param {number|string} id - Customer User ID
 * @param {string} status - 'ACTIVE' | 'LOCKED'
 */
export const updateCustomerStatus = async (id, status) => {
  const response = await axiosClient.put(`/api/admin/customers/${id}/status`, { status });
  return response.data;
};
