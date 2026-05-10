package com.campushub.dto.admin;

import com.campushub.dto.message.MessageResponse;
import java.util.List;
import java.util.ArrayList;

public record AdminDisputeDetailResponse(
        AdminDisputeResponse disputeInfo,
        List<MessageResponse> conversationHistory
) {}



