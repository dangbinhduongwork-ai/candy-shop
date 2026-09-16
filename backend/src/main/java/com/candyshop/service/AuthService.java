package com.candyshop.service;

import com.candyshop.dto.AuthResponse;
import com.candyshop.dto.LoginRequest;
import com.candyshop.dto.RegisterRequest;
import com.candyshop.dto.UserResponse;

/**
 * Auth service contract — defines register and login operations.
 */
public interface AuthService {

    /** Register a new user account and return JWT token */
    AuthResponse register(RegisterRequest request);

    /** Authenticate user credentials and return JWT token */
    AuthResponse login(LoginRequest request);
}
