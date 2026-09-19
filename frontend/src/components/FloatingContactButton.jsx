import React, { useState, useRef, useEffect } from 'react';
import { useShopSettings } from '../context/ShopSettingsContext';

/**
 * Floating Hotline Contact Widget (Bottom-Left Corner)
 * Features:
 * - Pulsing ripple ring animation
 * - Direct dialer trigger
 * - Interactive Popup Card with Formatted Phone, Zalo Chat Link, and Operating Hours
 */
const FloatingContactButton = () => {
  const { settings } = useShopSettings();
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef(null);
  const timerRef = useRef(null);

  const rawPhone = settings?.footerHotline || settings?.headerHotline || '0969 315 603';
  const cleanPhone = rawPhone.replace(/\D/g, '');
  const telLink = `tel:${cleanPhone.startsWith('0') ? '+84' + cleanPhone.slice(1) : cleanPhone}`;
  const zaloLink = `https://zalo.me/${cleanPhone}`;
  const workingHours = settings?.footerWorkingHours || '06:00 - 22:00 tất cả các ngày';

  // Desktop hover handling
  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 280);
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      ref={widgetRef}
      className="floating-contact-widget"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        zIndex: 9999,
      }}
    >
      {/* Interactive Popup Card */}
      {isOpen && (
        <div className="floating-contact-popup" role="dialog" aria-label="Thông tin liên hệ nhanh">
          <div className="contact-popup-header">
            <div className="popup-badge-dot"></div>
            <div className="popup-title-group">
              <span className="popup-title">Hỗ Trợ & Đặt Hàng</span>
              <span className="popup-sub">Phục vụ tận tâm 24/7</span>
            </div>
            <button
              type="button"
              className="popup-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              title="Đóng"
            >
              ✕
            </button>
          </div>

          <div className="contact-popup-body">
            <div className="popup-phone-display">
              <span className="phone-icon-tag">📞</span>
              <span className="phone-number-bold">{rawPhone}</span>
            </div>

            <div className="popup-hours-info">
              <span className="hours-icon">⏰</span>
              <span className="hours-text">{workingHours}</span>
            </div>

            <div className="popup-action-grid">
              <a
                href={telLink}
                className="btn-popup-call"
                title="Gọi điện thoại trực tiếp"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Gọi Ngay</span>
              </a>

              <a
                href={zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-popup-zalo"
                title="Mở trò chuyện Zalo"
              >
                <span className="zalo-icon-text">Z</span>
                <span>Chat Zalo</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <a
        href={telLink}
        className="floating-hotline-btn"
        onClick={(e) => {
          // On mobile / touch, toggle popup first so user can choose Call or Zalo
          if (window.innerWidth < 768 && !isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        aria-label={`Hotline: ${rawPhone}`}
        title={`Hotline tư vấn & đặt hàng: ${rawPhone}`}
      >
        {/* Pulsing Ripple Rings */}
        <span className="ripple-ring ring-1"></span>
        <span className="ripple-ring ring-2"></span>

        {/* Center Icon */}
        <span className="hotline-btn-inner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="phone-bounce-icon">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </span>
      </a>
    </div>
  );
};

export default FloatingContactButton;
