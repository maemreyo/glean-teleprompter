-- Migration: Add RLS policies for recording tables
-- Description: Creates Row Level Security policies for user data isolation
-- Version: 002

-- Enable Row Level Security on recordings table
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on user_recording_settings table
ALTER TABLE user_recording_settings ENABLE ROW LEVEL SECURITY;

-- Recordings table policies
-- Users can view their own recordings
CREATE POLICY "Users can view own recordings"
ON recordings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own recordings
CREATE POLICY "Users can insert own recordings"
ON recordings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own recordings
CREATE POLICY "Users can update own recordings"
ON recordings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own recordings
CREATE POLICY "Users can delete own recordings"
ON recordings
FOR DELETE
USING (auth.uid() = user_id);

-- user_recording_settings table policies
-- Users can view their own settings
CREATE POLICY "Users can view own settings"
ON user_recording_settings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own settings (typically created on first sign up via trigger)
CREATE POLICY "Users can insert own settings"
ON user_recording_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
ON user_recording_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create a function to initialize user settings on signup
CREATE OR REPLACE FUNCTION init_user_recording_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_recording_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create settings on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION init_user_recording_settings();

-- Add helpful comments
COMMENT ON FUNCTION init_user_recording_settings() IS 'Automatically creates default recording settings for new users';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger to initialize recording settings on user signup';
