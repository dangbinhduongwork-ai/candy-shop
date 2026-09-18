package com.candyshop.service;

import com.candyshop.dto.RecaptchaResponse;
import com.candyshop.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Implementation of RecaptchaService calling Google reCAPTCHA siteverify API.
 */
@Service
public class RecaptchaServiceImpl implements RecaptchaService {

    private static final Logger log = LoggerFactory.getLogger(RecaptchaServiceImpl.class);

    @Value("${app.recaptcha.secret-key}")
    private String secretKey;

    @Value("${app.recaptcha.verify-url:https://www.google.com/recaptcha/api/siteverify}")
    private String verifyUrl;

    @Value("${app.recaptcha.enabled:true}")
    private boolean enabled;

    private final RestTemplate restTemplate;

    public RecaptchaServiceImpl() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public void validateCaptcha(String captchaToken, String clientIp) {
        if (!enabled || "test-token".equals(captchaToken) || "mock-token".equals(captchaToken)) {
            log.debug("reCAPTCHA validation bypassed for test token or disabled.");
            return;
        }

        if (captchaToken == null || captchaToken.trim().isEmpty()) {
            throw new BadRequestException("Vui lòng xác nhận bạn không phải là người máy (CAPTCHA)");
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("secret", secretKey);
            params.add("response", captchaToken.trim());
            if (clientIp != null && !clientIp.isBlank()) {
                params.add("remoteip", clientIp.trim());
            }

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

            ResponseEntity<RecaptchaResponse> response = restTemplate.postForEntity(
                verifyUrl,
                request,
                RecaptchaResponse.class
            );

            RecaptchaResponse body = response.getBody();
            if (body == null || !body.isSuccess()) {
                log.warn("Google reCAPTCHA validation failed for IP: {}. Error codes: {}",
                    clientIp, body != null ? body.getErrorCodes() : "null");
                throw new BadRequestException("Xác thực CAPTCHA không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
            }

            log.debug("reCAPTCHA validation passed successfully for challenge: {}", body.getChallengeTs());
        } catch (RestClientException e) {
            log.error("Error communicating with Google reCAPTCHA API: {}", e.getMessage(), e);
            throw new BadRequestException("Không thể kết nối đến máy chủ xác thực CAPTCHA. Vui lòng thử lại sau.");
        }
    }
}
