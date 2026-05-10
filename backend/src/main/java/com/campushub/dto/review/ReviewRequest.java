package com.campushub.dto.review;

import jakarta.validation.constraints.*;



public record ReviewRequest(
        @NotNull String orderId,
        @NotNull @Min(1) @Max(5) Short rating,
        @Size(max = 1000) String comment
) {}



