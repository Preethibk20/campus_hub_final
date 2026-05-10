package com.campushub.controller;

import com.campushub.dto.badge.BadgeResponse;
import com.campushub.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BadgeResponse>> getUserBadges(@PathVariable String userId) {
        return ResponseEntity.ok(badgeService.getUserBadges(userId));
    }
}



