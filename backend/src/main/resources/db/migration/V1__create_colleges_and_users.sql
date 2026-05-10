-- ── Colleges ──────────────────────────────────────────────────────────────
CREATE TABLE colleges (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(200) NOT NULL,
    email_domain VARCHAR(100) NOT NULL UNIQUE,
    is_active    BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);

-- ── Users ─────────────────────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('student', 'admin', 'recruiter');

CREATE TABLE users (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id      UUID          REFERENCES colleges(id) ON DELETE SET NULL,
    name            VARCHAR(120)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    password_hash   TEXT          NOT NULL,
    role            user_role     NOT NULL DEFAULT 'student',
    is_verified     BOOLEAN       NOT NULL DEFAULT false,
    profile_pic_url TEXT,
    bio             TEXT,
    course          VARCHAR(100),
    year            SMALLINT,
    linkedin_url    TEXT,
    github_url      TEXT,
    hourly_rate     DECIMAL(10,2),
    created_at      TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX users_email_idx   ON users(email);
CREATE INDEX users_college_idx ON users(college_id);

-- ── Refresh Tokens ────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT      NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX refresh_tokens_user_idx  ON refresh_tokens(user_id);
CREATE INDEX refresh_tokens_token_idx ON refresh_tokens(token);
