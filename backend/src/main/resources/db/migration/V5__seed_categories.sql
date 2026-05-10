-- ── Categories ────────────────────────────────────────────────────────────
CREATE TABLE categories (
    id        UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name      VARCHAR(80)  NOT NULL,
    icon_name VARCHAR(80)  NOT NULL,
    slug      VARCHAR(80)  NOT NULL UNIQUE
);

INSERT INTO categories (name, icon_name, slug) VALUES
    ('Coding',        'code',          'coding'),
    ('Design',        'palette',       'design'),
    ('Writing',       'pencil',        'writing'),
    ('Video',         'video',         'video'),
    ('Music',         'music',         'music'),
    ('Tutoring',      'book-open',     'tutoring'),
    ('Marketing',     'megaphone',     'marketing'),
    ('Photography',   'camera',        'photography'),
    ('Translation',   'languages',     'translation'),
    ('Other',         'ellipsis',      'other');
