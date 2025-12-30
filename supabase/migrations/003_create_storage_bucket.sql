-- Migration: Create storage bucket for user recordings
-- Description: Creates storage bucket and policies for video file storage
-- Version: 003

-- Note: Storage bucket creation requires Supabase admin privileges
-- Run this in Supabase Dashboard or via CLI with admin credentials

-- Create the user_recordings storage bucket (private)
-- This should be executed via Supabase Dashboard or CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('user_recordings', 'user_recordings', false);

-- Storage policies for user_recordings bucket
-- These policies ensure users can only access their own recording files

-- Upload Policy: Users can only upload to their own directory
CREATE POLICY IF NOT EXISTS "Users can upload own recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Read Policy: Users can only view their own recordings
CREATE POLICY IF NOT EXISTS "Users can view own recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Delete Policy: Users can only delete their own recordings
CREATE POLICY IF NOT EXISTS "Users can delete own recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Update Policy: Users can only update their own recordings
CREATE POLICY IF NOT EXISTS "Users can update own recordings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'user_recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add helpful comments
COMMENT ON POLICY "Users can upload own recordings" ON storage.objects IS 'Allows users to upload recordings to their personal folder only';
COMMENT ON POLICY "Users can view own recordings" ON storage.objects IS 'Allows users to view only their own recording files';
COMMENT ON POLICY "Users can delete own recordings" ON storage.objects IS 'Allows users to delete only their own recording files';

-- Instructions for manual bucket creation:
/*
To create the storage bucket manually:

1. Via Supabase Dashboard:
   - Go to Storage → New bucket
   - Name: user_recordings
   - Public bucket: OFF (private)
   - File size limit: 50MB
   - Allowed MIME types: video/webm, video/mp4

2. Via Supabase CLI:
   supabase storage create-bucket user_recordings --public false

3. Via SQL (requires admin):
   INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
   VALUES (
     'user_recordings',
     'user_recordings',
     false,
     52428800, -- 50MB in bytes
     ARRAY['video/webm', 'video/mp4']
   );
*/
