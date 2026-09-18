package com.candyshop.dto;

public class ReviewEligibilityResponse {

    private boolean canReview;
    private boolean hasPurchased;
    private boolean hasReviewed;
    private Long userReviewId;
    private String message;

    public ReviewEligibilityResponse() {}

    public ReviewEligibilityResponse(boolean canReview, boolean hasPurchased,
                                     boolean hasReviewed, Long userReviewId,
                                     String message) {
        this.canReview = canReview;
        this.hasPurchased = hasPurchased;
        this.hasReviewed = hasReviewed;
        this.userReviewId = userReviewId;
        this.message = message;
    }

    public boolean isCanReview() {
        return canReview;
    }

    public void setCanReview(boolean canReview) {
        this.canReview = canReview;
    }

    public boolean isHasPurchased() {
        return hasPurchased;
    }

    public void setHasPurchased(boolean hasPurchased) {
        this.hasPurchased = hasPurchased;
    }

    public boolean isHasReviewed() {
        return hasReviewed;
    }

    public void setHasReviewed(boolean hasReviewed) {
        this.hasReviewed = hasReviewed;
    }

    public Long getUserReviewId() {
        return userReviewId;
    }

    public void setUserReviewId(Long userReviewId) {
        this.userReviewId = userReviewId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
