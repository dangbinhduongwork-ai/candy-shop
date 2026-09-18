import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as cartApi from '../api/cartService';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Show Toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch cart whenever authentication status changes
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = useCallback(async (productId, quantity = 1, productName = '') => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng! 🔒', 'warning');
      return false;
    }
    try {
      const updatedCart = await cartApi.addToCart(productId, quantity);
      setCart(updatedCart);
      const nameText = productName ? `"${productName}"` : 'sản phẩm';
      showToast(`🍬 Đã thêm ${quantity} x ${nameText} vào giỏ hàng thành công!`, 'success');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng';
      showToast(errorMsg, 'error');
      return false;
    }
  }, [isAuthenticated, showToast]);

  // Update item quantity
  const updateQuantity = useCallback(async (itemId, quantity) => {
    try {
      const updatedCart = await cartApi.updateCartItem(itemId, quantity);
      setCart(updatedCart);
      showToast('Đã cập nhật số lượng trong giỏ hàng! ✨', 'success');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể cập nhật số lượng';
      showToast(errorMsg, 'error');
      return false;
    }
  }, [showToast]);

  // Remove item
  const removeItem = useCallback(async (itemId, productName = '') => {
    try {
      const updatedCart = await cartApi.removeCartItem(itemId);
      setCart(updatedCart);
      const nameText = productName ? `"${productName}"` : 'sản phẩm';
      showToast(`Đã xóa ${nameText} khỏi giỏ hàng`, 'info');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng';
      showToast(errorMsg, 'error');
      return false;
    }
  }, [showToast]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      const updatedCart = await cartApi.clearCart();
      setCart(updatedCart);
      showToast('Đã làm trống giỏ hàng thành công! 🧹', 'info');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể làm trống giỏ hàng';
      showToast(errorMsg, 'error');
      return false;
    }
  }, [showToast]);

  const cartCount = cart?.totalItems || 0;
  const totalAmount = cart?.totalAmount || 0;

  // Alias for backward compatibility
  const refreshCart = fetchCart;

  const value = {
    cart,
    cartCount,
    totalAmount,
    loading,
    toast,
    showToast,
    fetchCart,
    refreshCart,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Global floating toast notification */}
      {toast && (
        <div className="global-toast-container">
          <div className={`global-toast toast-${toast.type}`}>
            <div className="toast-content-wrapper">
              <span className="toast-icon">
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <span className="toast-text">{toast.message}</span>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setToast(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
