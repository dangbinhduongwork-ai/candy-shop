package com.candyshop.dto;

import jakarta.validation.constraints.NotBlank;

public class ApplyVoucherRequest {

    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    public ApplyVoucherRequest() {}

    public ApplyVoucherRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
