package com.campushub.controller;

import com.campushub.dto.notification.NotificationResponse;
import com.campushub.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** GET /api/notifications?page=0&size=20 */
    @GetMapping
    public Page<NotificationResponse> getAll(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return notificationService.getAll(
                userId, PageRequest.of(page, size));
    }

    /** GET /api/notifications/unread — count + latest 10 */
    @GetMapping("/unread")
    public Map<String, Object> getUnread(@AuthenticationPrincipal String userId) {
        return notificationService.getUnread(userId);
    }

    /** POST /api/notifications/read-all */
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal String userId) {
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    /** POST /api/notifications/:id/read */
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markOne(
            @PathVariable String id,
            @AuthenticationPrincipal String userId) {
        notificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }
}



