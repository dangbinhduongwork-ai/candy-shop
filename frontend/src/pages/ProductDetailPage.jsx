import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductById, getProducts } from '../api/productService';
import {
  getProductReviews,
  checkReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
} from '../api/reviewService';

/**
 * ProductDetailPage — Public product details view with full information,
 * quantity selector, real cart actions, product reviews & ratings system.
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  // Product state
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);

  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    content: [],
    page: 0,
    size: 5,
    totalElements: 0,
    totalPages: 0,
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewsPage, setReviewsPage] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Review Eligibility & Form state
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasPurchased: false,
    hasReviewed: false,
    userReviewId: null,
    message: '',
  });

  // Create review form
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Edit review state
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete review confirmation state
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);

  // Fetch product detail
  const fetchDetail = useCallback(async () => {
    try {
      const prodData = await getProductById(id);
      setProduct(prodData);
      setQuantity(1);

      // Fetch related products from same category
      if (prodData.category?.id) {
        const related = await getProducts({
          categoryId: prodData.category.id,
          size: 4,
          sortBy: 'createdAt',
          sortDir: 'desc',
        });
        setRelatedProducts(related.content.filter((p) => p.id !== prodData.id).slice(0, 3));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy thông tin sản phẩm');
    }
  }, [id]);

  // Fetch reviews
  const fetchReviews = useCallback(async (pageIndex = 0) => {
    try {
      setReviewsLoading(true);
      const data = await getProductReviews(id, { page: pageIndex, size: 5 });
      setReviewsData(data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  // Fetch eligibility
  const fetchEligibility = useCallback(async () => {
    if (!isAuthenticated) {
      setEligibility({
        canReview: false,
        hasPurchased: false,
        hasReviewed: false,
        userReviewId: null,
        message: 'Vui lòng đăng nhập để đánh giá sản phẩm',
      });
      return;
    }
    try {
      const data = await checkReviewEligibility(id);
      setEligibility(data);
    } catch (err) {
      console.error('Error checking review eligibility:', err);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    setError('');
    window.scrollTo(0, 0);

    Promise.all([fetchDetail(), fetchReviews(0), fetchEligibility()]).finally(() => {
      setLoading(false);
    });
  }, [id, fetchDetail, fetchReviews, fetchEligibility]);

  const showReviewToast = (msg) => {
    setReviewSuccess(msg);
    setTimeout(() => {
      setReviewSuccess('');
    }, 4500);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
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

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && (!product.stockQuantity || newQty <= product.stockQuantity)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    await addToCart(product.id, quantity, product.name);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    const success = await addToCart(product.id, quantity, product.name);
    setAddingToCart(false);
    if (success) {
      navigate('/cart');
    }
  };

  // Submit new review
  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      await createReview(product.id, {
        rating: newRating,
        comment: newComment.trim(),
      });
      showReviewToast('Gửi đánh giá thành công! Cảm ơn nhận xét ngọt ngào của bạn 🎉');
      setNewComment('');
      setNewRating(5);
      // Refresh reviews, eligibility, and product detail
      fetchReviews(0);
      fetchEligibility();
      fetchDetail();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Open edit review modal
  const handleOpenEditReview = (rev) => {
    setEditingReview(rev);
    setEditRating(rev.rating);
    setEditComment(rev.comment);
    setReviewError('');
  };

  // Submit edit review
  const handleSaveEditReview = async (e) => {
    e.preventDefault();
    if (!editComment.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmittingEdit(true);
    setReviewError('');
    try {
      await updateReview(editingReview.id, {
        rating: editRating,
        comment: editComment.trim(),
      });
      showReviewToast('Cập nhật đánh giá thành công! ✨');
      setEditingReview(null);
      // Refresh reviews and product detail
      fetchReviews(reviewsPage);
      fetchEligibility();
      fetchDetail();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Không thể cập nhật đánh giá');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Confirm delete review
  const handleConfirmDeleteReview = async () => {
    if (!reviewToDelete) return;
    setDeletingReview(true);
    try {
      await deleteReview(reviewToDelete.id);
      showReviewToast('Đã xóa đánh giá thành công!');
      setReviewToDelete(null);
      // Refresh reviews, eligibility and product detail
      fetchReviews(0);
      fetchEligibility();
      fetchDetail();
    } catch (err) {
      showReviewToast(err.response?.data?.message || 'Không thể xóa đánh giá');
    } finally {
      setDeletingReview(false);
    }
  };

  const getStarRatingLabel = (stars) => {
    switch (stars) {
      case 5: return 'Tuyệt vời, cực kỳ hài lòng! ⭐⭐⭐⭐⭐';
      case 4: return 'Bánh kẹo ngon, đóng gói đẹp ⭐⭐⭐⭐';
      case 3: return 'Chất lượng bình thường ⭐⭐⭐';
      case 2: return 'Chưa hài lòng ⭐⭐';
      case 1: return 'Rất thất vọng ⭐';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Đang tải thông tin bánh kẹo ngọt ngào...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="detail-error-card">
          <div className="error-icon">🍭</div>
          <h2>Ôi, không tìm thấy sản phẩm!</h2>
          <p>{error || 'Sản phẩm này có thể đã bị gỡ bỏ hoặc không tồn tại.'}</p>
          <Link to="/" className="btn btn-primary mt-2">
            &laquo; Quay về danh sách bánh kẹo
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity === 0;
  const avgRating = reviewsData.averageRating || product.averageRating || 0;
  const reviewTotal = reviewsData.totalReviews || product.reviewCount || 0;

  return (
    <div className="product-detail-page">
      {/* Toast Notification */}
      {reviewSuccess && (
        <div className="global-toast-container" style={{ zIndex: 10002 }}>
          <div className="global-toast toast-success">
            <span style={{ fontSize: '1.2rem' }}>🎉</span>
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{reviewSuccess}</span>
            <button
              type="button"
              onClick={() => setReviewSuccess('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb-nav">
        <Link to="/" className="breadcrumb-link">🏠 Trang chủ</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-cat">{product.category?.name || 'Bánh kẹo'}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      {/* Product Detail Main Card */}
      <div className="product-detail-card">
        {/* Left: Product Image */}
        <div className="product-detail-gallery">
          <div className="detail-image-wrapper">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="detail-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24"><text y="18" font-size="16">🍬</text></svg>';
                }}
              />
            ) : (
              <div className="detail-placeholder-image">🍬</div>
            )}
            <span className="detail-cat-badge">{product.category?.name}</span>
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="product-detail-info">
          <div className="detail-header">
            <span className="detail-sub-badge">🌟 Bánh Kẹo Tuyển Chọn</span>
            <h1 className="detail-title">{product.name}</h1>

            {/* Star Rating Overview near title */}
            <div className="detail-rating-quick">
              <div className="rating-stars-gold">
                {'★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating))}
              </div>
              <strong className="rating-score-num">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</strong>
              <a href="#reviews-section" className="review-count-anchor">
                ({reviewTotal} đánh giá)
              </a>
              <span className="rating-divider">•</span>
              <span className="verified-sold-tag">🍬 Đã bán & tin dùng</span>
            </div>

            <div className="detail-price-box">
              <span className="detail-price-label">Giá ưu đãi:</span>
              <span className="detail-price">{formatCurrency(product.price)}</span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="detail-stock-row">
            <span className="stock-label">Tình trạng:</span>
            {isOutOfStock ? (
              <span className="stock-pill pill-out">❌ Hết hàng</span>
            ) : product.stockQuantity <= 10 ? (
              <span className="stock-pill pill-low">⚠️ Chỉ còn {product.stockQuantity} sản phẩm</span>
            ) : (
              <span className="stock-pill pill-in">✅ Còn hàng ({product.stockQuantity} sản phẩm có sẵn)</span>
            )}
          </div>

          {/* Product Description */}
          <div className="detail-description-section">
            <h3 className="section-title">Mô tả sản phẩm</h3>
            <p className="detail-description">
              {product.description || 'Sản phẩm bánh kẹo cao cấp mang hương vị thơm ngon tuyệt hảo, được chế biến từ những nguyên liệu tươi mới nhất.'}
            </p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          {!isOutOfStock && (
            <div className="detail-actions-section">
              <div className="quantity-selector-box">
                <span className="quantity-label">Số lượng:</span>
                <div className="quantity-controller">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || addingToCart}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="qty-input"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= product.stockQuantity) {
                        setQuantity(val);
                      }
                    }}
                    min="1"
                    max={product.stockQuantity}
                    disabled={addingToCart}
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockQuantity || addingToCart}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detail-btn-group">
                <button
                  type="button"
                  className="btn btn-primary btn-add-cart"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? '⏳ Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
                </button>
                <button
                  type="button"
                  className="btn btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                >
                  ⚡ Mua ngay
                </button>
              </div>
            </div>
          )}

          {/* Safe Shopping Commitments */}
          <div className="shop-benefits-grid">
            <div className="benefit-item">
              <span className="benefit-icon">🚚</span>
              <div>
                <strong>Giao hàng nhanh chóng</strong>
                <p>Nội thành trong 2 giờ</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🍬</span>
              <div>
                <strong>Bánh kẹo tươi ngon</strong>
                <p>Hạn sử dụng luôn mới nhất</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🛡️</span>
              <div>
                <strong>Đổi trả dễ dàng</strong>
                <p>Hoàn tiền nếu không hài lòng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================
          REVIEWS & RATINGS SECTION
          ============================================= */}
      <section id="reviews-section" className="product-reviews-section">
        <div className="section-header">
          <h2 className="related-title">⭐ Đánh Giá & Nhận Xét Từ Khách Hàng</h2>
          <span className="reviews-section-subtitle">
            Nhận xét thật từ khách hàng đã mua và thưởng thức sản phẩm
          </span>
        </div>

        {/* 1. Review Summary Card (Score + Bars) */}
        <div className="review-summary-container">
          <div className="review-score-box">
            <div className="big-rating-number">
              {avgRating > 0 ? avgRating.toFixed(1) : '5.0'}
            </div>
            <div className="rating-stars-large">
              {'★'.repeat(Math.round(avgRating || 5)) + '☆'.repeat(5 - Math.round(avgRating || 5))}
            </div>
            <span className="review-total-hint">
              Dựa trên <strong>{reviewTotal}</strong> đánh giá
            </span>
          </div>

          <div className="review-breakdown-bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviewsData.ratingBreakdown?.[star] || 0;
              const percent = reviewTotal > 0 ? Math.round((count / reviewTotal) * 100) : 0;
              return (
                <div key={star} className="breakdown-bar-row">
                  <span className="star-level-label">{star} ⭐</span>
                  <div className="breakdown-bar-track">
                    <div
                      className="breakdown-bar-fill"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <span className="star-count-label">{count} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Review Form & Eligibility Handling Box */}
        <div className="review-action-box">
          {!isAuthenticated ? (
            <div className="review-notice-card notice-guest">
              <span className="notice-icon">🍬</span>
              <div>
                <strong>Bạn muốn chia sẻ cảm nhận về món bánh kẹo này?</strong>
                <p>
                  Vui lòng{' '}
                  <Link to="/login" className="text-primary font-bold">
                    Đăng nhập tài khoản
                  </Link>{' '}
                  đã mua hàng để viết đánh giá.
                </p>
              </div>
            </div>
          ) : eligibility.canReview ? (
            /* Write Review Form */
            <form onSubmit={handleCreateReview} className="review-create-form">
              <h3 className="form-heading">✍️ Viết đánh giá của bạn</h3>
              <p className="form-sub">Chia sẻ hương vị, độ ngọt, chất lượng đóng gói cho mọi người cùng biết nhé!</p>

              {reviewError && (
                <div className="alert alert-error mb-2">
                  ⚠️ {reviewError}
                </div>
              )}

              {/* Star selector */}
              <div className="form-group">
                <label className="rating-picker-label">Mức độ hài lòng của bạn:</label>
                <div className="interactive-star-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-pick-btn ${
                        (hoverRating || newRating) >= star ? 'star-active' : ''
                      }`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      title={`${star} sao`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-rating-hint-text">
                    {getStarRatingLabel(hoverRating || newRating)}
                  </span>
                </div>
              </div>

              {/* Comment text */}
              <div className="form-group">
                <label className="rating-picker-label">Nhận xét chi tiết:</label>
                <textarea
                  className="form-textarea review-textarea"
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Bánh kẹo ăn rất giòn, độ ngọt vừa phải, thơm nức mùi bơ vani..."
                  maxLength="1000"
                  required
                />
                <span className="char-counter">{newComment.length}/1000 ký tự</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-submit-review"
                disabled={submittingReview}
              >
                {submittingReview ? '⏳ Đang gửi đánh giá...' : '✨ Gửi đánh giá ngay'}
              </button>
            </form>
          ) : eligibility.hasReviewed ? (
            <div className="review-notice-card notice-reviewed">
              <span className="notice-icon">🎉</span>
              <div>
                <strong>Cảm ơn bạn đã đánh giá sản phẩm này!</strong>
                <p>Bạn có thể chỉnh sửa hoặc xóa đánh giá của mình ở danh sách bên dưới bất kỳ lúc nào.</p>
              </div>
            </div>
          ) : (
            <div className="review-notice-card notice-locked">
              <span className="notice-icon">🛍️</span>
              <div>
                <strong>Bạn chưa thể đánh giá sản phẩm này</strong>
                <p>
                  Để đảm bảo tính khách quan và uy tín, chỉ những khách hàng <strong>đã mua sản phẩm</strong> và <strong>đơn hàng đã hoàn thành</strong> mới có thể gửi đánh giá.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. Review List */}
        <div className="reviews-list-container">
          <h3 className="review-list-title">
            💬 Nhận xét ({reviewTotal})
          </h3>

          {reviewsLoading ? (
            <div className="loading-reviews">
              <div className="spinner"></div>
              <p>Đang tải nhận xét...</p>
            </div>
          ) : reviewsData.content.length === 0 ? (
            <div className="empty-reviews-card">
              <span className="empty-reviews-icon">🍭</span>
              <h4>Chưa có đánh giá nào cho sản phẩm này</h4>
              <p>Hãy là người đầu tiên thưởng thức và chia sẻ cảm nhận về món bánh kẹo ngọt ngào này nhé!</p>
            </div>
          ) : (
            <div className="reviews-cards-stack">
              {reviewsData.content.map((rev) => {
                const isOwnReview = user && user.email === rev.userEmail;
                const isAdmin = user && user.role === 'ROLE_ADMIN';
                return (
                  <div
                    key={rev.id}
                    className={`review-item-card ${isOwnReview ? 'own-review-highlight' : ''}`}
                  >
                    <div className="review-card-header">
                      <div className="reviewer-info-left">
                        <div className="reviewer-avatar">
                          {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="reviewer-name-row">
                            <strong className="reviewer-name">{rev.userName}</strong>
                            <span className="verified-badge">✓ Đã mua hàng</span>
                            {isOwnReview && (
                              <span className="own-badge">🌟 Đánh giá của bạn</span>
                            )}
                          </div>
                          <div className="review-stars-and-date">
                            <span className="review-card-stars">
                              {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                            </span>
                            <span className="review-card-date">
                              {formatDateTime(rev.createdAt)}
                              {rev.updatedAt && rev.updatedAt !== rev.createdAt && (
                                <span className="edited-hint"> (đã chỉnh sửa)</span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Edit for author, Delete for author & admin) */}
                      <div className="reviewer-actions">
                        {isOwnReview && (
                          <button
                            type="button"
                            className="btn-review-action btn-edit-review"
                            onClick={() => handleOpenEditReview(rev)}
                            title="Chỉnh sửa đánh giá"
                          >
                            ✏️ Sửa
                          </button>
                        )}
                        {(isOwnReview || isAdmin) && (
                          <button
                            type="button"
                            className="btn-review-action btn-delete-review"
                            onClick={() => setReviewToDelete(rev)}
                            title="Xóa đánh giá"
                          >
                            🗑️ Xóa
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="review-card-body">
                      <p className="review-comment-text">{rev.comment}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reviews Pagination */}
          {reviewsData.totalPages > 1 && (
            <div className="pagination-bar mt-3">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={reviewsData.page === 0}
                onClick={() => {
                  setReviewsPage(reviewsData.page - 1);
                  fetchReviews(reviewsData.page - 1);
                }}
              >
                &laquo; Trang trước
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: reviewsData.totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`page-num-btn ${reviewsData.page === i ? 'active' : ''}`}
                    onClick={() => {
                      setReviewsPage(i);
                      fetchReviews(i);
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={reviewsData.page === reviewsData.totalPages - 1}
                onClick={() => {
                  setReviewsPage(reviewsData.page + 1);
                  fetchReviews(reviewsData.page + 1);
                }}
              >
                Trang sau &raquo;
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="modal-overlay" onClick={() => setEditingReview(null)}>
          <div className="modal-container modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">✏️ Chỉnh sửa đánh giá của bạn</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingReview(null)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveEditReview}>
              <div className="modal-body">
                {reviewError && (
                  <div className="alert alert-error mb-2">
                    ⚠️ {reviewError}
                  </div>
                )}

                <div className="form-group">
                  <label className="rating-picker-label">Mức độ hài lòng:</label>
                  <div className="interactive-star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-pick-btn ${editRating >= star ? 'star-active' : ''}`}
                        onClick={() => setEditRating(star)}
                      >
                        ★
                      </button>
                    ))}
                    <span className="star-rating-hint-text">
                      {getStarRatingLabel(editRating)}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="rating-picker-label">Nội dung nhận xét:</label>
                  <textarea
                    className="form-textarea review-textarea"
                    rows="4"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    maxLength="1000"
                    required
                  />
                  <span className="char-counter">{editComment.length}/1000 ký tự</span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingReview(null)}
                  disabled={submittingEdit}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Review Confirmation Modal */}
      {reviewToDelete && (
        <div className="modal-overlay" onClick={() => setReviewToDelete(null)}>
          <div className="modal-container modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title text-danger">⚠️ Xác nhận xóa đánh giá</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReviewToDelete(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa bài đánh giá của <strong>{reviewToDelete.userName}</strong> ({reviewToDelete.rating} ⭐) không?
              </p>
              <p className="text-muted text-sm mt-1">
                Hành động này sẽ xóa vĩnh viễn nhận xét và cập nhật lại điểm số trung bình của sản phẩm.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setReviewToDelete(null)}
                disabled={deletingReview}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-primary bg-danger"
                onClick={handleConfirmDeleteReview}
                disabled={deletingReview}
              >
                {deletingReview ? 'Đang xóa...' : 'Xác nhận xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="related-products-section">
          <div className="section-header">
            <h2 className="related-title">🍭 Sản phẩm cùng loại bạn có thể thích</h2>
          </div>
          <div className="products-responsive-grid">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="product-store-card"
                onClick={() => navigate(`/products/${rel.id}`)}
              >
                <div className="card-image-box">
                  {rel.imageUrl ? (
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="store-card-img"
                    />
                  ) : (
                    <div className="store-placeholder-img">🍬</div>
                  )}
                  <span className="store-cat-badge">{rel.category?.name}</span>
                </div>
                <div className="card-info-box">
                  <h3 className="store-prod-name">{rel.name}</h3>
                  <div className="store-prod-desc">
                    {rel.description || 'Hương vị thơm ngon tuyệt hảo được tuyển chọn.'}
                  </div>
                  <div className="card-price-and-stock">
                    <div className="store-price">{formatCurrency(rel.price)}</div>
                  </div>
                  <div className="card-actions-group">
                    <button className="btn btn-view-detail">
                      Xem ngay &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Back Button */}
      <div className="detail-footer-back">
        <Link to="/" className="btn btn-outline">
          &laquo; Quay lại danh mục bánh kẹo
        </Link>
      </div>
    </div>
  );
};

export default ProductDetailPage;
