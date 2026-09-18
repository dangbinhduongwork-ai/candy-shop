package com.candyshop.service;

import com.candyshop.dto.BannerRequest;
import com.candyshop.dto.BannerResponse;
import com.candyshop.entity.Banner;
import com.candyshop.exception.BadRequestException;
import com.candyshop.exception.ResourceNotFoundException;
import com.candyshop.repository.BannerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BannerServiceImpl implements BannerService {

    private final BannerRepository bannerRepository;
    private final FileStorageService fileStorageService;

    public BannerServiceImpl(BannerRepository bannerRepository, FileStorageService fileStorageService) {
        this.bannerRepository = bannerRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners() {
        LocalDateTime now = LocalDateTime.now();
        return bannerRepository.findActiveBanners(now).stream()
                .map(BannerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BannerResponse> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrderAscCreatedAtDesc().stream()
                .map(BannerResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BannerResponse getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));
        return BannerResponse.fromEntity(banner);
    }

    @Override
    @Transactional
    public BannerResponse createBanner(BannerRequest request, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new BadRequestException("Vui lòng tải lên ảnh cho banner");
        }

        validateBannerDates(request.getStartDate(), request.getEndDate());

        String imageUrl = fileStorageService.storeFile(image);

        Banner banner = new Banner();
        banner.setImageUrl(imageUrl);
        banner.setTitle(request.getTitle() != null ? request.getTitle().trim() : null);
        banner.setTargetUrl(request.getTargetUrl() != null ? request.getTargetUrl().trim() : null);
        banner.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        banner.setActive(request.getActive() != null ? request.getActive() : true);
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());

        Banner saved = bannerRepository.save(banner);
        return BannerResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public BannerResponse updateBanner(Long id, BannerRequest request, MultipartFile image) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));

        validateBannerDates(request.getStartDate(), request.getEndDate());

        if (image != null && !image.isEmpty()) {
            if (banner.getImageUrl() != null) {
                fileStorageService.deleteFile(banner.getImageUrl());
            }
            String imageUrl = fileStorageService.storeFile(image);
            banner.setImageUrl(imageUrl);
        }

        if (request.getTitle() != null) {
            banner.setTitle(request.getTitle().trim());
        }
        if (request.getTargetUrl() != null) {
            banner.setTargetUrl(request.getTargetUrl().trim());
        }
        if (request.getDisplayOrder() != null) {
            banner.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            banner.setActive(request.getActive());
        }
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());

        Banner updated = bannerRepository.save(banner);
        return BannerResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));

        if (banner.getImageUrl() != null) {
            fileStorageService.deleteFile(banner.getImageUrl());
        }
        bannerRepository.delete(banner);
    }

    @Override
    @Transactional
    public BannerResponse toggleBannerStatus(Long id, Boolean active) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy banner với id: " + id));

        if (active != null) {
            banner.setActive(active);
        } else {
            banner.setActive(!Boolean.TRUE.equals(banner.getActive()));
        }

        Banner updated = bannerRepository.save(banner);
        return BannerResponse.fromEntity(updated);
    }

    private void validateBannerDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new BadRequestException("Ngày bắt đầu không được sau ngày kết thúc hiển thị");
        }
    }
}
