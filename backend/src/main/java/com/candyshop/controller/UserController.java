package com.candyshop.controller;

import com.candyshop.dto.ChangePasswordRequest;
import com.candyshop.dto.UpdateProfileRequest;
import com.candyshop.dto.UserResponse;
import com.candyshop.exception.BadRequestException;
import com.candyshop.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST controller for user profile endpoints.
 * All routes require a valid JWT token.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users/me
     * Returns the profile of the currently authenticated user.
     * Requires: Authorization: Bearer <token>
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }

    /**
     * PUT /api/users/me
     * Updates full name, phone number, and default address of the authenticated user.
     */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserResponse updatedUser = userService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * PUT /api/users/me/password
     * Changes password after verifying the old password.
     */
    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới của bạn."));
    }

    /**
     * POST /api/users/me/avatar
     * Uploads and sets a new avatar image for the authenticated user.
     */
    @PostMapping("/me/avatar")
    public ResponseEntity<UserResponse> updateAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        MultipartFile uploadFile = file != null ? file : avatar;
        if (uploadFile == null || uploadFile.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn file ảnh để tải lên làm ảnh đại diện");
        }
        UserResponse updatedUser = userService.updateAvatar(userDetails.getUsername(), uploadFile);
        return ResponseEntity.ok(updatedUser);
    }
}
