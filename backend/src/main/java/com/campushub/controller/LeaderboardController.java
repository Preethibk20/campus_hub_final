package com.campushub.controller;

import com.campushub.domain.User;
import com.campushub.dto.leaderboard.LeaderboardEntry;
import com.campushub.repository.UserRepository;
import com.campushub.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.campushub.domain.Order;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    @GetMapping
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") int limit) {

        String cacheKey = "leaderboard:" + (category != null ? category : "all");
        List<LeaderboardEntry> cached = (List<LeaderboardEntry>) redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            return ResponseEntity.ok(cached.size() > limit ? cached.subList(0, limit) : cached);
        }

        List<User> users = userRepository.findAll(); 

        List<LeaderboardEntry> leaderboard = users.stream()
                .map(u -> {
                    long completedOrders = orderRepository.countBySellerIdAndEscrowStatus(u.getId(), Order.EscrowStatus.released);
                    double avgRating = u.getAvgRating() != null ? u.getAvgRating().doubleValue() : 0.0;
                    int reviewCount = u.getReviewCount() != null ? u.getReviewCount() : 0;

                    double score = (avgRating * 0.4) + (completedOrders * 0.4) + (reviewCount * 0.2);

                    return new LeaderboardEntry(
                            u.getId(),
                            u.getName(),
                            u.getProfilePicUrl(),
                            score,
                            avgRating,
                            (int) completedOrders,
                            reviewCount
                    );
                })
                .sorted(Comparator.comparing(LeaderboardEntry::score).reversed())
                .limit(limit)
                .toList();

        redisTemplate.opsForValue().set(cacheKey, leaderboard, 10, TimeUnit.MINUTES);

        return ResponseEntity.ok(leaderboard);
    }
}



