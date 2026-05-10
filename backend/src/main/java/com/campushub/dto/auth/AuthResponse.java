package com.campushub.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String userId,
        String name,
        String email,
        String role,
        String profilePicUrl
) {}



