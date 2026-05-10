package com.campushub.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;


public record AdminDisputeResponse(
        String orderId,
        String gigTitle,
        String buyerName,
        String sellerName,
        BigDecimal amount,
        String status,
        Instant createdAt,
        Instant escalatedAt
) {}



