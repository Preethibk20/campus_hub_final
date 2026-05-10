-- ── Orders ────────────────────────────────────────────────────────────────
CREATE TYPE escrow_status AS ENUM ('pending', 'held', 'released', 'refunded', 'disputed');

CREATE TABLE orders (
    id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id                UUID          NOT NULL REFERENCES gigs(id),
    buyer_id              UUID          NOT NULL REFERENCES users(id),
    seller_id             UUID          NOT NULL REFERENCES users(id),
    amount                DECIMAL(10,2) NOT NULL,
    platform_fee          DECIMAL(10,2),
    payment_gateway_ref   VARCHAR(200),
    escrow_status         escrow_status NOT NULL DEFAULT 'pending',
    created_at            TIMESTAMP     NOT NULL DEFAULT now(),
    released_at           TIMESTAMP
);

CREATE INDEX orders_buyer_idx  ON orders(buyer_id);
CREATE INDEX orders_seller_idx ON orders(seller_id);
CREATE INDEX orders_gig_idx    ON orders(gig_id);

-- ── Wallet Ledger ─────────────────────────────────────────────────────────
CREATE TYPE ledger_entry_type AS ENUM ('credit', 'debit', 'hold', 'release', 'refund');

CREATE TABLE wallet_ledger (
    id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID              NOT NULL REFERENCES users(id),
    order_id      UUID              REFERENCES orders(id),
    type          ledger_entry_type NOT NULL,
    amount        DECIMAL(10,2)     NOT NULL,
    balance_after DECIMAL(10,2)     NOT NULL,
    created_at    TIMESTAMP         NOT NULL DEFAULT now()
);

CREATE INDEX wallet_ledger_user_idx ON wallet_ledger(user_id);
