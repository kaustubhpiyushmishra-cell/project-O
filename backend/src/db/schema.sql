-- Project O Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    name            VARCHAR(100),
    college         VARCHAR(200),
    branch          VARCHAR(100),
    year            SMALLINT CHECK (year BETWEEN 1 AND 6),
    interests       TEXT[], -- array of interest tags
    reputation      INTEGER DEFAULT 0,
    is_mentor       BOOLEAN DEFAULT FALSE,
    mentor_status   VARCHAR(20) DEFAULT NULL, -- 'pending', 'approved', 'rejected'
    mentor_rate     INTEGER DEFAULT 0,        -- price per session in INR (0 = free)
    mentor_bio      TEXT DEFAULT NULL,        -- mentor-specific about/expertise
    is_verified     BOOLEAN DEFAULT FALSE,
    is_banned       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_college ON users(college);

-- ============================================
-- MENTORSHIP REQUESTS
-- ============================================
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

CREATE TABLE mentorship_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         TEXT,
    status          mentorship_status DEFAULT 'pending',
    scheduled_at    TIMESTAMPTZ,
    topic           VARCHAR(200),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_users CHECK (requester_id != mentor_id)
);

CREATE INDEX idx_mentorship_requester ON mentorship_requests(requester_id);
CREATE INDEX idx_mentorship_mentor ON mentorship_requests(mentor_id);
CREATE INDEX idx_mentorship_status ON mentorship_requests(status);

-- ============================================
-- SESSIONS (video calls — both casual and mentorship)
-- ============================================
CREATE TYPE session_type AS ENUM ('casual', 'mentorship');
CREATE TYPE session_status AS ENUM ('active', 'ended', 'missed');

CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            session_type NOT NULL,
    status          session_status DEFAULT 'active',
    mentorship_id   UUID REFERENCES mentorship_requests(id) ON DELETE SET NULL,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    duration_sec    INTEGER,
    CONSTRAINT different_session_users CHECK (user1_id != user2_id)
);

CREATE INDEX idx_sessions_user1 ON sessions(user1_id);
CREATE INDEX idx_sessions_user2 ON sessions(user2_id);
CREATE INDEX idx_sessions_type ON sessions(type);

-- ============================================
-- RATINGS
-- ============================================
CREATE TABLE ratings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    rater_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score           SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_rating UNIQUE (session_id, rater_id),
    CONSTRAINT different_rater CHECK (rater_id != rated_id)
);

CREATE INDEX idx_ratings_rated ON ratings(rated_id);

-- ============================================
-- REPORTS
-- ============================================
CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

CREATE TABLE reports (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason          TEXT NOT NULL,
    session_id      UUID REFERENCES sessions(id) ON DELETE SET NULL,
    status          report_status DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT different_reporter CHECK (reporter_id != reported_id)
);

CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_reports_status ON reports(status);

-- ============================================
-- BLOCKED USERS
-- ============================================
CREATE TABLE blocked_users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_block UNIQUE (blocker_id, blocked_id),
    CONSTRAINT different_blocker CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocked_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_blocked ON blocked_users(blocked_id);

-- ============================================
-- Trigger: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_mentorship_updated_at
    BEFORE UPDATE ON mentorship_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- WALLET: add balance column to users
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance INTEGER DEFAULT 0;

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TYPE transaction_type AS ENUM ('credit', 'debit');

CREATE TABLE IF NOT EXISTS transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            transaction_type NOT NULL,
    amount          INTEGER NOT NULL CHECK (amount > 0),
    description     TEXT,
    ref_id          UUID,  -- optional reference to session/mentorship
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

