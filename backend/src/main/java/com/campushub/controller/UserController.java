package com.campushub.controller;

import com.campushub.dto.user.SkillRequest;
import com.campushub.dto.user.UpdateProfileRequest;
import com.campushub.dto.user.UserProfileResponse;
import com.campushub.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** GET /api/users/me */
    @GetMapping("/api/users/me")
    public ResponseEntity<UserProfileResponse> getMe(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(userService.getMe(userId));
    }

    /** PUT /api/users/me */
    @PutMapping("/api/users/me")
    public ResponseEntity<UserProfileResponse> updateMe(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateMe(userId, req));
    }

    /** GET /api/profile/:id — public */
    @GetMapping("/api/profile/{id}")
    public ResponseEntity<UserProfileResponse> getPublicProfile(@PathVariable String id) {
        return ResponseEntity.ok(userService.getPublicProfile(id));
    }

    /** DELETE /api/users/me/skills/:skillId */
    @DeleteMapping("/api/users/me/skills/{skillId}")
    public ResponseEntity<Void> deleteSkill(
            @AuthenticationPrincipal String userId,
            @PathVariable String skillId) {
        userService.deleteSkill(userId, skillId);
        return ResponseEntity.noContent().build();
    }
}



