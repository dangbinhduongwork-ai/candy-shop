import React, { useState, useEffect, useCallback } from 'react';
import { getCustomers, getCustomerStats, getCustomerById, updateCustomerStatus } from '../api/customerService';

/**
 * AdminCustomersPage — Customer management dashboard for administrators.
 */
const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Detail Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Top Spenders Modal State
  const [showTopSpendersModal, setShowTopSpendersModal] = useState(false);

  // Confirm Status Change Dialog State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    customer: null,
    targetStatus: 'LOCKED',
    loading: false,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return Number(price).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getCustomerStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch customer stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Customer List
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        sortBy: 'createdAt',
        direction: 'desc',
      };
      const data = await getCustomers(params);
      setCustomers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khách hàng.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Open Customer Detail Modal
  const handleViewDetail = async (customerId) => {
    setSelectedCustomerId(customerId);
    setDetailLoading(true);
    setCustomerDetail(null);
    try {
      const data = await getCustomerById(customerId);
      setCustomerDetail(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Không thể lấy thông tin chi tiết khách hàng.');
      setSelectedCustomerId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Trigger Confirmation for Status Toggle
  const triggerStatusConfirm = (customer, newStatus) => {
    setConfirmModal({
      isOpen: true,
      customer,
      targetStatus: newStatus,
      loading: false,
    });
  };

  // Execute Status Toggle
  const handleExecuteStatusChange = async () => {
    if (!confirmModal.customer) return;

    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      const updated = await updateCustomerStatus(confirmModal.customer.id, confirmModal.targetStatus);
      showToast(
        confirmModal.targetStatus === 'LOCKED'
          ? `Đã khóa tài khoản khách hàng "${updated.fullName}" thành công.`
          : `Đã mở khóa tài khoản khách hàng "${updated.fullName}" thành công.`
      );

      // Refresh list & stats
      fetchCustomers();
      fetchStats();

      // If detail modal is currently open for this user, refresh it too
      if (customerDetail && customerDetail.id === updated.id) {
        setCustomerDetail((prev) => ({ ...prev, status: updated.status }));
      }

      setConfirmModal({ isOpen: false, customer: null, targetStatus: 'LOCKED', loading: false });
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái tài khoản.');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const renderOrderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="order-badge badge-pending">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="order-badge badge-confirmed">Đã xác nhận</span>;
      case 'SHIPPING':
        return <span className="order-badge badge-shipping">Đang giao hàng</span>;
      case 'COMPLETED':
        return <span className="order-badge badge-completed">Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="order-badge badge-cancelled">Đã hủy</span>;
      default:
        return <span className="order-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-page">
      {/* Toast Notification */}
      {toastMessage && <div className="toast-float">{toastMessage}</div>}

      <div className="admin-container">
        {/* Header Title */}
        <div className="admin-header">
          <div>
            <span className="admin-subtitle">Trung tâm quản trị</span>
            <h1 className="admin-title">Quản Lý Khách Hàng</h1>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="btn btn-vip-shimmer btn-icon-gap"
              onClick={() => setShowTopSpendersModal(true)}
              title="Xem bảng xếp hạng khách hàng thân thiết"
            >
              <span>👑</span> Top Khách Hàng VIP
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-icon-gap"
              onClick={() => {
                fetchStats();
                fetchCustomers();
                showToast('Đã làm mới dữ liệu khách hàng!');
              }}
              title="Làm mới dữ liệu"
            >
              <span>🔄</span> Làm Mới
            </button>
          </div>
        </div>

        {/* 4 Premium Stat Cards */}
        {(() => {
          const total = stats?.totalCustomers || 0;
          const active = stats?.activeCustomers || 0;
          const locked = stats?.lockedCustomers || 0;
          const newThisMonth = stats?.newCustomersThisMonth || 0;
          const activePercent = total > 0 ? Math.round((active / total) * 100) : 100;
          const lockedPercent = total > 0 ? Math.round((locked / total) * 100) : 0;

          return (
            <div className="admin-stats-modern-grid">
              {/* Card 1: Total Customers */}
              <div
                className={`admin-stat-card-premium theme-blue clickable ${statusFilter === '' ? 'active-filter' : ''}`}
                onClick={() => {
                  setStatusFilter('');
                  setPage(0);
                }}
                title="Bấm để xem tất cả khách hàng"
              >
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-blue">👥</div>
                  <span className="stat-trend-pill pill-blue">
                    {statusFilter === '' ? '✓ Đang xem' : 'Toàn bộ'}
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Tổng Khách Hàng</span>
                  <div className="stat-numeric-value">{statsLoading ? '...' : total}</div>
                  <span className="stat-helper-desc">Thành viên đăng ký hệ thống</span>
                </div>
                <div className="stat-mini-progress">
                  <div className="stat-mini-progress-fill progress-fill-blue" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Card 2: New This Month */}
              <div className="admin-stat-card-premium theme-purple">
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-purple">✨</div>
                  <span className="stat-trend-pill pill-purple">
                    +{newThisMonth} mới
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Mới Trong Tháng</span>
                  <div className="stat-numeric-value">{statsLoading ? '...' : newThisMonth}</div>
                  <span className="stat-helper-desc">Gia nhập từ đầu tháng</span>
                </div>
                <div className="stat-mini-progress">
                  <div
                    className="stat-mini-progress-fill progress-fill-purple"
                    style={{ width: `${total > 0 ? Math.min(100, Math.round((newThisMonth / total) * 100)) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Card 3: Active Customers */}
              <div
                className={`admin-stat-card-premium theme-emerald clickable ${statusFilter === 'ACTIVE' ? 'active-filter' : ''}`}
                onClick={() => {
                  setStatusFilter(statusFilter === 'ACTIVE' ? '' : 'ACTIVE');
                  setPage(0);
                }}
                title="Bấm để lọc khách hàng đang hoạt động"
              >
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-emerald">🟢</div>
                  <span className="stat-trend-pill pill-emerald">
                    {activePercent}% kích hoạt
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Đang Hoạt Động</span>
                  <div className="stat-numeric-value text-emerald">{statsLoading ? '...' : active}</div>
                  <span className="stat-helper-desc">Có thể đăng nhập & mua hàng</span>
                </div>
                <div className="stat-mini-progress">
                  <div
                    className="stat-mini-progress-fill progress-fill-emerald"
                    style={{ width: `${activePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Card 4: Locked Customers */}
              <div
                className={`admin-stat-card-premium theme-rose clickable ${statusFilter === 'LOCKED' ? 'active-filter' : ''}`}
                onClick={() => {
                  setStatusFilter(statusFilter === 'LOCKED' ? '' : 'LOCKED');
                  setPage(0);
                }}
                title="Bấm để lọc tài khoản bị khóa"
              >
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-rose">🔒</div>
                  <span className="stat-trend-pill pill-rose">
                    {locked > 0 ? `⚠️ ${locked} tài khoản` : 'An toàn'}
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Tài Khoản Đã Khóa</span>
                  <div className="stat-numeric-value text-rose">{statsLoading ? '...' : locked}</div>
                  <span className="stat-helper-desc">Bị vô hiệu hóa truy cập</span>
                </div>
                <div className="stat-mini-progress">
                  <div
                    className="stat-mini-progress-fill progress-fill-rose"
                    style={{ width: `${lockedPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Toolbar: Search & Filter */}
        <div className="admin-toolbar" style={{ marginTop: '1.5rem' }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Tìm theo họ tên, email hoặc số điện thoại..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="statusFilter" style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)' }}>
              Trạng thái:
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: '1.5px solid var(--border)',
                background: 'white',
                fontWeight: '600',
                fontSize: '0.88rem',
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">🟢 Đang hoạt động</option>
              <option value="LOCKED">🔒 Đã bị khóa</option>
            </select>
          </div>
        </div>

        {/* Stats summary bar */}
        <div className="admin-stats-bar">
          Hiển thị <strong>{customers.length}</strong> / <strong>{totalElements}</strong> khách hàng phù hợp
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span className="alert-icon">⚠️</span>
            <div className="alert-body">
              <strong>Lỗi tải dữ liệu</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Customer Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách Hàng</th>
                <th>Liên Hệ</th>
                <th>Ngày Tham Gia</th>
                <th>Trạng Thái</th>
                <th style={{ textAlign: 'center' }}>Đơn Hàng</th>
                <th style={{ textAlign: 'right' }}>Tổng Chi Tiêu</th>
                <th style={{ textAlign: 'center' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
                    <p style={{ color: 'var(--text-medium)', fontWeight: '600' }}>Đang tải danh sách khách hàng...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)' }}>Không tìm thấy khách hàng nào</h3>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="customer-row-profile">
                        <div className="customer-avatar-badge">
                          {c.avatarUrl ? (
                            <img
                              src={c.avatarUrl.startsWith('http') ? c.avatarUrl : `http://localhost:8080${c.avatarUrl}`}
                              alt={c.fullName}
                              className="customer-avatar-img"
                            />
                          ) : (
                            <span className="customer-avatar-initial">
                              {c.fullName ? c.fullName.charAt(0).toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                        <div className="customer-name-meta">
                          <strong className="customer-full-name">{c.fullName}</strong>
                          <span className="customer-email-sub">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem' }}>
                        <div>📞 {c.phone || <em style={{ color: '#94a3b8' }}>Chưa cập nhật</em>}</div>
                      </div>
                    </td>
                    <td className="date-col">{formatDate(c.createdAt)}</td>
                    <td>
                      {c.status === 'ACTIVE' ? (
                        <span className="customer-status-badge badge-active">🟢 Hoạt động</span>
                      ) : (
                        <span className="customer-status-badge badge-locked">🔒 Đã khóa</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="order-count-pill">{c.totalOrders} đơn</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <strong className="customer-spent-amount">{formatPrice(c.totalSpent)}</strong>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-action btn-edit"
                          onClick={() => handleViewDetail(c.id)}
                          title="Xem chi tiết hồ sơ và đơn hàng"
                        >
                          👁️ Chi tiết
                        </button>

                        {c.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            className="btn-action btn-delete"
                            onClick={() => triggerStatusConfirm(c, 'LOCKED')}
                            title="Khóa tài khoản khách hàng"
                          >
                            🔒 Khóa
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn-action btn-unlock"
                            onClick={() => triggerStatusConfirm(c, 'ACTIVE')}
                            title="Mở khóa tài khoản khách hàng"
                          >
                            🔓 Mở khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="page-btn"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              ← Trang trước
            </button>
            <span className="page-info">
              Trang <strong>{page + 1}</strong> / <strong>{totalPages}</strong>
            </span>
            <button
              type="button"
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Trang sau →
            </button>
          </div>
        )}
      </div>

      {/* =============================================
          MODAL: CUSTOMER DETAILS & RECENT ORDERS
          ============================================= */}
      {selectedCustomerId && (
        <div className="modal-overlay" onClick={() => setSelectedCustomerId(null)}>
          <div
            className="modal-container modal-customer-detail"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '850px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.6rem' }}>👤</span>
                <h2 className="modal-title">Hồ Sơ Chi Tiết Khách Hàng</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCustomerId(null)}
              >
                &times;
              </button>
            </div>

            {detailLoading || !customerDetail ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
                <p style={{ color: 'var(--text-medium)' }}>Đang tải thông tin khách hàng...</p>
              </div>
            ) : (
              <div className="customer-detail-body">
                {/* Profile Hero Box */}
                <div className="customer-profile-card">
                  <div className="customer-avatar-large">
                    {customerDetail.avatarUrl ? (
                      <img
                        src={customerDetail.avatarUrl.startsWith('http') ? customerDetail.avatarUrl : `http://localhost:8080${customerDetail.avatarUrl}`}
                        alt={customerDetail.fullName}
                      />
                    ) : (
                      <span>{customerDetail.fullName ? customerDetail.fullName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="customer-profile-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 className="profile-name">{customerDetail.fullName}</h3>
                      {customerDetail.status === 'ACTIVE' ? (
                        <span className="customer-status-badge badge-active">🟢 Đang hoạt động</span>
                      ) : (
                        <span className="customer-status-badge badge-locked">🔒 Đã bị khóa</span>
                      )}
                    </div>
                    <div className="profile-meta-grid">
                      <div>📧 <strong>Email:</strong> {customerDetail.email}</div>
                      <div>📞 <strong>Số điện thoại:</strong> {customerDetail.phone || 'Chưa cung cấp'}</div>
                      <div>📍 <strong>Địa chỉ mặc định:</strong> {customerDetail.address || 'Chưa cung cấp'}</div>
                      <div>📅 <strong>Ngày đăng ký:</strong> {formatDate(customerDetail.createdAt)}</div>
                    </div>
                  </div>
                  <div className="customer-profile-action">
                    {customerDetail.status === 'ACTIVE' ? (
                      <button
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => triggerStatusConfirm(customerDetail, 'LOCKED')}
                      >
                        🔒 Khóa Tài Khoản
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success-outline btn-sm"
                        onClick={() => triggerStatusConfirm(customerDetail, 'ACTIVE')}
                      >
                        🔓 Mở Khóa Tài Khoản
                      </button>
                    )}
                  </div>
                </div>

                {/* Spending Summary Cards */}
                <div className="customer-spending-grid">
                  <div className="spending-metric-box">
                    <span className="spending-metric-title">📦 Tổng Số Đơn Đã Đặt</span>
                    <span className="spending-metric-value">{customerDetail.totalOrders} đơn</span>
                  </div>
                  <div className="spending-metric-box metric-accent">
                    <span className="spending-metric-title">💰 Tổng Chi Tiêu (Hoàn thành)</span>
                    <span className="spending-metric-value">{formatPrice(customerDetail.totalSpent)}</span>
                  </div>
                </div>

                {/* Recent Orders List */}
                <div className="recent-orders-section" style={{ marginTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.85rem', color: 'var(--text-dark)' }}>
                    📦 Đơn Hàng Gần Đây ({customerDetail.recentOrders?.length || 0})
                  </h4>

                  {(!customerDetail.recentOrders || customerDetail.recentOrders.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '12px' }}>
                      <p style={{ color: 'var(--text-light)', margin: 0 }}>Khách hàng chưa có đơn hàng nào.</p>
                    </div>
                  ) : (
                    <div className="table-responsive" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      <table className="admin-table" style={{ fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th>Mã Đơn</th>
                            <th>Ngày Đặt</th>
                            <th>Người Nhận</th>
                            <th style={{ textAlign: 'right' }}>Tổng Tiền</th>
                            <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerDetail.recentOrders.map((ord) => (
                            <tr key={ord.id}>
                              <td>
                                <strong style={{ color: 'var(--primary)' }}>{ord.orderCode}</strong>
                              </td>
                              <td className="date-col">{formatDate(ord.createdAt)}</td>
                              <td>{ord.receiverName} ({ord.receiverPhone})</td>
                              <td style={{ textAlign: 'right', fontWeight: '800' }}>
                                {formatPrice(ord.totalAmount)}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {renderOrderStatusBadge(ord.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================
          MODAL: TOP 5 VIP SPENDERS
          ============================================= */}
      {showTopSpendersModal && (
        <div className="modal-overlay" onClick={() => setShowTopSpendersModal(false)}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '650px' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.8rem' }}>👑</span>
                <h2 className="modal-title">Top 5 Khách Hàng VIP</h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowTopSpendersModal(false)}
              >
                &times;
              </button>
            </div>

            {(!stats?.topSpenders || stats.topSpenders.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
                <p style={{ color: 'var(--text-light)' }}>Chưa có đủ dữ liệu đơn hàng hoàn thành để xếp hạng VIP.</p>
              </div>
            ) : (
              <div className="vip-spenders-list">
                {stats.topSpenders.map((vip, index) => {
                  const rankIcons = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                  return (
                    <div key={vip.id} className="vip-spender-card">
                      <div className="vip-rank-badge">{rankIcons[index] || `#${index + 1}`}</div>
                      <div className="vip-avatar">
                        {vip.avatarUrl ? (
                          <img
                            src={vip.avatarUrl.startsWith('http') ? vip.avatarUrl : `http://localhost:8080${vip.avatarUrl}`}
                            alt={vip.fullName}
                          />
                        ) : (
                          <span>{vip.fullName ? vip.fullName.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                      </div>
                      <div className="vip-info">
                        <strong className="vip-name">{vip.fullName}</strong>
                        <span className="vip-email">{vip.email}</span>
                        <span className="vip-orders-count">📦 {vip.orderCount} đơn hoàn thành</span>
                      </div>
                      <div className="vip-spending">
                        <span className="vip-spending-label">Đã chi tiêu</span>
                        <strong className="vip-spending-amount">{formatPrice(vip.totalSpent)}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================
          MODAL: CONFIRM LOCK / UNLOCK DIALOG
          ============================================= */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" onClick={() => !confirmModal.loading && setConfirmModal({ ...confirmModal, isOpen: false })}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {confirmModal.targetStatus === 'LOCKED' ? '🔒 Khóa Tài Khoản' : '🔓 Mở Khóa Tài Khoản'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                disabled={confirmModal.loading}
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '0.5rem 0 1.25rem 0', color: '#475569', lineHeight: '1.6' }}>
              {confirmModal.targetStatus === 'LOCKED' ? (
                <>
                  <p>
                    Bạn có chắc chắn muốn <strong>KHÓA</strong> tài khoản của khách hàng{' '}
                    <strong>"{confirmModal.customer?.fullName}"</strong> ({confirmModal.customer?.email})?
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#dc2626', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px' }}>
                    ⚠️ Khách hàng sẽ bị từ chối truy cập ngay lập tức và không thể đăng nhập cho đến khi được mở khóa lại.
                  </p>
                </>
              ) : (
                <p>
                  Bạn có muốn <strong>MỞ KHÓA</strong> tài khoản cho khách hàng{' '}
                  <strong>"{confirmModal.customer?.fullName}"</strong> ({confirmModal.customer?.email}) để họ tiếp tục đăng nhập và mua hàng?
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={confirmModal.loading}
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className={`btn ${confirmModal.targetStatus === 'LOCKED' ? 'btn-danger' : 'btn-primary'}`}
                disabled={confirmModal.loading}
                onClick={handleExecuteStatusChange}
              >
                {confirmModal.loading
                  ? 'Đang xử lý...'
                  : confirmModal.targetStatus === 'LOCKED'
                  ? 'Xác Nhận Khóa'
                  : 'Xác Nhận Mở Khóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersPage;
