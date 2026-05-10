package com.campushub.service;

import com.campushub.domain.Badge;
import com.campushub.domain.Order;
import com.campushub.domain.User;
import com.campushub.dto.badge.BadgeResponse;
import com.campushub.exception.ApiException;
import com.campushub.repository.BadgeRepository;
import com.campushub.repository.OrderRepository;
import com.campushub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class BadgeService {

    private static final Logger log = LoggerFactory.getLogger(BadgeService.class);

    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public BadgeService(BadgeRepository badgeRepository, UserRepository userRepository, OrderRepository orderRepository) {
        this.badgeRepository = badgeRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public void checkAndAward(String userId, String event) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        switch (event) {
            case "first_gig":
                awardBadge(user, "first_gig");
                break;
            case "first_order_completed":
                awardBadge(user, "first_order_completed");
                checkTrustedSeller(user);
                break;
            case "top_rated":
                checkTopRated(user);
                break;
            case "trusted_seller":
                checkTrustedSeller(user);
                break;
            case "power_buyer":
                checkPowerBuyer(user);
                break;
            case "verified_student":
                awardBadge(user, "verified_student");
                break;
            case "order_placed as buyer":
                checkPowerBuyer(user);
                break;
            default:
                log.warn("Unknown badge event: {}", event);
        }
    }

    private void checkTopRated(User user) {
        if (user.getAvgRating() != null && user.getAvgRating().compareTo(new BigDecimal("4.5")) >= 0
                && user.getReviewCount() != null && user.getReviewCount() >= 5) {
            awardBadge(user, "top_rated");
        }
    }

    private void checkTrustedSeller(User user) {
        long completedOrders = orderRepository.countBySellerIdAndEscrowStatus(user.getId(), Order.EscrowStatus.released);
        if (completedOrders >= 10) {
            awardBadge(user, "trusted_seller");
        }
    }

    private void checkPowerBuyer(User user) {
        long completedOrders = orderRepository.countByBuyerIdAndEscrowStatus(user.getId(), Order.EscrowStatus.released);
        if (completedOrders >= 5) {
            awardBadge(user, "power_buyer");
        }
    }

    private void awardBadge(User user, String badgeKey) {
        if (!badgeRepository.existsByUserIdAndBadgeKey(user.getId(), badgeKey)) {
            Badge badge = Badge.builder()
                    .user(user)
                    .badgeKey(badgeKey)
                    .build();
            badgeRepository.save(badge);
            log.info("Awarded badge {} to user {}", badgeKey, user.getId());
        }
    }

    public List<BadgeResponse> getUserBadges(String userId) {
        return badgeRepository.findByUserId(userId).stream()
                .map(b -> new BadgeResponse(b.getId(), b.getUser().getId(), b.getBadgeKey(), b.getAwardedAt()))
                .collect(Collectors.toList());
    }
}



