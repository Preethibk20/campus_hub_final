-- ── Conversations ─────────────────────────────────────────────────────────
CREATE TABLE conversations (
    id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id        UUID      REFERENCES gigs(id)   ON DELETE SET NULL,
    order_id      UUID      REFERENCES orders(id) ON DELETE SET NULL,
    participant_a UUID      NOT NULL REFERENCES users(id),
    participant_b UUID      NOT NULL REFERENCES users(id),
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_participants UNIQUE (participant_a, participant_b)
);

CREATE INDEX conversations_a_idx ON conversations(participant_a);
CREATE INDEX conversations_b_idx ON conversations(participant_b);

-- ── Messages ──────────────────────────────────────────────────────────────
CREATE TYPE message_type AS ENUM ('text', 'file', 'image');

CREATE TABLE messages (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID         NOT NULL REFERENCES users(id),
    content         TEXT,
    type            message_type NOT NULL DEFAULT 'text',
    file_url        TEXT,
    is_read         BOOLEAN      NOT NULL DEFAULT false,
    created_at      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX messages_conv_idx ON messages(conversation_id);

-- ── Reviews ───────────────────────────────────────────────────────────────
CREATE TABLE reviews (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID      NOT NULL UNIQUE REFERENCES orders(id),
    reviewer_id UUID      NOT NULL REFERENCES users(id),
    reviewee_id UUID      NOT NULL REFERENCES users(id),
    rating      SMALLINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX reviews_reviewee_idx ON reviews(reviewee_id);

-- ── Notifications ─────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(80)  NOT NULL,
    title      VARCHAR(200) NOT NULL,
    body       TEXT,
    is_read    BOOLEAN   NOT NULL DEFAULT false,
    metadata   JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_idx    ON notifications(user_id);
CREATE INDEX notifications_unread_idx  ON notifications(user_id) WHERE is_read = false;
