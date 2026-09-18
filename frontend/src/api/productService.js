import axiosClient from './axiosClient';

/**
 * Product API Service
 */

// --- PRODUCTS ---

export const getProducts = async (params = {}) => {
  const response = await axiosClient.get('/api/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axiosClient.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosClient.post('/api/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axiosClient.put(`/api/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosClient.delete(`/api/products/${id}`);
  return response.data;
};

export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosClient.post('/api/products/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// --- CATEGORIES ---

export const getCategories = async () => {
  const response = await axiosClient.get('/api/categories');
  return response.data;
};

export const getCategoryById = async (id) => {
  const response = await axiosClient.get(`/api/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await axiosClient.post('/api/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await axiosClient.put(`/api/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await axiosClient.delete(`/api/categories/${id}`);
  return response.data;
};
