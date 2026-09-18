import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../api/productService';
import ProductModal from '../components/ProductModal';

/**
 * AdminProductsPage — Admin product management dashboard.
 * Provides full CRUD operations, pagination, search, category filtering,
 * and image uploads.
 */
const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pagination & Filtering state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Delete confirmation modal
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProducts({
        page,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
        categoryId: selectedCategory || undefined,
        keyword: keyword || undefined,
      });

      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedCategory, keyword]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setKeyword(searchInput);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setKeyword('');
    setSelectedCategory('');
    setPage(0);
  };

  // Create or Update Product
  const handleSaveProduct = async (productData) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      showToast('Cập nhật sản phẩm thành công! 🎉');
    } else {
      await createProduct(productData);
      showToast('Thêm sản phẩm mới thành công! 🍬');
    }
    fetchProducts();
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  // Delete product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete.id);
      showToast(`Đã xóa sản phẩm "${productToDelete.name}" thành công!`);
      setProductToDelete(null);
      // If last item on page deleted and page > 0, go back one page
      if (products.length === 1 && page > 0) {
        setPage(page - 1);
      } else {
        fetchProducts();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa sản phẩm');
    } finally {
      setIsDeleting(false);
    }
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Navigation Tabs */}
        <div className="admin-nav-tabs">
          <Link to="/admin/products" className="admin-tab-btn active">
            🍭 Quản Lý Sản Phẩm
          </Link>
          <Link to="/admin/categories" className="admin-tab-btn">
            🏷️ Quản Lý Danh Mục
          </Link>
          <Link to="/admin/orders" className="admin-tab-btn">
            📦 Quản Lý Đơn Hàng
          </Link>
        </div>

        {/* Header Section */}
        <div className="admin-header">
          <div>
            <span className="admin-subtitle">Hệ thống quản trị</span>
            <h1 className="admin-title">🍭 Quản Lý Sản Phẩm Bánh Kẹo</h1>
          </div>
          <button className="btn btn-primary btn-add-prod" onClick={handleOpenCreateModal}>
            ✨ Thêm sản phẩm mới
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="alert alert-success toast-animation">
            {successMsg}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Controls Toolbar: Search & Filter */}
        <div className="admin-toolbar">
          <form onSubmit={handleSearchSubmit} className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên sản phẩm, mô tả..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Tìm kiếm
            </button>
          </form>

          <div className="filter-group">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(0);
              }}
              className="form-select category-select"
            >
              <option value="">🍬 Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {(keyword || selectedCategory) && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleResetFilters}
              >
                🔄 Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="admin-stats-bar">
          <span>Tổng số: <strong>{totalElements}</strong> sản phẩm</span>
          {keyword && <span> | Từ khóa: <em>"{keyword}"</em></span>}
          {selectedCategory && (
            <span> | Danh mục: <strong>{categories.find((c) => String(c.id) === String(selectedCategory))?.name}</strong></span>
          )}
        </div>

        {/* Products Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Loại bánh kẹo</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>Ngày tạo</th>
                <th style={{ width: '160px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-loading">
                    <div className="spinner"></div>
                    <p>Đang tải dữ liệu sản phẩm...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    <div className="empty-icon">🍬</div>
                    <p>Không tìm thấy sản phẩm nào phù hợp.</p>
                    <button
                      className="btn btn-outline btn-sm mt-2"
                      onClick={handleOpenCreateModal}
                    >
                      + Tạo sản phẩm đầu tiên
                    </button>
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div className="prod-thumbnail-wrapper">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="prod-thumbnail"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="prod-thumbnail-placeholder">🍬</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="prod-name-col">
                        <strong className="prod-title">{prod.name}</strong>
                        {prod.description && (
                          <p className="prod-desc-preview" title={prod.description}>
                            {prod.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">
                        {prod.category?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td>
                      <span className="price-tag">{formatCurrency(prod.price)}</span>
                    </td>
                    <td>
                      <span
                        className={`stock-badge ${
                          prod.stockQuantity === 0
                            ? 'stock-out'
                            : prod.stockQuantity <= 15
                            ? 'stock-low'
                            : 'stock-ok'
                        }`}
                      >
                        {prod.stockQuantity === 0
                          ? 'Hết hàng'
                          : `${prod.stockQuantity} cái`}
                      </span>
                    </td>
                    <td className="date-col">{formatDate(prod.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenEditModal(prod)}
                          title="Chỉnh sửa sản phẩm"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => setProductToDelete(prod)}
                          title="Xóa sản phẩm"
                        >
                          🗑️ Xóa
                        </button>
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
          <div className="pagination-bar">
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

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-overlay" onClick={() => setProductToDelete(null)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title text-danger">⚠️ Xác nhận xóa</h3>
              <button
                className="modal-close-btn"
                onClick={() => setProductToDelete(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa sản phẩm{' '}
                <strong>"{productToDelete.name}"</strong> không?
              </p>
              <p className="text-muted text-sm mt-1">
                Hành động này không thể hoàn tác sau khi thực hiện.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary bg-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
