package com.campushub.service;

import com.campushub.domain.Notification;
import com.campushub.domain.User;
import com.campushub.dto.notification.NotificationResponse;
import com.campushub.exception.ApiException;
import com.campushub.repository.NotificationRepository;
import com.campushub.repository.UserRepository;
import com.campushub.websocket.WebSocketSessionRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;


@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final WebSocketSessionRegistry sessionRegistry;

    /**
     * Save notification to DB.
     * If user is online → push via WebSocket immediately.
     * If offline → store in Redis list "notif:{userId}" for delivery on reconnect.
     */
    @Transactional
    public void sendNotification(String userId, String type, String title,
                                  String body, Map<String, Object> metadata) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Notification n = Notification.builder()
                .user(user).type(type).title(title).body(body).metadata(metadata)
                .build();
        notificationRepository.save(n);

        NotificationResponse payload = toResponse(n);

        if (sessionRegistry.isOnline(userId.toString())) {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(), "/queue/notifications", payload);
        } else {
            // Store for delivery on next connect (max 100 pending per user)
            String key = "notif:" + userId;
            redisTemplate.opsForList().rightPush(key, payload);
            redisTemplate.opsForList().trim(key, -100, -1);
        }
    }

    /** Convenience overload accepting a User entity (used by GigService etc.) */
    @Transactional
    public void send(User recipient, String type, String title,
                     String body, Map<String, Object> metadata) {
        sendNotification(recipient.getId(), type, title, body, metadata);
    }

    @Transactional
    public void markAsRead(String notificationId, String userId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!n.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Not your notification");
        }
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(String userId) {
        notificationRepository.markAllReadForUser(userId);
    }

    public Map<String, Object> getUnread(String userId) {
        long count = notificationRepository.countByUserIdAndIsReadFalse(userId);
        List<NotificationResponse> latest = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 10))
                .stream().map(this::toResponse).toList();
        return Map.of("count", count, "notifications", latest);
    }

    public Page<NotificationResponse> getAll(String userId, Pageable pageable) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(), n.getType(), n.getTitle(),
                n.getBody(), n.isRead(), n.getMetadata(), n.getCreatedAt());
    }
}



