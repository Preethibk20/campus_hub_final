package com.campushub.dto.badge;

import java.time.Instant;


public record BadgeResponse(
        String id,
        String userId,
        String badgeKey,
        Instant awardedAt
) {}



