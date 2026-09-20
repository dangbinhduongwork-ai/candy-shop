import React, { useState, useEffect, useRef } from 'react';
import AdminNavTabs from '../components/AdminNavTabs';
import { useCart } from '../context/CartContext';
import { useShopSettings, hexToRgb, adjustBrightness } from '../context/ShopSettingsContext';
import { SHOP_PATTERNS } from '../components/ShopBackground';
import settingService from '../api/settingService';

const THEME_PALETTES = [
  { id: 'forest-teal', name: 'Xanh Rừng (Forest Teal)', hex: '#0f766e', desc: 'Tươi mới, sạch sẽ & tin cậy', badge: 'Mặc định' },
  { id: 'candy-pink', name: 'Hồng Kẹo Ngọt (Candy Berry)', hex: '#ec4899', desc: 'Ngọt ngào, đáng yêu & nổi bật', badge: 'Ngọt ngào' },
  { id: 'royal-purple', name: 'Tím Hoàng Gia (Royal Purple)', hex: '#8b5cf6', desc: 'Sang trọng, quý phái & cao cấp', badge: 'Quý phái' },
  { id: 'ocean-blue', name: 'Đại Dương Xanh (Ocean Blue)', hex: '#0284c7', desc: 'Hiện đại, chuyên nghiệp & uy tín', badge: 'Hiện đại' },
  { id: 'fresh-emerald', name: 'Ngọc Lục Bảo (Fresh Emerald)', hex: '#059669', desc: 'Thiên nhiên tươi mát, an toàn', badge: 'Organic' },
  { id: 'warm-amber', name: 'Hổ Phách Ấm (Warm Amber)', hex: '#d97706', desc: 'Năng động, rực rỡ & ấm áp', badge: 'Năng động' },
  { id: 'caramel-brown', name: 'Caramel & Cacao (Caramel)', hex: '#b45309', desc: 'Đậm đà hương vị truyền thống', badge: 'Cổ điển' },
  { id: 'ruby-red', name: 'Đỏ Ruby (Ruby Red)', hex: '#e11d48', desc: 'Nổi bật, rực rỡ & thu hút', badge: 'Nổi bật' },
  { id: 'midnight-slate', name: 'Đá Phiến Đêm (Midnight)', hex: '#334155', desc: 'Tối giản, trang nhã & thanh lịch', badge: 'Minimal' },
];

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
  const {
    updateSettingsLocally,
    refreshSettings,
    setPreviewEffect,
    previewEffect,
    setPreviewColor,
    setPreviewBackground,
  } = useShopSettings();

  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'header' | 'footer' | 'shipping' | 'effects'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Appearance specific states
  const [uploadingBg, setUploadingBg] = useState(false);
  const [liveStorePreview, setLiveStorePreview] = useState(false);
  const bgFileInputRef = useRef(null);

  // Shipping form state
  const [shippingForm, setShippingForm] = useState({
    defaultShippingFee: 25000,
    freeShippingThreshold: 300000,
  });

  // General settings (Header, Footer, Branding, Effects, Appearance) form state
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
    primaryColor: '#0f766e',
    shopBackgroundPattern: 'DEFAULT',
    shopBackgroundImageUrl: '',
    shopBackgroundOpacity: 15,
  });

  useEffect(() => {
    fetchAllSettings();
    return () => {
      if (setPreviewEffect) setPreviewEffect(null);
      if (setPreviewColor) setPreviewColor(null);
      if (setPreviewBackground) setPreviewBackground(null);
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
          primaryColor: generalData.primaryColor || '#0f766e',
          shopBackgroundPattern: generalData.shopBackgroundPattern || 'DEFAULT',
          shopBackgroundImageUrl: generalData.shopBackgroundImageUrl || '',
          shopBackgroundOpacity: generalData.shopBackgroundOpacity !== undefined ? Number(generalData.shopBackgroundOpacity) : 15,
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
                className={`subtab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => { setActiveTab('appearance'); setSuccessMsg(''); setErrorMsg(''); }}
              >
                🎨 Màu Sắc & Hình Nền Shop
              </button>

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
                ❄️ Hiệu Ứng Theo Mùa
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

            {/* TAB 5: MÀU SẮC CHỦ ĐẠO & HÌNH NỀN SHOP */}
            {activeTab === 'appearance' && (
              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-card-header">
                    <div className="setting-icon-box" style={{ background: '#fdf2f8', color: '#ec4899' }}>
                      🎨
                    </div>
                    <div>
                      <h3 className="setting-card-title">Màu Sắc Chủ Đạo & Hình Nền Cửa Hàng</h3>
                      <p className="setting-card-desc">
                        Tùy biến phong cách thương hiệu độc bản: chọn màu chủ đạo và họa tiết nền hiển thị đồng bộ trên toàn trang
                      </p>
                    </div>
                  </div>

                  <form onSubmit={(e) => handleSaveGeneral(e, 'Màu Sắc & Hình Nền')} className="setting-form">
                    
                    {/* SECTION 1: PRIMARY THEME COLOR */}
                    <div className="appearance-section-box">
                      <div className="appearance-section-header">
                        <div className="section-step-badge">1</div>
                        <div>
                          <h4 className="appearance-section-title">Màu Sắc Chủ Đạo (Primary Theme Color)</h4>
                          <p className="appearance-section-desc">
                            Màu sắc này sẽ áp dụng cho tất cả các nút bấm chính (Button), tab đang chọn, liên kết nổi bật, nhãn thông báo và hiệu ứng focus toàn shop.
                          </p>
                        </div>
                      </div>

                      {/* Palettes Grid */}
                      <div className="theme-palette-grid">
                        {THEME_PALETTES.map((pal) => {
                          const isSelected = (generalForm.primaryColor || '').toLowerCase() === pal.hex.toLowerCase();
                          return (
                            <div
                              key={pal.id}
                              className={`theme-palette-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setGeneralForm((prev) => ({ ...prev, primaryColor: pal.hex }));
                                if (liveStorePreview && setPreviewColor) setPreviewColor(pal.hex);
                              }}
                            >
                              <div className="palette-color-preview" style={{ background: pal.hex }}>
                                {isSelected && <span className="palette-check-mark">✓</span>}
                              </div>
                              <div className="palette-info">
                                <div className="palette-header-line">
                                  <span className="palette-name">{pal.name}</span>
                                  <span className="palette-badge">{pal.badge}</span>
                                </div>
                                <span className="palette-hex-code">{pal.hex.toUpperCase()}</span>
                                <span className="palette-desc">{pal.desc}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Color Picker & Hex Input */}
                      <div className="custom-color-row">
                        <div className="custom-picker-group">
                          <label className="form-label" htmlFor="customColorPicker">
                            Hoặc chọn màu tùy chỉnh tự do:
                          </label>
                          <div className="custom-picker-inputs">
                            <input
                              id="customColorPicker"
                              type="color"
                              className="custom-color-circle"
                              value={generalForm.primaryColor || '#0f766e'}
                              onChange={(e) => {
                                const newHex = e.target.value;
                                setGeneralForm((prev) => ({ ...prev, primaryColor: newHex }));
                                if (liveStorePreview && setPreviewColor) setPreviewColor(newHex);
                              }}
                            />
                            <div className="hex-input-wrapper">
                              <span className="hex-prefix">HEX</span>
                              <input
                                type="text"
                                className="form-input hex-text-input"
                                value={generalForm.primaryColor || '#0f766e'}
                                placeholder="#0f766e"
                                maxLength={7}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setGeneralForm((prev) => ({ ...prev, primaryColor: val }));
                                  if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val) && liveStorePreview && setPreviewColor) {
                                    setPreviewColor(val);
                                  }
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              className="btn-reset-color"
                              onClick={() => {
                                setGeneralForm((prev) => ({ ...prev, primaryColor: '#0f766e' }));
                                if (liveStorePreview && setPreviewColor) setPreviewColor('#0f766e');
                              }}
                            >
                              Khôi phục màu mặc định (#0f766e)
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: SHOP BACKGROUND PATTERN & IMAGE */}
                    <div className="appearance-section-box">
                      <div className="appearance-section-header">
                        <div className="section-step-badge">2</div>
                        <div>
                          <h4 className="appearance-section-title">Hình Nền & Họa Tiết Shop (Shop Background)</h4>
                          <p className="appearance-section-desc">
                            Lớp nền vector tinh tế hoặc hình ảnh do bạn tải lên sẽ phủ nhẹ nhàng phía sau nội dung trang web.
                          </p>
                        </div>
                      </div>

                      {/* Pattern Preset Cards */}
                      <div className="pattern-cards-grid">
                        {Object.values(SHOP_PATTERNS).map((pat) => {
                          const isSelected = (generalForm.shopBackgroundPattern || 'DEFAULT') === pat.id;
                          return (
                            <div
                              key={pat.id}
                              className={`pattern-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setGeneralForm((prev) => ({ ...prev, shopBackgroundPattern: pat.id }));
                                if (liveStorePreview && setPreviewBackground) {
                                  setPreviewBackground({
                                    pattern: pat.id,
                                    imageUrl: generalForm.shopBackgroundImageUrl,
                                    opacity: generalForm.shopBackgroundOpacity,
                                  });
                                }
                              }}
                            >
                              <div className="pattern-icon-box">{pat.icon}</div>
                              <div className="pattern-body">
                                <div className="pattern-title-row">
                                  <h5 className="pattern-title">{pat.name}</h5>
                                  <span className="pattern-badge">{pat.badge}</span>
                                </div>
                                <p className="pattern-desc">{pat.desc}</p>
                              </div>
                              {isSelected && <span className="pattern-check-badge">✓ Đang chọn</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Custom Image Upload & URL input (when CUSTOM_IMAGE selected) */}
                      {generalForm.shopBackgroundPattern === 'CUSTOM_IMAGE' && (
                        <div className="custom-bg-upload-box">
                          <h5 className="custom-bg-title">Cung Cấp Hình Ảnh Nền Tùy Chỉnh</h5>
                          <div className="upload-options-grid">
                            {/* Option 1: File Upload */}
                            <div className="upload-dropzone">
                              <input
                                ref={bgFileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                style={{ display: 'none' }}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 5 * 1024 * 1024) {
                                    if (showToast) showToast('Dung lượng ảnh tối đa 5MB!', 'error');
                                    return;
                                  }
                                  try {
                                    setUploadingBg(true);
                                    const res = await settingService.uploadBackgroundImage(file);
                                    if (res && res.url) {
                                      setGeneralForm((prev) => ({ ...prev, shopBackgroundImageUrl: res.url }));
                                      if (liveStorePreview && setPreviewBackground) {
                                        setPreviewBackground({
                                          pattern: 'CUSTOM_IMAGE',
                                          imageUrl: res.url,
                                          opacity: generalForm.shopBackgroundOpacity,
                                        });
                                      }
                                      if (showToast) showToast('Tải ảnh nền lên thành công! 🎉', 'success');
                                    }
                                  } catch (err) {
                                    console.error('Lỗi tải ảnh:', err);
                                    if (showToast) showToast('Không thể tải ảnh lên', 'error');
                                  } finally {
                                    setUploadingBg(false);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="btn-upload-trigger"
                                disabled={uploadingBg}
                                onClick={() => bgFileInputRef.current?.click()}
                              >
                                {uploadingBg ? '⏳ Đang tải ảnh lên...' : '📁 Tải ảnh từ máy tính (JPG, PNG, WEBP)'}
                              </button>
                              <span className="upload-hint">Dung lượng tối đa 5MB. Khuyên dùng ảnh phong cảnh hoặc họa tiết liền mạch.</span>
                            </div>

                            {/* Option 2: Image URL input */}
                            <div className="url-input-group">
                              <label className="form-label" htmlFor="bgImageUrlInput">
                                Hoặc dán đường dẫn ảnh (URL):
                              </label>
                              <input
                                id="bgImageUrlInput"
                                type="url"
                                className="form-input"
                                placeholder="https://example.com/background.jpg"
                                value={generalForm.shopBackgroundImageUrl || ''}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  setGeneralForm((prev) => ({ ...prev, shopBackgroundImageUrl: url }));
                                  if (liveStorePreview && setPreviewBackground) {
                                    setPreviewBackground({
                                      pattern: 'CUSTOM_IMAGE',
                                      imageUrl: url,
                                      opacity: generalForm.shopBackgroundOpacity,
                                    });
                                  }
                                }}
                              />
                            </div>
                          </div>

                          {/* Image preview thumbnail */}
                          {generalForm.shopBackgroundImageUrl && (
                            <div className="custom-bg-preview-row">
                              <span className="form-label">Ảnh nền hiện tại:</span>
                              <div className="custom-bg-thumb-wrap">
                                <img
                                  src={generalForm.shopBackgroundImageUrl}
                                  alt="Custom background preview"
                                  className="custom-bg-thumb"
                                />
                                <button
                                  type="button"
                                  className="btn-remove-custom-bg"
                                  onClick={() => {
                                    setGeneralForm((prev) => ({
                                      ...prev,
                                      shopBackgroundImageUrl: '',
                                      shopBackgroundPattern: 'DEFAULT',
                                    }));
                                    if (liveStorePreview && setPreviewBackground) {
                                      setPreviewBackground({
                                        pattern: 'DEFAULT',
                                        imageUrl: '',
                                        opacity: generalForm.shopBackgroundOpacity,
                                      });
                                    }
                                  }}
                                >
                                  ✕ Xóa ảnh này
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Opacity Slider */}
                      {generalForm.shopBackgroundPattern !== 'NONE' && (
                        <div className="opacity-slider-box">
                          <div className="opacity-slider-header">
                            <div>
                              <label className="form-label mb-0" htmlFor="bgOpacitySlider">
                                Độ Mờ / Trong Suốt Của Nền (Background Opacity):
                              </label>
                              <span className="slider-hint">
                                Khuyên dùng: <strong>10% - 25%</strong> để họa tiết hiển thị dịu nhẹ, đảm bảo chữ và thẻ sản phẩm rõ nét 100%.
                              </span>
                            </div>
                            <span className="opacity-value-badge">{generalForm.shopBackgroundOpacity || 15}%</span>
                          </div>

                          <div className="slider-control-row">
                            <span className="slider-end-label">5% (Rất mờ)</span>
                            <input
                              id="bgOpacitySlider"
                              type="range"
                              min={5}
                              max={50}
                              step={1}
                              className="opacity-range-slider"
                              value={generalForm.shopBackgroundOpacity || 15}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setGeneralForm((prev) => ({ ...prev, shopBackgroundOpacity: val }));
                                if (liveStorePreview && setPreviewBackground) {
                                  setPreviewBackground({
                                    pattern: generalForm.shopBackgroundPattern,
                                    imageUrl: generalForm.shopBackgroundImageUrl,
                                    opacity: val,
                                  });
                                }
                              }}
                            />
                            <span className="slider-end-label">50% (Đậm nét)</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 3: INTERACTIVE LIVE PREVIEW MOCKUP */}
                    <div className="appearance-section-box">
                      <div className="appearance-section-header">
                        <div className="section-step-badge">3</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h4 className="appearance-section-title">Mô Phỏng Thực Tế (Interactive Preview)</h4>
                            
                            {/* Live Store Toggle */}
                            <label className="live-preview-toggle-label">
                              <input
                                type="checkbox"
                                checked={liveStorePreview}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setLiveStorePreview(checked);
                                  if (checked) {
                                    if (setPreviewColor) setPreviewColor(generalForm.primaryColor);
                                    if (setPreviewBackground) {
                                      setPreviewBackground({
                                        pattern: generalForm.shopBackgroundPattern,
                                        imageUrl: generalForm.shopBackgroundImageUrl,
                                        opacity: generalForm.shopBackgroundOpacity,
                                      });
                                    }
                                    if (showToast) showToast('Đang bật chế độ xem thử trực tiếp trên toàn website! 👀', 'info');
                                  } else {
                                    if (setPreviewColor) setPreviewColor(null);
                                    if (setPreviewBackground) setPreviewBackground(null);
                                  }
                                }}
                              />
                              <span>👁️ Áp dụng xem trước trực tiếp trên toàn màn hình</span>
                            </label>
                          </div>
                          <p className="appearance-section-desc">
                            Xem trước hiệu ứng tương tác của màu chủ đạo và họa tiết nền trên các thành phần cốt lõi của website:
                          </p>
                        </div>
                      </div>

                      {/* Mockup Preview Card */}
                      <div
                        className="mockup-preview-container"
                        style={{
                          '--preview-primary': generalForm.primaryColor || '#0f766e',
                          '--preview-primary-hover': adjustBrightness(generalForm.primaryColor || '#0f766e', -12),
                          '--preview-primary-light': `rgba(${hexToRgb(generalForm.primaryColor || '#0f766e').r}, ${hexToRgb(generalForm.primaryColor || '#0f766e').g}, ${hexToRgb(generalForm.primaryColor || '#0f766e').b}, 0.1)`,
                        }}
                      >
                        {/* Simulated Mockup Header */}
                        <div className="mockup-header-bar">
                          <div className="mockup-brand-title" style={{ color: 'var(--preview-primary)' }}>
                            🍬 {generalForm.shopName || 'Nguyen Huong Grocery Store'}
                          </div>
                          <div className="mockup-nav-links">
                            <span className="mockup-link active" style={{ color: 'var(--preview-primary)', borderBottomColor: 'var(--preview-primary)' }}>
                              Trang Chủ
                            </span>
                            <span className="mockup-link">Sản Phẩm</span>
                            <span className="mockup-link">Khuyến Mãi</span>
                          </div>
                        </div>

                        {/* Simulated Mockup Content */}
                        <div className="mockup-content-grid">
                          {/* Left Column: Sample Product Card */}
                          <div className="mockup-product-card">
                            <div className="mockup-product-badge" style={{ background: 'var(--preview-primary)', color: '#ffffff' }}>
                              🔥 Bán Chạy Nhất
                            </div>
                            <div className="mockup-product-img">🍭</div>
                            <div className="mockup-product-info">
                              <span className="mockup-prod-cat" style={{ color: 'var(--preview-primary)', background: 'var(--preview-primary-light)' }}>
                                Bánh Kẹo Nhập Khẩu
                              </span>
                              <h6 className="mockup-prod-name">Kẹo Dẻo Trái Cây Marshmallow</h6>
                              <div className="mockup-prod-price-row">
                                <span className="mockup-prod-price" style={{ color: 'var(--preview-primary)' }}>
                                  45.000 ₫
                                </span>
                                <span className="mockup-prod-old-price">65.000 ₫</span>
                              </div>
                              <button
                                type="button"
                                className="mockup-btn-primary"
                                style={{ background: 'var(--preview-primary)', color: '#ffffff' }}
                              >
                                🛒 Thêm Vào Giỏ
                              </button>
                            </div>
                          </div>

                          {/* Right Column: Sample Controls & Badges */}
                          <div className="mockup-controls-col">
                            <div className="mockup-box-group">
                              <span className="mockup-label">Nút Bấm & Liên Kết:</span>
                              <div className="mockup-buttons-row">
                                <button
                                  type="button"
                                  className="mockup-btn-primary"
                                  style={{ background: 'var(--preview-primary)', color: '#ffffff' }}
                                >
                                  Nút Chính
                                </button>
                                <button
                                  type="button"
                                  className="mockup-btn-outline"
                                  style={{
                                    border: '1.5px solid var(--preview-primary)',
                                    color: 'var(--preview-primary)',
                                    background: 'var(--preview-primary-light)',
                                  }}
                                >
                                  Nút Phụ Viền
                                </button>
                              </div>
                            </div>

                            <div className="mockup-box-group">
                              <span className="mockup-label">Huy Hiệu Giảm Giá & Thông Báo:</span>
                              <div className="mockup-badges-row">
                                <span className="mockup-pill" style={{ background: 'var(--preview-primary-light)', color: 'var(--preview-primary)', border: '1px solid var(--preview-primary)' }}>
                                  🏷️ FREESHIP 0Đ
                                </span>
                                <span className="mockup-pill" style={{ background: 'var(--preview-primary)', color: '#ffffff' }}>
                                  ⚡ VOUCHER 30K
                                </span>
                              </div>
                            </div>

                            <div className="mockup-box-group">
                              <span className="mockup-label">Ô Tìm Kiếm Có Focus Highlight:</span>
                              <div className="mockup-input-wrap">
                                <input
                                  type="text"
                                  className="mockup-search-input"
                                  placeholder="Tìm kiếm kẹo dẻo, sô cô la..."
                                  readOnly
                                  style={{ borderColor: 'var(--preview-primary)', boxShadow: `0 0 0 3px var(--preview-primary-light)` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="setting-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          const defaultApp = {
                            primaryColor: '#0f766e',
                            shopBackgroundPattern: 'DEFAULT',
                            shopBackgroundImageUrl: '',
                            shopBackgroundOpacity: 15,
                          };
                          setGeneralForm((prev) => ({ ...prev, ...defaultApp }));
                          if (liveStorePreview) {
                            if (setPreviewColor) setPreviewColor(defaultApp.primaryColor);
                            if (setPreviewBackground) {
                              setPreviewBackground({
                                pattern: defaultApp.shopBackgroundPattern,
                                imageUrl: defaultApp.shopBackgroundImageUrl,
                                opacity: defaultApp.shopBackgroundOpacity,
                              });
                            }
                          }
                          if (showToast) showToast('Đã đặt lại giao diện mặc định!', 'info');
                        }}
                      >
                        🔄 Khôi Phục Mặc Định
                      </button>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="submit"
                          className="btn btn-primary btn-save-settings"
                          disabled={saving}
                          style={{
                            background: generalForm.primaryColor || '#0f766e',
                            borderColor: generalForm.primaryColor || '#0f766e',
                            padding: '0.75rem 1.75rem',
                            fontWeight: 700,
                            boxShadow: `0 4px 12px rgba(${hexToRgb(generalForm.primaryColor || '#0f766e').r}, ${hexToRgb(generalForm.primaryColor || '#0f766e').g}, ${hexToRgb(generalForm.primaryColor || '#0f766e').b}, 0.25)`,
                          }}
                        >
                          {saving ? '⏳ Đang lưu...' : '💾 Lưu Cấu Hình Giao Diện & Màu Sắc'}
                        </button>
                      </div>
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
