-- ── Skills ────────────────────────────────────────────────────────────────
CREATE TYPE rate_type AS ENUM ('hourly', 'fixed');

CREATE TABLE skills (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    category    VARCHAR(80),
    rate_type   rate_type,
    rate_amount DECIMAL(10,2),
    is_active   BOOLEAN      NOT NULL DEFAULT true
);

CREATE INDEX skills_user_idx ON skills(user_id);

-- ── Gigs ──────────────────────────────────────────────────────────────────
CREATE TYPE gig_type   AS ENUM ('service', 'request');
CREATE TYPE gig_status AS ENUM ('open', 'in_progress', 'completed', 'disputed', 'cancelled');

CREATE TABLE gigs (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    poster_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            gig_type     NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(80),
    budget_min      DECIMAL(10,2),
    budget_max      DECIMAL(10,2),
    timeline_days   SMALLINT,
    status          gig_status   NOT NULL DEFAULT 'open',
    attachment_urls TEXT[],
    search_vector   TSVECTOR,
    created_at      TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX gigs_poster_idx  ON gigs(poster_id);
CREATE INDEX gigs_status_idx  ON gigs(status);
CREATE INDEX gigs_search_idx  ON gigs USING GIN(search_vector);

-- ── Full-text search: auto-update trigger ─────────────────────────────────
CREATE FUNCTION gigs_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')),       'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')),    'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gigs_search_vector_trigger
    BEFORE INSERT OR UPDATE OF title, description, category
    ON gigs
    FOR EACH ROW EXECUTE FUNCTION gigs_search_vector_update();
