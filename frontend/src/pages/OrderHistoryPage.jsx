import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserOrders } from '../api/orderService';
import OrderReviewModal from '../components/OrderReviewModal';

export const getStatusBadgeInfo = (status) => {
  switch (status) {
    case 'PENDING':
      return { label: '⏳ Chờ xác nhận', className: 'status-badge-pending' };
    case 'CONFIRMED':
      return { label: '✅ Đã xác nhận', className: 'status-badge-confirmed' };
    case 'SHIPPING':
      return { label: '🚚 Đang giao hàng', className: 'status-badge-shipping' };
    case 'COMPLETED':
      return { label: '🎉 Hoàn thành', className: 'status-badge-completed' };
    case 'CANCELLED':
      return { label: '❌ Đã huỷ', className: 'status-badge-cancelled' };
    default:
      return { label: status, className: 'status-badge-default' };
  }
};

const OrderHistoryPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Review modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchOrders = async (pageNum = 0) => {
    setLoading(true);
    setError('');
    try {
      const data = await getUserOrders({ page: pageNum, size: 8 });
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.number);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(page);
    }
  }, [isAuthenticated, page]);

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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-container">
          <div className="cart-auth-prompt-card">
            <div className="prompt-icon">🔒</div>
            <h2 className="prompt-title">Vui lòng đăng nhập</h2>
            <p className="prompt-sub">Đăng nhập để xem lịch sử mua bánh kẹo và theo dõi trạng thái đơn hàng của bạn.</p>
            <div className="prompt-btn-group">
              <Link to="/login" className="btn btn-primary">Đăng nhập ngay ✨</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      <div className="orders-container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav">
          <Link to="/" className="breadcrumb-link">🏠 Trang chủ</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">📦 Lịch sử đơn hàng ({totalElements} đơn)</span>
        </nav>

        <div className="orders-header">
          <div>
            <h1 className="orders-main-title">📦 Lịch Sử Đơn Hàng Của Bạn</h1>
            <p className="orders-header-sub">Theo dõi hành trình những món bánh kẹo ngọt ngào đang trên đường tới bạn</p>
          </div>
          <Link to="/" className="btn btn-outline btn-sm">
            ➕ Đặt thêm bánh kẹo
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-grid-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-cart-card">
            <div className="empty-cart-icon">📦</div>
            <h2 className="empty-cart-title">Bạn chưa có đơn hàng nào!</h2>
            <p className="empty-cart-desc">Hãy dạo qua cửa hàng và chọn những món bánh kẹo thơm ngon nhé.</p>
            <Link to="/" className="btn btn-primary btn-explore-sweets">✨ Mua sắm bánh kẹo ngay</Link>
          </div>
        ) : (
          <div className="orders-list-wrapper">
            {orders.map((order) => {
              const statusInfo = getStatusBadgeInfo(order.status);
              const items = order.items || [];
              const totalItemsCount = items.reduce((sum, it) => sum + it.quantity, 0);
              const isCompleted = order.status === 'COMPLETED';

              return (
                <div
                  key={order.id}
                  className="order-card-row"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  {/* Header: Order Code & Date & Status */}
                  <div className="order-row-header">
                    <div className="order-code-group">
                      <span className="order-card-code">{order.orderCode}</span>
                      <span className="order-card-date">🕒 {formatDate(order.createdAt)}</span>
                    </div>
                    <span className={`order-status-badge ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Body: Items Preview & Thumbnails */}
                  <div className="order-row-body">
                    <div className="order-thumbs-strip">
                      {items.slice(0, 4).map((it, idx) => (
                        <div key={idx} className="order-thumb-wrapper" title={`${it.productName} (x${it.quantity})`}>
                          {it.productImageUrl ? (
                            <img src={it.productImageUrl} alt={it.productName} className="order-thumb-img" />
                          ) : (
                            <div className="order-thumb-ph">🍬</div>
                          )}
                          <span className="order-thumb-qty">x{it.quantity}</span>
                        </div>
                      ))}
                      {items.length > 4 && (
                        <div className="order-thumb-more">+{items.length - 4}</div>
                      )}
                    </div>

                    <div className="order-items-summary-text">
                      <p className="order-first-item-name">
                        <strong>{items[0]?.productName}</strong>
                        {items.length > 1 && ` và ${items.length - 1} loại bánh kẹo khác`}
                      </p>
                      <span className="order-items-count-tag">Tổng cộng: {totalItemsCount} cái</span>
                    </div>
                  </div>

                  {/* If Order is COMPLETED: Quick review buttons for each item */}
                  {isCompleted && items.length > 0 && (
                    <div className="order-completed-review-bar" onClick={(e) => e.stopPropagation()}>
                      <span className="order-review-bar-hint">✨ Bạn thấy bánh kẹo thế nào?</span>
                      <div className="order-review-items-buttons">
                        {items.map((it) => (
                          <button
                            key={it.id || it.productId}
                            type="button"
                            className="btn-order-item-review"
                            onClick={() => handleOpenReview(it)}
                          >
                            ⭐ Đánh giá "{it.productName}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer: Receiver & Total & Action */}
                  <div className="order-row-footer">
                    <div className="order-receiver-meta">
                      <span>👤 {order.receiverName} ({order.receiverPhone})</span>
                      <span className="order-addr-meta">📍 {order.shippingAddress}</span>
                    </div>

                    <div className="order-row-action-box">
                      <div className="order-total-price-box">
                        <span className="order-total-label">Tổng tiền:</span>
                        <span className="order-total-val">{formatCurrency(order.totalAmount)}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-view-order-detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.id}`);
                        }}
                      >
                        Chi tiết &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-bar mt-3">
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  &laquo; Trang trước
                </button>
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`page-num-btn ${page === i ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Trang sau &raquo;
                </button>
              </div>
            )}
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
    </div>
  );
};

export default OrderHistoryPage;
