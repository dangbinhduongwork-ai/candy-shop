import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../api/orderService';
import { applyVoucher, getAvailableVouchers } from '../api/voucherService';
import settingService from '../api/settingService';

const CheckoutPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, refreshCart, showToast } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [shippingSettings, setShippingSettings] = useState({
    defaultShippingFee: 25000,
    freeShippingThreshold: 300000,
  });

  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    shippingAddress: '',
    note: '',
  });

  // Voucher states
  const [appliedVoucher, setAppliedVoucher] = useState(location.state?.appliedVoucher || null);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showAvailableModal, setShowAvailableModal] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Fetch shipping settings
  useEffect(() => {
    settingService.getShippingSetting()
      .then((data) => {
        if (data) {
          setShippingSettings({
            defaultShippingFee: Number(data.defaultShippingFee) || 25000,
            freeShippingThreshold: Number(data.freeShippingThreshold) || 300000,
          });
        }
      })
      .catch((err) => console.error('Không thể tải cấu hình vận chuyển:', err));
  }, []);

  // Fetch available vouchers
  useEffect(() => {
    if (isAuthenticated) {
      getAvailableVouchers()
        .then((data) => setAvailableVouchers(data || []))
        .catch((err) => console.error('Failed to load vouchers:', err));
    }
  }, [isAuthenticated]);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        receiverName: prev.receiverName || user.fullName || '',
        receiverPhone: prev.receiverPhone || user.phone || '',
        shippingAddress: prev.shippingAddress || user.address || '',
      }));
    }
  }, [user]);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const handleApplyVoucher = async (codeToApply) => {
    const code = (codeToApply || voucherCodeInput).trim();
    if (!code) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      setVoucherLoading(true);
      setVoucherError('');
      const res = await applyVoucher(code);
      if (res.valid) {
        setAppliedVoucher(res);
        setVoucherCodeInput('');
        setShowAvailableModal(false);
        showToast(res.message || 'Áp dụng mã giảm giá thành công! 🎉', 'success');
      } else {
        setVoucherError(res.message || 'Mã giảm giá không hợp lệ');
        showToast(res.message || 'Mã giảm giá không hợp lệ', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể áp dụng mã giảm giá';
      setVoucherError(msg);
      showToast(msg, 'error');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError('');
    showToast('Đã gỡ mã giảm giá', 'info');
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-container">
          <div className="cart-auth-prompt-card">
            <div className="prompt-icon">🔒</div>
            <h2 className="prompt-title">Vui lòng đăng nhập để thanh toán</h2>
            <p className="prompt-sub">Bạn cần đăng nhập tài khoản để hoàn tất đơn đặt hàng bánh kẹo.</p>
            <div className="prompt-btn-group">
              <Link to="/login" className="btn btn-primary">Đăng nhập ngay ✨</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const defaultShippingFee = Number(shippingSettings.defaultShippingFee) || 25000;
  const freeShippingThreshold = Number(shippingSettings.freeShippingThreshold) || 300000;
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const isFreeShipping = subtotalAfterDiscount >= freeShippingThreshold;
  const shippingAmount = items.length === 0 ? 0 : (isFreeShipping ? 0 : defaultShippingFee);
  const grandTotal = Math.max(0, subtotalAfterDiscount + shippingAmount);

  if (items.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-container">
          <div className="empty-cart-card">
            <div className="empty-cart-icon">🛒</div>
            <h2 className="empty-cart-title">Giỏ hàng của bạn đang trống!</h2>
            <p className="empty-cart-desc">Hãy thêm ít nhất một món bánh kẹo vào giỏ trước khi tiến hành thanh toán nhé.</p>
            <Link to="/" className="btn btn-primary btn-explore-sweets">✨ Khám phá bánh kẹo ngay</Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (!formData.receiverName.trim()) {
      errs.receiverName = 'Vui lòng nhập họ tên người nhận';
    }
    if (!formData.receiverPhone.trim()) {
      errs.receiverPhone = 'Vui lòng nhập số điện thoại người nhận';
    } else {
      // Accept all Vietnamese phone numbers: 03x, 05x, 07x, 08x, 09x (10 digits)
      const phoneRegex = /^0[3-9][0-9]{8}$/;
      if (!phoneRegex.test(formData.receiverPhone.trim())) {
        errs.receiverPhone = 'Số điện thoại không đúng định dạng (VD: 0912345678)';
      }
    }
    if (!formData.shippingAddress.trim()) {
      errs.shippingAddress = 'Vui lòng nhập địa chỉ giao hàng cụ thể';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        receiverName: formData.receiverName.trim(),
        receiverPhone: formData.receiverPhone.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        note: formData.note.trim(),
        paymentMethod: 'COD',
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      });

      // Clear local cart state
      await refreshCart();
      showToast('Đặt hàng thành công! Mã đơn: ' + order.orderCode, 'success');

      // Navigate to order success page
      navigate(`/order-success/${order.id}`, { state: { order } });
    } catch (err) {
      // Show the server's error message (field validation or business rule errors)
      let msg = 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!';
      if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Handle Spring @Valid field errors
        const fieldErrors = err.response.data.errors;
        msg = Object.values(fieldErrors).join(', ');
      } else if (err.response?.data) {
        msg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      }
      setApiError(msg);
      showToast(msg, 'error');
      console.error('Order error:', err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/" className="breadcrumb-link">Trang chủ</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/cart" className="breadcrumb-link">Giỏ hàng</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Thanh toán & Đặt hàng</span>
        </nav>

        <div className="checkout-header">
          <h1 className="checkout-main-title">Thông Tin Giao Hàng & Đặt Mua</h1>
          <p className="checkout-header-sub">Vui lòng kiểm tra địa chỉ nhận hàng và xác nhận đơn hàng của bạn</p>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmitOrder} className="checkout-layout-grid">
          {/* Left: Delivery & Receiver Form */}
          <div className="checkout-form-section">
            <div className="checkout-card">
              <h2 className="checkout-section-title">
                Địa Chỉ Nhận Hàng
              </h2>

              <div>
                <div className="form-group">
                  <label htmlFor="receiverName">
                    Họ và tên người nhận <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="receiverName"
                    name="receiverName"
                    className={`form-input ${errors.receiverName ? 'input-error' : ''}`}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                  />
                  {errors.receiverName && (
                    <span className="error-msg">{errors.receiverName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="receiverPhone">
                    Số điện thoại liên hệ <span className="req">*</span>
                  </label>
                  <input
                    type="tel"
                    id="receiverPhone"
                    name="receiverPhone"
                    className={`form-input ${errors.receiverPhone ? 'input-error' : ''}`}
                    placeholder="Ví dụ: 0912345678"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                  />
                  {errors.receiverPhone && (
                    <span className="error-msg">{errors.receiverPhone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="shippingAddress">
                    Địa chỉ giao hàng chi tiết <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="shippingAddress"
                    name="shippingAddress"
                    className={`form-input ${errors.shippingAddress ? 'input-error' : ''}`}
                    placeholder="Số nhà, tên ngõ/đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                  />
                  {errors.shippingAddress && (
                    <span className="error-msg">{errors.shippingAddress}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="orderNote">Ghi chú cho shipper / tiệm (tùy chọn)</label>
                  <textarea
                    id="orderNote"
                    name="orderNote"
                    rows="3"
                    className="form-textarea"
                    placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi giao, đóng gói cẩn thận..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  ></textarea>
                </div>

                {/* Payment Method */}
                <div className="payment-method-box">
                  <h3 className="payment-title">Phương thức thanh toán</h3>
                  <div className="payment-option-card active">
                    <input type="radio" id="cod" name="paymentMethod" checked readOnly />
                    <label htmlFor="cod" className="payment-option-label">
                      <div className="payment-icon" style={{ display: 'flex', color: '#0f766e' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="5" width="20" height="14" rx="2"/>
                          <line x1="2" y1="10" x2="22" y2="10"/>
                        </svg>
                      </div>
                      <div className="payment-details">
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <p>Bạn chỉ phải thanh toán tiền mặt trực tiếp cho nhân viên giao hàng khi nhận được kiện hàng tận tay.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary-section">
            <div className="order-summary-card">
              <h3 className="summary-title">Đơn Hàng ({items.length} sản phẩm)</h3>

              {/* Items List Preview */}
              <div className="checkout-items-preview-list">
                {items.map((item) => (
                  <div key={item.id} className="checkout-item-preview">
                    <div className="checkout-thumb-box">
                      {item.product?.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="checkout-thumb-img"
                        />
                      ) : (
                        <div className="checkout-thumb-placeholder" style={{ color: '#cbd5e1' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 0 1-8 0"/>
                          </svg>
                        </div>
                      )}
                      <span className="checkout-item-qty-badge">x{item.quantity}</span>
                    </div>

                    <div className="checkout-item-meta">
                      <span className="checkout-item-name">{item.product?.name}</span>
                      <span className="checkout-item-unit">{formatCurrency(item.unitPrice)}</span>
                    </div>

                    <div className="checkout-item-subtotal">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Section */}
              <div
                style={{
                  margin: '1rem 0',
                  padding: '0.85rem',
                  background: 'var(--primary-light)',
                  borderRadius: '8px',
                  border: '1px dashed var(--primary)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-dark)' }}>
                    Mã Giảm Giá
                  </span>
                  {availableVouchers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAvailableModal(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Chọn mã ({availableVouchers.length})
                    </button>
                  )}
                </div>

                {appliedVoucher ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#fff',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            color: 'var(--primary)',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                          }}
                        >
                          {appliedVoucher.code}
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            background: 'var(--primary-light)',
                            color: 'var(--primary-dark)',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          -{formatCurrency(appliedVoucher.discountAmount)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                        {appliedVoucher.message}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      style={{
                        background: '#fee2e2',
                        border: 'none',
                        color: '#ef4444',
                        borderRadius: '6px',
                        padding: '0.3rem 0.55rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      title="Gỡ mã giảm giá"
                    >
                      ✕ Huỷ
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <input
                        type="text"
                        placeholder="Nhập mã (VD: WELCOME10)"
                        value={voucherCodeInput}
                        onChange={(e) => {
                          setVoucherCodeInput(e.target.value.toUpperCase());
                          setVoucherError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyVoucher();
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '0.45rem 0.65rem',
                          borderRadius: '6px',
                          border: '1px solid #f472b6',
                          textTransform: 'uppercase',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher()}
                        disabled={voucherLoading || !voucherCodeInput.trim()}
                        className="btn btn-primary"
                        style={{
                          padding: '0.45rem 0.8rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: '6px',
                        }}
                      >
                        {voucherLoading ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                    {voucherError && (
                      <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.35rem', fontWeight: 600 }}>
                        ⚠️ {voucherError}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="summary-line-rows">
                <div className="summary-line">
                  <span className="summary-line-label">Tạm tính:</span>
                  <span className="summary-line-val">{formatCurrency(subtotal)}</span>
                </div>

                {appliedVoucher && (
                  <div className="summary-line" style={{ color: '#be185d', fontWeight: 600 }}>
                    <span className="summary-line-label">Giảm giá voucher:</span>
                    <span className="summary-line-val">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="summary-line">
                  <span className="summary-line-label">Phí vận chuyển:</span>
                  <span className="summary-line-val">
                    {isFreeShipping ? (
                      <span className="badge-freeship-free">Miễn phí 🎉</span>
                    ) : (
                      formatCurrency(shippingAmount)
                    )}
                  </span>
                </div>

                <div className="summary-divider"></div>

                <div className="summary-total-line">
                  <span className="total-label">Tổng thanh toán:</span>
                  <div className="total-amount-box">
                    <span className="total-amount-val">{formatCurrency(grandTotal)}</span>
                    <span className="total-vat-hint">(Đã bao gồm VAT)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-place-order"
                disabled={submitting}
              >
                {submitting ? '⏳ Đang xử lý đơn hàng...' : '🎉 Thanh Toán & Đặt Hàng Ngay'}
              </button>

              <div className="summary-guarantees">
                <div className="guarantee-badge">
                  <span>🛡️</span> Cam kết bánh kẹo chính hãng, chuẩn vị
                </div>
                <div className="guarantee-badge">
                  <span>🚚</span> Giao hàng tận nơi, kiểm tra trước khi trả tiền
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Available Vouchers Popup Modal */}
      {showAvailableModal && (
        <div className="modal-overlay" onClick={() => setShowAvailableModal(false)}>
          <div
            className="modal-container"
            style={{ maxWidth: '520px', borderRadius: '16px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-header"
              style={{ backgroundColor: '#fdf2f8', borderBottom: '1px solid #fbcfe8' }}
            >
              <h3 className="modal-title" style={{ color: '#831843' }}>
                🎟️ Danh Sách Mã Giảm Giá Có Sẵn
              </h3>
              <button className="modal-close-btn" onClick={() => setShowAvailableModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', padding: '1rem' }}>
              {availableVouchers.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                  Hiện chưa có mã giảm giá công khai nào.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {availableVouchers.map((v) => {
                    const isMinMet = subtotal >= (v.minOrderAmount || 0);
                    return (
                      <div
                        key={v.id}
                        style={{
                          border: isMinMet ? '1px solid #f472b6' : '1px dashed #cbd5e1',
                          backgroundColor: isMinMet ? '#fff' : '#f8fafc',
                          borderRadius: '10px',
                          padding: '0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.75rem',
                          opacity: isMinMet ? 1 : 0.75,
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span
                              style={{
                                backgroundColor: isMinMet ? '#fce7f3' : '#e2e8f0',
                                color: isMinMet ? '#be185d' : '#475569',
                                fontWeight: 800,
                                fontFamily: 'monospace',
                                fontSize: '0.95rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                              }}
                            >
                              {v.code}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                              {v.discountType === 'PERCENTAGE'
                                ? `Giảm ${v.discountValue}% (Tối đa ${formatCurrency(v.maxDiscountAmount || 0)})`
                                : `Giảm ${formatCurrency(v.discountValue)}`}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {v.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isMinMet ? '#15803d' : '#d97706', marginTop: '0.2rem' }}>
                            Đơn tối thiểu: {formatCurrency(v.minOrderAmount || 0)}
                            {!isMinMet && ` (Mua thêm ${formatCurrency((v.minOrderAmount || 0) - subtotal)})`}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={!isMinMet || voucherLoading}
                          onClick={() => handleApplyVoucher(v.code)}
                          className={`btn ${isMinMet ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            padding: '0.4rem 0.85rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            borderRadius: '6px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isMinMet ? 'Dùng mã' : 'Chưa đủ điều kiện'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-actions" style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAvailableModal(false)}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
