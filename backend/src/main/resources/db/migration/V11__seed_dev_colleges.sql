-- ── Dev/test college seed ─────────────────────────────────────────────────
-- Allows testing with common email providers locally.
INSERT INTO colleges (name, email_domain, is_active) VALUES
    ('Gmail Users',   'gmail.com',   true),
    ('Outlook Users', 'outlook.com', true),
    ('Hotmail Users', 'hotmail.com', true),
    ('Yahoo Users',   'yahoo.com',   true),
    ('Test College',  'test.edu',    true)
ON CONFLICT (email_domain) DO NOTHING;
