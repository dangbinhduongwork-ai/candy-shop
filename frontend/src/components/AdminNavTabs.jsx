import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * AdminNavTabs — Unified navigation header bar across all admin dashboard pages.
 */
const AdminNavTabs = () => {
  const navItems = [
    { path: '/admin/products', label: 'Sản Phẩm' },
    { path: '/admin/categories', label: 'Danh Mục' },
    { path: '/admin/orders', label: 'Đơn Hàng' },
    { path: '/admin/customers', label: 'Khách Hàng' },
    { path: '/admin/vouchers', label: 'Vouchers' },
    { path: '/admin/banners', label: 'Banners' },
    { path: '/admin/settings', label: 'Cài Đặt' },
  ];

  return (
    <nav className="admin-tabs-nav" aria-label="Menu Quản Trị">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `admin-tab-item ${isActive ? 'active' : ''}`}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminNavTabs;
