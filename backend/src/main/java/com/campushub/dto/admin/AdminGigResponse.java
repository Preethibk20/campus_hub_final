package com.campushub.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;


public record AdminGigResponse(
        String id,
        String title,
        String posterName,
        String category,
        String status,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        Instant createdAt
) {}



