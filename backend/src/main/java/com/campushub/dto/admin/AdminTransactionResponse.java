package com.campushub.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;


public record AdminTransactionResponse(
        String orderId,
        String gigTitle,
        String buyerName,
        String sellerName,
        BigDecimal amount,
        BigDecimal fee,
        String escrowStatus,
        Instant createdAt
) {}



