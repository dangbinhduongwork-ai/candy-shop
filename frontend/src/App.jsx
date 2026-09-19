import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

// Route-Based Code Splitting for Enterprise Performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminCustomersPage = lazy(() => import('./pages/AdminCustomersPage'));
const AdminVouchersPage = lazy(() => import('./pages/AdminVouchersPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminBannersPage = lazy(() => import('./pages/AdminBannersPage'));

/**
 * App routing configuration.
 * Public routes: /, /products, /category/:id, /products/:id, /cart, /login, /register, /forgot-password, /reset-password
 * User routes: /checkout, /order-success/:id, /orders, /orders/:id, /profile
 * Admin routes (require ROLE_ADMIN): /admin/products, /admin/categories, /admin/orders, /admin/customers, /admin/vouchers, /admin/banners, /admin/settings
 */
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Catalog Routes — accessible to everyone */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<HomePage />} />
      <Route path="/category/:id" element={<HomePage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />

      {/* Order & Checkout Routes — protected for authenticated customers */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success/:id"
        element={
          <ProtectedRoute>
            <OrderSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />

      {/* User Account / Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Auth routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />

      {/* Admin routes — require ROLE_ADMIN */}
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProductsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminCategoriesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrdersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <AdminRoute>
            <AdminCustomersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/vouchers"
        element={
          <AdminRoute>
            <AdminVouchersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/banners"
        element={
          <AdminRoute>
            <AdminBannersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettingsPage />
          </AdminRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>
            <Suspense fallback={
              <div className="route-loading-fallback" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div className="spinner"></div>
                <p style={{ color: '#64748b', fontWeight: 600 }}>Đang tải trang...</p>
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
