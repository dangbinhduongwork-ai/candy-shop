import React, { useState, useEffect } from 'react';
import AdminNavTabs from '../components/AdminNavTabs';
import { useCart } from '../context/CartContext';
import { useShopSettings } from '../context/ShopSettingsContext';
import settingService from '../api/settingService';

const SEASONAL_EFFECTS = [
  {
    id: 'NONE',
    name: 'Không sử dụng',
    icon: '🚫',
    desc: 'Giao diện tiêu chuẩn, không có hiệu ứng rơi nền',
    badge: 'Mặc định',
  },
  {
    id: 'WINTER_SNOW',
    name: 'Mùa Đông - Bông Tuyết Rơi',
    icon: '❄️',
    desc: 'Bông tuyết trắng nhẹ nhàng rơi và lắc lư, phù hợp Noel & Giáng Sinh',
    badge: 'Giáng Sinh / Năm Mới',
  },
  {
    id: 'SPRING_BLOSSOM',
    name: 'Mùa Xuân - Hoa Đào / Mai',
    icon: '🌸',
    desc: 'Cánh hoa đào hồng mềm mại xoay lượn trong gió, lý tưởng dịp Tết Nguyên Đán',
    badge: 'Tết Âm Lịch',
  },
  {
    id: 'AUTUMN_LEAVES',
    name: 'Mùa Thu - Lá Vàng Rơi',
    icon: '🍁',
    desc: 'Những chiếc lá vàng, phong đỏ dập dờn bay đón thu & tựu trường',
    badge: 'Trung Thu / Khai Giảng',
  },
  {
    id: 'SUMMER_BUBBLES',
    name: 'Mùa Hè - Bong Bóng Tươi Mát',
    icon: '🫧',
    desc: 'Bong bóng trong suốt lung linh bốc lên nhẹ nhàng, mang lại cảm giác tươi mát',
    badge: 'Mùa Hè Sôi Động',
  },
  {
    id: 'CONFETTI_PARTY',
    name: 'Lễ Hội - Pháo Giấy Confetti',
    icon: '🎉',
    desc: 'Pháo giấy rực rỡ sắc màu rơi bùng nổ, phù hợp các dịp Sinh Nhật & Đại Sale',
    badge: 'Mega Sale / Sinh Nhật Shop',
  },
];

