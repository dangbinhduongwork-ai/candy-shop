import React, { useState, useEffect, useCallback } from 'react';
import AdminNavTabs from '../components/AdminNavTabs';
import {
  getAdminVouchers,
  createAdminVoucher,
  updateAdminVoucher,
  deleteAdminVoucher,
} from '../api/voucherService';

/**
 * AdminVouchersPage — Discount codes and voucher management for administrators.
 */
const AdminVouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Filtering & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 8;

  // Create / Edit Modal State
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
  const [formData, setFormData] = useState({
    id: null,
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    startDate: '',
    endDate: '',
    maxUsageCount: '100',
    maxUsagePerUser: '1',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    voucher: null,
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

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  // Fetch Vouchers List
  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      };
      const data = await getAdminVouchers(params);
      setVouchers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách voucher.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Open Create Modal
  const handleOpenCreate = () => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    setFormData({
      id: null,
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '10',
      minOrderAmount: '50000',
      maxDiscountAmount: '30000',
      startDate: formatDateTimeLocal(now.toISOString()),
      endDate: formatDateTimeLocal(nextMonth.toISOString()),
      maxUsageCount: '100',
      maxUsagePerUser: '1',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setModalMode('create');
  };

  // Open Edit Modal
  const handleOpenEdit = (v) => {
    setFormData({
      id: v.id,
      code: v.code || '',
      name: v.name || '',
      description: v.description || '',
      discountType: v.discountType || 'PERCENTAGE',
      discountValue: v.discountValue != null ? String(v.discountValue) : '',
      minOrderAmount: v.minOrderAmount != null ? String(v.minOrderAmount) : '0',
      maxDiscountAmount: v.maxDiscountAmount != null ? String(v.maxDiscountAmount) : '',
      startDate: formatDateTimeLocal(v.startDate),
      endDate: formatDateTimeLocal(v.endDate),
      maxUsageCount: v.maxUsageCount != null ? String(v.maxUsageCount) : '100',
      maxUsagePerUser: v.maxUsagePerUser != null ? String(v.maxUsagePerUser) : '1',
      status: v.status || 'ACTIVE',
    });
    setFormErrors({});
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    if (!submitting) {
      setModalMode(null);
      setFormErrors({});
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) {
      errors.code = 'Mã code không được để trống';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.code.trim())) {
      errors.code = 'Mã code chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới';
    }

    if (!formData.name.trim()) {
      errors.name = 'Tên mã giảm giá không được để trống';
    }

    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      errors.discountValue = 'Giá trị giảm phải lớn hơn 0';
    } else if (formData.discountType === 'PERCENTAGE' && Number(formData.discountValue) > 100) {
      errors.discountValue = 'Giảm % không được vượt quá 100%';
    }

    if (formData.minOrderAmount && Number(formData.minOrderAmount) < 0) {
      errors.minOrderAmount = 'Giá trị tối thiểu không được âm';
    }

    if (!formData.startDate) {
      errors.startDate = 'Vui lòng chọn ngày bắt đầu';
    }

    if (!formData.endDate) {
      errors.endDate = 'Vui lòng chọn ngày kết thúc';
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!formData.maxUsageCount || Number(formData.maxUsageCount) < 1) {
      errors.maxUsageCount = 'Số lượt dùng tối đa phải từ 1';
    }

    if (!formData.maxUsagePerUser || Number(formData.maxUsagePerUser) < 1) {
      errors.maxUsagePerUser = 'Số lượt dùng mỗi khách hàng phải từ 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount:
          formData.discountType === 'PERCENTAGE' && formData.maxDiscountAmount
            ? Number(formData.maxDiscountAmount)
            : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxUsageCount: Number(formData.maxUsageCount),
        maxUsagePerUser: Number(formData.maxUsagePerUser),
        status: formData.status,
      };

      if (modalMode === 'create') {
        await createAdminVoucher(payload);
        showToast(`✅ Đã tạo thành công voucher "${payload.code}"!`);
      } else {
        await updateAdminVoucher(formData.id, payload);
        showToast(`✅ Đã cập nhật thành công voucher "${payload.code}"!`);
      }

      setModalMode(null);
      fetchVouchers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu voucher.';
      showToast(`❌ ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete / Deactivate
  const handleConfirmDelete = async () => {
    if (!deleteConfirm.voucher) return;
    try {
      setDeleteConfirm((prev) => ({ ...prev, loading: true }));
      await deleteAdminVoucher(deleteConfirm.voucher.id);
      showToast(`✅ Đã xoá/ngừng kích hoạt voucher "${deleteConfirm.voucher.code}" thành công!`);
      setDeleteConfirm({ isOpen: false, voucher: null, loading: false });
      fetchVouchers();
    } catch (err) {
      showToast(`❌ ${err.response?.data?.message || 'Không thể xoá voucher'}`);
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  // Check timing badge
  const getTimingBadge = (voucher) => {
    const now = new Date();
    const start = new Date(voucher.startDate);
    const end = new Date(voucher.endDate);

    if (now < start) {
      return <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e' }}>⏳ Chưa bắt đầu</span>;
    }
    if (now > end) {
      return <span className="status-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>⛔ Đã hết hạn</span>;
    }
    if (voucher.maxUsageCount != null && voucher.usedCount >= voucher.maxUsageCount) {
      return <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>🔒 Hết lượt dùng</span>;
    }
    return <span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>⚡ Đang hiệu lực</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#1e293b',
            color: '#fff',
            padding: '14px 22px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontWeight: '600',
            fontSize: '0.95rem',
            animation: 'fadeInDown 0.3s ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Unified Navigation Tabs */}
      <AdminNavTabs />

      {/* Header Banner */}
      <div className="admin-header">
        <div>
          <span className="admin-subtitle">Tạo và quản lý các chương trình ưu đãi, mã giảm giá % hoặc tiền mặt cho khách hàng mua sắm.</span>
          <h1 className="admin-title">Quản lý mã giảm giá (Vouchers)</h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn btn-primary"
        >
          Thêm Voucher Mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-toolbar" style={{ marginBottom: '1.75rem' }}>
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Tìm theo mã code hoặc tên voucher..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="search-input"
            style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px' }}
          />
        </div>

        <div style={{ flex: '0 1 200px' }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="form-select filter-select"
            style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '8px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
            <option value="INACTIVE">Vô hiệu hóa (INACTIVE)</option>
          </select>
        </div>

        {(search || statusFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setPage(0);
            }}
            className="btn btn-secondary"
            style={{ padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.9rem' }}
          >
            ✕ Đặt lại lọc
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            border: '1px solid #fecaca',
            fontWeight: '500',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Vouchers Table */}
      <div className="table-responsive admin-table-wrapper" style={{ borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table admin-voucher-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700' }}>MÃ CODE</th>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700' }}>TÊN & MÔ TẢ</th>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700' }}>MỨC GIẢM</th>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700' }}>ĐƠN TỐI THIỂU</th>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700' }}>THỜI HẠN & HIỆU LỰC</th>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700', textAlign: 'center' }}>LƯỢT DÙNG</th>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700', textAlign: 'center' }}>TRẠNG THÁI</th>
              <th style={{ padding: '1rem 1.2rem', fontWeight: '700', textAlign: 'right' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light, #64748b)' }}>
                  <div style={{ display: 'inline-block', fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                  <div>Đang tải dữ liệu voucher...</div>
                </td>
              </tr>
            ) : vouchers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light, #64748b)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎟️</div>
                  <div style={{ fontWeight: '600' }}>Không tìm thấy mã giảm giá nào.</div>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem' }}>
                    Hãy thử tìm kiếm với từ khóa khác hoặc tạo voucher mới!
                  </p>
                </td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id}>
                  {/* Voucher Code */}
                  <td style={{ padding: '1rem 1.2rem' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#fce7f3',
                        color: '#be185d',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        border: '1px dashed #f472b6',
                        fontFamily: 'monospace',
                        fontSize: '0.95rem',
                      }}
                    >
                      {v.code}
                    </div>
                  </td>

                  {/* Name & Description */}
                  <td style={{ padding: '1rem 1.2rem', maxWidth: '260px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--text-dark, #0f172a)', marginBottom: '0.2rem' }}>
                      {v.name}
                    </div>
                    {v.description && (
                      <div style={{ color: 'var(--text-light, #64748b)', fontSize: '0.82rem', lineHeight: '1.3' }}>
                        {v.description}
                      </div>
                    )}
                  </td>

                    {/* Discount Value */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      {v.discountType === 'PERCENTAGE' ? (
                        <div>
                          <span style={{ fontWeight: '800', color: '#ec4899', fontSize: '1rem' }}>
                            {v.discountValue}%
                          </span>
                          {v.maxDiscountAmount && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Tối đa: {formatPrice(v.maxDiscountAmount)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontWeight: '800', color: '#0284c7', fontSize: '1rem' }}>
                          -{formatPrice(v.discountValue)}
                        </span>
                      )}
                    </td>

                    {/* Min Order Amount */}
                    <td style={{ padding: '1rem 1.2rem', color: 'var(--text-medium, #334155)', fontWeight: '600' }}>
                      {v.minOrderAmount && Number(v.minOrderAmount) > 0 ? (
                        formatPrice(v.minOrderAmount)
                      ) : (
                        <span style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>Không yêu cầu</span>
                      )}
                    </td>

                    {/* Dates & Validity Status */}
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ marginBottom: '0.3rem' }}>{getTimingBadge(v)}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-light, #64748b)' }}>
                        <div>Từ: {formatDate(v.startDate)}</div>
                        <div>Đến: {formatDate(v.endDate)}</div>
                      </div>
                    </td>

                    {/* Usage Count */}
                    <td style={{ padding: '1rem 1.2rem', textAlign: 'center' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-dark, #0f172a)' }}>
                        {v.usedCount || 0} / {v.maxUsageCount || '∞'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light, #64748b)' }}>
                        Tối đa {v.maxUsagePerUser || 1} lần/user
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 1.2rem', textAlign: 'center' }}>
                      {v.status === 'ACTIVE' ? (
                        <span
                          style={{
                            backgroundColor: '#dcfce7',
                            color: '#15803d',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '20px',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                          }}
                        >
                          ACTIVE
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '20px',
                            fontWeight: '700',
                            fontSize: '0.78rem',
                          }}
                        >
                          INACTIVE
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem 1.2rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenEdit(v)}
                          title="Chỉnh sửa voucher"
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                          }}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, voucher: v, loading: false })}
                          title="Xoá hoặc ngừng kích hoạt"
                          style={{
                            backgroundColor: '#fff1f2',
                            color: '#e11d48',
                            border: '1px solid #fecdd3',
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                          }}
                        >
                          🗑️ Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ color: '#64748b', fontSize: '0.88rem' }}>
              Hiển thị {vouchers.length} trên tổng số {totalElements} mã giảm giá
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                ◀ Trang trước
              </button>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 0.75rem',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: '#334155',
                }}
              >
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '6px' }}
              >
                Trang sau ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Create / Edit */}
      {modalMode && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' ? '🎟️ Thêm Voucher Mới' : '✏️ Chỉnh Sửa Voucher'}
              </h2>
              <button onClick={handleCloseModal} className="modal-close-btn">
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Code */}
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Mã Voucher (Code) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: WELCOME10, GIAM50K"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className={`form-control ${formErrors.code ? 'is-invalid' : ''}`}
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: '700' }}
                  />
                  {formErrors.code && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      {formErrors.code}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Trạng thái kích hoạt
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
                    <option value="INACTIVE">Vô hiệu hóa (INACTIVE)</option>
                  </select>
                </div>
              </div>

              {/* Name */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  Tên / Tiêu đề Voucher <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Giảm 10% mừng đại lễ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-control"
                />
                {formErrors.name && (
                  <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    {formErrors.name}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  Mô tả chi tiết (tuỳ chọn)
                </label>
                <textarea
                  rows="2"
                  placeholder="VD: Áp dụng cho mọi đơn hàng bánh kẹo từ 100.000đ"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* Discount Type and Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Loại giảm giá <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="form-control"
                  >
                    <option value="PERCENTAGE">Theo phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Giá trị giảm ({formData.discountType === 'PERCENTAGE' ? '%' : 'VNĐ'}){' '}
                    <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'VD: 15' : 'VD: 30000'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="form-control"
                    min="1"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                  />
                  {formErrors.discountValue && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      {formErrors.discountValue}
                    </div>
                  )}
                </div>
              </div>

              {/* Min Order & Max Discount (if percentage) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Đơn hàng tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 100000 (0 nếu không yêu cầu)"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="form-control"
                    min="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Số tiền giảm tối đa (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'VD: 50000' : 'Không áp dụng'}
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="form-control"
                    disabled={formData.discountType !== 'PERCENTAGE'}
                    min="0"
                  />
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Ngày bắt đầu <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="form-control"
                  />
                  {formErrors.startDate && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      {formErrors.startDate}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Ngày kết thúc <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="form-control"
                  />
                  {formErrors.endDate && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      {formErrors.endDate}
                    </div>
                  )}
                </div>
              </div>

              {/* Usages Limits */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Tổng số lượt dùng tối đa <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsageCount}
                    onChange={(e) => setFormData({ ...formData, maxUsageCount: e.target.value })}
                    className="form-control"
                    min="1"
                  />
                  {formErrors.maxUsageCount && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      {formErrors.maxUsageCount}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '700', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                    Lượt dùng tối đa mỗi khách <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxUsagePerUser}
                    onChange={(e) => setFormData({ ...formData, maxUsagePerUser: e.target.value })}
                    className="form-control"
                    min="1"
                  />
                  {formErrors.maxUsagePerUser && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                      {formErrors.maxUsagePerUser}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '1.75rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary"
                  disabled={submitting}
                  style={{ borderRadius: '8px', padding: '0.65rem 1.25rem' }}
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ borderRadius: '8px', padding: '0.65rem 1.5rem', fontWeight: '700' }}
                >
                  {submitting ? '⏳ Đang lưu...' : modalMode === 'create' ? 'Tạo Voucher' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && deleteConfirm.voucher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1060,
            padding: '1rem',
          }}
          onClick={() => !deleteConfirm.loading && setDeleteConfirm({ isOpen: false, voucher: null, loading: false })}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              maxWidth: '440px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗑️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 0.5rem' }}>
              Xác nhận xoá voucher?
            </h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 1.5rem' }}>
              Bạn có chắc chắn muốn xoá voucher{' '}
              <strong style={{ color: '#ec4899', fontFamily: 'monospace' }}>
                {deleteConfirm.voucher.code}
              </strong>
              ?
              {deleteConfirm.voucher.usedCount > 0 && (
                <span style={{ display: 'block', marginTop: '0.5rem', color: '#d97706', fontSize: '0.85rem' }}>
                  ℹ️ Mã này đã có {deleteConfirm.voucher.usedCount} lượt sử dụng, hệ thống sẽ tự động chuyển sang trạng
                  thái <strong>INACTIVE</strong> để bảo toàn lịch sử đơn hàng.
                </span>
              )}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, voucher: null, loading: false })}
                className="btn btn-secondary"
                disabled={deleteConfirm.loading}
                style={{ borderRadius: '8px', padding: '0.6rem 1.25rem' }}
              >
                Không, giữ lại
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="btn btn-danger"
                disabled={deleteConfirm.loading}
                style={{ borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: '700' }}
              >
                {deleteConfirm.loading ? '⏳ Đang xoá...' : 'Đồng ý xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminVouchersPage;
