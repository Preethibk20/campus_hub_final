package com.campushub.controller;

import com.campushub.domain.HackathonPost;
import com.campushub.domain.MatchRequest;
import com.campushub.dto.SuggestedPartnerDTO;
import com.campushub.service.MatchingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


/**
 * REST controller for the hackathon team-matching system.
 *
 * All write endpoints are protected by the JwtAuthFilter —
 * the @AuthenticationPrincipal extracts the userId from the
 * Security context set by that filter.
 *
 * READ-ONLY endpoints (browse posts / get detail) are open
 * to anonymous users so the board is publicly discoverable.
 */
@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    // ─────────────────────────────────────────────────────────────
    // HACKATHON POSTS
    // ─────────────────────────────────────────────────────────────

    /**
     * POST /api/matching/posts
     * Create a new hackathon / team-finding post.
     * JWT required — postedBy is set from the token, never the body.
     */
    @PostMapping("/posts")
    public ResponseEntity<HackathonPost> createPost(
            @Valid @RequestBody HackathonPost post,
            @AuthenticationPrincipal String currentUserId) {

        HackathonPost created = matchingService.createPost(post, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/matching/posts
     * Browse all posts with optional server-side filters.
     *
     * Query params:
     *   ?status=OPEN|CLOSED
     *   ?mode=ONLINE|OFFLINE|HYBRID
     *   ?role=Frontend Dev
     *
     * Public — no auth required.
     */
    @GetMapping("/posts")
    public ResponseEntity<List<HackathonPost>> getAllPosts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String role) {

        return ResponseEntity.ok(matchingService.getAllPosts(status, mode, role));
    }

    /**
     * GET /api/matching/posts/{id}
     * Full detail for a single hackathon post.
     * Public — no auth required.
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<HackathonPost> getPostById(@PathVariable String id) {
        return ResponseEntity.ok(matchingService.getPostById(id));
    }

    /**
     * GET /api/matching/posts/my
     * All posts created by the current user (dashboard view).
     * JWT required.
     */
    @GetMapping("/posts/my")
    public ResponseEntity<List<HackathonPost>> getMyPosts(
            @AuthenticationPrincipal String currentUserId) {

        return ResponseEntity.ok(matchingService.getMyPosts(currentUserId));
    }

    // ─────────────────────────────────────────────────────────────
    // SKILL-BASED SUGGESTIONS
    // ─────────────────────────────────────────────────────────────

    /**
     * GET /api/matching/suggestions
     * Returns up to 10 OPEN posts scored by overlap with the
     * current user's skill set. Calls the Auth service internally
     * to fetch the user's skills.
     * JWT required.
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<SuggestedPartnerDTO>> getSuggestions(
            @AuthenticationPrincipal String currentUserId) {

        return ResponseEntity.ok(matchingService.getSuggestedPartners(currentUserId));
    }

    // ─────────────────────────────────────────────────────────────
    // MATCH REQUESTS
    // ─────────────────────────────────────────────────────────────

    /**
     * POST /api/matching/requests
     * Send a join request to a hackathon post.
     * Body: { "postId": "String", "message": "optional intro" }
     *
     * Guards enforced by MatchingService:
     *   - can't request own post
     *   - post must be open and have spots
     *   - no duplicate requests
     *
     * JWT required.
     */
    @PostMapping("/requests")
    public ResponseEntity<MatchRequest> sendMatchRequest(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String currentUserId) {

        String postId = body.get("postId");
        String message = body.getOrDefault("message", "");
        MatchRequest created = matchingService.sendMatchRequest(postId, currentUserId, message);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/matching/requests/incoming
     * All PENDING requests received by the current user (post owner view).
     * JWT required.
     */
    @GetMapping("/requests/incoming")
    public ResponseEntity<List<MatchRequest>> getIncomingRequests(
            @AuthenticationPrincipal String currentUserId) {

        return ResponseEntity.ok(matchingService.getIncomingRequests(currentUserId));
    }

    /**
     * GET /api/matching/requests/outgoing
     * All requests this user has sent (their own activity feed).
     * JWT required.
     */
    @GetMapping("/requests/outgoing")
    public ResponseEntity<List<MatchRequest>> getOutgoingRequests(
            @AuthenticationPrincipal String currentUserId) {

        return ResponseEntity.ok(matchingService.getOutgoingRequests(currentUserId));
    }

    /**
     * PUT /api/matching/requests/{id}
     * Accept or reject a match request.
     * Body: { "status": "ACCEPTED" | "REJECTED" }
     *
     * Only the post owner (toUserId) may call this endpoint.
     * On ACCEPTED: post's currentSize is incremented; post auto-closes when full.
     *
     * JWT required.
     */
    @PutMapping("/requests/{id}")
    public ResponseEntity<MatchRequest> respondToRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal String currentUserId) {

        String newStatus = body.get("status");
        MatchRequest updated = matchingService.respondToRequest(id, newStatus, currentUserId);
        return ResponseEntity.ok(updated);
    }
}



