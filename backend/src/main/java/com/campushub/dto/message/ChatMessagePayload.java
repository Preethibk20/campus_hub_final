package com.campushub.dto.message;

import com.campushub.domain.Message;
import jakarta.validation.constraints.NotNull;



/**
 * STOMP payload for /app/chat.send and /app/chat.typing
 */
public record ChatMessagePayload(
        @NotNull String conversationId,
        String content,
        Message.MessageType type,   // null defaults to text
        Boolean isTyping            // used only for typing indicator
) {}



