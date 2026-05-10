package com.campushub.dto.endorsement;

import java.time.Instant;
import java.util.Optional;


public record EndorsementResponse(
        String id,
        String endorserId,
        String endorserName,
        Optional<String> comment,
        Instant createdAt
) {}



