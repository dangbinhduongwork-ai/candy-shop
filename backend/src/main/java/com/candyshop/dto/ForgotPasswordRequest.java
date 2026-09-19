package com.candyshop.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ForgotPasswordRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Địa chỉ email không đúng định dạng")
    private String email;

    @NotBlank(message = "Vui lòng hoàn thành xác thực CAPTCHA")
    private String captchaToken;

    public ForgotPasswordRequest() {}

    public ForgotPasswordRequest(String email, String captchaToken) {
        this.email = email;
        this.captchaToken = captchaToken;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCaptchaToken() { return captchaToken; }
    public void setCaptchaToken(String captchaToken) { this.captchaToken = captchaToken; }
}
