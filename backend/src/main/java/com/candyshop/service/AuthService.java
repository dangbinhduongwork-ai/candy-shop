package com.candyshop.service;

import com.candyshop.dto.AuthResponse;
import com.candyshop.dto.ForgotPasswordRequest;
import com.candyshop.dto.LoginRequest;
import com.candyshop.dto.RegisterRequest;
import com.candyshop.dto.ResetPasswordRequest;
import com.candyshop.dto.UserResponse;

/**
 * Auth service contract — defines register and login operations.
 */
public interface AuthService {

    /** Register a new user account and return JWT token */
    AuthResponse register(RegisterRequest request);

    /** Authenticate user credentials and return JWT token */
    AuthResponse login(LoginRequest request);

    /** Initiate password reset flow, generate and store token */
    String forgotPassword(ForgotPasswordRequest request);

    /** Verify if a reset token is valid and not expired */
    void verifyResetToken(String token);

    /** Set new password for user identified by reset token */
    void resetPassword(ResetPasswordRequest request);
}
