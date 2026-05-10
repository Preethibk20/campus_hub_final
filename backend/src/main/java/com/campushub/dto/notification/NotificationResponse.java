package com.campushub.dto.notification;

import java.time.Instant;
import java.util.Map;


public record NotificationResponse(
        String id,
        String type,
        String title,
        String body,
        boolean isRead,
        Map<String, Object> metadata,
        Instant createdAt
) {}



