package com.campushub.dto.gig;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ApplicationRequest(
        @NotBlank @Size(max = 1000) String message
) {}



