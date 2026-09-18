import axiosClient from './axiosClient';

/**
 * Shopping Cart API Service
 */

export const getCart = async () => {
  const response = await axiosClient.get('/api/cart');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await axiosClient.post('/api/cart/items', {
    productId,
    quantity,
  });
  return response.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const response = await axiosClient.put(`/api/cart/items/${itemId}`, {
    quantity,
  });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await axiosClient.delete(`/api/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await axiosClient.delete('/api/cart');
  return response.data;
};
