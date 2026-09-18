package com.candyshop.dto;

import com.candyshop.entity.Banner;

import java.time.LocalDateTime;

public class BannerResponse {

    private Long id;
    private String imageUrl;
    private String title;
    private String targetUrl;
    private Integer displayOrder;
    private Boolean active;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BannerResponse() {
    }

    public static BannerResponse fromEntity(Banner banner) {
        if (banner == null) return null;
        BannerResponse resp = new BannerResponse();
        resp.setId(banner.getId());
        resp.setImageUrl(banner.getImageUrl());
        resp.setTitle(banner.getTitle());
        resp.setTargetUrl(banner.getTargetUrl());
        resp.setDisplayOrder(banner.getDisplayOrder());
        resp.setActive(banner.getActive());
        resp.setStartDate(banner.getStartDate());
        resp.setEndDate(banner.getEndDate());
        resp.setCreatedAt(banner.getCreatedAt());
        resp.setUpdatedAt(banner.getUpdatedAt());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getTargetUrl() {
        return targetUrl;
    }

    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
