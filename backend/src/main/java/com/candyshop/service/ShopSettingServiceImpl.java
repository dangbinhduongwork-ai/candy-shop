package com.candyshop.service;

import com.candyshop.dto.ShippingSettingDTO;
import com.candyshop.dto.ShopGeneralSettingDTO;
import com.candyshop.entity.ShopSetting;
import com.candyshop.repository.ShopSettingRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class ShopSettingServiceImpl implements ShopSettingService {

    public static final String KEY_DEFAULT_SHIPPING_FEE = "DEFAULT_SHIPPING_FEE";
    public static final String KEY_FREE_SHIPPING_THRESHOLD = "FREE_SHIPPING_THRESHOLD";

    public static final BigDecimal FALLBACK_SHIPPING_FEE = new BigDecimal("25000");
    public static final BigDecimal FALLBACK_FREE_THRESHOLD = new BigDecimal("300000");

    // --- General Shop Branding, Header & Footer Setting Keys ---
    public static final String KEY_SHOP_NAME = "SHOP_NAME";
    public static final String KEY_SHOP_TITLE = "SHOP_TITLE";
    public static final String KEY_SHOP_SLOGAN = "SHOP_SLOGAN";
    public static final String KEY_HEADER_ANNOUNCEMENT = "HEADER_ANNOUNCEMENT";
    public static final String KEY_HEADER_HOTLINE = "HEADER_HOTLINE";
    public static final String KEY_FOOTER_DESCRIPTION = "FOOTER_DESCRIPTION";
    public static final String KEY_FOOTER_ADDRESS = "FOOTER_ADDRESS";
    public static final String KEY_FOOTER_MAPS_URL = "FOOTER_MAPS_URL";
    public static final String KEY_FOOTER_HOTLINE = "FOOTER_HOTLINE";
    public static final String KEY_FOOTER_WORKING_HOURS = "FOOTER_WORKING_HOURS";
    public static final String KEY_FOOTER_EMAIL = "FOOTER_EMAIL";
    public static final String KEY_FOOTER_COPYRIGHT = "FOOTER_COPYRIGHT";
    public static final String KEY_FOOTER_BADGE_1 = "FOOTER_BADGE_1";
    public static final String KEY_FOOTER_BADGE_2 = "FOOTER_BADGE_2";
    public static final String KEY_ACTIVE_SEASONAL_EFFECT = "ACTIVE_SEASONAL_EFFECT";

    public static final String FALLBACK_SHOP_NAME = "Nguyen Huong Grocery Store";
    public static final String FALLBACK_SHOP_TITLE = "Nguyen Huong Grocery Store - Bánh kẹo & Tạp hóa chính hãng";
    public static final String FALLBACK_SHOP_SLOGAN = "Grocery Store • Since 2026";
    public static final String FALLBACK_HEADER_ANNOUNCEMENT = "Miễn phí giao hàng cho đơn từ 200.000đ • Hotline đặt hàng & CSKH: 0969 315 603";
    public static final String FALLBACK_HEADER_HOTLINE = "0969 315 603";
    public static final String FALLBACK_FOOTER_DESCRIPTION = "Hệ thống bán lẻ thực phẩm thiết yếu, bánh kẹo cao cấp và đặc sản tuyển chọn. Cam kết chất lượng, nguồn gốc rõ ràng và giá thành hợp lý.";
    public static final String FALLBACK_FOOTER_ADDRESS = "Số 509 thôn 9, Suối Hai, Ba Vì, Hà Nội";
    public static final String FALLBACK_FOOTER_MAPS_URL = "https://maps.app.goo.gl/BiWJi5AJAdMfZvRb7";
    public static final String FALLBACK_FOOTER_HOTLINE = "0969 315 603";
    public static final String FALLBACK_FOOTER_WORKING_HOURS = "06:00 - 22:00 tất cả các ngày";
    public static final String FALLBACK_FOOTER_EMAIL = "taphoa.nguyenhuong@gmail.com";
    public static final String FALLBACK_FOOTER_COPYRIGHT = "© 2026 Nguyen Huong Grocery Store. Tất cả các quyền được bảo lưu.";
    public static final String FALLBACK_FOOTER_BADGE_1 = "Sản phẩm chính hãng";
    public static final String FALLBACK_FOOTER_BADGE_2 = "Giao hàng tận nơi";
    public static final String FALLBACK_ACTIVE_SEASONAL_EFFECT = "NONE";


    private final ShopSettingRepository settingRepository;

    public ShopSettingServiceImpl(ShopSettingRepository settingRepository) {
        this.settingRepository = settingRepository;
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "settings", key = "'shipping'")
    public ShippingSettingDTO getShippingSetting() {
        BigDecimal defaultFee = getDecimalValue(KEY_DEFAULT_SHIPPING_FEE, FALLBACK_SHIPPING_FEE);
        BigDecimal freeThreshold = getDecimalValue(KEY_FREE_SHIPPING_THRESHOLD, FALLBACK_FREE_THRESHOLD);
        return new ShippingSettingDTO(defaultFee, freeThreshold);
    }

    @Override
    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public ShippingSettingDTO updateShippingSetting(ShippingSettingDTO dto) {
        if (dto.getDefaultShippingFee() == null || dto.getDefaultShippingFee().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Phí vận chuyển mặc định phải là số không âm");
        }
        if (dto.getFreeShippingThreshold() == null || dto.getFreeShippingThreshold().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Ngưỡng miễn phí vận chuyển phải là số không âm");
        }

        saveOrUpdateSetting(KEY_DEFAULT_SHIPPING_FEE, dto.getDefaultShippingFee().toPlainString(), "Phí vận chuyển mặc định (VNĐ)");
        saveOrUpdateSetting(KEY_FREE_SHIPPING_THRESHOLD, dto.getFreeShippingThreshold().toPlainString(), "Ngưỡng giá trị đơn hàng được miễn phí vận chuyển (VNĐ)");

        return getShippingSetting();
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateShippingFee(BigDecimal subtotalAfterDiscount) {
        if (subtotalAfterDiscount == null) {
            subtotalAfterDiscount = BigDecimal.ZERO;
        }
        ShippingSettingDTO settings = getShippingSetting();
        if (subtotalAfterDiscount.compareTo(settings.getFreeShippingThreshold()) >= 0) {
            return BigDecimal.ZERO;
        }
        return settings.getDefaultShippingFee();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "settings", key = "'general'")
    public ShopGeneralSettingDTO getGeneralSetting() {
        return new ShopGeneralSettingDTO(
                getStringValue(KEY_SHOP_NAME, FALLBACK_SHOP_NAME),
                getStringValue(KEY_SHOP_TITLE, FALLBACK_SHOP_TITLE),
                getStringValue(KEY_SHOP_SLOGAN, FALLBACK_SHOP_SLOGAN),
                getStringValue(KEY_HEADER_ANNOUNCEMENT, FALLBACK_HEADER_ANNOUNCEMENT),
                getStringValue(KEY_HEADER_HOTLINE, FALLBACK_HEADER_HOTLINE),
                getStringValue(KEY_FOOTER_DESCRIPTION, FALLBACK_FOOTER_DESCRIPTION),
                getStringValue(KEY_FOOTER_ADDRESS, FALLBACK_FOOTER_ADDRESS),
                getStringValue(KEY_FOOTER_MAPS_URL, FALLBACK_FOOTER_MAPS_URL),
                getStringValue(KEY_FOOTER_HOTLINE, FALLBACK_FOOTER_HOTLINE),
                getStringValue(KEY_FOOTER_WORKING_HOURS, FALLBACK_FOOTER_WORKING_HOURS),
                getStringValue(KEY_FOOTER_EMAIL, FALLBACK_FOOTER_EMAIL),
                getStringValue(KEY_FOOTER_COPYRIGHT, FALLBACK_FOOTER_COPYRIGHT),
                getStringValue(KEY_FOOTER_BADGE_1, FALLBACK_FOOTER_BADGE_1),
                getStringValue(KEY_FOOTER_BADGE_2, FALLBACK_FOOTER_BADGE_2),
                getStringValue(KEY_ACTIVE_SEASONAL_EFFECT, FALLBACK_ACTIVE_SEASONAL_EFFECT)
        );
    }

    @Override
    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public ShopGeneralSettingDTO updateGeneralSetting(ShopGeneralSettingDTO dto) {
        if (dto.getShopName() != null && !dto.getShopName().trim().isEmpty()) {
            saveOrUpdateSetting(KEY_SHOP_NAME, dto.getShopName().trim(), "Tên hiển thị thương hiệu shop");
        }
        if (dto.getShopTitle() != null && !dto.getShopTitle().trim().isEmpty()) {
            saveOrUpdateSetting(KEY_SHOP_TITLE, dto.getShopTitle().trim(), "Tiêu đề trình duyệt & SEO của shop");
        }
        if (dto.getShopSlogan() != null) {
            saveOrUpdateSetting(KEY_SHOP_SLOGAN, dto.getShopSlogan().trim(), "Slogan / Phụ đề thương hiệu");
        }
        if (dto.getHeaderAnnouncement() != null) {
            saveOrUpdateSetting(KEY_HEADER_ANNOUNCEMENT, dto.getHeaderAnnouncement().trim(), "Thanh thông báo chạy trên đầu trang header");
        }
        if (dto.getHeaderHotline() != null) {
            saveOrUpdateSetting(KEY_HEADER_HOTLINE, dto.getHeaderHotline().trim(), "Hotline hỗ trợ hiển thị trên header");
        }
        if (dto.getFooterDescription() != null) {
            saveOrUpdateSetting(KEY_FOOTER_DESCRIPTION, dto.getFooterDescription().trim(), "Đoạn giới thiệu ngắn về shop ở chân trang footer");
        }
        if (dto.getFooterAddress() != null) {
            saveOrUpdateSetting(KEY_FOOTER_ADDRESS, dto.getFooterAddress().trim(), "Địa chỉ cửa hàng ở footer");
        }
        if (dto.getFooterMapsUrl() != null) {
            saveOrUpdateSetting(KEY_FOOTER_MAPS_URL, dto.getFooterMapsUrl().trim(), "Đường dẫn Google Maps");
        }
        if (dto.getFooterHotline() != null) {
            saveOrUpdateSetting(KEY_FOOTER_HOTLINE, dto.getFooterHotline().trim(), "Số điện thoại hotline ở footer");
        }
        if (dto.getFooterWorkingHours() != null) {
            saveOrUpdateSetting(KEY_FOOTER_WORKING_HOURS, dto.getFooterWorkingHours().trim(), "Thời gian mở cửa phục vụ");
        }
        if (dto.getFooterEmail() != null) {
            saveOrUpdateSetting(KEY_FOOTER_EMAIL, dto.getFooterEmail().trim(), "Email liên hệ của cửa hàng");
        }
        if (dto.getFooterCopyright() != null) {
            saveOrUpdateSetting(KEY_FOOTER_COPYRIGHT, dto.getFooterCopyright().trim(), "Dòng chữ bản quyền ở đáy trang footer");
        }
        if (dto.getFooterBadge1() != null) {
            saveOrUpdateSetting(KEY_FOOTER_BADGE_1, dto.getFooterBadge1().trim(), "Huy hiệu cam kết 1 ở footer");
        }
        if (dto.getFooterBadge2() != null) {
            saveOrUpdateSetting(KEY_FOOTER_BADGE_2, dto.getFooterBadge2().trim(), "Huy hiệu cam kết 2 ở footer");
        }
        if (dto.getActiveEffect() != null) {
            saveOrUpdateSetting(KEY_ACTIVE_SEASONAL_EFFECT, dto.getActiveEffect().trim(), "Hiệu ứng giao diện theo mùa (Canvas Seasonal Effect)");
        }

        return getGeneralSetting();
    }


    private BigDecimal getDecimalValue(String key, BigDecimal fallback) {
        return settingRepository.findBySettingKey(key)
                .map(setting -> {
                    try {
                        return new BigDecimal(setting.getSettingValue());
                    } catch (Exception e) {
                        return fallback;
                    }
                })
                .orElse(fallback);
    }

    private String getStringValue(String key, String fallback) {
        return settingRepository.findBySettingKey(key)
                .map(ShopSetting::getSettingValue)
                .filter(v -> v != null && !v.trim().isEmpty())
                .orElse(fallback);
    }

    private void saveOrUpdateSetting(String key, String value, String description) {
        ShopSetting setting = settingRepository.findBySettingKey(key)
                .orElse(new ShopSetting(key, value, description));
        setting.setSettingValue(value);
        if (description != null) {
            setting.setDescription(description);
        }
        settingRepository.save(setting);
    }
}

