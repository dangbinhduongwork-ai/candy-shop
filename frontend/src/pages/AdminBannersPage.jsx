import React, { useState, useEffect } from 'react';
import AdminNavTabs from '../components/AdminNavTabs';
import { useCart } from '../context/CartContext';
import bannerService from '../api/bannerService';
import { getCategories } from '../api/categoryService';

const AdminBannersPage = () => {
  const { showToast } = useCart();
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formValues, setFormValues] = useState({
    title: '',
    targetUrl: '',
    displayOrder: 0,
    active: true,
    startDate: '',
    endDate: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [quickLinkType, setQuickLinkType] = useState('custom');

  // Delete State
  const [deletingBanner, setDeletingBanner] = useState(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getAllBanners();
      setBanners(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách banner:', err);
      if (showToast) showToast('Không thể tải danh sách banner!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormValues({
      title: '',
      targetUrl: '/products',
      displayOrder: (banners.length + 1) * 10,
      active: true,
      startDate: '',
      endDate: '',
    });
    setImageFile(null);
    setImagePreview('');
    setQuickLinkType('products');
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setEditingBanner(banner);
    setFormValues({
      title: banner.title || '',
      targetUrl: banner.targetUrl || '',
      displayOrder: banner.displayOrder !== undefined ? banner.displayOrder : 0,
      active: banner.active !== undefined ? banner.active : true,
      startDate: banner.startDate ? banner.startDate.substring(0, 16) : '',
      endDate: banner.endDate ? banner.endDate.substring(0, 16) : '',
    });
    setImageFile(null);
    setImagePreview(banner.imageUrl || '');

    // Deduce quick link type
    if (banner.targetUrl === '/products') {
      setQuickLinkType('products');
    } else if (banner.targetUrl && banner.targetUrl.startsWith('/category/')) {
      setQuickLinkType('category');
    } else {
      setQuickLinkType('custom');
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        if (showToast) showToast('Kích thước ảnh tối đa 5MB', 'error');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleQuickLinkChange = (e) => {
    const type = e.target.value;
    setQuickLinkType(type);
    if (type === 'products') {
      setFormValues((prev) => ({ ...prev, targetUrl: '/products' }));
    } else if (type === 'home') {
      setFormValues((prev) => ({ ...prev, targetUrl: '/' }));
    }
  };

  const handleCategorySelect = (e) => {
    const catId = e.target.value;
    if (catId) {
      setFormValues((prev) => ({ ...prev, targetUrl: `/category/${catId}` }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingBanner && !imageFile) {
      if (showToast) showToast('Vui lòng chọn ảnh cho banner!', 'error');
      return;
    }

    if (formValues.startDate && formValues.endDate) {
      if (new Date(formValues.startDate) > new Date(formValues.endDate)) {
        if (showToast) showToast('Ngày bắt đầu không được sau ngày kết thúc', 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (formValues.title) formData.append('title', formValues.title);
      if (formValues.targetUrl) formData.append('targetUrl', formValues.targetUrl);
      formData.append('displayOrder', formValues.displayOrder || 0);
      formData.append('active', formValues.active);
      if (formValues.startDate) formData.append('startDate', formValues.startDate);
      if (formValues.endDate) formData.append('endDate', formValues.endDate);

      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, formData);
        if (showToast) showToast('Cập nhật banner thành công! 🎉', 'success');
        setAlertMsg({ text: 'Cập nhật banner thành công! 🎉', type: 'success' });
      } else {
        await bannerService.createBanner(formData);
        if (showToast) showToast('Tạo banner mới thành công! 🎉', 'success');
        setAlertMsg({ text: 'Tạo banner mới thành công! 🎉', type: 'success' });
      }

      closeModal();
      fetchBanners();
    } catch (err) {
      console.error('Lỗi khi lưu banner:', err);
      const msg = err.response?.data?.message || 'Lỗi khi lưu banner';
      if (showToast) showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const updated = await bannerService.toggleBannerStatus(banner.id, !banner.active);
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, active: updated.active } : b))
      );
      const msg = `Đã ${updated.active ? 'kích hoạt' : 'ẩn'} banner!`;
      if (showToast) showToast(msg, 'info');
      setAlertMsg({ text: msg, type: 'info' });
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái banner:', err);
      if (showToast) showToast('Không thể cập nhật trạng thái banner', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingBanner) return;
    try {
      await bannerService.deleteBanner(deletingBanner.id);
      if (showToast) showToast('Xoá banner thành công!', 'success');
      setAlertMsg({ text: 'Xoá banner thành công!', type: 'success' });
      setBanners((prev) => prev.filter((b) => b.id !== deletingBanner.id));
      setDeletingBanner(null);
    } catch (err) {
      console.error('Lỗi khi xoá banner:', err);
      if (showToast) showToast('Không thể xoá banner!', 'error');
    }
  };

  const isBannerEffective = (banner) => {
    if (!banner.active) return false;
    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now) return false;
    if (banner.endDate && new Date(banner.endDate) < now) return false;
    return true;
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Unified Navigation Tabs */}
        <AdminNavTabs />

        {/* Header */}
        <div className="admin-header">
          <div>
            <span className="admin-subtitle">Quản lý banner khuyến mãi, thứ tự hiển thị và đường link liên kết</span>
            <h1 className="admin-title">Quản Lý Banner Trang Chủ</h1>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            Thêm Banner Mới
          </button>
        </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type === 'error' ? 'danger' : 'success'} mb-3`} style={{
          background: alertMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
          color: alertMsg.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${alertMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          fontWeight: 600
        }}>
          {alertMsg.text}
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách banner...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">🖼️</div>
          <h3>Chưa có banner nào</h3>
          <p>Hãy bấm vào nút "Thêm Banner Mới" để tạo banner trình chiếu trang chủ.</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            ➕ Thêm Banner Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="admin-banners-grid">
          {banners.map((banner) => {
            const effective = isBannerEffective(banner);
            return (
              <div key={banner.id} className={`banner-admin-card ${effective ? 'card-effective' : 'card-inactive'}`}>
                {/* Banner Thumbnail */}
                <div className="banner-card-media">
                  <img
                    src={banner.imageUrl?.startsWith('http') ? banner.imageUrl : `http://localhost:8080${banner.imageUrl}`}
                    alt={banner.title || 'Banner'}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/800x300?text=Banner+Image';
                    }}
                  />
                  <div className="banner-badges-overlay">
                    <span className={`status-pill ${banner.active ? 'status-active' : 'status-inactive'}`}>
                      {banner.active ? '🟢 Đang Bật' : '⚪ Đang Ẩn'}
                    </span>
                    {effective && (
                      <span className="effective-pill" title="Đang hiển thị trên trang chủ">
                        ⭐ Live
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Info */}
                <div className="banner-card-body">
                  <h4 className="banner-card-title">{banner.title || <em>(Không có tiêu đề)</em>}</h4>
                  
                  <div className="banner-info-rows">
                    <div className="banner-info-row">
                      <span className="row-label">🔗 Link đích:</span>
                      <span className="row-val link-val" title={banner.targetUrl || 'Không có'}>
                        {banner.targetUrl || '—'}
                      </span>
                    </div>

                    <div className="banner-info-row">
                      <span className="row-label">🔢 Thứ tự:</span>
                      <span className="row-val font-semibold">{banner.displayOrder}</span>
                    </div>

                    <div className="banner-info-row">
                      <span className="row-label">⏳ Thời hạn:</span>
                      <span className="row-val text-xs">
                        {banner.startDate || banner.endDate ? (
                          <>
                            {banner.startDate ? new Date(banner.startDate).toLocaleDateString('vi-VN') : 'Từ đầu'}
                            {' → '}
                            {banner.endDate ? new Date(banner.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                          </>
                        ) : (
                          'Luôn hiển thị'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="banner-card-actions">
                    <button
                      className={`btn-icon-action ${banner.active ? 'btn-toggle-on' : 'btn-toggle-off'}`}
                      onClick={() => handleToggleStatus(banner)}
                      title={banner.active ? 'Bấm để ẩn banner' : 'Bấm để hiện banner'}
                    >
                      {banner.active ? '👁️ Ẩn' : '👁️‍🗨️ Hiện'}
                    </button>
                    <button
                      className="btn-icon-action btn-edit"
                      onClick={() => openEditModal(banner)}
                      title="Chỉnh sửa banner"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn-icon-action btn-delete"
                      onClick={() => setDeletingBanner(banner)}
                      title="Xoá banner"
                    >
                      🗑️ Xoá
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-banner">
            <div className="modal-header">
              <h3>{editingBanner ? '✏️ Chỉnh Sửa Banner' : '➕ Thêm Banner Mới'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Image Upload Area */}
              <div className="form-group">
                <label className="form-label">
                  Ảnh Banner <span className="required-star">*</span>
                </label>
                <div className="image-upload-wrapper">
                  {imagePreview ? (
                    <div className="banner-preview-box">
                      <img
                        src={imagePreview?.startsWith('blob:') || imagePreview?.startsWith('http') ? imagePreview : `http://localhost:8080${imagePreview}`}
                        alt="Preview"
                        className="banner-preview-img"
                      />
                      <label htmlFor="bannerImgInput" className="change-img-overlay">
                        🔄 Thay đổi ảnh
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="bannerImgInput" className="upload-dropzone">
                      <div className="upload-icon">📸</div>
                      <div className="upload-text">Bấm để chọn ảnh banner từ máy tính</div>
                      <div className="upload-hint">Tỉ lệ khuyến nghị 16:9 hoặc 3:1 (VD: 1600x600px), tối đa 5MB</div>
                    </label>
                  )}
                  <input
                    id="bannerImgInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="bannerTitle">
                  Tiêu đề Banner (tuỳ chọn)
                </label>
                <input
                  id="bannerTitle"
                  type="text"
                  className="form-input"
                  placeholder="VD: Siêu Hội Giảm Giá Mùa Hè 30%"
                  value={formValues.title}
                  onChange={(e) => setFormValues({ ...formValues, title: e.target.value })}
                />
              </div>

              {/* Target Link Picker */}
              <div className="form-group">
                <label className="form-label">
                  Đường link khi bấm vào banner
                </label>
                <div className="link-type-selector">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="quickLinkType"
                      value="products"
                      checked={quickLinkType === 'products'}
                      onChange={handleQuickLinkChange}
                    />
                    Trang Tất cả sản phẩm (/products)
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="quickLinkType"
                      value="category"
                      checked={quickLinkType === 'category'}
                      onChange={handleQuickLinkChange}
                    />
                    Theo Danh mục
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="quickLinkType"
                      value="custom"
                      checked={quickLinkType === 'custom'}
                      onChange={handleQuickLinkChange}
                    />
                    Tùy biến URL
                  </label>
                </div>

                {quickLinkType === 'category' && (
                  <select
                    className="form-select"
                    style={{ marginTop: '0.5rem' }}
                    onChange={handleCategorySelect}
                    value={formValues.targetUrl?.startsWith('/category/') ? formValues.targetUrl.replace('/category/', '') : ''}
                  >
                    <option value="">-- Chọn danh mục sản phẩm --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}

                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="VD: /products, /category/1 hoặc https://..."
                  value={formValues.targetUrl}
                  onChange={(e) => setFormValues({ ...formValues, targetUrl: e.target.value })}
                />
              </div>

              {/* Display Order & Active */}
              <div className="form-row">
                <div className="form-group col-6">
                  <label className="form-label" htmlFor="bannerOrder">
                    Thứ tự hiển thị
                  </label>
                  <input
                    id="bannerOrder"
                    type="number"
                    className="form-input"
                    value={formValues.displayOrder}
                    onChange={(e) => setFormValues({ ...formValues, displayOrder: parseInt(e.target.value) || 0 })}
                  />
                  <small className="form-hint">Số nhỏ hiển thị trước (VD: 1, 2, 3)</small>
                </div>

                <div className="form-group col-6" style={{ display: 'flex', alignItems: 'center', marginTop: '1.75rem' }}>
                  <label className="checkbox-custom-label">
                    <input
                      type="checkbox"
                      checked={formValues.active}
                      onChange={(e) => setFormValues({ ...formValues, active: e.target.checked })}
                    />
                    <span>Kích hoạt hiển thị</span>
                  </label>
                </div>
              </div>

              {/* Date Ranges */}
              <div className="form-row">
                <div className="form-group col-6">
                  <label className="form-label" htmlFor="startDate">
                    Ngày bắt đầu hiển thị (tuỳ chọn)
                  </label>
                  <input
                    id="startDate"
                    type="datetime-local"
                    className="form-input"
                    value={formValues.startDate}
                    onChange={(e) => setFormValues({ ...formValues, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group col-6">
                  <label className="form-label" htmlFor="endDate">
                    Ngày kết thúc hiển thị (tuỳ chọn)
                  </label>
                  <input
                    id="endDate"
                    type="datetime-local"
                    className="form-input"
                    value={formValues.endDate}
                    onChange={(e) => setFormValues({ ...formValues, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={submitting}>
                  Hủy Bỏ
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? '⏳ Đang lưu...' : editingBanner ? '💾 Cập Nhật' : '➕ Tạo Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBanner && (
        <div className="modal-overlay">
          <div className="modal-container modal-confirm">
            <div className="modal-header">
              <h3>🗑️ Xác Nhận Xoá Banner</h3>
              <button className="modal-close-btn" onClick={() => setDeletingBanner(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xoá banner "<strong>{deletingBanner.title || 'này'}</strong>"?</p>
              <p className="text-sm text-gray-500">Hành động này sẽ xoá vĩnh viễn tệp ảnh và không thể hoàn tác.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeletingBanner(null)}>
                Hủy
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                Xoá Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminBannersPage;
