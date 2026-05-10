package com.campushub.dto.message;

import java.time.Instant;


public record ConversationResponse(
        String id,
        String gigId,
        String otherUserId,
        String otherUserName,
        String otherUserAvatar,
        String lastMessagePreview,
        Instant lastMessageAt,
        long unreadCount,
        Instant createdAt
) {}



