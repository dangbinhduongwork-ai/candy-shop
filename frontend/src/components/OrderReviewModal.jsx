import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { checkReviewEligibility, createReview, updateReview, deleteReview } from '../api/reviewService';

const RATING_DESCRIPTIONS = {
  1: '⭐ Rất tệ',
  2: '⭐⭐ Không ngon / Tệ',
  3: '⭐⭐⭐ Bình thường',
  4: '⭐⭐⭐⭐ Ngon / Hài lòng',
  5: '⭐⭐⭐⭐⭐ Rất ngon / Tuyệt vời!',
};

const OrderReviewModal = ({ product, isOpen, onClose, onReviewSuccess }) => {
  const { showToast } = useCart();

  const [loadingEligibility, setLoadingEligibility] = useState(true);
  const [eligibility, setEligibility] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchEligibility = async () => {
    if (!product || !product.productId) return;
    setLoadingEligibility(true);
    setErrorMessage('');
    try {
      const data = await checkReviewEligibility(product.productId);
      setEligibility(data);
      if (data.existingReview) {
        setRating(data.existingReview.rating);
        setComment(data.existingReview.comment || '');
        setIsEditing(false);
      } else {
        setRating(5);
        setComment('');
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error loading review eligibility:', err);
      setErrorMessage(err.response?.data?.message || 'Không thể kiểm tra trạng thái đánh giá');
    } finally {
      setLoadingEligibility(false);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchEligibility();
      setShowDeleteConfirm(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      showToast('Vui lòng chọn từ 1 đến 5 sao', 'error');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      if (eligibility?.existingReview) {
        // Update review
        await updateReview(eligibility.existingReview.id, { rating, comment });
        showToast('🎉 Cập nhật đánh giá bánh kẹo thành công!', 'success');
      } else {
        // Create new review
        await createReview(product.productId, { rating, comment });
        showToast('🎉 Cảm ơn bạn đã gửi đánh giá bánh kẹo!', 'success');
      }
      if (onReviewSuccess) {
        onReviewSuccess();
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu đánh giá';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eligibility?.existingReview) return;
    setDeleting(true);
    try {
      await deleteReview(eligibility.existingReview.id);
      showToast('Đã xoá đánh giá của bạn thành công!', 'info');
      if (onReviewSuccess) {
        onReviewSuccess();
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể xoá đánh giá';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-review-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            ⭐ {eligibility?.existingReview && !isEditing ? 'Đánh Giá Của Bạn' : 'Đánh Giá Bánh Kẹo'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Đóng">
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Product Summary Header */}
          <div className="review-modal-product-summary">
            <div className="review-modal-thumb">
              {product.productImageUrl ? (
                <img src={product.productImageUrl} alt={product.productName} />
              ) : (
                <div className="review-modal-ph">🍬</div>
              )}
            </div>
            <div className="review-modal-prod-info">
              {product.categoryName && (
                <span className="order-item-category-pill">{product.categoryName}</span>
              )}
              <h4 className="review-modal-prod-name">{product.productName}</h4>
              <p className="review-modal-prod-price">
                Giá mua: <strong>{formatCurrency(product.priceAtOrder || product.price)}</strong>
              </p>
            </div>
          </div>

          {errorMessage && <div className="alert alert-error mb-2">{errorMessage}</div>}

          {loadingEligibility ? (
            <div className="loading-grid-state py-4">
              <div className="spinner"></div>
              <p>Đang kiểm tra thông tin đánh giá...</p>
            </div>
          ) : !eligibility?.eligible && !eligibility?.alreadyReviewed ? (
            <div className="alert alert-warning">
              ⚠️ {eligibility?.message || 'Bạn chỉ có thể đánh giá sản phẩm này sau khi đơn hàng được giao thành công.'}
            </div>
          ) : eligibility?.alreadyReviewed && !isEditing ? (
            /* Existing review view mode */
            <div className="existing-review-view-card">
              <div className="existing-review-badge-row">
                <span className="own-badge">✨ Đã đánh giá</span>
                <span className="review-card-date">
                  🕒 {formatDate(eligibility.existingReview.createdAt)}
                </span>
              </div>

              <div className="existing-review-stars-row">
                <span className="rating-stars-gold">
                  {'★'.repeat(eligibility.existingReview.rating)}
                  {'☆'.repeat(5 - eligibility.existingReview.rating)}
                </span>
                <span className="existing-review-score-desc">
                  {RATING_DESCRIPTIONS[eligibility.existingReview.rating]}
                </span>
              </div>

              <div className="existing-review-comment-box">
                {eligibility.existingReview.comment ? (
                  <p>"{eligibility.existingReview.comment}"</p>
                ) : (
                  <p className="text-muted italic">(Không có nhận xét bằng chữ)</p>
                )}
              </div>

              {showDeleteConfirm ? (
                <div className="alert-box-warning mt-3">
                  <p><strong>Xác nhận xoá:</strong> Bạn có chắc muốn xoá đánh giá này?</p>
                  <div className="d-flex gap-2 mt-2">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Huỷ
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary bg-danger btn-sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Đang xoá...' : 'Xác nhận xoá'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="existing-review-actions-row">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Chỉnh sửa đánh giá
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    🗑️ Xoá
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Create or Edit Review Form */
            <form onSubmit={handleSubmit} className="order-review-form">
              <div className="form-group mb-3">
                <label className="rating-picker-label">
                  Chất lượng sản phẩm ({hoverRating || rating}/5 sao):
                </label>
                <div className="interactive-star-picker" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-pick-btn ${
                        star <= (hoverRating || rating) ? 'star-active' : ''
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      title={`${star} sao`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="star-rating-hint-text">
                    {RATING_DESCRIPTIONS[hoverRating || rating]}
                  </span>
                </div>
              </div>

              <div className="form-group mb-3">
                <label className="input-label" htmlFor="order-review-comment">
                  Nhận xét của bạn về bánh kẹo:
                </label>
                <textarea
                  id="order-review-comment"
                  className="review-textarea"
                  rows={4}
                  placeholder="Hãy chia sẻ trải nghiệm của bạn về hương vị, độ ngọt, bao bì, hạn sử dụng..."
                  value={comment}
                  maxLength={1000}
                  onChange={(e) => setComment(e.target.value)}
                />
                <span className="char-counter">{comment.length} / 1000 ký tự</span>
              </div>

              <div className="modal-actions mt-3">
                {eligibility?.alreadyReviewed && isEditing && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsEditing(false)}
                    disabled={submitting}
                  >
                    Huỷ sửa
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onClose}
                  disabled={submitting}
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Đang gửi...' : eligibility?.alreadyReviewed ? '💾 Lưu cập nhật' : '✨ Gửi đánh giá'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer link to detail page */}
        <div className="modal-footer-link">
          <Link
            to={`/products/${product.productId}`}
            className="view-all-product-reviews-link"
            onClick={onClose}
          >
            🔍 Xem trang chi tiết & tất cả bình luận về món này &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewModal;
