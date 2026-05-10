package com.campushub.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;


public record AdminUserResponse(
        String id,
        String name,
        String email,
        String role,
        boolean isVerified,
        Instant createdAt,
        Integer reviewCount,
        BigDecimal avgRating,
        boolean isBanned
) {}



