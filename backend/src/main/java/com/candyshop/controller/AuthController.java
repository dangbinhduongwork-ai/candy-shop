package com.candyshop.controller;

import com.candyshop.dto.AuthResponse;
import com.candyshop.dto.LoginRequest;
import com.candyshop.dto.RegisterRequest;
import com.candyshop.exception.BadRequestException;
import com.candyshop.service.AuthService;
import com.candyshop.service.LoginAttemptService;
import com.candyshop.service.RecaptchaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 * Routes are public (no JWT required) — configured in SecurityConfig.
 * Enforces Google reCAPTCHA v2 verification and IP brute-force protection.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RecaptchaService recaptchaService;
    private final LoginAttemptService loginAttemptService;

    public AuthController(AuthService authService,
            RecaptchaService recaptchaService,
            LoginAttemptService loginAttemptService) {
        this.authService = authService;
        this.recaptchaService = recaptchaService;
        this.loginAttemptService = loginAttemptService;
    }

    /**
     * POST /api/auth/register
     * Register a new user account with Google reCAPTCHA v2 verification.
     * Returns 201 Created with JWT token and user info.
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = loginAttemptService.getClientIp(httpRequest);

        // 1. Verify Google reCAPTCHA v2 token
        recaptchaService.validateCaptcha(request.getCaptchaToken(), clientIp);

        // 2. Perform registration
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login
     * Authenticate with email, password, and Google reCAPTCHA v2.
     * Protected by IP-based brute force rate limiting.
     * Returns 200 OK with JWT token and user info.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = loginAttemptService.getClientIp(httpRequest);

        // 1. Check if client IP is currently blocked due to repeated failed logins
        if (loginAttemptService.isBlocked(clientIp)) {
            long remainingMinutes = loginAttemptService.getRemainingBlockMinutes(clientIp);
            throw new BadRequestException(
                    "Địa chỉ IP này đã đăng nhập sai quá 5 lần. Tạm khóa trong 15 phút. Vui lòng thử lại sau "
                            + (remainingMinutes > 0 ? remainingMinutes : 1) + " phút.");
        }

        // 2. Verify Google reCAPTCHA v2 token
        recaptchaService.validateCaptcha(request.getCaptchaToken(), clientIp);

        // 3. Authenticate credentials
        try {
            AuthResponse response = authService.login(request);
            // Reset failed login counter on success
            loginAttemptService.loginSucceeded(clientIp);
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.authentication.LockedException e) {
            throw new BadRequestException(e.getMessage());
        } catch (BadCredentialsException e) {
            // Record failed attempt
            loginAttemptService.loginFailed(clientIp);
            int remainingAttempts = loginAttemptService.getRemainingAttempts(clientIp);

            if (remainingAttempts > 0) {
                throw new BadRequestException("Email hoặc mật khẩu không chính xác. Bạn còn "
                        + remainingAttempts + " lần thử trước khi bị khóa tạm thời.");
            } else {
                throw new BadRequestException(
                        "Bạn đã nhập sai mật khẩu quá 5 lần. Địa chỉ IP của bạn tạm thời bị khóa trong 15 phút để đảm bảo an toàn.");
            }
        }
    }
}
