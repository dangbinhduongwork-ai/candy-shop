package com.candyshop.service;

import com.candyshop.dto.BannerRequest;
import com.candyshop.dto.BannerResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BannerService {

    List<BannerResponse> getActiveBanners();

    List<BannerResponse> getAllBanners();

    BannerResponse getBannerById(Long id);

    BannerResponse createBanner(BannerRequest request, MultipartFile image);

    BannerResponse updateBanner(Long id, BannerRequest request, MultipartFile image);

    void deleteBanner(Long id);

    BannerResponse toggleBannerStatus(Long id, Boolean active);
}
