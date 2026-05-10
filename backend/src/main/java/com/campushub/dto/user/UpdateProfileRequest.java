package com.campushub.dto.user;

import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProfileRequest(
        @Size(min = 2, max = 120) String name,
        String profilePicUrl,
        String bio,
        String academicYear,
        String branch,
        String linkedinUrl,
        String githubUrl,
        BigDecimal hourlyRate,
        String college,
        String availability,
        String portfolioUrl,
        java.util.List<String> domains,
        java.util.List<String> skills
) {}




