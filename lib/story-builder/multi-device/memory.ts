/**
 * Memory Calculation Utilities for Multi-Device Preview
 *
 * Estimates memory usage for multiple device previews to prevent
 * performance degradation and browser crashes.
 */

import { MEMORY_THRESHOLDS } from '../types';

/**
 * Calculate estimated memory usage for multi-device preview.
 *
 * Formula: (deviceCount * BASE_PER_IFRAME) + (contentChars / 1000 * CONTENT_PER_1000_CHARS)
 *
 * @param deviceCount - Number of active device iframes
 * @param contentCharacterCount - Total character count of content being previewed
 * @returns Estimated memory usage in MB
 */
export function calculateMemoryUsage(
  deviceCount: number,
  contentCharacterCount: number
): number {
  const { BASE_PER_IFRAME, CONTENT_PER_1000_CHARS } = MEMORY_THRESHOLDS;

  const iframeMemory = deviceCount * BASE_PER_IFRAME;
  const contentMemory = (contentCharacterCount / 1000) * CONTENT_PER_1000_CHARS;

  return iframeMemory + contentMemory;
}

/**
 * Check if memory usage is at warning threshold.
 *
 * @param memoryUsageMB - Current memory usage in MB
 * @returns true if at or above warning threshold
 */
export function isAtWarningThreshold(memoryUsageMB: number): boolean {
  return memoryUsageMB >= MEMORY_THRESHOLDS.WARNING;
}

/**
 * Check if memory usage is at hard limit.
 *
 * @param memoryUsageMB - Current memory usage in MB
 * @returns true if at or above hard limit
 */
export function isAtHardLimit(memoryUsageMB: number): boolean {
  return memoryUsageMB >= MEMORY_THRESHOLDS.HARD_LIMIT;
}

/**
 * Determine if enabling an additional device would exceed limits.
 *
 * @param currentDeviceCount - Current number of enabled devices
 * @param contentCharacterCount - Total character count of content
 * @returns Object with status flags
 */
export function canEnableDevice(
  currentDeviceCount: number,
  contentCharacterCount: number
): {
  canEnable: boolean;
  wouldExceedWarning: boolean;
  wouldExceedLimit: boolean;
  projectedUsage: number;
} {
  const projectedCount = currentDeviceCount + 1;
  const projectedUsage = calculateMemoryUsage(
    projectedCount,
    contentCharacterCount
  );

  return {
    canEnable: projectedUsage < MEMORY_THRESHOLDS.HARD_LIMIT,
    wouldExceedWarning: projectedUsage >= MEMORY_THRESHOLDS.WARNING,
    wouldExceedLimit: projectedUsage >= MEMORY_THRESHOLDS.HARD_LIMIT,
    projectedUsage,
  };
}

/**
 * Get maximum number of devices allowed for given content size.
 *
 * @param contentCharacterCount - Total character count of content
 * @returns Maximum device count
 */
export function getMaxDeviceCount(contentCharacterCount: number): number {
  const { BASE_PER_IFRAME, HARD_LIMIT } = MEMORY_THRESHOLDS;

  // Calculate how many base iframe costs fit into the hard limit
  // We leave some buffer for content memory
  const contentMemory = (contentCharacterCount / 1000) * MEMORY_THRESHOLDS.CONTENT_PER_1000_CHARS;
  const availableForIframes = HARD_LIMIT - contentMemory;

  const maxDevices = Math.floor(availableForIframes / BASE_PER_IFRAME);

  // Ensure at least 1 device can be enabled
  return Math.max(1, maxDevices);
}

/**
 * Get memory status description for user feedback.
 *
 * @param memoryUsageMB - Current memory usage in MB
 * @returns Status object with message and severity
 */
export function getMemoryStatus(memoryUsageMB: number): {
  status: 'normal' | 'warning' | 'critical';
  message: string;
  percentage: number;
} {
  const percentage = (memoryUsageMB / MEMORY_THRESHOLDS.HARD_LIMIT) * 100;

  if (memoryUsageMB >= MEMORY_THRESHOLDS.HARD_LIMIT) {
    return {
      status: 'critical',
      message: 'Memory limit reached. Cannot enable more devices.',
      percentage,
    };
  }

  if (memoryUsageMB >= MEMORY_THRESHOLDS.WARNING) {
    return {
      status: 'warning',
      message: 'High memory usage. Performance may be affected.',
      percentage,
    };
  }

  return {
    status: 'normal',
    message: 'Memory usage is within safe limits.',
    percentage,
  };
}

/**
 * Format memory usage for display.
 *
 * @param memoryUsageMB - Memory usage in MB
 * @returns Formatted string (e.g., "150 MB")
 */
export function formatMemoryUsage(memoryUsageMB: number): string {
  return `${Math.round(memoryUsageMB)} MB`;
}
