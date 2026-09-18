package com.candyshop.service;

import com.candyshop.dto.*;
import com.candyshop.entity.Product;
import com.candyshop.entity.Review;
import com.candyshop.entity.Role;
import com.candyshop.entity.User;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.OrderRepository;
import com.candyshop.repository.ProductRepository;
import com.candyshop.repository.ReviewRepository;
import com.candyshop.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             ProductRepository productRepository,
                             OrderRepository orderRepository,
                             UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProductReviewsResponse getProductReviews(Long productId, int page, int size) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviewPage = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);

        List<ReviewResponse> content = reviewPage.getContent().stream()
                .map(this::mapToReviewResponse)
                .toList();

        Double rawAverage = reviewRepository.getAverageRatingByProductId(productId);
        Double averageRating = 0.0;
        if (rawAverage != null) {
            averageRating = Math.round(rawAverage * 10.0) / 10.0;
        }

        long totalReviews = reviewRepository.countByProductId(productId);

        Map<Integer, Long> breakdown = new LinkedHashMap<>();
        for (int star = 5; star >= 1; star--) {
            breakdown.put(star, reviewRepository.countByProductIdAndRating(productId, star));
        }

        return new ProductReviewsResponse(
                content,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast(),
                averageRating,
                totalReviews,
                breakdown
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewEligibilityResponse checkReviewEligibility(Long productId, String userEmail) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId);
        }

        if (userEmail == null || userEmail.isBlank()) {
            return new ReviewEligibilityResponse(false, false, false, null, "Vui lòng đăng nhập để đánh giá sản phẩm");
        }

        Optional<Review> existingReview = reviewRepository.findByProductIdAndUserEmail(productId, userEmail);
        if (existingReview.isPresent()) {
            return new ReviewEligibilityResponse(false, true, true, existingReview.get().getId(), "Bạn đã đánh giá sản phẩm này");
        }

        boolean hasPurchased = orderRepository.hasUserPurchasedCompletedProduct(productId, userEmail);
        if (!hasPurchased) {
            return new ReviewEligibilityResponse(false, false, false, null, "Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua và đơn hàng được giao thành công (COMPLETED)");
        }

        return new ReviewEligibilityResponse(true, true, false, null, "Bạn đủ điều kiện để viết đánh giá cho sản phẩm này");
    }

    @Override
    @Transactional
    public ReviewResponse createReview(Long productId, String userEmail, ReviewRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + userEmail));

        // Constraint 1: User already reviewed
        if (reviewRepository.existsByProductIdAndUserEmail(productId, userEmail)) {
            throw new BadRequestException("Bạn đã đánh giá sản phẩm này rồi! Mỗi khách hàng chỉ được đánh giá 1 lần.");
        }

        // Constraint 2: Must have purchased in COMPLETED order
        if (!orderRepository.hasUserPurchasedCompletedProduct(productId, userEmail)) {
            throw new BadRequestException("Bạn chỉ được đánh giá sản phẩm mà bạn ĐÃ MUA và đơn hàng đã ở trạng thái Hoàn thành (COMPLETED).");
        }

        Review review = new Review(product, user, request.getRating(), request.getComment().trim());
        Review saved = reviewRepository.save(review);

        return mapToReviewResponse(saved);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, String userEmail, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + reviewId));

        if (!review.getUser().getEmail().equals(userEmail)) {
            throw new BadRequestException("Bạn chỉ có quyền chỉnh sửa đánh giá của chính mình.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());

        Review updated = reviewRepository.save(review);
        return mapToReviewResponse(updated);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá với ID: " + reviewId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + userEmail));

        boolean isAuthor = review.getUser().getEmail().equals(userEmail);
        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;

        if (!isAuthor && !isAdmin) {
            throw new BadRequestException("Bạn không có quyền xoá đánh giá này.");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getProduct() != null ? review.getProduct().getId() : null,
                review.getUser() != null ? review.getUser().getId() : null,
                review.getUser() != null ? review.getUser().getFullName() : "Khách hàng",
                review.getUser() != null ? review.getUser().getEmail() : null,
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
