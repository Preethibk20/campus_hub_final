package com.campushub.controller;

import com.campushub.domain.Gig;
import com.campushub.dto.GigResponseDTO;
import com.campushub.service.GigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/gigs")
public class GigController {

    private final GigService gigService;

    public GigController(GigService gigService) {
        this.gigService = gigService;
    }

    @PostMapping
    public ResponseEntity<GigResponseDTO> createGig(@Valid @RequestBody Gig gig, @AuthenticationPrincipal String currentUserId) {
        gig.setPostedBy(currentUserId);
        return new ResponseEntity<>(gigService.createGig(gig), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GigResponseDTO>> browseAll(
            @RequestParam(required = false) Gig.Category category,
            @RequestParam(required = false) Gig.Type type,
            @RequestParam(required = false) List<String> skills,
            @AuthenticationPrincipal String currentUserId) {
        return ResponseEntity.ok(gigService.filterGigs(category, type, skills, currentUserId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GigResponseDTO> getGigById(@PathVariable String id, @AuthenticationPrincipal String currentUserId) {
        return gigService.getGigById(id, currentUserId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<GigResponseDTO> updateGig(
            @PathVariable String id,
            @Valid @RequestBody Gig updatedGig,
            @AuthenticationPrincipal String currentUserId) {
        
        return gigService.getGigById(id, currentUserId)
                .map(existing -> {
                    if (!existing.getPostedBy().equals(currentUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<GigResponseDTO>build();
                    }
                    return ResponseEntity.ok(gigService.updateGig(id, updatedGig));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGig(@PathVariable String id, @AuthenticationPrincipal String currentUserId) {
        return gigService.getGigById(id, currentUserId)
                .map(existing -> {
                    if (!existing.getPostedBy().equals(currentUserId)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }
                    gigService.deleteGig(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my")
    public ResponseEntity<List<GigResponseDTO>> getMyGigs(@AuthenticationPrincipal String currentUserId) {
        return ResponseEntity.ok(gigService.getGigsByUser(currentUserId));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<Void> applyToGig(@PathVariable String id, @AuthenticationPrincipal String currentUserId) {
        gigService.applyToGig(id, currentUserId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/interest")
    public ResponseEntity<GigResponseDTO> expressInterest(@PathVariable String id, @AuthenticationPrincipal String currentUserId) {
        return ResponseEntity.ok(gigService.recordInterest(id, currentUserId));
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<List<com.campushub.domain.User>> getApplications(
            @PathVariable String id, 
            @AuthenticationPrincipal String currentUserId) {
        return ResponseEntity.ok(gigService.getApplicationsForGig(id, currentUserId));
    }

    @PatchMapping("/{id}/applicants/{userId}/accept")
    public ResponseEntity<GigResponseDTO> acceptApplicant(
            @PathVariable String id, 
            @PathVariable String userId, 
            @AuthenticationPrincipal String currentUserId) {
        return ResponseEntity.ok(gigService.acceptApplicant(id, userId, currentUserId));
    }

    @PatchMapping("/{id}/applicants/{userId}/reject")
    public ResponseEntity<GigResponseDTO> rejectApplicant(
            @PathVariable String id, 
            @PathVariable String userId, 
            @AuthenticationPrincipal String currentUserId) {
        return ResponseEntity.ok(gigService.rejectApplicant(id, userId, currentUserId));
    }
}



