package com.campushub.repository;

import com.campushub.domain.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

import java.time.Instant;
import java.math.BigDecimal;

public interface OrderRepository extends MongoRepository<Order, String> {
    Page<Order> findByBuyerId(String buyerId, Pageable pageable);
    Page<Order> findBySellerId(String sellerId, Pageable pageable);
    
    long countBySellerIdAndEscrowStatus(String sellerId, Order.EscrowStatus status);
    long countByBuyerIdAndEscrowStatus(String buyerId, Order.EscrowStatus status);
    
    Optional<Order> findByPaymentGatewayRef(String paymentGatewayRef);

    @Query("{ '$and': [ { 'escrow_status': ?0 }, { 'created_at': { '$gte': ?1 } }, { 'created_at': { '$lte': ?2 } } ] }")
    Page<Order> findAdminTransactions(String status, Instant from, Instant to, Pageable pageable);

    // Sum queries need aggregation, providing placeholders for compilation
    default BigDecimal totalPlatformRevenue() { return BigDecimal.ZERO; }
    default BigDecimal revenueThisMonth(Instant startOfMonth) { return BigDecimal.ZERO; }

    long countByEscrowStatus(Order.EscrowStatus status);
    
    @Query("{ 'escrow_status': 'disputed' }")
    Page<Order> findDisputedOrders(Pageable pageable);
}



