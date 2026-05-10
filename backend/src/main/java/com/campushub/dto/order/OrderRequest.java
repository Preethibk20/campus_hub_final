package com.campushub.dto.order;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;


public record OrderRequest(
        @NotNull String gigId,
        @NotNull @DecimalMin("1.0") BigDecimal amount
) {}



