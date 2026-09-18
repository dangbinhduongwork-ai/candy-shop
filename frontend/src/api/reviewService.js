import axiosClient from './axiosClient';

/**
 * Product Review API Service
 */

/**
 * Get paginated reviews for a product (public)
 * @param {number|string} productId
 * @param {Object} params - { page, size }
 */
export const getProductReviews = async (productId, params = {}) => {
  const response = await axiosClient.get(`/api/products/${productId}/reviews`, { params });
  return response.data;
};

/**
 * Check review eligibility for current user on a product
 * @param {number|string} productId
 */
export const checkReviewEligibility = async (productId) => {
  const response = await axiosClient.get(`/api/products/${productId}/reviews/eligibility`);
  return response.data;
};

/**
 * Create a new review for a product
 * @param {number|string} productId
 * @param {Object} data - { rating, comment }
 */
export const createReview = async (productId, data) => {
  const response = await axiosClient.post(`/api/products/${productId}/reviews`, data);
  return response.data;
};

/**
 * Update an existing review
 * @param {number|string} reviewId
 * @param {Object} data - { rating, comment }
 */
export const updateReview = async (reviewId, data) => {
  const response = await axiosClient.put(`/api/reviews/${reviewId}`, data);
  return response.data;
};

/**
 * Delete a review (author or admin)
 * @param {number|string} reviewId
 */
export const deleteReview = async (reviewId) => {
  const response = await axiosClient.delete(`/api/reviews/${reviewId}`);
  return response.data;
};
