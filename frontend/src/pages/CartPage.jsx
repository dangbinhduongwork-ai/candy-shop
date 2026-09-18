import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { applyVoucher, getAvailableVouchers } from '../api/voucherService';
import settingService from '../api/settingService';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { cart, loading, updateQuantity, removeItem, clearCart, showToast } = useCart();
  const navigate = useNavigate();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Dynamic Shipping Setting
  const [shippingSettings, setShippingSettings] = useState({
    defaultShippingFee: 25000,
    freeShippingThreshold: 300000,
  });

  // Voucher states
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showAvailableModal, setShowAvailableModal] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated) {
      getAvailableVouchers()
        .then((data) => setAvailableVouchers(data || []))
        .catch((err) => console.error('Failed to load vouchers:', err));
    }
  }, [isAuthenticated]);

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

  // If user is not logged in
  if (!isAuthenticated) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-container">
          <div className="cart-auth-prompt-card">
            <div className="prompt-icon">🔒</div>
            <h2 className="prompt-title">Vui lòng đăng nhập để xem giỏ hàng</h2>
            <p className="prompt-sub">
              Đăng nhập tài khoản của bạn để quản lý các món bánh kẹo đã chọn và nhận nhiều ưu đãi ngọt ngào!
            </p>
            <div className="prompt-btn-group">
              <Link to="/login" className="btn btn-primary">
                Đăng nhập ngay ✨
              </Link>
              <Link to="/register" className="btn btn-outline">
                Tạo tài khoản mới
              </Link>
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
  const freeShipRemaining = Math.max(0, freeShippingThreshold - subtotalAfterDiscount);
  const freeShipPercent = Math.min(100, (subtotalAfterDiscount / freeShippingThreshold) * 100);

  const handleCheckoutClick = () => {
    navigate('/checkout', { state: { appliedVoucher } });
  };

  return (
    <div className="cart-page-wrapper">
      <div className="cart-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/" className="breadcrumb-link">🏠 Trang chủ</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">🛒 Giỏ hàng ({cart?.totalItems || 0} sản phẩm)</span>
        </nav>

        {/* Main Title Header */}
        <div className="cart-page-header">
          <div>
            <h1 className="cart-main-title">🍬 Giỏ Hàng Ngọt Ngào Của Bạn</h1>
            <p className="cart-header-sub">Kiểm tra lại danh sách bánh kẹo và tiến hành đặt hàng</p>
          </div>

          {items.length > 0 && (
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => setShowClearConfirm(true)}
            >
              🗑️ Xóa toàn bộ giỏ
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-grid-state">
            <div className="spinner"></div>
            <p>Đang tải giỏ hàng của bạn...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart View */
          <div className="empty-cart-card">
            <div className="empty-cart-icon">🛒</div>
            <h2 className="empty-cart-title">Giỏ hàng của bạn đang trống trơn!</h2>
            <p className="empty-cart-desc">
              Chưa có món bánh kẹo nào trong giỏ. Hãy dạo quanh một vòng và chọn những hương vị ngọt ngào yêu thích nhé!
            </p>
            <Link to="/" className="btn btn-primary btn-explore-sweets">
              ✨ Khám phá bánh kẹo thơm ngon ngay
            </Link>
          </div>
        ) : (
          /* Cart Content Layout: Items Grid + Order Summary */
          <div className="cart-content-layout">
            {/* Left: Cart Items List */}
            <div className="cart-items-section">
              {/* Free shipping progress bar */}
              <div className="freeship-banner">
                <div className="freeship-header">
                  <span className="freeship-icon">🚚</span>
                  {isFreeShipping ? (
                    <span className="freeship-text-success">
                      🎉 <strong>Chúc mừng!</strong> Bạn đã được <strong>Miễn phí vận chuyển</strong> toàn quốc!
                    </span>
                  ) : (
                    <span className="freeship-text-info">
                      Mua thêm <strong>{formatCurrency(freeShipRemaining)}</strong> để được <strong>Freeship</strong> đơn hàng!
                    </span>
                  )}
                </div>
                <div className="freeship-progress-track">
                  <div
                    className="freeship-progress-fill"
                    style={{ width: `${freeShipPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Items List */}
              <div className="cart-items-card">
                {items.map((item) => {
                  const product = item.product;
                  const maxStock = product?.stockQuantity || 999;

                  return (
                    <div key={item.id} className="cart-item-row">
                      {/* Product Thumbnail */}
                      <Link to={`/products/${product.id}`} className="cart-item-thumb-link">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="cart-item-thumb-img"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="cart-item-thumb-placeholder">🍬</div>
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="cart-item-details">
                        <span className="cart-item-cat-badge">{product.category?.name}</span>
                        <Link to={`/products/${product.id}`} className="cart-item-title">
                          {product.name}
                        </Link>
                        <div className="cart-item-unit-price">
                          Đơn giá: <strong>{formatCurrency(item.unitPrice)}</strong>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div className="cart-item-qty-cell">
                        <div className="cart-qty-controller">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            disabled={item.quantity <= 1}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            title="Giảm 1"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="cart-qty-input"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!isNaN(val) && val >= 1 && val <= maxStock) {
                                updateQuantity(item.id, val);
                              }
                            }}
                            min="1"
                            max={maxStock}
                          />
                          <button
                            type="button"
                            className="cart-qty-btn"
                            disabled={item.quantity >= maxStock}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            title="Tăng 1"
                          >
                            +
                          </button>
                        </div>
                        {item.quantity >= maxStock && (
                          <span className="cart-stock-warn">Tối đa ({maxStock})</span>
                        )}
                      </div>

                      {/* Subtotal */}
                      <div className="cart-item-subtotal-cell">
                        <span className="subtotal-label">Thành tiền:</span>
                        <span className="subtotal-value">{formatCurrency(item.subtotal)}</span>
                      </div>

                      {/* Delete Button */}
                      <div className="cart-item-delete-cell">
                        <button
                          type="button"
                          className="btn-delete-cart-item"
                          onClick={() => removeItem(item.id, product.name)}
                          title="Xóa sản phẩm này"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping Link */}
              <div className="cart-bottom-actions">
                <Link to="/" className="btn btn-outline">
                  &laquo; Tiếp tục chọn thêm bánh kẹo
                </Link>
              </div>
            </div>

            {/* Right: Order Summary Card */}
            <div className="cart-summary-section">
              <div className="order-summary-card">
                <h3 className="summary-title">📋 Tóm Tắt Đơn Hàng</h3>

                <div className="summary-line-rows">
                  <div className="summary-line">
                    <span className="summary-line-label">Tổng số lượng:</span>
                    <span className="summary-line-val"><strong>{cart?.totalItems || 0}</strong> cái</span>
                  </div>

                  <div className="summary-line">
                    <span className="summary-line-label">Tạm tính:</span>
                    <span className="summary-line-val">{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Voucher Section */}
                  <div
                    style={{
                      margin: '0.85rem 0',
                      padding: '0.85rem',
                      background: '#fdf2f8',
                      borderRadius: '10px',
                      border: '1px dashed #f472b6',
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
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#831843' }}>
                        🎟️ Mã Giảm Giá
                      </span>
                      {availableVouchers.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowAvailableModal(true)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#db2777',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          Chọn mã ({availableVouchers.length}) 🎁
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
                          borderRadius: '8px',
                          border: '1px solid #fbcfe8',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span
                              style={{
                                fontWeight: 800,
                                color: '#be185d',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                              }}
                            >
                              {appliedVoucher.code}
                            </span>
                            <span
                              style={{
                                fontSize: '0.78rem',
                                background: '#fce7f3',
                                color: '#be185d',
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

                  {/* Discount Line */}
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
                  type="button"
                  className="btn btn-primary btn-checkout-sweet"
                  onClick={handleCheckoutClick}
                >
                  💳 Tiến Hành Đặt Hàng Ngay
                </button>

                <div className="summary-guarantees">
                  <div className="guarantee-badge">
                    <span>🔒</span> Thanh toán an toàn 100%
                  </div>
                  <div className="guarantee-badge">
                    <span>🍬</span> Bánh kẹo chuẩn vị tươi ngon
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title text-danger">⚠️ Xóa toàn bộ giỏ hàng</h3>
              <button className="modal-close-btn" onClick={() => setShowClearConfirm(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng không?</p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowClearConfirm(false)}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary bg-danger"
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
              >
                Xác nhận xóa hết
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Placeholder Modal */}
      {checkoutModalOpen && (
        <div className="modal-overlay" onClick={() => setCheckoutModalOpen(false)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🎉 Đặt hàng bánh kẹo</h3>
              <button className="modal-close-btn" onClick={() => setCheckoutModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body text-center">
              <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎁</div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
                Đơn hàng trị giá <strong>{formatCurrency(grandTotal)}</strong>
              </h4>
              <p style={{ color: 'var(--text-medium)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Cảm ơn bạn đã lựa chọn Nguyen Huong Grocery Store! Chức năng thanh toán trực tuyến & chọn địa chỉ giao hàng sẽ sớm có mặt ở phiên bản tiếp theo.
              </p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCheckoutModalOpen(false)}
              >
                Đồng ý & Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      )}
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

export default CartPage;
