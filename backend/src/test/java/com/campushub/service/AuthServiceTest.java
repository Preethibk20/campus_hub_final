package com.campushub.service;

import com.campushub.domain.College;
import com.campushub.domain.RefreshToken;
import com.campushub.domain.User;
import com.campushub.dto.auth.AuthResponse;
import com.campushub.dto.auth.LoginRequest;
import com.campushub.dto.auth.RegisterRequest;
import com.campushub.exception.ApiException;
import com.campushub.repository.CollegeRepository;
import com.campushub.repository.RefreshTokenRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.JwtUtil;
import com.campushub.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock CollegeRepository collegeRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock RedisTemplate<String, Object> redisTemplate;
    @Mock ValueOperations<String, Object> valueOps;

    @InjectMocks AuthServiceImpl authService;

    private College college;
    private User user;

    @BeforeEach
    void setUp() {
        college = College.builder().id(UUID.randomUUID().toString())
                .name("Test College").emailDomain("college.edu").build();
        user = User.builder().id(UUID.randomUUID().toString())
                .name("Alice").email("alice@college.edu")
                .password("$2a$12$hashed").role("student")
                .collegeId(college.getId()).isVerified(true).build();

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOps);
    }

    // ── register ─────────────────────────────────────────────────────────────

    @Test
    void register_success_sendsOtp() {
        when(collegeRepository.findByEmailDomain("college.edu")).thenReturn(Optional.of(college));
        when(userRepository.findByEmail("alice@college.edu")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenReturn(user);

        String result = authService.register(
                new RegisterRequest("Alice", "alice@college.edu", "password123", null));

        assertThat(result).contains("OTP");
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        when(collegeRepository.findByEmailDomain("college.edu")).thenReturn(Optional.of(college));
        when(userRepository.findByEmail("alice@college.edu")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("Alice", "alice@college.edu", "password123", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void register_unknownDomain_throwsBadRequest() {
        when(collegeRepository.findByEmailDomain("unknown.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.register(
                new RegisterRequest("Bob", "bob@unknown.com", "password123", null)))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ── verifyOtp ─────────────────────────────────────────────────────────────

    @Test
    void verifyOtp_success_returnsTokens() {
        when(valueOps.get("otp:alice@college.edu")).thenReturn("123456");
        when(userRepository.findByEmail("alice@college.edu")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);
        when(jwtUtil.generateAccessToken(any(), any(), any())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(any())).thenReturn("refresh-token");
        when(refreshTokenRepository.save(any())).thenReturn(mock(RefreshToken.class));

        AuthResponse resp = authService.verifyOtp("alice@college.edu", "123456");

        assertThat(resp.accessToken()).isEqualTo("access-token");
        assertThat(resp.refreshToken()).isEqualTo("refresh-token");
    }

    @Test
    void verifyOtp_wrongCode_throwsBadRequest() {
        when(valueOps.get("otp:alice@college.edu")).thenReturn("999999");

        assertThatThrownBy(() -> authService.verifyOtp("alice@college.edu", "000000"))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_success_returnsTokens() {
        when(userRepository.findByEmail("alice@college.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "$2a$12$hashed")).thenReturn(true);
        when(jwtUtil.generateAccessToken(any(), any(), any())).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(any())).thenReturn("refresh-token");
        when(refreshTokenRepository.save(any())).thenReturn(mock(RefreshToken.class));

        AuthResponse resp = authService.login(new LoginRequest("alice@college.edu", "password123"));

        assertThat(resp.email()).isEqualTo("alice@college.edu");
    }

    @Test
    void login_wrongPassword_throwsBadRequest() {
        when(userRepository.findByEmail("alice@college.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(
                new LoginRequest("alice@college.edu", "wrong")))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void login_unverifiedUser_throwsForbidden() {
        user.setVerified(false);
        when(userRepository.findByEmail("alice@college.edu")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(any(), any())).thenReturn(true);

        assertThatThrownBy(() -> authService.login(
                new LoginRequest("alice@college.edu", "password123")))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus())
                        .isEqualTo(HttpStatus.FORBIDDEN));
    }

    // ── refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_expiredToken_throwsBadRequest() {
        RefreshToken rt = RefreshToken.builder()
                .token("old-token").user(user)
                .expiresAt(Instant.now().minusSeconds(60))
                .build();
        when(refreshTokenRepository.findByToken("old-token")).thenReturn(Optional.of(rt));

        assertThatThrownBy(() -> authService.refresh("old-token"))
                .isInstanceOf(ApiException.class)
                .satisfies(e -> assertThat(((ApiException) e).getStatus())
                        .isEqualTo(HttpStatus.BAD_REQUEST));
    }
}
