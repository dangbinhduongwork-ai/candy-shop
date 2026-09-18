import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * Navbar component with frosted glass aesthetic, navigation links,
 * admin dropdown menu, cart badge counter, and user status.
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isAdminActive = location.pathname.startsWith('/admin');

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAdminDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setAdminDropdownOpen(false);
    }, 220);
  };

  // Close admin dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close admin dropdown on route change
  useEffect(() => {
    setAdminDropdownOpen(false);
  }, [location.pathname]);

  return (
    <header className="navbar-sticky-wrapper">
      {/* Top micro announcement bar */}
      <div className="top-announcement-bar">
        <span>🎉 Miễn phí giao hàng cho đơn từ 200.000đ | Tặng kèm kẹo dẻo cho mỗi đơn hàng! 🍬</span>
      </div>

      <nav className="navbar-glass">
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand">
            <span className="brand-icon-wrapper">
              <span className="brand-candy-icon">🍬</span>
            </span>
            <div className="brand-text-group">
              <span className="brand-title">Nguyen Huong</span>
              <span className="brand-slogan">Grocery Store • Since 2026</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="navbar-nav-links">
            <Link to="/" className={`nav-link-item ${isActive('/') ? 'active' : ''}`}>
              <span>🏠</span> Trang Chủ
            </Link>

            {isAuthenticated && user?.role !== 'ROLE_ADMIN' && (
              <Link to="/orders" className={`nav-link-item ${isActive('/orders') ? 'active' : ''}`}>
                <span>📦</span> Đơn Hàng Của Tôi
              </Link>
            )}

            {user?.role === 'ROLE_ADMIN' && (
              <div
                className="admin-dropdown-wrapper"
                ref={adminDropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={`admin-dropdown-btn ${isAdminActive ? 'active' : ''}`}
                  onClick={() => setAdminDropdownOpen((prev) => !prev)}
                  aria-expanded={adminDropdownOpen}
                  title="Bảng điều khiển Quản Trị Viên"
                >
                  <span className="admin-badge-icon">👑</span>
                  <span className="admin-dropdown-text">Quản Trị</span>
                  <span className={`admin-dropdown-chevron ${adminDropdownOpen ? 'open' : ''}`}>▾</span>
                </button>

                {adminDropdownOpen && (
                  <div className="admin-dropdown-menu">
                    <div className="admin-dropdown-header">
                      <div className="admin-header-title-box">
                        <span className="admin-header-badge">👑 Admin Panel</span>
                        <span className="admin-header-sub">Hệ thống quản lý cửa hàng</span>
                      </div>
                    </div>

                    <div className="admin-dropdown-items">
                      <Link
                        to="/admin/products"
                        className={`admin-menu-item ${isActive('/admin/products') ? 'active' : ''}`}
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        <span className="admin-menu-icon">🍭</span>
                        <div className="admin-menu-info">
                          <span className="admin-menu-title">Sản Phẩm</span>
                          <span className="admin-menu-desc">Kho hàng & thêm sản phẩm mới</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/categories"
                        className={`admin-menu-item ${isActive('/admin/categories') ? 'active' : ''}`}
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        <span className="admin-menu-icon">🏷️</span>
                        <div className="admin-menu-info">
                          <span className="admin-menu-title">Danh Mục</span>
                          <span className="admin-menu-desc">Phân loại ngành hàng bánh kẹo</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/orders"
                        className={`admin-menu-item ${isActive('/admin/orders') ? 'active' : ''}`}
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        <span className="admin-menu-icon">📦</span>
                        <div className="admin-menu-info">
                          <span className="admin-menu-title">Đơn Hàng</span>
                          <span className="admin-menu-desc">Duyệt & theo dõi đơn khách đặt</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/customers"
                        className={`admin-menu-item ${isActive('/admin/customers') ? 'active' : ''}`}
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        <span className="admin-menu-icon">👥</span>
                        <div className="admin-menu-info">
                          <span className="admin-menu-title">Khách Hàng</span>
                          <span className="admin-menu-desc">Danh sách tài khoản người mua</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/vouchers"
                        className={`admin-menu-item ${isActive('/admin/vouchers') ? 'active' : ''}`}
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        <span className="admin-menu-icon">🎟️</span>
                        <div className="admin-menu-info">
                          <span className="admin-menu-title">Voucher</span>
                          <span className="admin-menu-desc">Mã ưu đãi & giảm giá khuyến mãi</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/banners"
                        className={`admin-menu-item ${isActive('/admin/banners') ? 'active' : ''}`}
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        <span className="admin-menu-icon">🖼️</span>
                        <div className="admin-menu-info">
                          <span className="admin-menu-title">Banner</span>
                          <span className="admin-menu-desc">Quản lý slider banner trang chủ</span>
                        </div>
                      </Link>

                      <Link
                        to="/admin/settings"
                        className={`admin-menu-item ${isActive('/admin/settings') ? 'active' : ''}`}
                        onClick={() => setAdminDropdownOpen(false)}
                      >
                        <span className="admin-menu-icon">⚙️</span>
                        <div className="admin-menu-info">
                          <span className="admin-menu-title">Cài Đặt Shop</span>
                          <span className="admin-menu-desc">Cấu hình cửa hàng & phí ship</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Buttons & User Menu */}
          <div className="navbar-actions">
            {/* Quick Cart Button on mobile / header */}
            <Link to="/cart" className={`navbar-cart-btn ${isActive('/cart') ? 'active' : ''}`} title="Xem giỏ hàng">
              <span className="cart-btn-icon">🛒</span>
              <span className="cart-btn-text">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="cart-badge-pill">{cartCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="user-profile-menu">
                <Link
                  to="/profile"
                  className={`user-info-pill ${isActive('/profile') ? 'active-profile' : ''}`}
                  title="Xem & sửa thông tin tài khoản"
                >
                  <div className="user-avatar-circle">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080${user.avatarUrl}`}
                        alt="Avatar"
                        className="navbar-avatar-img"
                      />
                    ) : (
                      user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="user-text-meta">
                    <span className="user-display-name">{user?.fullName || 'Tài khoản'}</span>
                    <span className="user-role-tag">
                      {user?.role === 'ROLE_ADMIN' ? '👑 Admin' : '🍬 Khách hàng'}
                    </span>
                  </div>
                </Link>

                <button
                  type="button"
                  className="btn btn-logout-icon"
                  onClick={handleLogout}
                  title="Đăng xuất"
                >
                  🚪 <span className="logout-btn-text">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="auth-action-group">
                <Link to="/login" className="btn btn-login-ghost">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-register-sweet">
                  Đăng ký ngay ✨
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
