-- Migration: Create recordings tables
-- Description: Creates tables and indexes for camera recording feature
-- Version: 001

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  script_snapshot TEXT,
  duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 300),
  size_mb FLOAT NOT NULL CHECK (size_mb > 0 AND size_mb <= 50),
  file_format TEXT NOT NULL DEFAULT 'webm' CHECK (file_format IN ('webm', 'mp4')),
  converted_url TEXT,
  recording_quality TEXT CHECK (recording_quality IN ('standard', 'reduced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_recording_settings table
CREATE TABLE IF NOT EXISTS user_recording_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_used_mb FLOAT NOT NULL DEFAULT 0,
  storage_limit_mb INTEGER NOT NULL DEFAULT 100 CHECK (storage_limit_mb > 0),
  default_quality TEXT NOT NULL DEFAULT 'standard' CHECK (default_quality IN ('standard', 'reduced')),
  auto_convert BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for recordings table
CREATE INDEX IF NOT EXISTS idx_recordings_user_id ON recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_recordings_created_at ON recordings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_user_created ON recordings(user_id, created_at DESC);

-- Create index for user_recording_settings
CREATE INDEX IF NOT EXISTS idx_user_recording_settings_user_id ON user_recording_settings(user_id);

-- Add helpful comments
COMMENT ON TABLE recordings IS 'Stores metadata for user video recordings';
COMMENT ON TABLE user_recording_settings IS 'Stores user-specific recording settings and storage quota';
COMMENT ON COLUMN recordings.script_snapshot IS 'Teleprompter text content at recording time';
COMMENT ON COLUMN recordings.converted_url IS 'Path to format-converted video file (if different from original)';
COMMENT ON COLUMN user_recording_settings.auto_convert IS 'Whether to automatically convert video formats for compatibility';
