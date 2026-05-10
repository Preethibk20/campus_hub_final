package com.campushub.dto.admin;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record AdminAnalyticsResponse(
        long totalUsers,
        long newUsersThisWeek,
        long totalGigs,
        long activeGigs,
        long totalOrders,
        long completedOrders,
        long disputedOrders,
        BigDecimal totalRevenue,
        BigDecimal revenueThisMonth,
        List<Map<String, Object>> topCategories,
        List<Map<String, Object>> dailyOrdersLast30Days
) {}



