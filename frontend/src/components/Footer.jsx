import React from 'react';
import { Link } from 'react-router-dom';
import { useShopSettings } from '../context/ShopSettingsContext';

const Footer = () => {
  const { settings } = useShopSettings();

  const hotline = settings.footerHotline || '0969 315 603';
  const hotlineClean = hotline.replace(/\s+/g, '');
  const email = settings.footerEmail || 'taphoa.nguyenhuong@gmail.com';
  const mapsUrl = settings.footerMapsUrl || 'https://maps.app.goo.gl/BiWJi5AJAdMfZvRb7';

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
              <span className="brand-icon-wrapper" style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </span>
              <span className="brand-logo-text">{settings.shopName || 'Nguyen Huong Grocery Store'}</span>
            </Link>
            <p className="footer-desc">
              {settings.footerDescription || 'Hệ thống bán lẻ thực phẩm thiết yếu, bánh kẹo cao cấp và đặc sản tuyển chọn. Cam kết chất lượng, nguồn gốc rõ ràng và giá thành hợp lý.'}
            </p>
            <div className="footer-badges">
              {settings.footerBadge1 && <span className="footer-pill">{settings.footerBadge1}</span>}
              {settings.footerBadge2 && <span className="footer-pill">{settings.footerBadge2}</span>}
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="footer-col">
            <h4 className="footer-title">Danh Mục Ngành Hàng</h4>
            <ul className="footer-links">
              <li><Link to="/">Bánh kẹo nhập khẩu & cao cấp</Link></li>
              <li><Link to="/">Đặc sản bánh kẹo truyền thống</Link></li>
              <li><Link to="/">Nhu yếu phẩm & Đồ uống</Link></li>
              <li><Link to="/">Trà, Cà phê & Ngũ cốc dinh dưỡng</Link></li>
              <li><Link to="/">Hạt dinh dưỡng & Trái cây sấy</Link></li>
            </ul>
          </div>

          {/* Col 3: Support */}
          <div className="footer-col">
            <h4 className="footer-title">Hỗ Trợ Khách Hàng</h4>
            <ul className="footer-links">
              <li><a href="#!">Chính sách đổi trả minh bạch</a></li>
              <li><a href="#!">Hướng dẫn đặt hàng online</a></li>
              <li><a href="#!">Chính sách bảo mật thông tin</a></li>
              <li><a href="#!">Kiểm tra tiến độ đơn hàng</a></li>
              <li><a href="#!">Ưu đãi thành viên & tích điểm</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="footer-col">
            <h4 className="footer-title">Thông Tin Liên Hệ</h4>
            <div className="footer-contact-info">
              <p>
                <strong>Địa chỉ:</strong>{' '}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {settings.footerAddress || 'Số 509 thôn 9, Suối Hai, Ba Vì, Hà Nội'}
                </a>
              </p>
              <p>
                <strong>Hotline:</strong>{' '}
                <a href={`https://zalo.me/${hotlineClean}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {hotline}
                </a>
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <a href={`https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${email}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  {email}
                </a>
              </p>
              <p>
                <strong>Giờ phục vụ:</strong>{' '}
                <span>{settings.footerWorkingHours || '06:00 - 22:00 tất cả các ngày'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>{settings.footerCopyright || `© ${new Date().getFullYear()} ${settings.shopName || 'Nguyen Huong Grocery Store'}. Tất cả các quyền được bảo lưu.`}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

