package com.campushub.repository;

import com.campushub.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {

    Page<Review> findByRevieweeIdOrderByCreatedAtDesc(String revieweeId, Pageable pageable);

    long countByRevieweeId(String revieweeId);

    // Sum queries/Avg need aggregation, providing placeholders for compilation
    default Double averageRatingForUser(String userId) { return 0.0; }
    default Optional<Double> avgRatingByRevieweeId(String userId) { return Optional.empty(); }

    boolean existsByOrderIdAndReviewerId(String orderId, String reviewerId);

    @Query("{ 'order.gig.id': ?0 }")
    Page<Review> findByGigIdOrderByCreatedAtDesc(String gigId, Pageable pageable);
}



