package com.campushub.dto.admin;

public record BanUserRequest(
        boolean banned,
        String reason
) {}



