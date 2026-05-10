package com.campushub.dto.review;

import java.time.Instant;

public record ReviewResponse(
        String id,
        String orderId,
        String reviewerId,
        String reviewerName,
        String reviewerAvatar,
        String revieweeId,
        short rating,
        String comment,
        Instant createdAt
) {}



