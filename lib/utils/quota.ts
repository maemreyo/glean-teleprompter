/**
 * Storage quota calculation and management utilities
 * @module lib/utils/quota
 */

import type { Recording, StorageQuota, UserRecordingSettings } from '@/types/recording';
import { RECORDING_LIMITS } from '@/types/recording';

/**
 * Calculate storage quota information from user settings and recordings
 * @param settings - User recording settings
 * @param recordings - User's recordings (optional, for calculating actual usage)
 * @returns Storage quota information
 */
export function calculateStorageQuota(
  settings: UserRecordingSettings,
  recordings?: Recording[]
): StorageQuota {
  // If recordings are provided, calculate actual usage
  const usedMb = recordings
    ? recordings.reduce((sum, rec) => sum + rec.size_mb, 0)
    : settings.storage_used_mb;

  const usagePercentage = (usedMb / settings.storage_limit_mb) * 100;
  const canRecord = usedMb < settings.storage_limit_mb;

  return {
    used_mb: Math.round(usedMb * 100) / 100,
    limit_mb: settings.storage_limit_mb,
    usage_percentage: Math.round(usagePercentage * 10) / 10,
    can_record: canRecord,
  };
}

/**
 * Check if a user can record a video of a given size
 * @param currentUsageMb - Current storage usage in MB
 * @param storageLimitMb - User's storage limit in MB
 * @param estimatedSizeMb - Estimated size of the recording in MB
 * @returns Object with canRecord flag and reason if not allowed
 */
export function canRecordVideo(
  currentUsageMb: number,
  storageLimitMb: number,
  estimatedSizeMb: number
): { can_record: boolean; reason?: string } {
  const projectedUsage = currentUsageMb + estimatedSizeMb;

  if (currentUsageMb >= storageLimitMb) {
    return {
      can_record: false,
      reason: 'Storage limit reached. Please delete some recordings or upgrade your plan.',
    };
  }

  if (projectedUsage > storageLimitMb) {
    return {
      can_record: false,
      reason: `Not enough storage space. This recording requires approximately ${estimatedSizeMb.toFixed(1)} MB, but you only have ${(storageLimitMb - currentUsageMb).toFixed(1)} MB available.`,
    };
  }

  if (estimatedSizeMb > RECORDING_LIMITS.MAX_SIZE_MB) {
    return {
      can_record: false,
      reason: `Recording exceeds maximum file size limit of ${RECORDING_LIMITS.MAX_SIZE_MB} MB. Try recording for a shorter duration.`,
    };
  }

  return { can_record: true };
}

/**
 * Calculate the maximum recording duration based on available storage
 * @param availableMb - Available storage in MB
 * @param quality - Recording quality preset
 * @returns Maximum recording duration in seconds
 */
export function maxRecordingDuration(availableMb: number, quality: 'standard' | 'reduced'): number {
  const bytesPerSecond = quality === 'standard' ? 250_000 : 130_000;
  const availableBytes = availableMb * 1024 * 1024;
  const maxSeconds = Math.floor(availableBytes / bytesPerSecond);

  // Return the lesser of storage-based limit and hardcoded limit
  return Math.min(maxSeconds, RECORDING_LIMITS.MAX_DURATION_SECONDS);
}

/**
 * Get storage quota status level for UI indicators
 * @param usagePercentage - Current usage percentage
 * @returns Status level: 'success', 'warning', or 'danger'
 */
export function getQuotaStatusLevel(usagePercentage: number): 'success' | 'warning' | 'danger' {
  if (usagePercentage >= 90) {
    return 'danger';
  }
  if (usagePercentage >= 75) {
    return 'warning';
  }
  return 'success';
}

/**
 * Get a user-friendly message about storage status
 * @param quota - Storage quota information
 * @returns User-friendly status message
 */
export function getQuotaStatusMessage(quota: StorageQuota): string {
  if (!quota.can_record) {
    return `Storage limit reached (${quota.used_mb.toFixed(1)} / ${quota.limit_mb} MB used)`;
  }

  const status = getQuotaStatusLevel(quota.usage_percentage);
  switch (status) {
    case 'danger':
      return `Storage almost full (${quota.used_mb.toFixed(1)} / ${quota.limit_mb} MB)`;
    case 'warning':
      return `Storage ${quota.usage_percentage.toFixed(0)}% full`;
    default:
      return `${quota.used_mb.toFixed(1)} MB of ${quota.limit_mb} MB used`;
  }
}

/**
 * Calculate recommended quality based on available storage
 * @param availableMb - Available storage in MB
 * @returns Recommended quality preset
 */
export function recommendQuality(availableMb: number): 'standard' | 'reduced' {
  // If less than 20MB available, recommend reduced quality
  if (availableMb < 20) {
    return 'reduced';
  }
  return 'standard';
}

/**
 * Update storage usage after a recording operation
 * @param currentUsedMb - Current storage usage
 * @param sizeChangeMb - Size change (positive for new recording, negative for deletion)
 * @param storageLimitMb - Storage limit
 * @returns Updated storage usage
 */
export function updateStorageUsage(
  currentUsedMb: number,
  sizeChangeMb: number,
  storageLimitMb: number
): number {
  const newUsage = Math.max(0, currentUsedMb + sizeChangeMb);
  return Math.min(newUsage, storageLimitMb);
}

/**
 * Calculate storage savings from format conversion
 * @param originalSizeMb - Original file size in MB
 * @param compressionRatio - Compression ratio (default 0.7 for 30% reduction)
 * @returns Estimated size after conversion in MB
 */
export function estimateConvertedSize(
  originalSizeMb: number,
  compressionRatio: number = 0.7
): number {
  return originalSizeMb * compressionRatio;
}

/**
 * Get storage quota tiers for potential future monetization
 * @returns Array of storage quota tiers
 */
export function getStorageTiers(): Array<{
  name: string;
  limitMb: number;
  price?: string;
}> {
  return [
    { name: 'Free', limitMb: 100, price: '$0' },
    { name: 'Pro', limitMb: 1000, price: '$9/month' },
    { name: 'Team', limitMb: 5000, price: '$29/month' },
  ];
}
