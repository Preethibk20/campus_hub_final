package com.campushub.dto.admin;

import jakarta.validation.constraints.NotBlank;

public record CollegeRequest(
        @NotBlank String name,
        @NotBlank String emailDomain
) {}



