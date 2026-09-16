package com.candyshop.service;

import com.candyshop.dto.AuthResponse;
import com.candyshop.dto.LoginRequest;
import com.candyshop.dto.RegisterRequest;
import com.candyshop.dto.UserResponse;
import com.candyshop.entity.User;
import com.candyshop.exception.BadRequestException;
import com.candyshop.repository.UserRepository;
import com.candyshop.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService.
 * Handles user registration and login business logic.
 */
@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email is already in use
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        // Build new user entity with BCrypt-hashed password
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt here!

        User savedUser = userRepository.save(user);

        // Generate JWT token immediately after registration
        String token = jwtTokenProvider.generateToken(savedUser.getEmail(), savedUser.getId());

        return new AuthResponse(token, mapToUserResponse(savedUser));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Authenticate credentials — throws BadCredentialsException on failure
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword()));

        // Generate JWT token for the authenticated user
        String token = jwtTokenProvider.generateToken(authentication);

        // Fetch full user details for the response
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow();

        return new AuthResponse(token, mapToUserResponse(user));
    }

    /** Map User entity to safe UserResponse DTO (no password exposed) */
    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole()
        );
    }
}
