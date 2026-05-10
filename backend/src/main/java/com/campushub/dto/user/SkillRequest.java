package com.campushub.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SkillRequest(
        @NotBlank String name,
        String category,
        @NotNull String rateType,   // "hourly" | "fixed"
        BigDecimal rateAmount
) {}



