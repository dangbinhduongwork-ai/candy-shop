package com.candyshop.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ShippingSettingDTO {

    @NotNull(message = "Phí vận chuyển mặc định không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Phí vận chuyển mặc định phải lớn hơn hoặc bằng 0")
    private BigDecimal defaultShippingFee;

    @NotNull(message = "Ngưỡng miễn phí vận chuyển không được để trống")
    @DecimalMin(value = "0.0", inclusive = true, message = "Ngưỡng miễn phí vận chuyển phải lớn hơn hoặc bằng 0")
    private BigDecimal freeShippingThreshold;

    public ShippingSettingDTO() {
    }

    public ShippingSettingDTO(BigDecimal defaultShippingFee, BigDecimal freeShippingThreshold) {
        this.defaultShippingFee = defaultShippingFee;
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public BigDecimal getDefaultShippingFee() {
        return defaultShippingFee;
    }

    public void setDefaultShippingFee(BigDecimal defaultShippingFee) {
        this.defaultShippingFee = defaultShippingFee;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }

    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) {
        this.freeShippingThreshold = freeShippingThreshold;
    }
}
