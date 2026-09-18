import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProducts } from '../api/productService';
import { getCategories } from '../api/categoryService';
import BannerCarousel from '../components/BannerCarousel';

/**
 * HomePage — Main customer product catalog with debounce search,
 * category visual showcase, category filtering, price range filtering, sorting, and pagination.
 */
const PRICE_PRESETS = [
  { label: 'Tất cả mức giá', min: null, max: null },
  { label: 'Dưới 50.000đ', min: null, max: 50000 },
  { label: '50.000đ - 100.000đ', min: 50000, max: 100000 },
  { label: 'Trên 100.000đ', min: 100000, max: null },
];

const SORT_OPTIONS = [
  { label: '✨ Mới nhất', sortBy: 'createdAt', sortDir: 'desc' },
  { label: '💰 Giá tăng dần (Thấp đến cao)', sortBy: 'price', sortDir: 'asc' },
  { label: '💎 Giá giảm dần (Cao đến thấp)', sortBy: 'price', sortDir: 'desc' },
  { label: '🔤 Tên sản phẩm (A - Z)', sortBy: 'name', sortDir: 'asc' },
];

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [addingId, setAddingId] = useState(null);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPricePreset, setSelectedPricePreset] = useState(0);
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');
  const [sortIndex, setSortIndex] = useState(0);

  // Pagination states
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Debounce search term (350ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPage(0);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load active categories for public storefront
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories({ includeInactive: false });
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products when filters or pagination change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');

    // Determine min/max price
    let minPrice = null;
    let maxPrice = null;

    if (customMinPrice !== '' || customMaxPrice !== '') {
      minPrice = customMinPrice !== '' ? parseFloat(customMinPrice) : null;
      maxPrice = customMaxPrice !== '' ? parseFloat(customMaxPrice) : null;
    } else {
      minPrice = PRICE_PRESETS[selectedPricePreset].min;
      maxPrice = PRICE_PRESETS[selectedPricePreset].max;
    }

    const currentSort = SORT_OPTIONS[sortIndex];

    try {
      const data = await getProducts({
        page,
        size: pageSize,
        sortBy: currentSort.sortBy,
        sortDir: currentSort.sortDir,
        categoryId: selectedCategory || undefined,
        keyword: debouncedKeyword.trim() || undefined,
        minPrice: minPrice !== null ? minPrice : undefined,
        maxPrice: maxPrice !== null ? maxPrice : undefined,
      });

      setProducts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedCategory, debouncedKeyword, selectedPricePreset, customMinPrice, customMaxPrice, sortIndex]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  // Handle Preset Price click
  const handlePricePresetClick = (idx) => {
    setSelectedPricePreset(idx);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setPage(0);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedKeyword('');
    setSelectedCategory('');
    setSelectedPricePreset(0);
    setCustomMinPrice('');
    setCustomMaxPrice('');
    setSortIndex(0);
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    debouncedKeyword ||
    selectedCategory ||
    selectedPricePreset !== 0 ||
    customMinPrice !== '' ||
    customMaxPrice !== '' ||
    sortIndex !== 0
  );

  return (
    <div className="home-catalog-page">
      {/* Dynamic Homepage Banner Carousel */}
      <BannerCarousel />

      {/* Hero Welcome Banner */}
      <section className="hero-sweet-banner">
        <div className="hero-banner-content">
          <span className="hero-tag">🍬 Thiên Đường Bánh Kẹo Ngọt Ngào</span>
          <h1 className="hero-title">
            Hương Vị Hạnh Phúc Trong Từng Viên Kẹo
          </h1>
          <p className="hero-subtitle">
            Khám phá hơn 100+ mặt hàng, kẹo, bánh quy bơ thượng hạng và đặc sản kẹo truyền thống chuẩn vị.
          </p>

          {user?.role === 'ROLE_ADMIN' && (
            <div className="admin-quick-badge-box">
              <Link to="/admin/products" className="btn btn-admin-banner">
                🍭 Quản Lý Sản Phẩm
              </Link>
              <Link to="/admin/categories" className="btn btn-admin-banner">
                🏷️ Quản Lý Danh Mục
              </Link>
              <Link to="/admin/orders" className="btn btn-admin-banner">
                📦 Quản Lý Đơn Hàng
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Catalog Container */}
      <div className="catalog-container">
        {/* Visual Category Showcase Cards */}
        {categories.length > 0 && (
          <section className="category-showcase-section">
            <div className="category-showcase-header">
              <div>
                <span className="section-sub-badge">🌟 Danh Mục Tuyển Chọn</span>
                <h2 className="showcase-title">Khám Phá Theo Loại Bánh Kẹo</h2>
              </div>
              {selectedCategory && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setSelectedCategory('');
                    setPage(0);
                  }}
                >
                  🌈 Xem tất cả các loại
                </button>
              )}
            </div>

            <div className="category-showcase-grid">
              {/* "All" category card */}
              <div
                className={`category-showcase-card ${selectedCategory === '' ? 'active-showcase' : ''}`}
                onClick={() => {
                  setSelectedCategory('');
                  setPage(0);
                }}
              >
                <div className="cat-card-thumb-box">
                  <div className="cat-card-ph-emoji">🌈</div>
                </div>
                <div className="cat-card-info-box">
                  <h3 className="cat-card-name">Tất Cả Danh Mục</h3>
                  <span className="cat-card-count">{totalElements} món ngon</span>
                </div>
              </div>

              {/* Active Category Cards */}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-showcase-card ${String(selectedCategory) === String(cat.id) ? 'active-showcase' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(0);
                    // Smooth scroll to catalog controls
                    const el = document.getElementById('catalog-controls-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className="cat-card-thumb-box">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="cat-card-thumb-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                        }}
                      />
                    ) : (
                      <div className="cat-card-ph-emoji">🍬</div>
                    )}
                  </div>
                  <div className="cat-card-info-box">
                    <h3 className="cat-card-name">{cat.name}</h3>
                    <span className="cat-card-count">{cat.productCount || 0} sản phẩm</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Top Filter Bar: Search, Category, Price, Sort */}
        <section className="catalog-controls-card" id="catalog-controls-section">
          {/* Row 1: Search & Sort */}
          <div className="controls-row-main">
            <div className="search-input-wrapper">
              <span className="search-icon-decor">🔍</span>
              <input
                type="text"
                className="search-input-field"
                placeholder="Tìm kiếm bánh kẹo theo tên, vị, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchTerm('')}
                  title="Xóa tìm kiếm"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="sort-selector-wrapper">
              <label htmlFor="sort-select" className="sort-label">Sắp xếp:</label>
              <select
                id="sort-select"
                className="form-select sort-select"
                value={sortIndex}
                onChange={(e) => {
                  setSortIndex(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={idx} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Category Filter Pills */}
          <div className="categories-filter-row">
            <span className="filter-section-label">🏷️ Danh mục:</span>
            <div className="category-pills-list">
              <button
                type="button"
                className={`category-pill-btn ${selectedCategory === '' ? 'active' : ''}`}
                onClick={() => {
                  setSelectedCategory('');
                  setPage(0);
                }}
              >
                🌈 Tất cả loại
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-pill-btn ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(0);
                  }}
                >
                  🍬 {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Price Filter Chips */}
          <div className="price-filter-row">
            <span className="filter-section-label">💵 Mức giá:</span>
            <div className="price-presets-list">
              {PRICE_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`price-chip-btn ${selectedPricePreset === idx && customMinPrice === '' && customMaxPrice === '' ? 'active' : ''}`}
                  onClick={() => handlePricePresetClick(idx)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="custom-price-inputs">
              <input
                type="number"
                placeholder="Từ (đ)"
                className="price-num-input"
                value={customMinPrice}
                onChange={(e) => {
                  setCustomMinPrice(e.target.value);
                  setPage(0);
                }}
                min="0"
                step="5000"
              />
              <span className="price-separator">-</span>
              <input
                type="number"
                placeholder="Đến (đ)"
                className="price-num-input"
                value={customMaxPrice}
                onChange={(e) => {
                  setCustomMaxPrice(e.target.value);
                  setPage(0);
                }}
                min="0"
                step="5000"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn-reset-filters"
                onClick={handleResetFilters}
              >
                🔄 Xóa bộ lọc
              </button>
            )}
          </div>
        </section>

        {/* Results Info Bar */}
        <div className="catalog-status-bar">
          <div className="status-text">
            Tìm thấy <strong>{totalElements}</strong> sản phẩm bánh kẹo phù hợp
            {debouncedKeyword && (
              <span> cho từ khóa <em>"{debouncedKeyword}"</em></span>
            )}
            {selectedCategory && (
              <span> trong danh mục <strong>{categories.find((c) => String(c.id) === String(selectedCategory))?.name}</strong></span>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Product Grid / Loading / Empty States */}
        {loading ? (
          <div className="loading-grid-state">
            <div className="spinner"></div>
            <p>Đang tìm kiếm bánh kẹo cho bạn...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="catalog-empty-card">
            <div className="empty-candy-icon">🍭</div>
            <h3>Không tìm thấy sản phẩm nào!</h3>
            <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại khoảng giá và danh mục.</p>
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-primary mt-2"
                onClick={handleResetFilters}
              >
                ✨ Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="products-responsive-grid">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="product-store-card"
                onClick={() => navigate(`/products/${prod.id}`)}
              >
                <div className="card-image-box">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="store-card-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                      }}
                    />
                  ) : (
                    <div className="store-placeholder-img">🍬</div>
                  )}
                  <span className="store-cat-badge">{prod.category?.name}</span>
                </div>

                <div className="card-info-box">
                  <h3 className="store-prod-name" title={prod.name}>
                    {prod.name}
                  </h3>

                  {/* Rating Badge */}
                  <div className="card-rating-badge">
                    {prod.reviewCount > 0 ? (
                      <>
                        <span className="star-icon">⭐</span>
                        <span className="rating-score">{prod.averageRating?.toFixed(1)}</span>
                        <span className="rating-count">({prod.reviewCount})</span>
                      </>
                    ) : (
                      <span className="rating-new">⭐ Chưa có đánh giá</span>
                    )}
                  </div>

                  <p className="store-prod-desc" title={prod.description}>
                    {prod.description || 'Hương vị thơm ngon tuyệt hảo được tuyển chọn.'}
                  </p>

                  <div className="card-price-and-stock">
                    <div className="store-price">{formatCurrency(prod.price)}</div>
                    <span
                      className={`store-stock-tag ${prod.stockQuantity === 0
                        ? 'out'
                        : prod.stockQuantity <= 10
                          ? 'low'
                          : 'ok'
                        }`}
                    >
                      {prod.stockQuantity === 0
                        ? 'Hết hàng'
                        : prod.stockQuantity <= 10
                          ? `Còn ${prod.stockQuantity}`
                          : `Còn hàng`}
                    </span>
                  </div>

                  <div className="card-actions-group">
                    <button
                      type="button"
                      className="btn btn-quick-add-cart"
                      disabled={prod.stockQuantity === 0 || addingId === prod.id}
                      onClick={async (e) => {
                        e.stopPropagation();
                        setAddingId(prod.id);
                        await addToCart(prod.id, 1, prod.name);
                        setAddingId(null);
                      }}
                      title="Thêm nhanh 1 sản phẩm vào giỏ"
                    >
                      {addingId === prod.id ? '⏳' : '🛒 +1 Giỏ'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-view-detail"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${prod.id}`);
                      }}
                    >
                      Chi tiết &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-bar mt-3">
            <button
              className="btn btn-outline btn-sm"
              disabled={page === 0}
              onClick={() => {
                setPage(page - 1);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
            >
              &laquo; Trang trước
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-num-btn ${page === i ? 'active' : ''}`}
                  onClick={() => {
                    setPage(i);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              className="btn btn-outline btn-sm"
              disabled={page === totalPages - 1}
              onClick={() => {
                setPage(page + 1);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
            >
              Trang sau &raquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
