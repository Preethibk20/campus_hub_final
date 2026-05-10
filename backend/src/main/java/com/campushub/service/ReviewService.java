package com.campushub.service;

import com.campushub.dto.review.ReviewRequest;
import com.campushub.dto.review.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



public interface ReviewService {
    ReviewResponse create(ReviewRequest request, String reviewerId);
    Page<ReviewResponse> getForUser(String userId, Pageable pageable);
    Page<ReviewResponse> getForGig(String gigId, Pageable pageable);
    Double getAverageRating(String userId);
}



