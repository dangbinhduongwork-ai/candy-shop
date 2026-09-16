import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar component — shows logo + navigation links.
 * Adapts based on authentication state.
 */
const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🍬</span>
          <span className="brand-name">Tiệm Bánh Kẹo</span>
        </Link>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <span className="navbar-greeting">
                Xin chào, <strong>{user?.fullName}</strong>
              </span>
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
