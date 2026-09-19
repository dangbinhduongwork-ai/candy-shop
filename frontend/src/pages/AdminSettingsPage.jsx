import React, { useState, useEffect } from 'react';
import AdminNavTabs from '../components/AdminNavTabs';
import { useCart } from '../context/CartContext';
import settingService from '../api/settingService';

const AdminSettingsPage = () => {
  const { showToast } = useCart();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shippingForm, setShippingForm] = useState({
    defaultShippingFee: 25000,
    freeShippingThreshold: 300000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingService.getAdminShippingSetting();
      if (data) {
        setShippingForm({
          defaultShippingFee: data.defaultShippingFee !== undefined ? Number(data.defaultShippingFee) : 25000,
          freeShippingThreshold: data.freeShippingThreshold !== undefined ? Number(data.freeShippingThreshold) : 300000,
        });
      }
    } catch (err) {
      console.error('Lỗi khi tải cấu hình:', err);
      if (showToast) showToast('Không thể tải cấu hình cửa hàng!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingForm((prev) => ({
      ...prev,
      [name]: value === '' ? '' : Math.max(0, Number(value)),
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
            <span className="admin-subtitle">Quản lý các thông số vận hành hệ thống, phí giao hàng và chính sách bán hàng</span>
            <h1 className="admin-title">Cài Đặt Cửa Hàng</h1>
          </div>
        </div>

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
          <p>Đang tải cấu hình...</p>
        </div>
      ) : (
        <div className="settings-grid">
          {/* Shipping Configuration Card */}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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

          {/* System Info / Extensibility Note */}
          <div className="setting-card">
            <div className="setting-card-header">
              <div className="setting-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                ℹ️
              </div>
              <div>
                <h3 className="setting-card-title">Thông Tin Hệ Thống</h3>
                <p className="setting-card-desc">Cơ chế lưu trữ cấu hình động dạng Key-Value</p>
              </div>
            </div>

            <div className="system-info-content">
              <div className="info-badge-item">
                <span className="info-key">Bảng lưu trữ:</span>
                <span className="info-val"><code>shop_settings</code> (Key-Value)</span>
              </div>
              <div className="info-badge-item">
                <span className="info-key">Key Phí Ship:</span>
                <span className="info-val"><code>DEFAULT_SHIPPING_FEE</code></span>
              </div>
              <div className="info-badge-item">
                <span className="info-key">Key Ngưỡng FreeShip:</span>
                <span className="info-val"><code>FREE_SHIPPING_THRESHOLD</code></span>
              </div>
              <div className="info-badge-item">
                <span className="info-key">Cơ chế bảo vệ:</span>
                <span className="info-val">Backend tự động tính lại phí ship khi tạo đơn (không tin cậy frontend)</span>
              </div>

              <div className="alert-box-info" style={{ marginTop: '1.25rem' }}>
                <p>
                  🚀 <strong>Kiến trúc mở rộng:</strong> Hệ thống cho phép bổ sung thêm các cấu hình khác (Banner, Hotline, Email thông báo, Slogan...) một cách độc lập mà không cần thay đổi cấu trúc bảng CSDL.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
