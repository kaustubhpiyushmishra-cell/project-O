-- Migration 002: Add mentor columns to users table
-- Run this against existing databases to add mentor support

-- Add mentor flag
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_mentor BOOLEAN DEFAULT FALSE;

-- Mentor application status: 'pending', 'approved', 'rejected'
ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_status VARCHAR(20) DEFAULT NULL;

-- Price per session in INR (0 = free)
ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_rate INTEGER DEFAULT 0;

-- Mentor-specific bio/expertise description
ALTER TABLE users ADD COLUMN IF NOT EXISTS mentor_bio TEXT DEFAULT NULL;

-- Index for fast mentor listing queries
CREATE INDEX IF NOT EXISTS idx_users_is_mentor ON users(is_mentor) WHERE is_mentor = TRUE;
CREATE INDEX IF NOT EXISTS idx_users_mentor_status ON users(mentor_status) WHERE mentor_status IS NOT NULL;
