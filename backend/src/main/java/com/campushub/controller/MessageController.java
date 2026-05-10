package com.campushub.controller;

import com.campushub.dto.message.*;
import com.campushub.exception.ApiException;
import com.campushub.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;


@RestController
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    // ── REST: Conversations ───────────────────────────────────────────────────

    /** POST /api/conversations — create conversation with gig poster */
    @PostMapping("/api/conversations")
    public ResponseEntity<ConversationResponse> createConversation(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        String gigId = body.get("gigId");
        String participantId = body.get("participantId");

        if (gigId == null && participantId == null) {
            throw ApiException.badRequest("Either gigId or participantId is required");
        }

        if (gigId != null && participantId != null) {
            return ResponseEntity.status(201)
                    .body(messageService.createConversation(
                            gigId,
                            participantId,
                            userId
                    ));
        }

        if (gigId != null) {
            return ResponseEntity.status(201)
                    .body(messageService.createConversation(gigId, userId));
        }

        return ResponseEntity.status(201)
                .body(messageService.createDirectConversation(participantId, userId));
    }

    /** GET /api/conversations — list all, sorted by latest message */
    @GetMapping("/api/conversations")
    public List<ConversationResponse> listConversations(
            @AuthenticationPrincipal String userId) {
        return messageService.listConversations(userId);
    }

    // ── REST: Messages ────────────────────────────────────────────────────────

    /** GET /api/conversations/:id/messages — paginated history */
    @GetMapping("/api/conversations/{id}/messages")
    public Page<MessageResponse> getMessages(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size) {
        return messageService.getMessages(id, userId,
                PageRequest.of(page, Math.min(size, 100)));
    }

    /** POST /api/conversations/:id/messages — REST fallback send */
    @PostMapping("/api/conversations/{id}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.status(201)
                .body(messageService.sendMessage(id, body.get("content"), userId));
    }

    /** POST /api/conversations/:id/upload — file upload */
    @PostMapping(value = "/api/conversations/{id}/upload",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MessageResponse> uploadFile(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.status(201)
                .body(messageService.sendFile(id, file, userId));
    }

    // ── WebSocket: STOMP handlers ─────────────────────────────────────────────

    /**
     * /app/chat.send → saves message, publishes to Redis, broadcasts to
     * /topic/conversation.{conversationId}
     */
    @MessageMapping("/chat.send")
    public void handleSend(@Valid @Payload ChatMessagePayload payload, Principal principal) {
        messageService.handleChatSend(
                payload.conversationId(),
                payload.content(),
                payload.type(),
                principal.getName()
        );
    }

    /**
     * /app/chat.typing → ephemeral, NOT saved to DB.
     * Broadcasts to /topic/conversation.{conversationId}.typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload ChatMessagePayload payload, Principal principal) {
        if (payload.conversationId() == null) return;
        messagingTemplate.convertAndSend(
                "/topic/conversation." + payload.conversationId() + ".typing",
                Map.of("userId", principal.getName(),
                       "isTyping", Boolean.TRUE.equals(payload.isTyping()))
        );
    }
}



