import axiosClient from './axiosClient';

/**
 * Admin Order Management API Service
 * All endpoints require ROLE_ADMIN.
 */

/**
 * Get all orders with optional filtering and pagination
 * @param {Object} params - { page, size, status, startDate, endDate, search }
 */
export const getAdminOrders = async (params = {}) => {
  const response = await axiosClient.get('/api/admin/orders', { params });
  return response.data;
};

/**
 * Get overview dashboard statistics (total orders, completed revenue, status counts, low stock)
 */
export const getAdminOrderStats = async () => {
  const response = await axiosClient.get('/api/admin/orders/stats');
  return response.data;
};

/**
 * Get full order detail by ID
 * @param {number|string} orderId
 */
export const getAdminOrderDetail = async (orderId) => {
  const response = await axiosClient.get(`/api/admin/orders/${orderId}`);
  return response.data;
};

/**
 * Update order status
 * Valid transitions:
 * - PENDING -> CONFIRMED, CANCELLED
 * - CONFIRMED -> SHIPPING, CANCELLED
 * - SHIPPING -> COMPLETED
 * @param {number|string} orderId
 * @param {string} status - New OrderStatus enum value
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await axiosClient.put(`/api/admin/orders/${orderId}/status`, { status });
  return response.data;
};
