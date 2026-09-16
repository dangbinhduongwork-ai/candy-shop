package com.candyshop.controller;

import com.candyshop.dto.UserResponse;
import com.candyshop.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
        // Extract email from authenticated principal, then fetch from DB
        UserResponse user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(user);
    }
}
