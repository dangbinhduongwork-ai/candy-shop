package com.candyshop.service;

import com.candyshop.dto.ChangePasswordRequest;
import com.candyshop.dto.UpdateProfileRequest;
import com.candyshop.dto.UserResponse;
import org.springframework.web.multipart.MultipartFile;

/**
 * User service contract for user-related operations.
 */
public interface UserService {

    /** Get user profile by ID */
    UserResponse getUserById(Long id);

    /** Get user profile by email */
    UserResponse getUserByEmail(String email);

    /** Update basic profile (fullName, phone, address) */
    UserResponse updateProfile(String email, UpdateProfileRequest request);

    /** Change password with old password verification */
    void changePassword(String email, ChangePasswordRequest request);

    /** Upload and change avatar image, cleaning up old avatar */
    UserResponse updateAvatar(String email, MultipartFile file);
}
