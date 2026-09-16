import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * HomePage — shown to authenticated users after login.
 * Displays personalized greeting and account summary.
 * Will be expanded in future iterations with product listings.
 */
const HomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Khách hàng';

  return (
    <div className="home-page">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">
            🎉 Xin chào, <span className="user-name">{user?.fullName}</span>!
          </h1>
          <p className="welcome-subtitle">
            Chào mừng bạn đến với Tiệm Bánh Kẹo — nơi mọi khoảnh khắc ngọt ngào đều bắt đầu từ đây 🍬
          </p>
        </div>
      </section>

      {/* Account Info Card */}
      <section className="account-section">
        <div className="account-card">
          <h2>Thông tin tài khoản</h2>
          <div className="account-info">
            <div className="info-row">
              <span className="info-label">📧 Email</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">📱 Số điện thoại</span>
              <span className="info-value">{user?.phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">🏷️ Vai trò</span>
              <span className="info-value role-badge">{roleLabel}</span>
            </div>
          </div>
          <button className="btn btn-outline-danger logout-btn" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="coming-soon">
        <h2>🍭 Sản phẩm nổi bật</h2>
        <div className="placeholder-grid">
          {['Kẹo dẻo gấu', 'Chocolate đen', 'Bánh quy bơ', 'Kẹo mút cầu vồng'].map((item) => (
            <div key={item} className="placeholder-card">
              <div className="placeholder-image">🍬</div>
              <p>{item}</p>
              <span className="coming-soon-tag">Sắp ra mắt</span>
            </div>
          ))}
        </div>
        <p className="coming-soon-note">
          Danh mục sản phẩm đầy đủ sẽ sớm có mặt. Hãy theo dõi nhé!
        </p>
      </section>
    </div>
  );
};

export default HomePage;
