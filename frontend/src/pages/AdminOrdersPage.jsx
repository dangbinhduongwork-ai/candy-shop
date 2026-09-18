import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getAdminOrders,
  getAdminOrderStats,
  getAdminOrderDetail,
  updateOrderStatus,
} from '../api/adminOrderService';
import AdminOrderDetailModal, { getStatusMeta } from '../components/AdminOrderDetailModal';

/**
 * AdminOrdersPage — Order management dashboard for administrators.
 * Includes dashboard overview stats cards, filter bar, order listing table,
 * and order status transition modal.
 */
const AdminOrdersPage = () => {
  // Stats state
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    countByStatus: {
      PENDING: 0,
      CONFIRMED: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    },
    lowStockCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Orders list state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filtering & Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await getAdminOrderStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading admin order stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch orders with current filters
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminOrders({
        page,
        size: pageSize,
        status: filterStatus || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchKeyword || undefined,
      });

      setOrders(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterStatus, startDate, endDate, searchKeyword]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast('');
    }, 4500);
  };

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(searchInput.trim());
    setPage(0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('');
    setSearchKeyword('');
    setFilterStatus('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  // Open detail modal
  const handleViewDetail = async (orderId) => {
    try {
      const detail = await getAdminOrderDetail(orderId);
      setSelectedOrder(detail);
      setIsModalOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setSelectedOrder(updated);
      const statusLabel = getStatusMeta(newStatus).label;
      showToast(`Đã cập nhật trạng thái đơn #${updated.orderCode} thành "${statusLabel}" thành công! 🎉`);
      // Refresh both list and stats
      fetchOrders();
      fetchStats();
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  return (
    <div className="admin-page">
      {/* Floating Global Toast Notification */}
      {successToast && (
        <div className="global-toast-container" style={{ zIndex: 10002 }}>
          <div className="global-toast toast-success">
            <span style={{ fontSize: '1.2rem' }}>🎉</span>
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{successToast}</span>
            <button
              type="button"
              onClick={() => setSuccessToast('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="admin-container">
        {/* Navigation Tabs for Admin */}
        <div className="admin-nav-tabs">
          <Link to="/admin/products" className="admin-tab-btn">
            🍭 Quản Lý Sản Phẩm
          </Link>
          <Link to="/admin/categories" className="admin-tab-btn">
            🏷️ Quản Lý Danh Mục
          </Link>
          <Link to="/admin/orders" className="admin-tab-btn active">
            📦 Quản Lý Đơn Hàng
          </Link>
        </div>

        {/* Page Header */}
        <div className="admin-header">
          <div>
            <span className="admin-subtitle">Bảng điều khiển quản trị</span>
            <h1 className="admin-title">📦 Quản Lý & Theo Dõi Đơn Hàng</h1>
          </div>
          <button
            className="btn btn-outline btn-refresh-stats"
            onClick={() => {
              fetchStats();
              fetchOrders();
              showToast('Đã làm mới dữ liệu thống kê và đơn hàng! 🔄');
            }}
            title="Làm mới dữ liệu"
          >
            🔄 Làm mới
          </button>
        </div>

        {/* Toast / Alert Messages */}
        {successToast && (
          <div className="alert alert-success toast-animation">
            {successToast}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {/* 1. Dashboard Overview Stats Cards */}
        <div className="admin-stats-grid">
          {/* Total Orders Card */}
          <div className="stat-card stat-card-total">
            <div className="stat-icon-wrapper bg-blue-glow">📦</div>
            <div className="stat-data">
              <span className="stat-label">Tổng số đơn hàng</span>
              <strong className="stat-value">{stats.totalOrders}</strong>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="stat-card stat-card-revenue">
            <div className="stat-icon-wrapper bg-emerald-glow">💰</div>
            <div className="stat-data">
              <span className="stat-label">Doanh thu hoàn thành</span>
              <strong className="stat-value stat-revenue-value">
                {formatCurrency(stats.totalRevenue)}
              </strong>
            </div>
          </div>

          {/* Pending Status Card */}
          <div
            className={`stat-card stat-card-clickable ${filterStatus === 'PENDING' ? 'active-filter-card' : ''}`}
            onClick={() => {
              setFilterStatus(filterStatus === 'PENDING' ? '' : 'PENDING');
              setPage(0);
            }}
            title="Nhấn để lọc đơn Chờ xác nhận"
          >
            <div className="stat-icon-wrapper bg-amber-glow">⏳</div>
            <div className="stat-data">
              <span className="stat-label">Chờ xác nhận</span>
              <strong className="stat-value text-amber">
                {stats.countByStatus?.PENDING || 0}
              </strong>
            </div>
          </div>

          {/* Confirmed / Shipping Card */}
          <div
            className={`stat-card stat-card-clickable ${filterStatus === 'SHIPPING' ? 'active-filter-card' : ''}`}
            onClick={() => {
              setFilterStatus(filterStatus === 'SHIPPING' ? '' : 'SHIPPING');
              setPage(0);
            }}
            title="Nhấn để lọc đơn Đang giao"
          >
            <div className="stat-icon-wrapper bg-purple-glow">🚚</div>
            <div className="stat-data">
              <span className="stat-label">Đang giao hàng</span>
              <strong className="stat-value text-purple">
                {stats.countByStatus?.SHIPPING || 0}
              </strong>
            </div>
          </div>

          {/* Completed Card */}
          <div
            className={`stat-card stat-card-clickable ${filterStatus === 'COMPLETED' ? 'active-filter-card' : ''}`}
            onClick={() => {
              setFilterStatus(filterStatus === 'COMPLETED' ? '' : 'COMPLETED');
              setPage(0);
            }}
            title="Nhấn để lọc đơn Hoàn thành"
          >
            <div className="stat-icon-wrapper bg-emerald-glow">✅</div>
            <div className="stat-data">
              <span className="stat-label">Đã hoàn thành</span>
              <strong className="stat-value text-emerald">
                {stats.countByStatus?.COMPLETED || 0}
              </strong>
            </div>
          </div>

          {/* Low Stock Warning Card */}
          <div className="stat-card stat-card-warning">
            <div className="stat-icon-wrapper bg-rose-glow">⚠️</div>
            <div className="stat-data">
              <span className="stat-label">Sản phẩm sắp hết (&lt;10)</span>
              <strong className="stat-value text-rose">
                {stats.lowStockCount} <span className="stat-unit">sp</span>
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Controls Toolbar: Search & Filter */}
        <div className="admin-toolbar admin-order-toolbar">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo mã đơn hoặc SĐT..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Tìm kiếm
            </button>
          </form>

          {/* Filters: Status & Dates */}
          <div className="admin-order-filters">
            {/* Status Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(0);
              }}
              className="form-select filter-select-status"
            >
              <option value="">🎯 Tất cả trạng thái</option>
              <option value="PENDING">⏳ Chờ xác nhận (PENDING)</option>
              <option value="CONFIRMED">📋 Đã xác nhận (CONFIRMED)</option>
              <option value="SHIPPING">🚚 Đang giao hàng (SHIPPING)</option>
              <option value="COMPLETED">✅ Hoàn thành (COMPLETED)</option>
              <option value="CANCELLED">🚫 Đã huỷ (CANCELLED)</option>
            </select>

            {/* Date Range: Start Date */}
            <div className="date-input-group">
              <label className="date-label">Từ ngày:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(0);
                }}
                className="form-input date-picker-input"
              />
            </div>

            {/* Date Range: End Date */}
            <div className="date-input-group">
              <label className="date-label">Đến ngày:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(0);
                }}
                className="form-input date-picker-input"
              />
            </div>

            {/* Reset button */}
            {(searchKeyword || filterStatus || startDate || endDate) && (
              <button
                type="button"
                className="btn btn-outline btn-sm btn-reset-filters"
                onClick={handleResetFilters}
              >
                🔄 Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Indicator */}
        <div className="admin-stats-bar">
          <span>
            Tìm thấy <strong>{totalElements}</strong> đơn hàng
          </span>
          {searchKeyword && (
            <span> | Từ khóa: <em>"{searchKeyword}"</em></span>
          )}
          {filterStatus && (
            <span> | Trạng thái: <strong>{getStatusMeta(filterStatus).label}</strong></span>
          )}
          {startDate && <span> | Từ ngày: <strong>{startDate}</strong></span>}
          {endDate && <span> | Đến ngày: <strong>{endDate}</strong></span>}
        </div>

        {/* 3. Orders Table */}
        <div className="table-responsive admin-orders-table-wrap">
          <table className="admin-table admin-orders-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Người nhận</th>
                <th>Số điện thoại</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'center', width: '130px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-loading">
                    <div className="spinner"></div>
                    <p>Đang tải danh sách đơn hàng...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    <div className="empty-icon">📦</div>
                    <p>Không tìm thấy đơn hàng nào phù hợp với điều kiện lọc.</p>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const meta = getStatusMeta(ord.status);
                  return (
                    <tr key={ord.id} className="order-row-hover">
                      <td>
                        <div className="order-code-cell">
                          <strong className="order-code-badge">{ord.orderCode}</strong>
                          {ord.paymentMethod && (
                            <span className="payment-method-pill">{ord.paymentMethod}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="receiver-cell">
                          <strong className="receiver-name">{ord.receiverName}</strong>
                          {ord.userEmail && (
                            <span className="receiver-email">{ord.userEmail}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="phone-cell">{ord.receiverPhone}</span>
                      </td>
                      <td className="date-col">
                        {formatDateTime(ord.createdAt)}
                      </td>
                      <td>
                        <strong className="order-amount-text">
                          {formatCurrency(ord.totalAmount)}
                        </strong>
                        <span className="item-count-sub">
                          ({ord.items?.length || 0} món)
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge-sm ${meta.colorClass}`}>
                          <span className="badge-icon">{meta.icon}</span>
                          {meta.label}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-action btn-view-detail"
                          onClick={() => handleViewDetail(ord.id)}
                          title="Xem chi tiết đơn hàng & đổi trạng thái"
                        >
                          👁️ Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Bar */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              type="button"
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
                  type="button"
                  className={`page-num-btn ${page === i ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={page === totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Trang sau &raquo;
            </button>
          </div>
        )}
      </div>

      {/* Order Detail & Status Transition Modal */}
      <AdminOrderDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
};

export default AdminOrdersPage;
