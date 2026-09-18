import axiosClient from './axiosClient';

/**
 * Category API Service
 */

/**
 * Get all categories
 * @param {Object} params - { includeInactive: boolean }
 */
export const getCategories = async (params = {}) => {
  const response = await axiosClient.get('/api/categories', { params });
  return response.data;
};

/**
 * Get category by ID
 * @param {number|string} id
 */
export const getCategoryById = async (id) => {
  const response = await axiosClient.get(`/api/categories/${id}`);
  return response.data;
};

/**
 * Create a new category (Admin only)
 * @param {Object} categoryData - { name, description, imageUrl, displayOrder, active }
 */
export const createCategory = async (categoryData) => {
  const response = await axiosClient.post('/api/categories', categoryData);
  return response.data;
};

/**
 * Update an existing category (Admin only)
 * @param {number|string} id
 * @param {Object} categoryData - { name, description, imageUrl, displayOrder, active }
 */
export const updateCategory = async (id, categoryData) => {
  const response = await axiosClient.put(`/api/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Toggle category active/inactive status quickly (Admin only)
 * @param {number|string} id
 * @param {boolean} active
 */
export const toggleCategoryStatus = async (id, active) => {
  const response = await axiosClient.put(`/api/categories/${id}/status`, { active });
  return response.data;
};

/**
 * Bulk reorder categories (Admin only)
 * @param {Array<{id: number, displayOrder: number}>} items
 */
export const reorderCategories = async (items) => {
  const response = await axiosClient.put('/api/categories/reorder', items);
  return response.data;
};

/**
 * Delete a category (Admin only)
 * @param {number|string} id
 */
export const deleteCategory = async (id) => {
  const response = await axiosClient.delete(`/api/categories/${id}`);
  return response.data;
};

/**
 * Upload category image / icon
 * @param {File} file
 */
export const uploadCategoryImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post('/api/products/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
