package com.campushub.controller;

import com.campushub.dto.review.ReviewRequest;
import com.campushub.dto.review.ReviewResponse;
import com.campushub.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> create(
            @Valid @RequestBody ReviewRequest req,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.create(req, userId));
    }

    @GetMapping("/user/{userId}")
    public Page<ReviewResponse> getForUser(
            @PathVariable String userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return reviewService.getForUser(userId, pageable);
    }

    @GetMapping("/gig/{gigId}")
    public Page<ReviewResponse> getForGig(
            @PathVariable String gigId,
            @PageableDefault(size = 20) Pageable pageable) {
        return reviewService.getForGig(gigId, pageable);
    }

    @GetMapping("/user/{userId}/rating")
    public ResponseEntity<Map<String, Double>> getRating(@PathVariable String userId) {
        return ResponseEntity.ok(Map.of("averageRating",
                reviewService.getAverageRating(userId) != null
                        ? reviewService.getAverageRating(userId) : 0.0));
    }
}



