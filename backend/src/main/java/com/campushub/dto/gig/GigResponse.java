package com.campushub.dto.gig;

import com.campushub.domain.Gig;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;


public record GigResponse(
        String id,
        String posterId,
        String posterName,
        String posterAvatar,
        String posterCollege,
        Gig.Type type,
        String title,
        String description,
        String category,
        BigDecimal budgetMin,
        BigDecimal budgetMax,
        Short timelineDays,
        Gig.Status status,
        List<String> attachmentUrls,
        Instant createdAt
) {}



