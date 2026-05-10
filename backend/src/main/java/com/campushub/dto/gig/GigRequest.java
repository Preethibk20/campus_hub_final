package com.campushub.dto.gig;

import com.campushub.domain.Gig;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record GigRequest(
        @NotNull Gig.Type type,
        @NotBlank @Size(max = 200) String title,
        @NotBlank String description,
        @NotBlank @Size(max = 80) String category,
        @DecimalMin("0.0") BigDecimal budgetMin,
        @DecimalMin("0.0") BigDecimal budgetMax,
        Short timelineDays
) {}