const AdminSettingsPage = () => {
  const { showToast } = useCart();
  const { updateSettingsLocally, refreshSettings, setPreviewEffect, previewEffect } = useShopSettings();

  const [activeTab, setActiveTab] = useState('header'); // 'header' | 'footer' | 'shipping' | 'effects'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    defaultShippingFee: 25000,
    freeShippingThreshold: 300000,
  });

  // General settings (Header, Footer, Branding, Effects) form state
  const [generalForm, setGeneralForm] = useState({
    shopName: '',
    shopTitle: '',
    shopSlogan: '',
    headerAnnouncement: '',
    headerHotline: '',
    footerDescription: '',
    footerAddress: '',
    footerMapsUrl: '',
    footerHotline: '',
    footerWorkingHours: '',
    footerEmail: '',
    footerCopyright: '',
    footerBadge1: '',
    footerBadge2: '',
    activeEffect: 'NONE',
  });

  useEffect(() => {
    fetchAllSettings();
    return () => {
      if (setPreviewEffect) setPreviewEffect(null);
    };
  }, []);

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const [shippingData, generalData] = await Promise.all([
        settingService.getAdminShippingSetting().catch(() => null),
        settingService.getAdminGeneralSetting().catch(() => null),
      ]);

      if (shippingData) {
        setShippingForm({
          defaultShippingFee: shippingData.defaultShippingFee !== undefined ? Number(shippingData.defaultShippingFee) : 25000,
          freeShippingThreshold: shippingData.freeShippingThreshold !== undefined ? Number(shippingData.freeShippingThreshold) : 300000,
        });
      }

      if (generalData) {
        setGeneralForm({
          shopName: generalData.shopName || 'Nguyen Huong Grocery Store',
          shopTitle: generalData.shopTitle || 'Nguyen Huong Grocery Store - Bánh kẹo & Tạp hóa chính hãng',
          shopSlogan: generalData.shopSlogan || 'Grocery Store • Since 2026',
          headerAnnouncement: generalData.headerAnnouncement || 'Miễn phí giao hàng cho đơn từ 200.000đ • Hotline đặt hàng & CSKH: 0969 315 603',
          headerHotline: generalData.headerHotline || '0969 315 603',
          footerDescription: generalData.footerDescription || 'Hệ thống bán lẻ thực phẩm thiết yếu, bánh kẹo cao cấp và đặc sản tuyển chọn. Cam kết chất lượng, nguồn gốc rõ ràng và giá thành hợp lý.',
          footerAddress: generalData.footerAddress || 'Số 509 thôn 9, Suối Hai, Ba Vì, Hà Nội',
          footerMapsUrl: generalData.footerMapsUrl || 'https://maps.app.goo.gl/BiWJi5AJAdMfZvRb7',
          footerHotline: generalData.footerHotline || '0969 315 603',
          footerWorkingHours: generalData.footerWorkingHours || '06:00 - 22:00 tất cả các ngày',
          footerEmail: generalData.footerEmail || 'taphoa.nguyenhuong@gmail.com',
          footerCopyright: generalData.footerCopyright || '© 2026 Nguyen Huong Grocery Store. Tất cả các quyền được bảo lưu.',
          footerBadge1: generalData.footerBadge1 || 'Sản phẩm chính hãng',
          footerBadge2: generalData.footerBadge2 || 'Giao hàng tận nơi',
          activeEffect: generalData.activeEffect || 'NONE',
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải cấu hình:', err);
      if (showToast) showToast('Không thể tải cấu hình cửa hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: value === '' ? '' : Math.max(0, Number(value)),
    }));
  };

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveShipping = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (shippingForm.defaultShippingFee === '' || shippingForm.defaultShippingFee < 0) {
      const msg = 'Phí vận chuyển mặc định phải là số không âm';
      setErrorMsg(msg);
      if (showToast) showToast(msg, 'error');
      return;
    }
    if (shippingForm.freeShippingThreshold === '' || shippingForm.freeShippingThreshold < 0) {
      const msg = 'Ngưỡng miễn phí vận chuyển phải là số không âm';
      setErrorMsg(msg);
      if (showToast) showToast(msg, 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        defaultShippingFee: Number(shippingForm.defaultShippingFee),
        freeShippingThreshold: Number(shippingForm.freeShippingThreshold),
      };
      await settingService.updateShippingSetting(payload);
      const msg = '🎉 Cập nhật cấu hình phí vận chuyển thành công!';
      setSuccessMsg(msg);
      if (showToast) showToast(msg, 'success');
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình vận chuyển:', err);
      const msg = err.response?.data?.message || 'Lỗi khi lưu cấu hình';
      setErrorMsg(msg);
      if (showToast) showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = async (e, sectionName) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!generalForm.shopName || !generalForm.shopName.trim()) {
      const msg = 'Tên hiển thị thương hiệu của shop không được để trống';
      setErrorMsg(msg);
      if (showToast) showToast(msg, 'error');
      return;
    }

    try {
      setSaving(true);
      const updated = await settingService.updateGeneralSetting(generalForm);
      if (updated) {
        updateSettingsLocally(updated);
        await refreshSettings();
      }
      const msg = `🎉 Cập nhật cấu hình ${sectionName} thành công!`;
      setSuccessMsg(msg);
      if (showToast) showToast(msg, 'success');
    } catch (err) {
      console.error('Lỗi khi lưu cấu hình:', err);
      const msg = err.response?.data?.message || 'Lỗi khi lưu cấu hình';
      setErrorMsg(msg);
      if (showToast) showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(num) || 0);
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Unified Navigation Tabs */}
        <AdminNavTabs />

        {/* Page Header */}
        <div className="admin-header">
          <div>
            <span className="admin-subtitle">Tùy biến thương hiệu, tiêu đề trang, thanh Header, thông tin Footer và chính sách vận chuyển</span>
            <h1 className="admin-title">Cài Đặt Cửa Hàng</h1>
          </div>
        </div>

        {/* Alert Messages */}
        {successMsg && (
          <div className="alert alert-success mb-3" style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.85rem 1.25rem', borderRadius: '10px', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-danger mb-3" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.85rem 1.25rem', borderRadius: '10px', fontWeight: 600 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Đang tải cấu hình hệ thống...</p>
          </div>
        ) : (
          <div>
            {/* Setting Sub-Tabs */}
            <div className="settings-subtabs">
              <button
                type="button"
                className={`subtab-btn ${activeTab === 'header' ? 'active' : ''}`}
                onClick={() => { setActiveTab('header'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                🏷️ Header & Tiêu Đề Shop
              </button>

              <button
                type="button"
                className={`subtab-btn ${activeTab === 'footer' ? 'active' : ''}`}
                onClick={() => { setActiveTab('footer'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                🦶 Footer & Liên Hệ
              </button>

              <button
                type="button"
                className={`subtab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
                onClick={() => { setActiveTab('shipping'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                🚚 Cấu Hình Vận Chuyển
              </button>

              <button
                type="button"
                className={`subtab-btn ${activeTab === 'effects' ? 'active' : ''}`}
                onClick={() => { setActiveTab('effects'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                🎨 Hiệu Ứng Theo Mùa
              </button>
            </div>

            {/* TAB 1: HEADER & TIÊU ĐỀ SHOP */}
            {activeTab === 'header' && (
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-card-header">
                    <div className="setting-icon-box" style={{ background: '#ecfdf5', color: '#0f766e' }}>
                      🏷️
                    </div>
                    <div>
                      <h3 className="setting-card-title">Header, Logo & Tiêu Đề Cửa Hàng</h3>
                      <p className="setting-card-desc">Tùy biến tên shop, thanh thông báo đầu trang, hotline và tiêu đề thẻ trình duyệt</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSaveGeneral(e, 'Header & Tiêu Đề')} className="setting-form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="shopName">
                        Tên Thương Hiệu Cửa Hàng <span className="required-star">*</span>
                      </label>
                      <input
                        id="shopName"
                        name="shopName"
                        type="text"
                        className="form-input"
                        value={generalForm.shopName}
                        onChange={handleGeneralChange}
                        placeholder="VD: Nguyen Huong Grocery Store"
                        required
                      />
                      <small className="form-hint">Hiển thị ở Logo Navbar, Footer và các tin nhắn thông báo.</small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="shopSlogan">
                        Slogan / Phụ Đề Thương Hiệu
                      </label>
                      <input
                        id="shopSlogan"
                        name="shopSlogan"
                        type="text"
                        className="form-input"
                        value={generalForm.shopSlogan}
                        onChange={handleGeneralChange}
                        placeholder="VD: Grocery Store • Since 2026"
                      />
                      <small className="form-hint">Dòng chữ nhỏ tinh tế ngay bên dưới logo trên thanh điều hướng.</small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="shopTitle">
                        Tiêu Đề Trình Duyệt & SEO (Window Title)
                      </label>
                      <input
                        id="shopTitle"
                        name="shopTitle"
                        type="text"
                        className="form-input"
                        value={generalForm.shopTitle}
                        onChange={handleGeneralChange}
                        placeholder="VD: Nguyen Huong Grocery Store - Bánh kẹo & Tạp hóa chính hãng"
                      />
                      <small className="form-hint">Tiêu đề xuất hiện trên tab trình duyệt (thẻ &lt;title&gt;) và kết quả tìm kiếm.</small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="headerAnnouncement">
                        Nội Dung Thanh Thông Báo Đầu Trang (Announcement Bar)
                      </label>
                      <textarea
                        id="headerAnnouncement"
                        name="headerAnnouncement"
                        rows="2"
                        className="form-input"
                        value={generalForm.headerAnnouncement}
                        onChange={handleGeneralChange}
                        placeholder="VD: Miễn phí giao hàng cho đơn từ 200.000đ • Hotline đặt hàng: 0969 315 603"
                      />
                      <small className="form-hint">Dải băng thông báo nổi bật nằm sát đỉnh màn hình (bỏ trống nếu không muốn hiển thị).</small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="headerHotline">
                        Hotline Hỗ Trợ Nhanh Ở Header
                      </label>
                      <input
                        id="headerHotline"
                        name="headerHotline"
                        type="text"
                        className="form-input"
                        value={generalForm.headerHotline}
                        onChange={handleGeneralChange}
                        placeholder="VD: 0969 315 603"
                      />
                    </div>

                    <div className="setting-actions" style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary btn-save-settings" disabled={saving}>
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu Cài Đặt Header & Tiêu Đề'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview Card for Header */}
                <div className="setting-card">
                  <div className="setting-card-header">
                    <div className="setting-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      👁️
                    </div>
                    <div>
                      <h3 className="setting-card-title">Xem Trước Trực Tiếp (Live Header Preview)</h3>
                      <p className="setting-card-desc">Mô phỏng tức thời giao diện phần đầu trang khách hàng nhìn thấy</p>
                    </div>
                  </div>

                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {/* Simulated Announcement Bar */}
                    {generalForm.headerAnnouncement ? (
                      <div style={{ background: 'linear-gradient(90deg, #0f766e, #0d9488)', color: '#ffffff', padding: '0.45rem 0.75rem', fontSize: '0.8rem', textAlign: 'center', fontWeight: 600 }}>
                        {generalForm.headerAnnouncement}
                      </div>
                    ) : (
                      <div style={{ background: '#f1f5f9', color: '#94a3b8', padding: '0.45rem 0.75rem', fontSize: '0.75rem', textAlign: 'center', fontStyle: 'italic' }}>
                        (Thanh thông báo đang bị tắt)
                      </div>
                    )}

                    {/* Simulated Navbar Brand */}
                    <div style={{ background: 'rgba(255,255,255,0.95)', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0f766e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                            {generalForm.shopName || 'Nguyen Huong'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#0f766e', fontWeight: 600 }}>
                            {generalForm.shopSlogan || 'Grocery Store • Since 2026'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, padding: '4px 8px', background: '#f8fafc', borderRadius: '6px' }}>Trang Chủ</span>
                        <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, padding: '4px 8px', background: '#f8fafc', borderRadius: '6px' }}>Giỏ Hàng (0)</span>
                      </div>
                    </div>
                  </div>

                  {/* Browser Tab Simulation */}
                  <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>🌐 Tab Trình Duyệt:</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                      <span>🍬</span>
                      <span>{generalForm.shopTitle || generalForm.shopName || 'Candy Shop'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FOOTER & THÔNG TIN LIÊN HỆ */}
            {activeTab === 'footer' && (
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-card-header">
                    <div className="setting-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                      🦶
                    </div>
                    <div>
                      <h3 className="setting-card-title">Chân Trang (Footer) & Thông Tin Shop</h3>
                      <p className="setting-card-desc">Cấu hình thông tin liên hệ, địa chỉ bản đồ, hotline, giờ mở cửa và cam kết</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSaveGeneral(e, 'Footer & Liên Hệ')} className="setting-form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="footerDescription">
                        Đoạn Giới Thiệu Ngắn (Footer Bio)
                      </label>
                      <textarea
                        id="footerDescription"
                        name="footerDescription"
                        rows="3"
                        className="form-input"
                        value={generalForm.footerDescription}
                        onChange={handleGeneralChange}
                        placeholder="VD: Hệ thống bán lẻ thực phẩm thiết yếu, bánh kẹo cao cấp..."
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="footerAddress">
                        Địa Chỉ Cửa Hàng
                      </label>
                      <input
                        id="footerAddress"
                        name="footerAddress"
                        type="text"
                        className="form-input"
                        value={generalForm.footerAddress}
                        onChange={handleGeneralChange}
                        placeholder="VD: Số 509 thôn 9, Suối Hai, Ba Vì, Hà Nội"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="footerMapsUrl">
                        Đường Dẫn Google Maps (khi khách click vào địa chỉ)
                      </label>
                      <input
                        id="footerMapsUrl"
                        name="footerMapsUrl"
                        type="url"
                        className="form-input"
                        value={generalForm.footerMapsUrl}
                        onChange={handleGeneralChange}
                        placeholder="VD: https://maps.app.goo.gl/..."
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="footerHotline">
                          Hotline CSKH Ở Footer
                        </label>
                        <input
                          id="footerHotline"
                          name="footerHotline"
                          type="text"
                          className="form-input"
                          value={generalForm.footerHotline}
                          onChange={handleGeneralChange}
                          placeholder="VD: 0969 315 603"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="footerEmail">
                          Email Liên Hệ
                        </label>
                        <input
                          id="footerEmail"
                          name="footerEmail"
                          type="email"
                          className="form-input"
                          value={generalForm.footerEmail}
                          onChange={handleGeneralChange}
                          placeholder="VD: taphoa.nguyenhuong@gmail.com"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="footerWorkingHours">
                        Khung Giờ Mở Cửa Phục Vụ
                      </label>
                      <input
                        id="footerWorkingHours"
                        name="footerWorkingHours"
                        type="text"
                        className="form-input"
                        value={generalForm.footerWorkingHours}
                        onChange={handleGeneralChange}
                        placeholder="VD: 06:00 - 22:00 tất cả các ngày"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="footerBadge1">
                          Huy Hiệu Cam Kết 1
                        </label>
                        <input
                          id="footerBadge1"
                          name="footerBadge1"
                          type="text"
                          className="form-input"
                          value={generalForm.footerBadge1}
                          onChange={handleGeneralChange}
                          placeholder="VD: Sản phẩm chính hãng"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="footerBadge2">
                          Huy Hiệu Cam Kết 2
                        </label>
                        <input
                          id="footerBadge2"
                          name="footerBadge2"
                          type="text"
                          className="form-input"
                          value={generalForm.footerBadge2}
                          onChange={handleGeneralChange}
                          placeholder="VD: Giao hàng tận nơi"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="footerCopyright">
                        Dòng Chữ Bản Quyền (Copyright)
                      </label>
                      <input
                        id="footerCopyright"
                        name="footerCopyright"
                        type="text"
                        className="form-input"
                        value={generalForm.footerCopyright}
                        onChange={handleGeneralChange}
                        placeholder="VD: © 2026 Nguyen Huong Grocery Store. Tất cả các quyền được bảo lưu."
                      />
                    </div>

                    <div className="setting-actions" style={{ marginTop: '1.5rem' }}>
                      <button type="submit" className="btn btn-primary btn-save-settings" disabled={saving}>
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu Cài Đặt Footer & Liên Hệ'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Preview Card for Footer */}
                <div className="setting-card">
                  <div className="setting-card-header">
                    <div className="setting-icon-box" style={{ background: '#fdf4ff', color: '#a855f7' }}>
                      👁️
                    </div>
                    <div>
                      <h3 className="setting-card-title">Xem Trước Footer (Live Footer Preview)</h3>
                      <p className="setting-card-desc">Giao diện mô phỏng Footer xuất hiện ở cuối mọi trang</p>
                    </div>
                  </div>

                  <div style={{ background: '#0f172a', color: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff', marginBottom: '6px' }}>
                      {generalForm.shopName || 'Nguyen Huong Grocery Store'}
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '12px' }}>
                      {generalForm.footerDescription || 'Hệ thống bán lẻ thực phẩm thiết yếu...'}
                    </p>

                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                      {generalForm.footerBadge1 && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#5eead4' }}>
                          ✓ {generalForm.footerBadge1}
                        </span>
                      )}
                      {generalForm.footerBadge2 && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '4px', color: '#5eead4' }}>
                          ✓ {generalForm.footerBadge2}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                      <div>📍 <strong>Địa chỉ:</strong> {generalForm.footerAddress || '—'}</div>
                      <div>📞 <strong>Hotline:</strong> {generalForm.footerHotline || '—'}</div>
                      <div>✉️ <strong>Email:</strong> {generalForm.footerEmail || '—'}</div>
                      <div>⏰ <strong>Giờ mở cửa:</strong> {generalForm.footerWorkingHours || '—'}</div>
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                      {generalForm.footerCopyright || `© ${new Date().getFullYear()} ${generalForm.shopName}. Tất cả các quyền được bảo lưu.`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CẤU HÌNH VẬN CHUYỂN */}
            {activeTab === 'shipping' && (
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-card-header">
                    <div className="setting-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                      🚚
                    </div>
                    <div>
                      <h3 className="setting-card-title">Cấu hình Phí Vận Chuyển</h3>
                      <p className="setting-card-desc">Thiết lập mức phí ship tiêu chuẩn và chính sách Free Ship tự động</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveShipping} className="setting-form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="defaultShippingFee">
                        Phí vận chuyển mặc định (VNĐ) <span className="required-star">*</span>
                      </label>
                      <div className="input-with-preview">
                        <input
                          id="defaultShippingFee"
                          name="defaultShippingFee"
                          type="number"
                          min="0"
                          step="1000"
                          className="form-input"
                          value={shippingForm.defaultShippingFee}
                          onChange={handleShippingChange}
                          placeholder="VD: 25000"
                          required
                        />
                        <div className="input-currency-tag">{formatVND(shippingForm.defaultShippingFee)}</div>
                      </div>
                      <small className="form-hint">
                        Áp dụng cho các đơn hàng chưa đạt ngưỡng miễn phí vận chuyển.
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="freeShippingThreshold">
                        Ngưỡng miễn phí vận chuyển (VNĐ) <span className="required-star">*</span>
                      </label>
                      <div className="input-with-preview">
                        <input
                          id="freeShippingThreshold"
                          name="freeShippingThreshold"
                          type="number"
                          min="0"
                          step="10000"
                          className="form-input"
                          value={shippingForm.freeShippingThreshold}
                          onChange={handleShippingChange}
                          placeholder="VD: 300000"
                          required
                        />
                        <div className="input-currency-tag">{formatVND(shippingForm.freeShippingThreshold)}</div>
                      </div>
                      <small className="form-hint">
                        Đơn hàng có tổng tiền hàng (sau khi trừ voucher) lớn hơn hoặc bằng mức này sẽ được <strong>0đ phí ship</strong>.
                      </small>
                    </div>

                    {/* Live Demonstration Preview */}
                    <div className="setting-demo-box">
                      <div className="demo-box-title">💡 Mô phỏng tính phí thực tế:</div>
                      <div className="demo-scenarios">
                        <div className="demo-item">
                          <span className="demo-label">Đơn hàng nhỏ (150.000đ):</span>
                          <span className="demo-value" style={{ color: '#dc2626' }}>
                            Phí ship {formatVND(shippingForm.defaultShippingFee)}
                          </span>
                        </div>
                        <div className="demo-item">
                          <span className="demo-label">Đơn hàng đạt ngưỡng ({formatVND(shippingForm.freeShippingThreshold)}):</span>
                          <span className="demo-value" style={{ color: '#059669', fontWeight: 700 }}>
                            🎉 Miễn phí ship (0đ)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="setting-actions">
                      <button
                        type="submit"
                        className="btn btn-primary btn-save-settings"
                        disabled={saving}
                      >
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu Cài Đặt Vận Chuyển'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* System Info Note */}
                <div className="setting-card">
                  <div className="setting-card-header">
                    <div className="setting-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      ℹ️
                    </div>
                    <div>
                      <h3 className="setting-card-title">Kiến Trúc Lưu Trữ Cấu Hình</h3>
                      <p className="setting-card-desc">Cơ chế lưu trữ cấu hình động Key-Value với Redis Cache</p>
                    </div>
                  </div>

                  <div className="system-info-content">
                    <div className="info-badge-item">
                      <span className="info-key">Bảng lưu trữ DB:</span>
                      <span className="info-val"><code>shop_settings</code> (Key-Value)</span>
                    </div>
                    <div className="info-badge-item">
                      <span className="info-key">Lớp Caching:</span>
                      <span className="info-val"><code>Redis Cache TTL 24h</code></span>
                    </div>
                    <div className="info-badge-item">
                      <span className="info-key">Độ trễ API:</span>
                      <span className="info-val"><code>&lt; 5ms (In-Memory)</code></span>
                    </div>
                    <div className="info-badge-item">
                      <span className="info-key">Đồng bộ:</span>
                      <span className="info-val">Tự động xóa cache và cập nhật toàn bộ máy khách ngay khi lưu</span>
                    </div>

                    <div className="alert-box-info" style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                        ✨ <strong>Tự động hóa hoàn toàn:</strong> Khi Quản trị viên cập nhật tên shop, khẩu hiệu, thanh thông báo hay footer, toàn bộ website của khách hàng và tiêu đề trình duyệt sẽ được cập nhật đồng bộ tức thời mà không cần can thiệp mã nguồn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: HIỆU ỨNG THEO MÙA */}
            {activeTab === 'effects' && (
              <div className="settings-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="setting-card">
                  <div className="setting-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div className="setting-icon-box" style={{ background: '#fdf2f8', color: '#db2777' }}>
                        🎨
                      </div>
                      <div>
                        <h3 className="setting-card-title">Cấu Hình Hiệu Ứng Rơi Theo Mùa</h3>
                        <p className="setting-card-desc">
                          Tạo không khí lễ hội cuốn hút khách hàng với hoạt họa HTML5 Canvas 60fps siêu mượt, tự động tối ưu hóa tài nguyên.
                        </p>
                      </div>
                    </div>

                    {previewEffect && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                        <span style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 600 }}>
                          Đang xem trước: <strong>{SEASONAL_EFFECTS.find(e => e.id === previewEffect)?.name || previewEffect}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewEffect(null)}
                          style={{
                            background: '#dc2626',
                            color: '#fff',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          ✕ Tắt xem trước
                        </button>
                      </div>
                    )}
                  </div>

                  <form onSubmit={(e) => {
                    setPreviewEffect(null);
                    handleSaveGeneral(e, 'Hiệu Ứng Theo Mùa');
                  }} className="setting-form">
                    <div className="seasonal-effects-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1.25rem',
                      margin: '1.5rem 0'
                    }}>
                      {SEASONAL_EFFECTS.map((effect) => {
                        const isSelected = generalForm.activeEffect === effect.id;
                        const isPreviewing = previewEffect === effect.id;

                        return (
                          <div
                            key={effect.id}
                            onClick={() => setGeneralForm((prev) => ({ ...prev, activeEffect: effect.id }))}
                            style={{
                              border: isSelected ? '2px solid #0f766e' : '1.5px solid var(--border-color, #e2e8f0)',
                              borderRadius: '16px',
                              padding: '1.25rem',
                              background: isSelected ? 'var(--bg-secondary, #f0fdfa)' : 'var(--card-bg, #ffffff)',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 4px 14px rgba(15, 118, 110, 0.15)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                              <div style={{ fontSize: '2rem' }}>{effect.icon}</div>
                              <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: isSelected ? '#0f766e' : '#f1f5f9',
                                color: isSelected ? '#ffffff' : '#64748b'
                              }}>
                                {effect.badge}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                              <input
                                type="radio"
                                name="activeEffect"
                                value={effect.id}
                                checked={isSelected}
                                onChange={() => setGeneralForm((prev) => ({ ...prev, activeEffect: effect.id }))}
                                style={{ accentColor: '#0f766e', cursor: 'pointer' }}
                              />
                              <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                                {effect.name}
                              </h4>
                            </div>

                            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary, #64748b)', margin: '0 0 1rem 0', lineHeight: 1.5, minHeight: '40px' }}>
                              {effect.desc}
                            </p>

                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color, #f1f5f9)', paddingTop: '0.75rem' }}>
                              {effect.id !== 'NONE' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isPreviewing) {
                                      setPreviewEffect(null);
                                    } else {
                                      setPreviewEffect(effect.id);
                                    }
                                  }}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    background: isPreviewing ? '#fef3c7' : '#ffffff',
                                    color: isPreviewing ? '#b45309' : '#334155',
                                    fontSize: '0.82rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {isPreviewing ? '⏹️ Dừng xem' : '👁️ Xem trước'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="setting-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                      <button
                        type="submit"
                        className="btn btn-primary btn-save-settings"
                        disabled={saving}
                      >
                        {saving ? '⏳ Đang lưu...' : '💾 Lưu Cài Đặt Hiệu Ứng'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
