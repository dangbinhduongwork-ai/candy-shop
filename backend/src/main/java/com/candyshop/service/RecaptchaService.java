package com.candyshop.service;

/**
 * Service for verifying Google reCAPTCHA v2 tokens.
 */
public interface RecaptchaService {

    /**
     * Validates the captcha token against Google's siteverify endpoint.
     * Throws BadRequestException if the token is null, empty, invalid, or expired.
     *
     * @param captchaToken the token received from the client widget
     * @param clientIp the IP address of the client (optional)
     */
    void validateCaptcha(String captchaToken, String clientIp);
}
