package com.campushub.dto.order;

import com.campushub.domain.Order;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderResponse(
        String id,
        String gigId,
        String gigTitle,
        String buyerId,
        String buyerName,
        String sellerId,
        String sellerName,
        BigDecimal amount,
        BigDecimal platformFee,
        String paymentGatewayRef,
        Order.EscrowStatus escrowStatus,
        Instant createdAt,
        Instant releasedAt
) {}



