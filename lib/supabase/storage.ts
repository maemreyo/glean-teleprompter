/**
 * Supabase Storage utilities for video file uploads
 * @module lib/supabase/storage
 */

import { createClient } from '@/lib/supabase/client';
import type { RecordingFileFormat } from '@/types/recording';

const STORAGE_BUCKET = 'user_recordings';

/**
 * Upload a video file to Supabase Storage
 * @param userId - User ID for creating user-scoped path
 * @param file - Video file blob to upload
 * @param format - File format
 * @returns Upload response with URL
 */
export async function uploadRecording(
  userId: string,
  file: Blob,
  format: RecordingFileFormat = 'webm'
): Promise<{ url: string; path: string; size_mb: number }> {
  const supabase = createClient();
  const timestamp = new Date().toISOString();
  const fileName = `${timestamp}_original.${format}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file);

  if (error) {
    throw new Error(`Failed to upload recording: ${error.message}`);
  }

  // Get public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: data.path,
    size_mb: file.size / (1024 * 1024),
  };
}

/**
 * Delete a recording file from Supabase Storage
 * @param filePath - Path to the file in storage
 */
export async function deleteRecording(filePath: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete recording: ${error.message}`);
  }
}

/**
 * Get a signed URL for private file access (if needed)
 * @param filePath - Path to the file in storage
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Signed URL for temporary access
 */
export async function getSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * List all recording files for a user
 * @param userId - User ID
 * @returns Array of file metadata
 */
export async function listUserRecordings(userId: string): Promise<Array<{ name: string; size: number }>> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .list(`${userId}/`);

  if (error) {
    throw new Error(`Failed to list recordings: ${error.message}`);
  }

  return data.map((file) => ({ name: file.name, size: file.metadata?.size || 0 }));
}

/**
 * Check if a file exists in storage
 * @param filePath - Path to check
 * @returns True if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(filePath.split('/').slice(0, -1).join('/') || '/');

    const fileName = filePath.split('/').pop();
    return data ? data.some((file: { name: string }) => file.name === fileName) : false;
  } catch {
    return false;
  }
}
