import axiosClient from './axiosClient';

/**
 * Shopping Order API Service
 * Uses the shared axiosClient which automatically attaches the JWT token.
 */

/**
 * Create order from user's current shopping cart
 * @param {Object} data - { receiverName, receiverPhone, shippingAddress, note, paymentMethod }
 */
export const createOrder = async (data) => {
  const response = await axiosClient.post('/api/orders', data);
  return response.data;
};

/**
 * Get paginated list of current user's orders
 * @param {Object} params - { page, size }
 */
export const getUserOrders = async (params = {}) => {
  const response = await axiosClient.get('/api/orders', { params });
  return response.data;
};

/**
 * Get single order detail by ID
 * @param {number|string} orderId
 */
export const getOrderById = async (orderId) => {
  const response = await axiosClient.get(`/api/orders/${orderId}`);
  return response.data;
};

/**
 * Cancel an order (allowed only if status is PENDING)
 * @param {number|string} orderId
 */
export const cancelOrder = async (orderId) => {
  const response = await axiosClient.put(`/api/orders/${orderId}/cancel`);
  return response.data;
};

