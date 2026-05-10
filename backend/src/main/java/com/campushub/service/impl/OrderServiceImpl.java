package com.campushub.service.impl;

import com.campushub.domain.*;
import com.campushub.dto.order.OrderRequest;
import com.campushub.dto.order.OrderResponse;
import com.campushub.exception.ApiException;
import com.campushub.repository.*;
import com.campushub.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;


@Service
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final GigRepository gigRepository;
    private final UserRepository userRepository;
    private final WalletLedgerRepository walletLedgerRepository;

    @Value("${platform.fee-percent:10}")
    private double feePercent;

    @Value("${webhook.secret:}")
    private String webhookSecret;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            GigRepository gigRepository,
            UserRepository userRepository,
            WalletLedgerRepository walletLedgerRepository
    ) {
        this.orderRepository = orderRepository;
        this.gigRepository = gigRepository;
        this.userRepository = userRepository;
        this.walletLedgerRepository = walletLedgerRepository;
    }

    @Override
    @Transactional
    public OrderResponse create(OrderRequest req, String buyerId) {
        Gig gig = gigRepository.findById(req.gigId())
                .orElseThrow(() -> ApiException.notFound("Gig not found"));
        if (gig.getStatus() != Gig.Status.OPEN) {
            throw ApiException.badRequest("Gig is not open for orders");
        }
        User buyer  = userRepository.findById(buyerId)
                .orElseThrow(() -> ApiException.notFound("Buyer not found"));
        User seller = userRepository.findById((gig.getPostedBy())).orElse(null);
        if (buyer.getId().equals(seller != null ? seller.getId() : null)) {
            throw ApiException.badRequest("Cannot order your own gig");
        }

        String demoOrderId = "DEMO" + System.currentTimeMillis();
        log.info("Created demo order: {} for gig: {}", demoOrderId, gig.getId());

        BigDecimal fee = req.amount().multiply(BigDecimal.valueOf(feePercent / 100.0));

        Order order = Order.builder()
                .gig(gig)
                .buyer(buyer)
                .seller(seller)
                .amount(req.amount())
                .platformFee(fee)
                .paymentGatewayRef(demoOrderId)
                .escrowStatus(Order.EscrowStatus.pending)
                .build();
        order = orderRepository.save(order);

        gig.setStatus(Gig.Status.IN_PROGRESS);
        gigRepository.save(gig);

        return toResponse(order);
    }

    @Override
    public OrderResponse getById(String id, String requesterId) {
        Order order = findOrThrow(id);
        if (!order.getBuyer().getId().equals(requesterId) &&
            !order.getSeller().getId().equals(requesterId)) {
            throw ApiException.forbidden("Access denied");
        }
        return toResponse(order);
    }

    @Override
    public Page<OrderResponse> getMyOrders(String userId, String role, Pageable pageable) {
        if ("seller".equalsIgnoreCase(role)) {
            return orderRepository.findBySellerId(userId, pageable).map(this::toResponse);
        }
        return orderRepository.findByBuyerId(userId, pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public OrderResponse releaseEscrow(String orderId, String buyerId) {
        Order order = findOrThrow(orderId);
        if (!order.getBuyer().getId().equals(buyerId)) {
            throw ApiException.forbidden("Only buyer can release escrow");
        }
        if (order.getEscrowStatus() != Order.EscrowStatus.held) {
            throw ApiException.badRequest("Escrow is not in held state");
        }
        order.setEscrowStatus(Order.EscrowStatus.released);
        order.setReleasedAt(Instant.now());
        orderRepository.save(order);

        BigDecimal net = order.getAmount().subtract(order.getPlatformFee());
        recordLedger(order.getSeller(), order, WalletLedger.EntryType.credit, net);

        order.getGig().setStatus(Gig.Status.CLOSED); // Assuming CLOSED for completed
        gigRepository.save(order.getGig());

        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse raiseDispute(String orderId, String requesterId) {
        Order order = findOrThrow(orderId);
        if (!order.getBuyer().getId().equals(requesterId) &&
            !order.getSeller().getId().equals(requesterId)) {
            throw ApiException.forbidden("Access denied");
        }
        order.setEscrowStatus(Order.EscrowStatus.disputed);
        order.getGig().setStatus(Gig.Status.CANCELLED); // Assuming CANCELLED for disputed
        gigRepository.save(order.getGig());
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse confirmDemoPayment(String orderId, String buyerId) {
        Order order = findOrThrow(orderId);
        if (!order.getBuyer().getId().equals(buyerId)) {
            throw ApiException.forbidden("Only buyer can confirm payment");
        }
        if (order.getEscrowStatus() != Order.EscrowStatus.pending) {
            throw ApiException.badRequest("Payment already confirmed");
        }
        
        order.setEscrowStatus(Order.EscrowStatus.held);
        orderRepository.save(order);
        recordLedger(order.getBuyer(), order, WalletLedger.EntryType.hold, order.getAmount().negate());
        log.info("Demo payment confirmed for order {} - funds held in escrow", order.getId());
        return toResponse(order);
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String signature) {
        verifyWebhookSignature(payload, signature);

        if (payload.contains("\"payment.captured\"") || payload.contains("\"order.paid\"")) {
            String paymentRef = extractJsonField(payload, "order_id");
            if (paymentRef != null) {
                orderRepository.findByPaymentGatewayRef(paymentRef).ifPresent(order -> {
                    if (order.getEscrowStatus() == Order.EscrowStatus.pending) {
                        order.setEscrowStatus(Order.EscrowStatus.held);
                        recordLedger(order.getBuyer(), order,
                                WalletLedger.EntryType.hold, order.getAmount().negate());
                        orderRepository.save(order);
                        log.info("Escrow held for order {} after payment", order.getId());
                    }
                });
            }
        } else if (payload.contains("\"payment.failed\"")) {
            String paymentRef = extractJsonField(payload, "order_id");
            if (paymentRef != null) {
                orderRepository.findByPaymentGatewayRef(paymentRef).ifPresent(order -> {
                    order.setEscrowStatus(Order.EscrowStatus.refunded);
                    order.getGig().setStatus(Gig.Status.OPEN);
                    gigRepository.save(order.getGig());
                    orderRepository.save(order);
                    log.info("Payment failed for order {}, gig re-opened", order.getId());
                });
            }
        }
    }

    private void verifyWebhookSignature(String payload, String signature) {
        String secret = webhookSecret;
        if (secret == null || secret.isBlank()) {
            log.warn("Webhook secret not configured — skipping signature verification");
            return;
        }
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(
                    secret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(
                    payload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) hex.append(String.format("%02x", b));
            if (!hex.toString().equals(signature)) {
                throw ApiException.forbidden("Invalid webhook signature");
            }
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Signature verification failed", e);
        }
    }

    private String extractJsonField(String json, String field) {
        String search = "\"" + field + "\":\"";
        int start = json.indexOf(search);
        if (start < 0) return null;
        start += search.length();
        int end = json.indexOf('"', start);
        return end > start ? json.substring(start, end) : null;
    }

    private void recordLedger(User user, Order order, WalletLedger.EntryType type, BigDecimal amount) {
        BigDecimal prev = walletLedgerRepository
                .findLatestBalance(user.getId())
                .orElse(BigDecimal.ZERO);
        walletLedgerRepository.save(WalletLedger.builder()
                .user(user)
                .order(order)
                .type(type)
                .amount(amount.abs())
                .balanceAfter(prev.add(amount))
                .build());
    }

    private Order findOrThrow(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Order not found: " + id));
    }

    private OrderResponse toResponse(Order o) {
        return new OrderResponse(
                o.getId(),
                o.getGig().getId(),
                o.getGig().getTitle(),
                o.getBuyer().getId(),
                o.getBuyer().getName(),
                o.getSeller().getId(),
                o.getSeller().getName(),
                o.getAmount(),
                o.getPlatformFee(),
                o.getPaymentGatewayRef(),
                o.getEscrowStatus(),
                o.getCreatedAt(),
                o.getReleasedAt()
        );
    }
}





