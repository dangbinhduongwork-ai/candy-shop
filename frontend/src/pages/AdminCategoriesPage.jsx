import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminNavTabs from '../components/AdminNavTabs';
import { useCart } from '../context/CartContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  reorderCategories,
  deleteCategory,
  uploadCategoryImage,
} from '../api/categoryService';

const AdminCategoriesPage = () => {
  const { showToast } = useCart();

  // Data states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    displayOrder: 1,
    active: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Drag & drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isReordering, setIsReordering] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCategories({ includeInactive: true });
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories by search keyword and status
  const filteredCategories = categories.filter((cat) => {
    if (statusFilter === 'ACTIVE' && !cat.active) return false;
    if (statusFilter === 'INACTIVE' && cat.active) return false;

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return (
      cat.name?.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term)
    );
  });

  // Calculate statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.active).length;
  const inactiveCategories = totalCategories - activeCategories;
  const totalProductsInCategories = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      displayOrder: categories.length + 1,
      active: true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      displayOrder: cat.displayOrder ?? 1,
      active: cat.active ?? true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  // Handle image upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Kích thước ảnh tối đa là 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const res = await uploadCategoryImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: res.imageUrl || res.fileUrl }));
      showToast('Tải ảnh đại diện danh mục thành công!', 'success');
    } catch (err) {
      console.error('Image upload failed:', err);
      showToast('Không thể tải ảnh lên. Vui lòng thử lại.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Tên danh mục không được để trống';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Tên danh mục không được vượt quá 100 ký tự';
    }

    // Check duplicate locally
    const duplicate = categories.find(
      (c) =>
        c.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id)
    );
    if (duplicate) {
      errors.name = 'Tên danh mục này đã tồn tại';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit create or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        displayOrder: parseInt(formData.displayOrder, 10) || 1,
        active: Boolean(formData.active),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        showToast(`🎉 Đã cập nhật danh mục "${payload.name}" thành công!`, 'success');
      } else {
        await createCategory(payload);
        showToast(`🎉 Đã thêm danh mục mới "${payload.name}" thành công!`, 'success');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Save category failed:', err);
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục';
      setFormErrors((prev) => ({ ...prev, server: msg }));
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick toggle active status
  const handleToggleActive = async (cat) => {
    const newStatus = !cat.active;
    try {
      await toggleCategoryStatus(cat.id, newStatus);
      setCategories((prev) =>
        prev.map((item) => (item.id === cat.id ? { ...item, active: newStatus } : item))
      );
      showToast(
        newStatus
          ? `Đã hiển thị danh mục "${cat.name}" ra trang chủ! `
          : `Đã tạm ẩn danh mục "${cat.name}" khỏi trang chủ! `,
        newStatus ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Toggle status failed:', err);
      showToast(err.response?.data?.message || 'Không thể đổi trạng thái danh mục', 'error');
    }
  };

  // Delete category
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      showToast(`Đã xoá danh mục "${deleteTarget.name}" thành công!`, 'info');
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      console.error('Delete category failed:', err);
      const msg = err.response?.data?.message || 'Không thể xoá danh mục';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const updated = [...categories];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);

    // Reassign displayOrder sequentially
    const reorderedItems = updated.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    setCategories(reorderedItems);
    setDraggedIndex(null);

    // Save to backend
    setIsReordering(true);
    try {
      const payload = reorderedItems.map((c) => ({
        id: c.id,
        displayOrder: c.displayOrder,
      }));
      await reorderCategories(payload);
      showToast('Đã lưu thứ tự hiển thị danh mục mới!', 'success');
    } catch (err) {
      console.error('Save reorder failed:', err);
      showToast('Không thể lưu thứ tự danh mục', 'error');
      fetchCategories();
    } finally {
      setIsReordering(false);
    }
  };

  // Move up/down buttons
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reorderedItems = updated.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    setCategories(reorderedItems);
    setIsReordering(true);
    try {
      const payload = reorderedItems.map((c) => ({
        id: c.id,
        displayOrder: c.displayOrder,
      }));
      await reorderCategories(payload);
      showToast('Đã cập nhật thứ tự hiển thị danh mục!', 'success');
    } catch (err) {
      console.error('Move order failed:', err);
      showToast('Không thể cập nhật thứ tự danh mục', 'error');
      fetchCategories();
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Unified Navigation Tabs */}
        <AdminNavTabs />

        {/* Header Title and Actions */}
        <div className="admin-header">
          <div>
            <span className="admin-subtitle">Khu vực quản trị</span>
            <h1 className="admin-title">Quản Lý Danh Mục Bánh Kẹo</h1>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-add-prod"
            onClick={handleOpenCreateModal}
          >
            Thêm Danh Mục Mới
          </button>
        </div>

        {/* Premium Modern Statistics Banner */}
        {(() => {
          const activePercent = totalCategories > 0 ? Math.round((activeCategories / totalCategories) * 100) : 100;
          const inactivePercent = totalCategories > 0 ? Math.round((inactiveCategories / totalCategories) * 100) : 0;
          const avgProducts = totalCategories > 0 ? (totalProductsInCategories / totalCategories).toFixed(1) : 0;

          return (
            <div className="admin-stats-modern-grid">
              {/* Card 1: Total Categories */}
              <div
                className={`admin-stat-card-premium theme-blue clickable ${statusFilter === 'ALL' ? 'active-filter' : ''}`}
                onClick={() => setStatusFilter('ALL')}
                title="Bấm để xem tất cả danh mục"
              >
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-blue">🏷️</div>
                  <span className="stat-trend-pill pill-blue">
                    {statusFilter === 'ALL' ? '✓ Đang xem' : `Toàn bộ ${totalCategories}`}
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Tổng Danh Mục</span>
                  <div className="stat-numeric-value">{totalCategories}</div>
                  <span className="stat-helper-desc">Nhóm phân loại sản phẩm</span>
                </div>
                <div className="stat-mini-progress">
                  <div className="stat-mini-progress-fill progress-fill-blue" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* Card 2: Active Categories */}
              <div
                className={`admin-stat-card-premium theme-emerald clickable ${statusFilter === 'ACTIVE' ? 'active-filter' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')}
                title="Bấm để lọc danh mục đang hiển thị"
              >
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-emerald">👁️</div>
                  <span className="stat-trend-pill pill-emerald">
                    {activePercent}% trang chủ
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Đang Hiển Thị</span>
                  <div className="stat-numeric-value text-emerald">{activeCategories}</div>
                  <span className="stat-helper-desc">Khách hàng thấy ngoài cửa hàng</span>
                </div>
                <div className="stat-mini-progress">
                  <div className="stat-mini-progress-fill progress-fill-emerald" style={{ width: `${activePercent}%` }}></div>
                </div>
              </div>

              {/* Card 3: Inactive Categories */}
              <div
                className={`admin-stat-card-premium theme-amber clickable ${statusFilter === 'INACTIVE' ? 'active-filter' : ''}`}
                onClick={() => setStatusFilter(statusFilter === 'INACTIVE' ? 'ALL' : 'INACTIVE')}
                title="Bấm để lọc danh mục đang tạm ẩn"
              >
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-amber">🙈</div>
                  <span className="stat-trend-pill pill-amber">
                    {inactiveCategories > 0 ? `⚠️ ${inactiveCategories} danh mục ẩn` : 'Tất cả bật'}
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Đang Tạm Ẩn</span>
                  <div className="stat-numeric-value text-amber">{inactiveCategories}</div>
                  <span className="stat-helper-desc">Tạm thời giấu khỏi trang chủ</span>
                </div>
                <div className="stat-mini-progress">
                  <div className="stat-mini-progress-fill progress-fill-amber" style={{ width: `${inactivePercent}%` }}></div>
                </div>
              </div>

              {/* Card 4: Total Products Covered */}
              <div className="admin-stat-card-premium theme-purple">
                <div className="stat-card-top-row">
                  <div className="stat-icon-3d icon-bg-purple">🍬</div>
                  <span className="stat-trend-pill pill-purple">
                    ~{avgProducts} SP/loại
                  </span>
                </div>
                <div className="stat-main-details">
                  <span className="stat-title-label">Tổng Sản Phẩm</span>
                  <div className="stat-numeric-value text-purple">{totalProductsInCategories}</div>
                  <span className="stat-helper-desc">Bánh kẹo đã xếp danh mục</span>
                </div>
                <div className="stat-mini-progress">
                  <div className="stat-mini-progress-fill progress-fill-purple" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Toolbar: Search & Quick Status Filters */}
        <div className="admin-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm danh mục theo tên, mô tả..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filter-pill-group">
            <button
              type="button"
              className={`category-pill-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              🌈 Tất cả ({totalCategories})
            </button>
            <button
              type="button"
              className={`category-pill-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ACTIVE')}
            >
              🟢 Hiển thị ({activeCategories})
            </button>
            <button
              type="button"
              className={`category-pill-btn ${statusFilter === 'INACTIVE' ? 'active' : ''}`}
              onClick={() => setStatusFilter('INACTIVE')}
            >
              🙈 Đang ẩn ({inactiveCategories})
            </button>
          </div>

          <div className="category-reorder-hint">
            💡 <em>Mẹo: Bấm vào thẻ thống kê để lọc nhanh, hoặc kéo-thả hàng / bấm ⬆️ ⬇️ để đổi thứ tự ngoài trang chủ.</em>
          </div>
        </div>

        {error && <div className="alert alert-error mb-3">{error}</div>}

        {/* Categories Table */}
        {loading ? (
          <div className="loading-grid-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách danh mục...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="catalog-empty-card">
            <div className="empty-candy-icon">🏷️</div>
            <h3>Không tìm thấy danh mục nào!</h3>
            <p>Hãy thêm danh mục mới để phân loại bánh kẹo trong cửa hàng.</p>
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={handleOpenCreateModal}
            >
              ➕ Thêm Danh Mục Đầu Tiên
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table category-manage-table">
              <thead>
                <tr>
                  <th style={{ width: '90px', textAlign: 'center' }}>Thứ Tự</th>
                  <th style={{ width: '90px' }}>Ảnh / Icon</th>
                  <th>Tên Danh Mục & Mô Tả</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>Số Sản Phẩm</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>Trạng Thái</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`category-row-draggable ${draggedIndex === idx ? 'row-dragging' : ''}`}
                  >
                    {/* Display Order & Drag Handle */}
                    <td style={{ textAlign: 'center' }}>
                      <div className="display-order-control">
                        <span className="drag-handle-icon" title="Kéo thả để sắp xếp">
                          ☰
                        </span>
                        <span className="order-number-badge">{cat.displayOrder}</span>
                        <div className="order-move-btn-group">
                          <button
                            type="button"
                            className="btn-order-arrow"
                            disabled={idx === 0 || isReordering}
                            onClick={() => handleMoveOrder(idx, -1)}
                            title="Di chuyển lên"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn-order-arrow"
                            disabled={idx === filteredCategories.length - 1 || isReordering}
                            onClick={() => handleMoveOrder(idx, 1)}
                            title="Di chuyển xuống"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Image Thumbnail */}
                    <td>
                      <div className="cat-table-thumb">
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="cat-table-ph">🍬</div>
                        )}
                      </div>
                    </td>

                    {/* Name & Description */}
                    <td>
                      <div className="cat-name-box">
                        <strong className="cat-table-name">{cat.name}</strong>
                        <p className="cat-table-desc">
                          {cat.description || <em className="text-muted">Chưa có mô tả</em>}
                        </p>
                      </div>
                    </td>

                    {/* Product Count */}
                    <td style={{ textAlign: 'center' }}>
                      <span className="product-count-pill">
                        📦 {cat.productCount || 0} món
                      </span>
                    </td>

                    {/* Active Status Switch */}
                    <td style={{ textAlign: 'center' }}>
                      <label className="toggle-switch" title={cat.active ? 'Bấm để ẩn danh mục' : 'Bấm để hiện danh mục'}>
                        <input
                          type="checkbox"
                          checked={Boolean(cat.active)}
                          onChange={() => handleToggleActive(cat)}
                        />
                        <span className="toggle-slider round"></span>
                      </label>
                      <div className="toggle-label-text">
                        {cat.active ? (
                          <span className="text-success font-bold">Đang hiện</span>
                        ) : (
                          <span className="text-muted">Đang ẩn</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-btn-group">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleOpenEditModal(cat)}
                          title="Chỉnh sửa danh mục"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => setDeleteTarget(cat)}
                          title="Xoá danh mục"
                        >
                          🗑️ Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container modal-category-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? '✏️ Chỉnh Sửa Danh Mục' : '➕ Thêm Danh Mục Mới'}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {formErrors.server && (
                <div className="alert alert-error mb-3">{formErrors.server}</div>
              )}

              {/* Category Name */}
              <div className="form-group mb-3">
                <label className="input-label" htmlFor="cat-name">
                  Tên danh mục <span className="text-danger">*</span>:
                </label>
                <input
                  id="cat-name"
                  type="text"
                  className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                  placeholder="Ví dụ: Kẹo Dẻo & Marshmallow, Sô Cô La..."
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  autoFocus
                />
                {formErrors.name && (
                  <span className="form-error-msg">{formErrors.name}</span>
                )}
              </div>

              {/* Description */}
              <div className="form-group mb-3">
                <label className="input-label" htmlFor="cat-desc">
                  Mô tả danh mục:
                </label>
                <textarea
                  id="cat-desc"
                  className="form-textarea"
                  rows={3}
                  placeholder="Mô tả ngắn gọn về các loại bánh kẹo trong danh mục này..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Category Image / Icon */}
              <div className="form-group mb-3">
                <label className="input-label">Ảnh minh hoạ / Icon danh mục:</label>
                <div className="category-image-input-layout">
                  <div className="cat-modal-thumb-preview">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="cat-preview-ph">🍬</div>
                    )}
                  </div>

                  <div className="cat-modal-image-fields">
                    <input
                      type="url"
                      className="form-input mb-2"
                      placeholder="Dán link ảnh (URL https://...)"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                    />

                    <div className="cat-upload-file-btn-box">
                      <label className="btn btn-outline btn-sm upload-file-btn">
                        📁 {uploadingImage ? 'Đang tải lên...' : 'Chọn ảnh từ máy tính'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                        />
                      </label>
                      {formData.imageUrl && (
                        <button
                          type="button"
                          className="btn-clear-image-link"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        >
                          Xoá ảnh
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Order & Active Checkbox */}
              <div className="form-row-grid mb-3">
                <div className="form-group">
                  <label className="input-label" htmlFor="cat-order">
                    Thứ tự hiển thị:
                  </label>
                  <input
                    id="cat-order"
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: e.target.value })
                    }
                  />
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    Số nhỏ hơn sẽ hiển thị trước ngoài trang chủ
                  </span>
                </div>

                <div className="form-group">
                  <label className="input-label">Trạng thái hiển thị:</label>
                  <label className="checkbox-custom-label mt-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                    />
                    <span className="checkbox-custom-text">
                      Kích hoạt hiển thị ra ngoài cửa hàng
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="modal-actions mt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={submitting || uploadingImage}
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || uploadingImage}
                >
                  {submitting ? '⏳ Đang lưu...' : editingCategory ? '💾 Lưu Cập Nhật' : '✨ Thêm Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title text-danger">⚠️ Xác Nhận Xoá Danh Mục</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeleteTarget(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xoá danh mục <strong>"{deleteTarget.name}"</strong> không?
              </p>

              {deleteTarget.productCount > 0 ? (
                <div className="alert alert-error mt-3">
                  ⚠️ <strong>Cảnh báo:</strong> Danh mục này hiện đang có{' '}
                  <strong>{deleteTarget.productCount} sản phẩm</strong>. Backend sẽ từ chối xoá cho đến khi bạn chuyển các sản phẩm này sang danh mục khác.
                </div>
              ) : (
                <p className="text-muted mt-2" style={{ fontSize: '0.88rem' }}>
                  Danh mục này hiện không có sản phẩm nào. Bạn có thể xoá an toàn.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="btn btn-primary bg-danger"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? '⏳ Đang xoá...' : 'Xác nhận xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
