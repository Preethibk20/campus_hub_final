package com.campushub.dto.message;

import com.campushub.domain.Message;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;



public record MessageRequest(
        @NotNull String conversationId,
        @NotBlank String content,
        Message.MessageType type
) {}



