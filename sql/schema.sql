CREATE DATABASE andyamat;
\c andyamat;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE invitations (
    id          TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(6), 'hex'),
    guest_name  TEXT NOT NULL,
    plus_ones   INT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsvps (
    id              SERIAL PRIMARY KEY,
    invitation_id   TEXT NOT NULL REFERENCES invitations(id),
    name            TEXT NOT NULL,
    num_guests      INT NOT NULL DEFAULT 1,
    attending       BOOLEAN NOT NULL,
    submitted_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invite_views (
    id              SERIAL PRIMARY KEY,
    invitation_id   TEXT NOT NULL REFERENCES invitations(id),
    viewed_at       TIMESTAMPTZ DEFAULT NOW(),
    user_agent      TEXT,
    ip_address      TEXT
);

CREATE TABLE admin_users (
    id              SERIAL PRIMARY KEY,
    username        TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rsvps_invitation ON rsvps(invitation_id);
CREATE INDEX idx_views_invitation ON invite_views(invitation_id);

-- Seed an initial admin (change password after first login)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', crypt('changeme', gen_salt('bf')));
