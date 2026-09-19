package com.candyshop.service;

import com.candyshop.dto.ShippingSettingDTO;
import com.candyshop.entity.ShopSetting;
import com.candyshop.exception.ResourceNotFoundException;
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
