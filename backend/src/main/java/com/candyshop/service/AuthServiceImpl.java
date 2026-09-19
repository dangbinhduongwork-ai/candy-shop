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
        // Fetch user first to check account lock status
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid email or password"));

        if (user.getStatus() == com.candyshop.entity.UserStatus.LOCKED) {
            throw new org.springframework.security.authentication.LockedException("Tài khoản của bạn đã bị khóa bởi quản trị viên. Vui lòng liên hệ bộ phận hỗ trợ.");
        }

        // Authenticate credentials — throws BadCredentialsException on failure
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), request.getPassword()));

        // Generate JWT token for the authenticated user
        String token = jwtTokenProvider.generateToken(authentication);

        return new AuthResponse(token, mapToUserResponse(user));
    }

    @Override
    @Transactional
    public String forgotPassword(com.candyshop.dto.ForgotPasswordRequest request) {
        java.util.Optional<User> userOpt = userRepository.findByEmail(request.getEmail().trim().toLowerCase());
        if (userOpt.isEmpty()) {
            // Return neutral message to avoid email enumeration
            return "Nếu email của bạn tồn tại trong hệ thống, chúng tôi đã tạo liên kết đặt lại mật khẩu. Vui lòng kiểm tra email của bạn.";
        }

        User user = userOpt.get();
        String resetToken = java.util.UUID.randomUUID().toString();
        user.setResetPasswordToken(resetToken);
        // Valid for 15 minutes
        user.setResetPasswordExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // In development/demo, log the link or return it
        org.slf4j.LoggerFactory.getLogger(AuthServiceImpl.class)
            .info("Reset password link generated for {}: /reset-password?token={}", user.getEmail(), resetToken);

        return "Hướng dẫn đặt lại mật khẩu đã được gửi đến email " + user.getEmail() + ". Mã có hiệu lực trong 15 phút.";
    }

    @Override
    @Transactional(readOnly = true)
    public void verifyResetToken(String token) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Mã xác thực không hợp lệ.");
        }

        User user = userRepository.findByResetPasswordToken(token.trim())
            .orElseThrow(() -> new BadRequestException("Mã đặt lại mật khẩu không hợp lệ hoặc không tồn tại."));

        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Mã đặt lại mật khẩu đã hết hạn. Vui lòng gửi lại yêu cầu mới.");
        }
    }

    @Override
    @Transactional
    public void resetPassword(com.candyshop.dto.ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw new BadRequestException("Mã xác thực không hợp lệ.");
        }

        User user = userRepository.findByResetPasswordToken(request.getToken().trim())
            .orElseThrow(() -> new BadRequestException("Mã đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng."));

        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Mã đặt lại mật khẩu đã hết hạn. Vui lòng gửi lại yêu cầu mới.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        // Invalidate token once used
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);
    }

    /** Map User entity to safe UserResponse DTO (no password exposed) */
    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getAddress(),
            user.getAvatarUrl(),
            user.getRole(),
            user.getCreatedAt()
        );
    }
}
