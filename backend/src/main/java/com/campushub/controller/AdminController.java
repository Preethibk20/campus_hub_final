package com.campushub.controller;

import com.campushub.dto.admin.*;
import com.campushub.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;


@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // 1. USER MANAGEMENT
    @GetMapping("/users")
    public Page<AdminUserResponse> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isVerified,
            @PageableDefault(size = 20) Pageable pageable) {
        return adminService.getUsers(search, role, isVerified, pageable);
    }

    @PutMapping("/users/{id}/ban")
    public ResponseEntity<AdminUserResponse> banUser(
            @PathVariable String id,
            @RequestBody BanUserRequest req) {
        return ResponseEntity.ok(adminService.banUser(id, req));
    }

    @PostMapping("/users/{id}/verify")
    public ResponseEntity<Void> verifyUser(@PathVariable String id) {
        adminService.verifyUser(id);
        return ResponseEntity.ok().build();
    }

    // 2. GIG MODERATION
    @GetMapping("/gigs")
    public Page<AdminGigResponse> getGigs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable) {
        return adminService.getGigs(status, category, pageable);
    }

    @PutMapping("/gigs/{id}/remove")
    public ResponseEntity<Void> removeGig(@PathVariable String id) {
        adminService.removeGig(id);
        return ResponseEntity.ok().build();
    }

    // 3. TRANSACTION OVERVIEW
    @GetMapping("/transactions")
    public Page<AdminTransactionResponse> getTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @PageableDefault(size = 20) Pageable pageable) {
        return adminService.getTransactions(status, from, to, pageable);
    }

    @GetMapping(value = "/transactions/export", produces = "text/csv")
    public ResponseEntity<String> exportTransactions() {
        String csv = adminService.exportTransactionsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"transactions.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    // 4. DISPUTE MANAGEMENT
    @GetMapping("/disputes")
    public Page<AdminDisputeResponse> getDisputes(
            @RequestParam(required = false, defaultValue = "disputed") String status,
            @PageableDefault(size = 20) Pageable pageable) {
        return adminService.getDisputes(pageable);
    }

    @GetMapping("/disputes/{orderId}")
    public ResponseEntity<AdminDisputeDetailResponse> getDisputeDetail(@PathVariable String orderId) {
        return ResponseEntity.ok(adminService.getDisputeDetail(orderId));
    }

    @PostMapping("/disputes/{orderId}/resolve")
    public ResponseEntity<Void> resolveDispute(
            @PathVariable String orderId,
            @RequestBody DisputeResolutionRequest req,
            @AuthenticationPrincipal String adminId) {
        adminService.resolveDispute(orderId, req, adminId);
        return ResponseEntity.ok().build();
    }

    // 5. ANALYTICS
    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    // 6. COLLEGE MANAGEMENT
    @PostMapping("/colleges")
    public ResponseEntity<CollegeDto> addCollege(@RequestBody CollegeRequest req) {
        return ResponseEntity.ok(adminService.addCollege(req));
    }

    @GetMapping("/colleges")
    public ResponseEntity<List<CollegeDto>> getColleges() {
        return ResponseEntity.ok(adminService.getColleges());
    }

    @DeleteMapping("/colleges/{id}")
    public ResponseEntity<Void> removeCollege(@PathVariable String id) {
        adminService.removeCollege(id);
        return ResponseEntity.ok().build();
    }
}



