package com.campushub.dto.leaderboard;



public record LeaderboardEntry(
        String userId,
        String name,
        String profilePicUrl,
        Double score,
        Double avgRating,
        Integer completedOrders,
        Integer reviewCount
) {}



