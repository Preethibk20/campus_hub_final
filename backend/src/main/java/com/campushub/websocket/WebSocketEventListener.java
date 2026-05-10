package com.campushub.websocket;

import com.campushub.domain.Message;
import com.campushub.dto.message.MessageResponse;
import com.campushub.repository.ConversationRepository;
import com.campushub.repository.MessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.Instant;
import java.util.List;
import java.util.Map;


@Component
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final WebSocketSessionRegistry sessionRegistry;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public WebSocketEventListener(
            WebSocketSessionRegistry sessionRegistry,
            RedisTemplate<String, Object> redisTemplate,
            SimpMessagingTemplate messagingTemplate,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository
    ) {
        this.sessionRegistry = sessionRegistry;
        this.redisTemplate = redisTemplate;
        this.messagingTemplate = messagingTemplate;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal == null) return;

        String userId = principal.getName();
        sessionRegistry.register(userId);
        log.debug("WS connected: {}", userId);

        drainPendingNotifications(userId);

        Map<String, Object> attrs = accessor.getSessionAttributes();
        if (attrs != null && attrs.containsKey("lastSeen")) {
            try {
                Instant lastSeen = Instant.parse(attrs.get("lastSeen").toString());
                deliverMissedMessages(userId, lastSeen);
            } catch (Exception e) {
                log.debug("Could not parse lastSeen: {}", e.getMessage());
            }
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if (principal == null) return;

        String userId = principal.getName();
        sessionRegistry.deregister(userId);
        log.debug("WS disconnected: {}", userId);
    }

    @SuppressWarnings("unchecked")
    private void drainPendingNotifications(String userId) {
        String key = "notif:" + userId;
        Long size = redisTemplate.opsForList().size(key);
        if (size == null || size == 0) return;

        List<Object> pending = redisTemplate.opsForList().range(key, 0, size - 1);
        redisTemplate.delete(key);

        if (pending != null) {
            pending.forEach(n ->
                    messagingTemplate.convertAndSendToUser(
                            userId, "/queue/notifications", n));
        }
        log.debug("Drained {} pending notifications for user {}", size, userId);
    }

    private void deliverMissedMessages(String userId, Instant since) {
        conversationRepository.findByParticipant(userId).forEach(conv -> {
            messageRepository
                    .findMissedMessages(conv.getId(), userId, since, PageRequest.of(0, 50))
                    .forEach(msg -> messagingTemplate.convertAndSendToUser(
                            userId, "/queue/messages", toResponse(msg)));
        });
    }

    private MessageResponse toResponse(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getConversation().getId(),
                m.getSender().getId(),
                m.getSender().getName(),
                m.getContent(),
                m.getType(),
                m.getFileUrl(),
                m.isRead(),
                m.getCreatedAt()
        );
    }
}


