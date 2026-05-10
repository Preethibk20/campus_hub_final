package com.campushub.service;

import com.campushub.dto.message.ConversationResponse;
import com.campushub.dto.message.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface MessageService {
    /** Create conversation between caller and gig poster */
    ConversationResponse createConversation(String gigId, String requesterId);

    /** Create a direct conversation between two users */
    ConversationResponse createDirectConversation(String otherUserId, String requesterId);

    /** Create or find a conversation between two users, optionally scoped to a gig */
    ConversationResponse createConversation(String gigId, String otherUserId, String requesterId);

    /** List all conversations for user, sorted by latest message */
    List<ConversationResponse> listConversations(String userId);

    /** Paginated message history — marks messages as read for requesterId */
    Page<MessageResponse> getMessages(String conversationId, String requesterId, Pageable pageable);

    /** REST fallback: send a text message */
    MessageResponse sendMessage(String conversationId, String content, String senderId);

    /** Upload file, save message with type=file, broadcast */
    MessageResponse sendFile(String conversationId, MultipartFile file, String senderId);

    /** WebSocket: send chat message, publish to Redis, broadcast */
    MessageResponse handleChatSend(String conversationId, String content,
                                    com.campushub.domain.Message.MessageType type, String senderId);

    int markRead(String conversationId, String userId);

    // kept for backward compat
    String getOrCreateConversation(String userA, String userB, String gigId);
}



