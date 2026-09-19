package com.candyshop.service;

import com.candyshop.dto.ForgotPasswordRequest;
import com.candyshop.dto.ResetPasswordRequest;
import com.candyshop.entity.Role;
import com.candyshop.entity.User;
import com.candyshop.exception.BadRequestException;
import com.candyshop.repository.UserRepository;
import com.candyshop.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServicePasswordResetTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("test@candyshop.com");
        sampleUser.setFullName("Test User");
        sampleUser.setPassword("encodedOldPassword");
        sampleUser.setRole(Role.ROLE_USER);
    }

    @Test
    void testForgotPassword_UserExists_GeneratesToken() {
        when(userRepository.findByEmail("test@candyshop.com")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        ForgotPasswordRequest request = new ForgotPasswordRequest("test@candyshop.com", "validCaptcha");
        String message = authService.forgotPassword(request);

        assertNotNull(message);
        assertNotNull(sampleUser.getResetPasswordToken());
        assertNotNull(sampleUser.getResetPasswordExpiry());
        assertTrue(sampleUser.getResetPasswordExpiry().isAfter(LocalDateTime.now()));
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    void testVerifyResetToken_ValidToken_Success() {
        sampleUser.setResetPasswordToken("valid-token-123");
        sampleUser.setResetPasswordExpiry(LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByResetPasswordToken("valid-token-123")).thenReturn(Optional.of(sampleUser));

        assertDoesNotThrow(() -> authService.verifyResetToken("valid-token-123"));
    }

    @Test
    void testVerifyResetToken_ExpiredToken_ThrowsBadRequest() {
        sampleUser.setResetPasswordToken("expired-token-123");
        sampleUser.setResetPasswordExpiry(LocalDateTime.now().minusMinutes(1));

        when(userRepository.findByResetPasswordToken("expired-token-123")).thenReturn(Optional.of(sampleUser));

        assertThrows(BadRequestException.class, () -> authService.verifyResetToken("expired-token-123"));
    }

    @Test
    void testResetPassword_Success_UpdatesPasswordAndClearsToken() {
        sampleUser.setResetPasswordToken("valid-token-123");
        sampleUser.setResetPasswordExpiry(LocalDateTime.now().plusMinutes(10));

        when(userRepository.findByResetPasswordToken("valid-token-123")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        ResetPasswordRequest request = new ResetPasswordRequest("valid-token-123", "newPassword123");
        authService.resetPassword(request);

        assertEquals("encodedNewPassword", sampleUser.getPassword());
        assertNull(sampleUser.getResetPasswordToken());
        assertNull(sampleUser.getResetPasswordExpiry());
        verify(userRepository, times(1)).save(sampleUser);
    }
}
