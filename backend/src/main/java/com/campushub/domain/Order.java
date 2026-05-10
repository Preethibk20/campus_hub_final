package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.Instant;


@Document(collection = "orders")
public class Order {

    public enum EscrowStatus { pending, held, released, refunded, disputed }

    @Id
    private String id;

    @DBRef
    private Gig gig;

    @DBRef
    private User buyer;

    @DBRef
    private User seller;

    private BigDecimal amount;

    @Field("platform_fee")
    private BigDecimal platformFee;

    @Field("payment_gateway_ref")
    private String paymentGatewayRef;

    @Field("escrow_status")
    private EscrowStatus escrowStatus = EscrowStatus.pending;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    @Field("released_at")
    private Instant releasedAt;

    @Field("updated_at")
    private Instant updatedAt;

    public Order() {}

    public Order(String id, Gig gig, User buyer, User seller, BigDecimal amount, BigDecimal platformFee, String paymentGatewayRef, EscrowStatus escrowStatus, Instant createdAt, Instant releasedAt, Instant updatedAt) {
        this.id = id;
        this.gig = gig;
        this.buyer = buyer;
        this.seller = seller;
        this.amount = amount;
        this.platformFee = platformFee;
        this.paymentGatewayRef = paymentGatewayRef;
        this.escrowStatus = escrowStatus;
        this.createdAt = createdAt;
        this.releasedAt = releasedAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Gig getGig() { return gig; }
    public void setGig(Gig gig) { this.gig = gig; }
    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }
    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getPlatformFee() { return platformFee; }
    public void setPlatformFee(BigDecimal platformFee) { this.platformFee = platformFee; }
    public String getPaymentGatewayRef() { return paymentGatewayRef; }
    public void setPaymentGatewayRef(String paymentGatewayRef) { this.paymentGatewayRef = paymentGatewayRef; }
    public EscrowStatus getEscrowStatus() { return escrowStatus; }
    public void setEscrowStatus(EscrowStatus escrowStatus) { this.escrowStatus = escrowStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getReleasedAt() { return releasedAt; }
    public void setReleasedAt(Instant releasedAt) { this.releasedAt = releasedAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static OrderBuilder builder() {
        return new OrderBuilder();
    }

    public static class OrderBuilder {
        private String id;
        private Gig gig;
        private User buyer;
        private User seller;
        private BigDecimal amount;
        private BigDecimal platformFee;
        private String paymentGatewayRef;
        private EscrowStatus escrowStatus = EscrowStatus.pending;
        private Instant createdAt;
        private Instant releasedAt;
        private Instant updatedAt;

        public OrderBuilder id(String id) { this.id = id; return this; }
        public OrderBuilder gig(Gig gig) { this.gig = gig; return this; }
        public OrderBuilder buyer(User buyer) { this.buyer = buyer; return this; }
        public OrderBuilder seller(User seller) { this.seller = seller; return this; }
        public OrderBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public OrderBuilder platformFee(BigDecimal platformFee) { this.platformFee = platformFee; return this; }
        public OrderBuilder paymentGatewayRef(String paymentGatewayRef) { this.paymentGatewayRef = paymentGatewayRef; return this; }
        public OrderBuilder escrowStatus(EscrowStatus escrowStatus) { this.escrowStatus = escrowStatus; return this; }
        public OrderBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public OrderBuilder releasedAt(Instant releasedAt) { this.releasedAt = releasedAt; return this; }
        public OrderBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Order build() {
            return new Order(id, gig, buyer, seller, amount, platformFee, paymentGatewayRef, escrowStatus, createdAt, releasedAt, updatedAt);
        }
    }
}



