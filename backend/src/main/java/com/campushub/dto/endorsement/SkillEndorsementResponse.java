package com.campushub.dto.endorsement;

import java.util.List;


public record SkillEndorsementResponse(
        String skillId,
        String skillName,
        List<EndorsementResponse> endorsements
) {}



