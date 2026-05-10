package com.campushub.dto.gig;

import com.campushub.domain.GigApplication;

import java.time.Instant;


public record ApplicationResponse(
        String id,
        String gigId,
        String applicantId,
        String applicantName,
        String applicantAvatar,
        String applicantCollege,
        String message,
        GigApplication.Status status,
        Instant createdAt
) {}



