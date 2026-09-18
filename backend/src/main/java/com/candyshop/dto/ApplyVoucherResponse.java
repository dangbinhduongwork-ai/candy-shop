package com.candyshop.dto;

import com.candyshop.entity.DiscountType;
import java.math.BigDecimal;

public class ApplyVoucherResponse {

    private boolean valid;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal originalAmount;
    private BigDecimal finalAmount;
    private String message;

    public ApplyVoucherResponse() {}

    public ApplyVoucherResponse(boolean valid, String code, DiscountType discountType, BigDecimal discountValue,
                                BigDecimal discountAmount, BigDecimal originalAmount, BigDecimal finalAmount,
                                String message) {
        this.valid = valid;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.discountAmount = discountAmount;
        this.originalAmount = originalAmount;
        this.finalAmount = finalAmount;
        this.message = message;
    }

    public static ApplyVoucherResponse error(String message) {
        ApplyVoucherResponse response = new ApplyVoucherResponse();
        response.setValid(false);
        response.setMessage(message);
        return response;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getOriginalAmount() { return originalAmount; }
    public void setOriginalAmount(BigDecimal originalAmount) { this.originalAmount = originalAmount; }

    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
