import React, { useState } from 'react';

/**
 * Helper to get Vietnamese label and badge styling for OrderStatus
 */
export const getStatusMeta = (status) => {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Chờ xác nhận',
        icon: '⏳',
        colorClass: 'status-pending',
        desc: 'Đơn hàng mới tạo, đang chờ xử lý',
      };
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        icon: '📋',
        colorClass: 'status-confirmed',
        desc: 'Đã duyệt đơn và chuẩn bị hàng',
      };
    case 'SHIPPING':
      return {
        label: 'Đang giao hàng',
        icon: '🚚',
        colorClass: 'status-shipping',
        desc: 'Đang trên đường vận chuyển tới khách hàng',
      };
    case 'COMPLETED':
      return {
        label: 'Đã giao thành công',
        icon: '✅',
        colorClass: 'status-completed',
        desc: 'Khách hàng đã nhận hàng và thanh toán',
      };
    case 'CANCELLED':
      return {
        label: 'Đã huỷ',
        icon: '🚫',
        colorClass: 'status-cancelled',
        desc: 'Đơn đã huỷ và đã hoàn kho',
      };
    default:
      return {
        label: status || 'Không rõ',
        icon: '❓',
        colorClass: 'status-unknown',
        desc: '',
      };
  }
};

/**
 * Returns allowed next statuses for admin transition
 */
export const getAllowedNextStatuses = (currentStatus) => {
  switch (currentStatus) {
    case 'PENDING':
      return [
        { value: 'CONFIRMED', label: '📋 Xác nhận đơn (CONFIRMED)' },
        { value: 'CANCELLED', label: '🚫 Huỷ đơn hàng (CANCELLED) — Tự hoàn kho' },
      ];
    case 'CONFIRMED':
      return [
        { value: 'SHIPPING', label: '🚚 Bắt đầu giao hàng (SHIPPING)' },
        { value: 'CANCELLED', label: '🚫 Huỷ đơn hàng (CANCELLED) — Tự hoàn kho' },
      ];
    case 'SHIPPING':
      return [
        { value: 'COMPLETED', label: '✅ Hoàn thành giao hàng (COMPLETED)' },
      ];
    case 'COMPLETED':
    case 'CANCELLED':
    default:
      return [];
  }
};

