-- ── Gig Applications ──────────────────────────────────────────────────────
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

CREATE TABLE gig_applications (
    id           UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id       UUID               NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
    applicant_id UUID               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message      TEXT,
    status       application_status NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMP          NOT NULL DEFAULT now(),
    CONSTRAINT uq_gig_applicant UNIQUE (gig_id, applicant_id)
);

CREATE INDEX gig_applications_gig_idx       ON gig_applications(gig_id);
CREATE INDEX gig_applications_applicant_idx ON gig_applications(applicant_id);
