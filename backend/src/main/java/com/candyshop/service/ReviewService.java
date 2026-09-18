package com.candyshop.service;

import com.candyshop.dto.ProductReviewsResponse;
import com.candyshop.dto.ReviewEligibilityResponse;
import com.candyshop.dto.ReviewRequest;
import com.candyshop.dto.ReviewResponse;

public interface ReviewService {

    ProductReviewsResponse getProductReviews(Long productId, int page, int size);

    ReviewEligibilityResponse checkReviewEligibility(Long productId, String userEmail);

    ReviewResponse createReview(Long productId, String userEmail, ReviewRequest request);

    ReviewResponse updateReview(Long reviewId, String userEmail, ReviewRequest request);

    void deleteReview(Long reviewId, String userEmail);
}