const AdminOrderDetailModal = ({
  isOpen,
  onClose,
  order,
  onStatusUpdate,
  isUpdating,
}) => {
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');

  if (!isOpen || !order) return null;

  const currentMeta = getStatusMeta(order.status);
  const allowedNext = getAllowedNextStatuses(order.status);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartStatusChange = () => {
    setActionError('');
    setModalSuccessMsg('');
    if (!selectedNextStatus) {
      setActionError('Vui lòng chọn trạng thái tiếp theo');
      return;
    }
    setShowConfirm(true);
  };

  const handleExecuteStatusChange = async () => {
    try {
      setActionError('');
      const targetLabel = getStatusMeta(selectedNextStatus).label;
      await onStatusUpdate(order.id, selectedNextStatus);
      setModalSuccessMsg(`Cập nhật trạng thái đơn hàng thành "${targetLabel}" thành công! 🎉`);
      setShowConfirm(false);
      setSelectedNextStatus('');
      setTimeout(() => {
        setModalSuccessMsg('');
      }, 5000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn hàng');
      setShowConfirm(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container modal-admin-order"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="admin-order-modal-title-wrap">
            <span className="order-badge-title">CHI TIẾT ĐƠN HÀNG</span>
            <h2 className="modal-title">
              Đơn hàng <span className="highlight-code">{order.orderCode}</span>
            </h2>
            <div className="order-meta-dates">
              <span>📅 Ngày đặt: {formatDateTime(order.createdAt)}</span>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <span> • Cập nhật lần cuối: {formatDateTime(order.updatedAt)}</span>
              )}
            </div>
          </div>

          <div className="modal-header-actions">
            <span className={`status-badge-lg ${currentMeta.colorClass}`}>
              <span className="badge-icon">{currentMeta.icon}</span>
              {currentMeta.label}
            </span>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              title="Đóng cửa sổ"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body admin-order-body">
          {modalSuccessMsg && (
            <div className="alert alert-success toast-animation mb-3" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
              {modalSuccessMsg}
            </div>
          )}

          {actionError && (
            <div className="alert alert-error mb-3">
              ⚠️ {actionError}
            </div>
          )}

          {/* Customer & Shipping Details Grid */}
          <div className="admin-order-grid">
            <div className="admin-info-card">
              <h4 className="info-card-heading">👤 Thông tin người nhận</h4>
              <div className="info-card-content">
                <div className="info-row">
                  <span className="info-label">Họ tên:</span>
                  <strong className="info-value">{order.receiverName}</strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Số điện thoại:</span>
                  <strong className="info-value highlight-phone">{order.receiverPhone}</strong>
                </div>
                <div className="info-row">
                  <span className="info-label">Email tài khoản:</span>
                  <span className="info-value">{order.userEmail || '—'}</span>
                </div>
              </div>
            </div>

            <div className="admin-info-card">
              <h4 className="info-card-heading">📍 Giao hàng & Thanh toán</h4>
              <div className="info-card-content">
                <div className="info-row">
                  <span className="info-label">Địa chỉ nhận:</span>
                  <span className="info-value">{order.shippingAddress}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Hình thức:</span>
                  <span className="info-value font-semibold">
                    {order.paymentMethod === 'COD' ? '💵 Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Ghi chú:</span>
                  <span className="info-value text-muted italic">
                    {order.note ? `"${order.note}"` : 'Không có ghi chú'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="admin-order-items-wrap">
            <h4 className="section-subheading">🍬 Danh sách sản phẩm trong đơn ({order.items?.length || 0} món)</h4>
            <div className="table-responsive">
              <table className="admin-items-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th className="text-right">Đơn giá lúc đặt</th>
                    <th className="text-center">Số lượng</th>
                    <th className="text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="item-cell-product">
                          <div className="item-cell-thumb">
                            {item.productImageUrl ? (
                              <img
                                src={item.productImageUrl}
                                alt={item.productName}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><text y="16" font-size="14">🍬</text></svg>';
                                }}
                              />
                            ) : (
                              <span>🍬</span>
                            )}
                          </div>
                          <div>
                            <strong className="item-product-name">{item.productName}</strong>
                            <div className="item-product-id">Mã SP: #{item.productId}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag-sm">{item.categoryName || 'Bánh kẹo'}</span>
                      </td>
                      <td className="text-right font-medium">
                        {formatCurrency(item.priceAtOrder)}
                      </td>
                      <td className="text-center">
                        <span className="item-qty-badge">x{item.quantity}</span>
                      </td>
                      <td className="text-right font-bold text-primary">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Order Summary */}
            <div className="admin-order-summary-box">
              <div className="summary-line">
                <span>Tạm tính hàng hóa:</span>
                <span>
                  {formatCurrency(
                    order.items?.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0) || 0
                  )}
                </span>
              </div>
              {order.voucherCode && (
                <div className="summary-line" style={{ color: '#be185d', fontWeight: 600 }}>
                  <span>
                    🎟️ Voucher (<span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{order.voucherCode}</span>):
                  </span>
                  <span>-{formatCurrency(order.discountAmount || 0)}</span>
                </div>
              )}
              <div className="summary-line">
                <span>Phí vận chuyển:</span>
                <span>
                  {Number(order.shippingFee) > 0 ? (
                    formatCurrency(order.shippingFee)
                  ) : (
                    <span className="text-free-ship">Miễn phí 🎁</span>
                  )}
                </span>
              </div>
              <div className="summary-line-total">
                <strong>Tổng cộng thanh toán:</strong>
                <span className="total-grand-price">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Order Status Transition Section */}
          <div className="admin-order-status-management">
            <h4 className="section-subheading">⚡ Quản lý & Cập nhật trạng thái</h4>

            {modalSuccessMsg && (
              <div className="alert alert-success toast-animation mb-3" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                {modalSuccessMsg}
              </div>
            )}
            
            {allowedNext.length > 0 ? (
              <div className="status-action-control">
                <div className="status-select-group">
                  <label className="status-select-label">Chuyển sang trạng thái tiếp theo:</label>
                  <select
                    className="form-select status-select-dropdown"
                    value={selectedNextStatus}
                    onChange={(e) => setSelectedNextStatus(e.target.value)}
                    disabled={isUpdating}
                  >
                    <option value="">-- Chọn trạng thái mới --</option>
                    {allowedNext.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-update-status"
                  disabled={!selectedNextStatus || isUpdating}
                  onClick={handleStartStatusChange}
                >
                  {isUpdating ? 'Đang cập nhật...' : '🚀 Cập nhật trạng thái'}
                </button>
              </div>
            ) : (
              <div className={`status-terminal-notice ${order.status === 'COMPLETED' ? 'notice-completed' : 'notice-cancelled'}`}>
                {order.status === 'COMPLETED' ? (
                  <span>🎉 <strong>Đơn hàng đã hoàn thành!</strong> Không thể chuyển trạng thái khác.</span>
                ) : (
                  <span>🚫 <strong>Đơn hàng đã bị huỷ!</strong> Số lượng tồn kho đã được hoàn lại.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        {/* Confirmation Sub-Modal / Overlay */}
        {showConfirm && (
          <div className="confirm-modal-overlay" onClick={() => setShowConfirm(false)}>
            <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-modal-header">
                <h3 className="confirm-title">⚠️ Xác nhận đổi trạng thái</h3>
              </div>
              <div className="confirm-modal-body">
                <p>
                  Bạn có chắc chắn muốn chuyển đơn hàng <strong>#{order.orderCode}</strong> từ:
                </p>
                <div className="confirm-status-flow">
                  <span className={`status-badge-sm ${currentMeta.colorClass}`}>
                    {currentMeta.icon} {currentMeta.label}
                  </span>
                  <span className="arrow-flow">➔</span>
                  <span className={`status-badge-sm ${getStatusMeta(selectedNextStatus).colorClass}`}>
                    {getStatusMeta(selectedNextStatus).icon} {getStatusMeta(selectedNextStatus).label}
                  </span>
                </div>

                {selectedNextStatus === 'CANCELLED' && (
                  <div className="alert-box-warning">
                    ⚠️ <strong>Lưu ý:</strong> Khi chuyển sang ĐÃ HUỶ, hệ thống sẽ tự động hoàn trả lại số lượng tồn kho cho các sản phẩm trong đơn này.
                  </div>
                )}
              </div>
              <div className="confirm-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowConfirm(false)}
                  disabled={isUpdating}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className={`btn btn-primary ${selectedNextStatus === 'CANCELLED' ? 'bg-danger' : ''}`}
                  onClick={handleExecuteStatusChange}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Đang thực hiện...' : 'Đồng ý cập nhật'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrderDetailModal;
