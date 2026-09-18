import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getOrderById, cancelOrder } from '../api/orderService';
import { getStatusBadgeInfo } from './OrderHistoryPage';
import OrderReviewModal from '../components/OrderReviewModal';

const OrderDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useCart();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Review modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchOrderDetail();
    }
  }, [isAuthenticated, id]);

  const handleOpenReview = (item) => {
    setSelectedProduct({
      productId: item.productId,
      productName: item.productName,
      productImageUrl: item.productImageUrl,
      priceAtOrder: item.priceAtOrder,
      categoryName: item.categoryName,
    });
    setShowReviewModal(true);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      const updated = await cancelOrder(id);
      setOrder(updated);
      setShowCancelModal(false);
      showToast('❌ Đơn hàng ' + updated.orderCode + ' đã được huỷ thành công. Tồn kho đã được hoàn lại!', 'info');
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể huỷ đơn hàng';
      showToast(msg, 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-container">
          <div className="cart-auth-prompt-card">
            <div className="prompt-icon">🔒</div>
            <h2 className="prompt-title">Vui lòng đăng nhập</h2>
            <p className="prompt-sub">Đăng nhập để xem chi tiết đơn hàng của bạn.</p>
            <div className="prompt-btn-group">
              <Link to="/login" className="btn btn-primary">Đăng nhập ngay ✨</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-container">
          <div className="loading-screen">
            <div className="spinner"></div>
            <p>Đang tải chi tiết đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-container">
          <div className="detail-error-card">
            <div className="error-icon">📦</div>
            <h2>Không tìm thấy đơn hàng!</h2>
            <p>{error || 'Đơn hàng này không tồn tại hoặc bạn không có quyền xem.'}</p>
            <Link to="/orders" className="btn btn-primary mt-2">
              &laquo; Quay về danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusBadgeInfo(order.status);
  const items = order.items || [];
  const isPending = order.status === 'PENDING';
  const isCompleted = order.status === 'COMPLETED';

  return (
    <div className="orders-page-wrapper">
      <div className="orders-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/" className="breadcrumb-link">🏠 Trang chủ</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/orders" className="breadcrumb-link">📦 Lịch sử đơn hàng</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{order.orderCode}</span>
        </nav>

        {/* Top Header Card */}
        <div className="order-detail-header-card">
          <div className="order-title-meta">
            <div className="order-code-row">
              <span className="order-code-badge-lg">{order.orderCode}</span>
              <span className={`order-status-badge ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="order-date-text">
              Thời gian đặt hàng: <strong>{formatDate(order.createdAt)}</strong>
            </p>
          </div>

          {isPending && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => setShowCancelModal(true)}
            >
              🗑️ Huỷ Đơn Hàng Này
            </button>
          )}
        </div>

        {/* Main Grid: Receiver info + Items breakdown */}
        <div className="order-detail-layout">
          {/* Left Column: Receiver & Shipping Info */}
          <div className="order-info-left">
            <div className="order-section-card">
              <h3 className="section-sub-title">📍 Thông Tin Người Nhận</h3>
              <div className="info-key-val-grid">
                <div className="info-kv-row">
                  <span className="info-label">Người nhận:</span>
                  <span className="info-value font-bold">{order.receiverName}</span>
                </div>
                <div className="info-kv-row">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{order.receiverPhone}</span>
                </div>
                <div className="info-kv-row">
                  <span className="info-label">Địa chỉ giao:</span>
                  <span className="info-value">{order.shippingAddress}</span>
                </div>
                {order.note && (
                  <div className="info-kv-row">
                    <span className="info-label">Ghi chú:</span>
                    <span className="info-value italic">"{order.note}"</span>
                  </div>
                )}
                <div className="info-kv-row">
                  <span className="info-label">Phương thức:</span>
                  <span className="info-value payment-tag">💵 Thanh toán khi nhận hàng (COD)</span>
                </div>
              </div>
            </div>

            {/* Order Status Guide */}
            <div className="order-section-card status-guide-card">
              <h3 className="section-sub-title">💡 Trạng Thái Đơn Hàng</h3>
              <div className="status-timeline">
                <div className={`timeline-step ${order.status !== 'CANCELLED' ? 'active' : ''}`}>
                  <div className="timeline-dot">1</div>
                  <div className="timeline-content">
                    <strong>Chờ xác nhận</strong>
                    <p>Tiệm đang kiểm tra giỏ kẹo của bạn</p>
                  </div>
                </div>

                <div className={`timeline-step ${['CONFIRMED', 'SHIPPING', 'COMPLETED'].includes(order.status) ? 'active' : ''}`}>
                  <div className="timeline-dot">2</div>
                  <div className="timeline-content">
                    <strong>Đã xác nhận</strong>
                    <p>Đang đóng gói bánh kẹo cẩn thận</p>
                  </div>
                </div>

                <div className={`timeline-step ${['SHIPPING', 'COMPLETED'].includes(order.status) ? 'active' : ''}`}>
                  <div className="timeline-dot">3</div>
                  <div className="timeline-content">
                    <strong>Đang giao hàng</strong>
                    <p>Shipper đang trên đường tới bạn</p>
                  </div>
                </div>

                <div className={`timeline-step ${order.status === 'COMPLETED' ? 'active' : ''}`}>
                  <div className="timeline-dot">4</div>
                  <div className="timeline-content">
                    <strong>Hoàn thành</strong>
                    <p>Chúc bạn thưởng thức bánh kẹo ngon miệng!</p>
                  </div>
                </div>
              </div>

              {order.status === 'CANCELLED' && (
                <div className="alert alert-error mt-2">
                  ❌ Đơn hàng này đã bị huỷ. Số lượng sản phẩm đã được tự động hoàn lại vào kho.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Ordered Items & Cost Summary */}
          <div className="order-info-right">
            <div className="order-section-card">
              <h3 className="section-sub-title">🍬 Danh Sách Bánh Kẹo Đã Đặt ({items.length} món)</h3>

              <div className="ordered-items-table">
                {items.map((item) => (
                  <div key={item.id} className="ordered-item-row">
                    <div className="ordered-thumb-box">
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} className="ordered-thumb-img" />
                      ) : (
                        <div className="ordered-thumb-ph">🍬</div>
                      )}
                    </div>

                    <div className="ordered-item-meta">
                      {item.categoryName && (
                        <span className="ordered-cat-tag">{item.categoryName}</span>
                      )}
                      <h4 className="ordered-item-name">{item.productName}</h4>
                      <div className="ordered-price-line">
                        <span className="ordered-unit-price">
                          Đơn giá lúc đặt: <strong>{formatCurrency(item.priceAtOrder)}</strong>
                        </span>
                        <span className="ordered-qty-tag">x{item.quantity}</span>
                      </div>
                      {isCompleted && (
                        <div className="ordered-item-review-action mt-2">
                          <button
                            type="button"
                            className="btn btn-order-item-review-sm"
                            onClick={() => handleOpenReview(item)}
                          >
                            ⭐ Đánh giá sản phẩm này
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="ordered-item-subtotal">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div className="order-cost-breakdown">
                <div className="cost-row">
                  <span>Tạm tính ({items.reduce((s, it) => s + it.quantity, 0)} sản phẩm):</span>
                  <span>
                    {formatCurrency(
                      items.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0)
                    )}
                  </span>
                </div>
                {order.voucherCode && (
                  <div className="cost-row" style={{ color: '#be185d', fontWeight: 600 }}>
                    <span>
                      🎟️ Giảm giá Voucher (<span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{order.voucherCode}</span>):
                    </span>
                    <span>-{formatCurrency(order.discountAmount || 0)}</span>
                  </div>
                )}
                <div className="cost-row">
                  <span>Phí vận chuyển:</span>
                  <span>
                    {Number(order.shippingFee) > 0 ? (
                      formatCurrency(order.shippingFee)
                    ) : (
                      <span className="badge-freeship-free">Miễn phí 🎉</span>
                    )}
                  </span>
                </div>
                <div className="cost-divider"></div>
                <div className="cost-row grand-total-row">
                  <span className="grand-label">Tổng thanh toán:</span>
                  <span className="grand-price">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="order-detail-footer-back">
          <Link to="/orders" className="btn btn-outline">
            &laquo; Quay lại Lịch sử đơn hàng
          </Link>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title text-danger">⚠️ Huỷ Đơn Hàng</h3>
              <button className="modal-close-btn" onClick={() => setShowCancelModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn huỷ đơn hàng <strong>{order.orderCode}</strong> không?</p>
              <p className="text-muted mt-1" style={{ fontSize: '0.88rem' }}>
                Hệ thống sẽ tự động hoàn lại số lượng sản phẩm vào kho hàng. Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Không, giữ đơn
              </button>
              <button
                type="button"
                className="btn btn-primary bg-danger"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? '⏳ Đang huỷ...' : 'Xác nhận huỷ đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Review Modal */}
      <OrderReviewModal
        product={selectedProduct}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedProduct(null);
        }}
        onReviewSuccess={() => {
          // Optional callback
        }}
      />
    </div>
  );
};

export default OrderDetailPage;
