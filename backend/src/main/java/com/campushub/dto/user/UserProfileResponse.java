package com.campushub.dto.user;

import com.campushub.domain.Skill;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record UserProfileResponse(
        String id,
        String name,
        String email,
        String role,
        boolean verified,
        String bio,
        String college,
        String academicYear,
        String branch,
        List<String> skills,
        List<SkillDto> activeSkills,
        List<String> domains,
        String availability,
        int profileCompletion,
        String profilePicUrl,
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl,
        BigDecimal hourlyRate,
        String collegeName,
        long reviewCount,
        double avgRating,
        Instant createdAt
) {
    public record SkillDto(
            String id,
            String name,
            String category,
            String rateType,
            BigDecimal rateAmount
    ) {}
}





