package com.campushub.controller;

import com.campushub.dto.order.OrderRequest;
import com.campushub.dto.order.OrderResponse;
import com.campushub.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @Valid @RequestBody OrderRequest req,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.create(req, userId));
    }

    @GetMapping("/{id}")
    public OrderResponse getById(
            @PathVariable String id,
            @AuthenticationPrincipal String userId) {
        return orderService.getById(id, userId);
    }

    @GetMapping
    public Page<OrderResponse> myOrders(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "buyer") String role,
            @PageableDefault(size = 20) Pageable pageable) {
        return orderService.getMyOrders(userId, role, pageable);
    }

    @PostMapping("/{id}/confirm-demo-payment")
    public OrderResponse confirmDemoPayment(
            @PathVariable String id,
            @AuthenticationPrincipal String userId) {
        return orderService.confirmDemoPayment(id, userId);
    }

    @PostMapping("/{id}/release")
    public OrderResponse release(
            @PathVariable String id,
            @AuthenticationPrincipal String userId) {
        return orderService.releaseEscrow(id, userId);
    }

    @PostMapping("/{id}/dispute")
    public OrderResponse dispute(
            @PathVariable String id,
            @AuthenticationPrincipal String userId) {
        return orderService.raiseDispute(id, userId);
    }

    @PostMapping("/webhook/payment")
    public ResponseEntity<Void> paymentWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Signature") String signature) {
        orderService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }
}



