package com.campushub.controller;

import com.campushub.dto.user.PublicProfileResponse;
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

    /** GET /api/profile/:id — requires login, but strips email/role for privacy */
    @GetMapping("/api/profile/{id}")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable String id) {
        UserProfileResponse full = userService.getPublicProfile(id);
        PublicProfileResponse pub = new PublicProfileResponse(
                full.id(), full.name(), full.bio(), full.college(),
                full.academicYear(), full.branch(), full.skills(), full.activeSkills(),
                full.domains(), full.availability(), full.profilePicUrl(),
                full.linkedinUrl(), full.githubUrl(), full.portfolioUrl(),
                full.hourlyRate(), full.reviewCount(), full.avgRating()
        );
        return ResponseEntity.ok(pub);
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



