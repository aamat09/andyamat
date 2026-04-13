CREATE DATABASE andyamat;
\c andyamat;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE invitations (
    id          TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(6), 'hex'),
    guest_name  TEXT NOT NULL,
    plus_ones   INT DEFAULT 0,
    theme       TEXT DEFAULT 'toystory',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rsvps (
    id              SERIAL PRIMARY KEY,
    invitation_id   TEXT NOT NULL UNIQUE REFERENCES invitations(id),
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

-- ============================================================
-- Pixel Arena: Fighters + Matches
-- ============================================================

CREATE TABLE fighters (
    id          TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(8), 'hex'),
    name        TEXT NOT NULL UNIQUE,
    char_type   TEXT NOT NULL CHECK (char_type IN ('knight','rogue','mage','berserker')),
    weapon      TEXT NOT NULL CHECK (weapon IN ('iron_sword','war_hammer','shadow_dagger')),
    level       INT NOT NULL DEFAULT 1,
    xp          INT NOT NULL DEFAULT 0,
    hp          INT NOT NULL,
    atk         INT NOT NULL,
    def         INT NOT NULL,
    spd         INT NOT NULL,
    crt         INT NOT NULL,
    lck         INT NOT NULL,
    elo         INT NOT NULL DEFAULT 1000,
    wins        INT NOT NULL DEFAULT 0,
    losses      INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fighters_elo ON fighters(elo DESC);
CREATE INDEX idx_fighters_name ON fighters(name);

CREATE TABLE matches (
    id          TEXT PRIMARY KEY DEFAULT encode(gen_random_bytes(8), 'hex'),
    fighter1_id TEXT NOT NULL REFERENCES fighters(id),
    fighter2_id TEXT NOT NULL REFERENCES fighters(id),
    winner_id   TEXT REFERENCES fighters(id),
    seed        BIGINT NOT NULL,
    battle_log  JSONB NOT NULL,
    elo_change  INT NOT NULL DEFAULT 0,
    fought_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_matches_fighter1 ON matches(fighter1_id);
CREATE INDEX idx_matches_fighter2 ON matches(fighter2_id);
CREATE INDEX idx_matches_fought_at ON matches(fought_at DESC);
