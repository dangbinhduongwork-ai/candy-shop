package com.candyshop.service;

import com.candyshop.dto.ShippingSettingDTO;

import java.math.BigDecimal;

public interface ShopSettingService {

    ShippingSettingDTO getShippingSetting();

    ShippingSettingDTO updateShippingSetting(ShippingSettingDTO dto);

    BigDecimal calculateShippingFee(BigDecimal subtotalAfterDiscount);
}
