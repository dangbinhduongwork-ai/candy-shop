package com.candyshop.service;

import com.candyshop.dto.UserResponse;

/**
 * User service contract for user-related operations.
 */
public interface UserService {

    /** Get user profile by ID */
    UserResponse getUserById(Long id);

    /** Get user profile by email */
    UserResponse getUserByEmail(String email);
}
