package com.campushub.dto.user;

import java.math.BigDecimal;
import java.util.List;

/**
 * Public profile DTO — intentionally omits sensitive fields (email, role, verified status)
 * to prevent data enumeration by authenticated-but-unprivileged users.
 */
public record PublicProfileResponse(
        String id,
        String name,
        String bio,
        String college,
        String academicYear,
        String branch,
        List<String> skills,
        List<UserProfileResponse.SkillDto> activeSkills,
        List<String> domains,
        String availability,
        String profilePicUrl,
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl,
        BigDecimal hourlyRate,
        long reviewCount,
        double avgRating
) {}
