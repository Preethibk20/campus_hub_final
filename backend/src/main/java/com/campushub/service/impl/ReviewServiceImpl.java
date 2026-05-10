package com.campushub.service.impl;

import com.campushub.domain.Order;
import com.campushub.domain.Review;
import com.campushub.domain.User;
import com.campushub.dto.review.ReviewRequest;
import com.campushub.dto.review.ReviewResponse;
import com.campushub.exception.ApiException;
import com.campushub.repository.OrderRepository;
import com.campushub.repository.ReviewRepository;
import com.campushub.repository.UserRepository;
import com.campushub.service.BadgeService;
import com.campushub.service.NotificationService;
import com.campushub.service.ReviewService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.Set;


@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final BadgeService badgeService;
    private final RedisTemplate<String, Object> redisTemplate;

    public ReviewServiceImpl(
            ReviewRepository reviewRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            BadgeService badgeService,
            RedisTemplate<String, Object> redisTemplate
    ) {
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.badgeService = badgeService;
        this.redisTemplate = redisTemplate;
    }

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest req, String reviewerId) {
        Order order = orderRepository.findById(req.orderId())
                .orElseThrow(() -> ApiException.notFound("Order not found"));

        if (order.getEscrowStatus() != Order.EscrowStatus.released) {
            throw ApiException.badRequest("Can only review after order escrow is released");
        }

        if (reviewRepository.existsByOrderIdAndReviewerId(req.orderId(), reviewerId)) {
            throw ApiException.badRequest("You have already reviewed this order");
        }

        User reviewer;
        User reviewee;

        if (order.getBuyer().getId().equals(reviewerId)) {
            reviewer = order.getBuyer();
            reviewee = order.getSeller();
        } else if (order.getSeller().getId().equals(reviewerId)) {
            reviewer = order.getSeller();
            reviewee = order.getBuyer();
        } else {
            throw ApiException.forbidden("Only the buyer or seller can leave a review");
        }

        Review review = Review.builder()
                .order(order)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(req.rating())
                .comment(req.comment())
                .build();

        Review savedReview = reviewRepository.save(review);

        long newCount = reviewRepository.countByRevieweeId(reviewee.getId());
        double avgRating = reviewRepository.avgRatingByRevieweeId(reviewee.getId()).orElse(0.0);
        
        reviewee.setReviewCount((int) newCount);
        reviewee.setAvgRating(BigDecimal.valueOf(avgRating).setScale(2, RoundingMode.HALF_UP));
        userRepository.save(reviewee);

        notificationService.send(reviewee, "review_received", "You received a new review!",
                reviewer.getName() + " left you a " + req.rating() + "-star review.", Map.of("orderId", order.getId()));

        badgeService.checkAndAward(reviewee.getId(), "top_rated");

        invalidateLeaderboardCache();

        return toResponse(savedReview);
    }

    private void invalidateLeaderboardCache() {
        Set<String> keys = redisTemplate.keys("leaderboard:*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public Page<ReviewResponse> getForUser(String userId, Pageable pageable) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    public Page<ReviewResponse> getForGig(String gigId, Pageable pageable) {
        return reviewRepository.findByGigIdOrderByCreatedAtDesc(gigId, pageable)
                .map(this::toResponse);
    }

    @Override
    public Double getAverageRating(String userId) {
        return reviewRepository.averageRatingForUser(userId);
    }

    private ReviewResponse toResponse(Review r) {
        return new ReviewResponse(
                r.getId(),
                r.getOrder().getId(),
                r.getReviewer().getId(),
                r.getReviewer().getName(),
                r.getReviewer().getProfilePicUrl(),
                r.getReviewee().getId(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        );
    }
}





