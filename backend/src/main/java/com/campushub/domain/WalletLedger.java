package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.Instant;


@Document(collection = "wallet_ledger")
public class WalletLedger {

    public enum EntryType { deposit, withdrawal, escrow_hold, escrow_release, payment_received, platform_fee, credit, hold }

    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private Order order;

    private EntryType type;

    private BigDecimal amount;

    private BigDecimal balanceAfter;

    private Instant createdAt = Instant.now();

    public WalletLedger() {}

    public WalletLedger(String id, User user, Order order, EntryType type, BigDecimal amount, BigDecimal balanceAfter, Instant createdAt) {
        this.id = id;
        this.user = user;
        this.order = order;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public EntryType getType() { return type; }
    public void setType(EntryType type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static WalletLedgerBuilder builder() { return new WalletLedgerBuilder(); }

    public static class WalletLedgerBuilder {
        private String id;
        private User user;
        private Order order;
        private EntryType type;
        private BigDecimal amount;
        private BigDecimal balanceAfter;
        private Instant createdAt;

        public WalletLedgerBuilder id(String id) { this.id = id; return this; }
        public WalletLedgerBuilder user(User user) { this.user = user; return this; }
        public WalletLedgerBuilder order(Order order) { this.order = order; return this; }
        public WalletLedgerBuilder type(EntryType type) { this.type = type; return this; }
        public WalletLedgerBuilder amount(BigDecimal amount) { this.amount = amount; return this; }
        public WalletLedgerBuilder balanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; return this; }
        public WalletLedgerBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public WalletLedger build() {
            return new WalletLedger(id, user, order, type, amount, balanceAfter, createdAt);
        }
    }
}




