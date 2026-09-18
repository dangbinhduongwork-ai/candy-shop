import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { getOrderById } from '../api/orderService';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const data = await getOrderById(id);
          setOrder(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Không thể tải thông tin đơn hàng');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="order-success-card">
        <div className="success-confetti-icon">🎉</div>
        <span className="success-tag">Đặt Hàng Thành Công!</span>
        <h1 className="success-title">Cảm Ơn Bạn Đã Mua Sắm Tại Nguyen Huong Grocery Store</h1>
        <p className="success-subtitle">
          Đơn hàng của bạn đã được ghi nhận vào hệ thống và đang được chuẩn bị để đóng gói những viên kẹo thơm ngon nhất.
        </p>

        {order && (
          <div className="order-meta-receipt">
            <div className="receipt-row">
              <span className="receipt-label">Mã đơn hàng:</span>
              <span className="receipt-val order-code-badge">{order.orderCode}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Người nhận:</span>
              <span className="receipt-val">{order.receiverName} ({order.receiverPhone})</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Địa chỉ giao:</span>
              <span className="receipt-val">{order.shippingAddress}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-label">Phương thức:</span>
              <span className="receipt-val">Thanh toán khi nhận hàng (COD)</span>
            </div>
            <div className="receipt-row total-row">
              <span className="receipt-label">Tổng thanh toán:</span>
              <span className="receipt-val receipt-total">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        )}

        <div className="success-delivery-hint">
          <span>🚚</span>
          <p>Shipper sẽ liên hệ qua số điện thoại của bạn trước khi giao hàng. Hãy giữ điện thoại nhé!</p>
        </div>

        <div className="success-actions-group">
          {order && (
            <Link to={`/orders/${order.id}`} className="btn btn-primary">
              📋 Xem Chi Tiết Đơn Hàng
            </Link>
          )}
          <Link to="/" className="btn btn-outline">
            🍬 Tiếp Tục Mua Bánh Kẹo
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
