import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-sweet">
      <div className="footer-top-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,64C1200,75,1320,85,1380,90.7L1440,96L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="footer-main-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Bio */}
          <div className="footer-col footer-brand-col">
            <Link to="/" className="footer-brand">
              <span className="brand-icon-spin">🍬</span>
              <span className="brand-logo-text">Nguyen Huong Grocery Store</span>
            </Link>
            <p className="footer-desc">
              Mang trọn tình yêu và sự ngọt ngào vào từng viên kẹo thủ công, thanh sô cô la đậm đà và chiếc bánh quy bơ giòn rụm thượng hạng.
            </p>
            <div className="footer-badges">
              <span className="footer-pill">✨ 100% Nguyên liệu tươi</span>
              <span className="footer-pill">🚚 Giao nhanh 2h</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="footer-col">
            <h4 className="footer-title">🍭 Danh Mục Bánh Kẹo</h4>
            <ul className="footer-links">
              <li><Link to="/">Kẹo Dẻo & Marshmallow</Link></li>
              <li><Link to="/">Sô Cô La Thủ Công & Cacao</Link></li>
              <li><Link to="/">Bánh Quy & Macaron Pháp</Link></li>
              <li><Link to="/">Kẹo Mút Cầu Vồng & Kẹo Cứng</Link></li>
              <li><Link to="/">Đặc Sản Bánh Kẹo Truyền Thống</Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="footer-col">
            <h4 className="footer-title">🛡️ Hỗ Trợ Khách Hàng</h4>
            <ul className="footer-links">
              <li><a href="#!">Chính sách đổi trả 100%</a></li>
              <li><a href="#!">Hướng dẫn đặt hàng online</a></li>
              <li><a href="#!">Chính sách bảo mật thông tin</a></li>
              <li><a href="#!">Kiểm tra đơn hàng</a></li>
              <li><a href="#!">Ưu đãi thành viên VIP</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="footer-col">
            <h4 className="footer-title">📍 Liên Hệ Tiệm</h4>
            <div className="footer-contact-info">
              <p>🏠 <strong>Địa chỉ:</strong> <a href="https://maps.app.goo.gl/BiWJi5AJAdMfZvRb7" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Số 509 thôn 9, Suối Hai, Hà Nội</a></p>
              <p>📞 <strong>Hotline:</strong> <a href="https://zalo.me/0969315603" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>0969 315 603 (6:00 - 22:00)</a></p>
              <p>✉️ <strong>Email:</strong> <a href="https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=taphoa.nguyenhuong@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>taphoa.nguyenhuong@gmail.com</a></p>
              <p>⏰ <strong>Giờ mở cửa:</strong> <a href="https://maps.app.goo.gl/BiWJi5AJAdMfZvRb7" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>06:00 - 22:00 tất cả các ngày</a></p>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2026 Nguyen Huong Grocery Store. All rights reserved. Made with ❤️ and lots of sugar.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
