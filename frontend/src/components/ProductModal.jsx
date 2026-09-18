import React, { useState, useEffect, useRef } from 'react';
import { uploadProductImage } from '../api/productService';

/**
 * ProductModal — dialog for adding or editing a product.
 * Supports file upload with preview, URL input, and field validation.
 */
const ProductModal = ({ isOpen, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    categoryId: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [apiError, setApiError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price ? String(product.price) : '',
        stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : '',
        categoryId: product.category?.id ? String(product.category.id) : '',
        imageUrl: product.imageUrl || '',
      });
      setImagePreview(product.imageUrl || '');
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '0',
        categoryId: categories.length > 0 ? String(categories[0].id) : '',
        imageUrl: '',
      });
      setImagePreview('');
    }
    setErrors({});
    setApiError('');
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn loại bánh kẹo';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Giá sản phẩm phải là số dương lớn hơn 0';
    }

    const stockNum = parseInt(formData.stockQuantity, 10);
    if (formData.stockQuantity === '' || isNaN(stockNum) || stockNum < 0) {
      newErrors.stockQuantity = 'Số lượng tồn kho phải là số nguyên không âm (>= 0)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'imageUrl') {
      setImagePreview(value);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsUploading(true);
    setApiError('');
    try {
      const response = await uploadProductImage(file);
      // Server returns relative path e.g. /uploads/uuid.jpg
      const serverImageUrl = `http://localhost:8080${response.imageUrl}`;
      setFormData((prev) => ({ ...prev, imageUrl: serverImageUrl }));
      setImagePreview(serverImageUrl);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Không thể upload ảnh, vui lòng thử lại');
      // Revert preview to previous URL if failed
      setImagePreview(formData.imageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        categoryId: parseInt(formData.categoryId, 10),
        imageUrl: formData.imageUrl.trim() || null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {product ? '✏️ Chỉnh sửa sản phẩm' : '✨ Thêm sản phẩm mới'}
          </h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            &times;
          </button>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="prod-name">Tên sản phẩm <span className="req">*</span></label>
              <input
                id="prod-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Kẹo dẻo gấu Haribo..."
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="prod-category">Loại bánh kẹo <span className="req">*</span></label>
              <select
                id="prod-category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`form-select ${errors.categoryId ? 'input-error' : ''}`}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <span className="error-text">{errors.categoryId}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="prod-price">Giá bán (VNĐ) <span className="req">*</span></label>
              <input
                id="prod-price"
                type="number"
                name="price"
                step="1000"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="VD: 45000"
                className={errors.price ? 'input-error' : ''}
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="prod-stock">Số lượng tồn kho <span className="req">*</span></label>
              <input
                id="prod-stock"
                type="number"
                name="stockQuantity"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="VD: 100"
                className={errors.stockQuantity ? 'input-error' : ''}
              />
              {errors.stockQuantity && <span className="error-text">{errors.stockQuantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prod-desc">Mô tả sản phẩm</label>
            <textarea
              id="prod-desc"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết, hương vị, thành phần..."
              className="form-textarea"
            />
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label>Hình ảnh sản phẩm</label>
            <div className="image-upload-wrapper">
              <div className="upload-controls">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                  style={{ display: 'none' }}
                  id="image-file-input"
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? '⏳ Đang tải ảnh lên...' : '📁 Tải ảnh từ máy tính'}
                </button>
                <span className="upload-divider">hoặc dán URL:</span>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/candy.jpg"
                  className="image-url-input"
                />
              </div>

              {imagePreview && (
                <div className="image-preview-card">
                  <img
                    src={imagePreview}
                    alt="Xem trước ảnh sản phẩm"
                    className="preview-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                    }}
                  />
                  <button
                    type="button"
                    className="btn-remove-preview"
                    onClick={handleRemoveImage}
                    title="Xoá ảnh"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? '💾 Đang lưu...' : product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
