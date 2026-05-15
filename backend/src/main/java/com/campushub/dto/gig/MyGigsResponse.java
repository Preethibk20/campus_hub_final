package com.campushub.dto.gig;

import com.campushub.dto.GigResponseDTO;
import java.util.List;

public record MyGigsResponse(
    List<GigResponseDTO> created,
    List<GigResponseDTO> applied
) {}
