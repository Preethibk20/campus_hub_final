-- Add user rating columns
ALTER TABLE users ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN review_count INT DEFAULT 0;

-- ── Endorsements ──────────────────────────────────────────────────────────
CREATE TABLE endorsements (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id UUID      NOT NULL REFERENCES users(id),
    endorsee_id UUID      NOT NULL REFERENCES users(id),
    skill_id    UUID      NOT NULL REFERENCES skills(id),
    comment     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT unique_endorsement UNIQUE (endorser_id, skill_id)
);

CREATE INDEX endorsements_endorsee_idx ON endorsements(endorsee_id);

-- ── Badges ────────────────────────────────────────────────────────────────
CREATE TABLE badges (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key   VARCHAR(100) NOT NULL,
    awarded_at  TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT  unique_badge UNIQUE (user_id, badge_key)
);

CREATE INDEX badges_user_idx ON badges(user_id);
