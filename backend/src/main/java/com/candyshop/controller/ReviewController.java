package com.candyshop.controller;

import com.candyshop.dto.ProductReviewsResponse;
import com.candyshop.dto.ReviewEligibilityResponse;
import com.candyshop.dto.ReviewRequest;
import com.candyshop.dto.ReviewResponse;
import com.candyshop.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * GET /api/products/{productId}/reviews : Get paginated reviews for a product (public)
     */
    @GetMapping("/api/products/{productId}/reviews")
    public ResponseEntity<ProductReviewsResponse> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        ProductReviewsResponse response = reviewService.getProductReviews(productId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/products/{productId}/reviews/eligibility : Check if current user can review this product
     */
    @GetMapping("/api/products/{productId}/reviews/eligibility")
    public ResponseEntity<ReviewEligibilityResponse> checkEligibility(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        ReviewEligibilityResponse response = reviewService.checkReviewEligibility(productId, email);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/products/{productId}/reviews : Create a new review for product
     * Requires authentication + completed purchase
     */
    @PostMapping("/api/products/{productId}/reviews")
    public ResponseEntity<ReviewResponse> createReview(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.createReview(productId, userDetails.getUsername(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * PUT /api/reviews/{id} : Update review
     * Only review author can update
     */
    @PutMapping("/api/reviews/{id}")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.updateReview(id, userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /api/reviews/{id} : Delete review
     * Author or Admin can delete
     */
    @DeleteMapping("/api/reviews/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(id, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Đã xoá đánh giá thành công"));
    }
}
