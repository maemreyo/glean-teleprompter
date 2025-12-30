/**
 * Supabase recordings table operations
 * @module lib/supabase/recordings
 */

import { createClient as createBrowserClient } from '@/lib/supabase/client';
import type { Recording, RecordingCreate, RecordingUpdate, StorageQuota, UserRecordingSettings } from '@/types/recording';
import { canRecordVideo, updateStorageUsage } from '@/lib/utils/quota';

const TABLE = 'recordings' as const;
const SETTINGS_TABLE = 'user_recording_settings' as const;

/**
 * Create a new recording entry in the database
 * @param data - Recording data to create
 * @returns Created recording
 */
export async function createRecording(data: RecordingCreate): Promise<Recording> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check quota before creating
  const settings = await getUserSettings();
  const canRecord = canRecordVideo(
    settings.storage_used_mb,
    settings.storage_limit_mb,
    data.size_mb
  );

  if (!canRecord.can_record) {
    throw new Error(canRecord.reason || 'Storage quota exceeded');
  }

  const { data: recording, error } = await supabase
    .from(TABLE)
    .insert({
      user_id: user.id,
      ...data,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create recording: ${error.message}`);
  }

  // Update storage usage
  const updatedUsage = updateStorageUsage(
    settings.storage_used_mb,
    data.size_mb,
    settings.storage_limit_mb
  );

  await updateUserSettings({ storage_used_mb: updatedUsage });

  return recording;
}

/**
 * Get a recording by ID
 * @param id - Recording ID
 * @returns Recording data or null
 */
export async function getRecording(id: string): Promise<Recording | null> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', user.id)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to get recording: ${error.message}`);
  }

  return data;
}

/**
 * List user recordings with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20, max: 50)
 * @returns Paginated recording list
 */
export async function listRecordings(
  page: number = 1,
  limit: number = 20
): Promise<{ recordings: Recording[]; total: number }> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to list recordings: ${error.message}`);
  }

  return {
    recordings: data || [],
    total: count || 0,
  };
}

/**
 * Update recording metadata
 * @param id - Recording ID
 * @param updates - Fields to update
 * @returns Updated recording
 */
export async function updateRecording(
  id: string,
  updates: RecordingUpdate
): Promise<Recording> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('user_id', user.id)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update recording: ${error.message}`);
  }

  return data;
}

/**
 * Delete a recording and its associated files
 * @param id - Recording ID
 */
export async function deleteRecording(id: string): Promise<void> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get recording details first to delete file from storage
  const recording = await getRecording(id);
  if (recording?.video_url) {
    // Delete from storage
    await import('@/lib/supabase/storage').then(({ deleteRecording }) =>
      deleteRecording(recording.video_url)
    ).catch(() => {
      console.warn('Failed to delete storage file, proceeding with database deletion');
    });
  }

  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', user.id)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete recording: ${error.message}`);
  }
}

/**
 * Get user's storage quota information
 * @returns Storage quota data
 */
export async function getStorageQuota(): Promise<StorageQuota> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: settings, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If settings don't exist, create them
    if (error.code === 'PGRST116') {
      const { data: newSettings } = await supabase
        .from(SETTINGS_TABLE)
        .insert({ user_id: user.id })
        .select()
        .single();

      return {
        used_mb: 0,
        limit_mb: newSettings.storage_limit_mb,
        usage_percentage: 0,
        can_record: true,
      };
    }
    throw new Error(`Failed to get storage quota: ${error.message}`);
  }

  // Calculate actual usage from recordings
  const { data: recordings } = await supabase
    .from(TABLE)
    .select('size_mb')
    .eq('user_id', user.id);

  const totalUsed = recordings?.reduce((sum: number, rec: { size_mb: number }) => sum + rec.size_mb, 0) || 0;

  return {
    used_mb: totalUsed,
    limit_mb: settings.storage_limit_mb,
    usage_percentage: (totalUsed / settings.storage_limit_mb) * 100,
    can_record: totalUsed < settings.storage_limit_mb,
  };
}

/**
 * Get user recording settings
 * @returns User settings
 */
export async function getUserSettings(): Promise<UserRecordingSettings> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // Create default settings if not exists
    if (error.code === 'PGRST116') {
      const { data: newSettings } = await supabase
        .from(SETTINGS_TABLE)
        .insert({ user_id: user.id })
        .select()
        .single();

      return newSettings;
    }
    throw new Error(`Failed to get user settings: ${error.message}`);
  }

  return data;
}

/**
 * Update user recording settings
 * @param updates - Settings to update
 * @returns Updated settings
 */
export async function updateUserSettings(
  updates: Partial<UserRecordingSettings>
): Promise<UserRecordingSettings> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from(SETTINGS_TABLE)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`);
  }

  return data;
}

/**
 * Update converted URL for a recording
 * @param id - Recording ID
 * @param convertedUrl - New converted file URL
 */
export async function setConvertedUrl(
  id: string,
  convertedUrl: string
): Promise<void> {
  await updateRecording(id, { converted_url: convertedUrl });
}

/**
 * Calculate and update storage usage from actual recordings
 * Called periodically to sync storage quota
 */
export async function syncStorageUsage(): Promise<void> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Calculate actual usage
  const { data: recordings } = await supabase
    .from(TABLE)
    .select('size_mb')
    .eq('user_id', user.id);

  const totalUsed = recordings?.reduce((sum: number, rec: { size_mb: number }) => sum + rec.size_mb, 0) || 0;

  await updateUserSettings({ storage_used_mb: totalUsed });
}
