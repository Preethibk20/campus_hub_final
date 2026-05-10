package com.campushub.controller;

import com.campushub.dto.endorsement.EndorsementRequest;
import com.campushub.dto.endorsement.SkillEndorsementResponse;
import com.campushub.service.EndorsementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/endorsements")
@RequiredArgsConstructor
public class EndorsementController {

    private final EndorsementService endorsementService;

    @PostMapping
    public ResponseEntity<Void> create(
            @Valid @RequestBody EndorsementRequest req,
            @AuthenticationPrincipal String userId) {
        endorsementService.create(req, userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SkillEndorsementResponse>> getForUser(@PathVariable String userId) {
        return ResponseEntity.ok(endorsementService.getForUser(userId));
    }
}



