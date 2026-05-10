package com.campushub.service;

import com.campushub.dto.order.OrderRequest;
import com.campushub.dto.order.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



public interface OrderService {
    OrderResponse create(OrderRequest request, String buyerId);
    OrderResponse getById(String id, String requesterId);
    Page<OrderResponse> getMyOrders(String userId, String role, Pageable pageable);
    OrderResponse releaseEscrow(String orderId, String buyerId);
    OrderResponse confirmDemoPayment(String orderId, String buyerId);
    OrderResponse raiseDispute(String orderId, String requesterId);
    void handleWebhook(String payload, String signature);
}



