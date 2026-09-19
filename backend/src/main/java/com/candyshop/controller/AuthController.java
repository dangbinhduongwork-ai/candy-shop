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

    /**
     * POST /api/auth/forgot-password
     * Generates a password reset token and returns a success message.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<java.util.Map<String, String>> forgotPassword(
            @Valid @RequestBody com.candyshop.dto.ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = loginAttemptService.getClientIp(httpRequest);
        recaptchaService.validateCaptcha(request.getCaptchaToken(), clientIp);

        String message = authService.forgotPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", message));
    }

    /**
     * GET /api/auth/verify-reset-token
     * Checks whether a reset token is valid and active.
     */
    @GetMapping("/verify-reset-token")
    public ResponseEntity<java.util.Map<String, String>> verifyResetToken(
            @RequestParam("token") String token) {
        authService.verifyResetToken(token);
        return ResponseEntity.ok(java.util.Map.of("message", "Mã xác thực hợp lệ"));
    }

    /**
     * POST /api/auth/reset-password
     * Sets a new password using a verified reset token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<java.util.Map<String, String>> resetPassword(
            @Valid @RequestBody com.candyshop.dto.ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(java.util.Map.of("message", "Mật khẩu của bạn đã được thay đổi thành công!"));
    }
}
