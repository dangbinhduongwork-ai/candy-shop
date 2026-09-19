package com.candyshop.service;

import com.candyshop.dto.ShippingSettingDTO;
import com.candyshop.dto.ShopGeneralSettingDTO;

import java.math.BigDecimal;

public interface ShopSettingService {

    ShippingSettingDTO getShippingSetting();

    ShippingSettingDTO updateShippingSetting(ShippingSettingDTO dto);

    BigDecimal calculateShippingFee(BigDecimal subtotalAfterDiscount);

    ShopGeneralSettingDTO getGeneralSetting();

    ShopGeneralSettingDTO updateGeneralSetting(ShopGeneralSettingDTO dto);
}

