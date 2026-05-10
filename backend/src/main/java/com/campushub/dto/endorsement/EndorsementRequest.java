package com.campushub.dto.endorsement;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;



public record EndorsementRequest(
        @NotNull String endorseeId,
        @NotNull String skillId,
        @Size(max = 1000) String comment
) {}



