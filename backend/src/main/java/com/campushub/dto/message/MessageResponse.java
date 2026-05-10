package com.campushub.dto.message;

import com.campushub.domain.Message;

import java.time.Instant;

public record MessageResponse(
        String id,
        String conversationId,
        String senderId,
        String senderName,
        String content,
        Message.MessageType type,
        String fileUrl,
        boolean isRead,
        Instant createdAt
) {}



