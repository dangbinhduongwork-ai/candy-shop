package com.candyshop.controller;

import com.candyshop.dto.BannerRequest;
import com.candyshop.dto.BannerResponse;
import com.candyshop.service.BannerService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
public class AdminBannerController {

    private final BannerService bannerService;

    public AdminBannerController(BannerService bannerService) {
        this.bannerService = bannerService;
    }

    /**
     * GET /api/admin/banners
     * List all banners (including hidden / expired).
     */
    @GetMapping
    public ResponseEntity<List<BannerResponse>> getAllBanners() {
        List<BannerResponse> banners = bannerService.getAllBanners();
        return ResponseEntity.ok(banners);
    }

    /**
     * GET /api/admin/banners/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<BannerResponse> getBannerById(@PathVariable Long id) {
        BannerResponse banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(banner);
    }

    /**
     * POST /api/admin/banners
     * Create new banner with uploaded image.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BannerResponse> createBanner(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "targetUrl", required = false) String targetUrl,
            @RequestParam(value = "displayOrder", defaultValue = "0") Integer displayOrder,
            @RequestParam(value = "active", defaultValue = "true") Boolean active,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        BannerRequest request = new BannerRequest();
        request.setTitle(title);
        request.setTargetUrl(targetUrl);
        request.setDisplayOrder(displayOrder);
        request.setActive(active);
        request.setStartDate(startDate);
        request.setEndDate(endDate);

        BannerResponse created = bannerService.createBanner(request, image);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/admin/banners/{id}
     * Update banner details, optionally uploading a new image.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BannerResponse> updateBanner(
            @PathVariable Long id,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "targetUrl", required = false) String targetUrl,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        BannerRequest request = new BannerRequest();
        request.setTitle(title);
        request.setTargetUrl(targetUrl);
        request.setDisplayOrder(displayOrder);
        request.setActive(active);
        request.setStartDate(startDate);
        request.setEndDate(endDate);

        BannerResponse updated = bannerService.updateBanner(id, request, image);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/admin/banners/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/admin/banners/{id}/status
     * Quick toggle / set active status.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<BannerResponse> toggleBannerStatus(
            @PathVariable Long id,
            @RequestParam(value = "active", required = false) Boolean active) {
        BannerResponse updated = bannerService.toggleBannerStatus(id, active);
        return ResponseEntity.ok(updated);
    }
}
