package com.campushub.service;

import com.campushub.dto.auth.AuthResponse;
import com.campushub.dto.auth.LoginRequest;
import com.campushub.dto.auth.RegisterRequest;

public interface AuthService {
    /** Register user, send OTP — returns 201 message */
    String register(RegisterRequest req);

    /** Verify OTP, mark user verified, return tokens */
    AuthResponse verifyOtp(String email, String otp);

    AuthResponse login(LoginRequest req);

    /** Rotate refresh token, return new access token */
    AuthResponse refresh(String refreshToken);

    /** Blacklist access token JTI, delete refresh token */
    void logout(String accessToken, String refreshToken);

    void sendVerificationCode(String email);

    void verifyEmail(String email, String code);
}



