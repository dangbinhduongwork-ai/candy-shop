package com.candyshop.dto;

import java.util.List;
import java.util.Map;

public class ProductReviewsResponse {

    private List<ReviewResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;
    private Double averageRating;
    private long totalReviews;
    private Map<Integer, Long> ratingBreakdown;

    public ProductReviewsResponse() {}

    public ProductReviewsResponse(List<ReviewResponse> content, int page, int size,
                                  long totalElements, int totalPages, boolean last,
                                  Double averageRating, long totalReviews,
                                  Map<Integer, Long> ratingBreakdown) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.last = last;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.ratingBreakdown = ratingBreakdown;
    }

    public List<ReviewResponse> getContent() {
        return content;
    }

    public void setContent(List<ReviewResponse> content) {
        this.content = content;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Map<Integer, Long> getRatingBreakdown() {
        return ratingBreakdown;
    }

    public void setRatingBreakdown(Map<Integer, Long> ratingBreakdown) {
        this.ratingBreakdown = ratingBreakdown;
    }
}
