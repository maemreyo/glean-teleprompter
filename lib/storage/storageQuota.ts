/**
 * Storage quota management for localStorage
 * Monitors usage and provides cleanup tools
 */

import {
  StorageUsageMetrics,
  QuotaWarningLevel,
  CleanupResult,
  QUOTA_THRESHOLDS,
  BROWSER_LIMITS,
  STORAGE_KEYS,
} from './types';
import { loadAllDrafts, clearCollection } from './draftStorage';

// ============================================================================
// Usage Calculation
// ============================================================================

/**
 * Estimate browser storage limit based on user agent
 */
function estimateBrowserLimit(): number {
  const userAgent = navigator.userAgent.toLowerCase();

  // Check for Safari
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    return BROWSER_LIMITS.SAFARI;
  }

  // Check for Firefox
  if (userAgent.includes('firefox')) {
    return BROWSER_LIMITS.FIREFOX;
  }

  // Check for Chrome/Edge (default)
  if (userAgent.includes('chrome') || userAgent.includes('edg')) {
    return BROWSER_LIMITS.CHROME;
  }

  // Default limit
  return BROWSER_LIMITS.DEFAULT;
}

/**
 * Calculate current storage usage
 * @returns Storage metrics including bytes used, total capacity, and percentage
 */
export function getUsage(): StorageUsageMetrics {
  let used = 0;
  const byKey: Record<string, number> = {};

  try {
    // Enumerate all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const value = localStorage.getItem(key) || '';
      // UTF-16 encoding: 2 bytes per character
      const size = (key.length + value.length) * 2;
      used += size;
      byKey[key] = size;
    }
  } catch (error) {
    console.error('Failed to calculate storage usage:', error);
  }

  const total = estimateBrowserLimit();
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return {
    used,
    total,
    percentage: Math.min(percentage, 100),
    byKey,
  };
}

/**
 * Get the warning level based on current usage
 */
export function getWarningLevel(): QuotaWarningLevel {
  const usage = getUsage();

  if (usage.percentage >= QUOTA_THRESHOLDS.CRITICAL) {
    return 'critical';
  }

  if (usage.percentage >= QUOTA_THRESHOLDS.WARNING) {
    return 'warning';
  }

  return 'normal';
}

/**
 * Check if a write would exceed quota
 * @param data - The data to check
 * @returns true if write would exceed quota
 */
export function wouldExceedQuota(data: unknown): boolean {
  const usage = getUsage();
  const dataSize = estimateDataSize(data);
  return (usage.used + dataSize) > usage.total;
}

/**
 * Estimate size of data before writing
 * @param data - Data to measure
 * @returns Size in bytes
 */
export function estimateDataSize(data: unknown): number {
  try {
    const serialized = JSON.stringify(data);
    return serialized.length * 2; // UTF-16 = 2 bytes/char
  } catch {
    return 0;
  }
}

/**
 * Get size of a specific key in bytes
 */
export function getKeySize(key: string): number {
  try {
    const value = localStorage.getItem(key) || '';
    return (key.length + value.length) * 2;
  } catch {
    return 0;
  }
}

/**
 * Get estimated browser storage limit
 */
export function getBrowserLimit(): number {
  return estimateBrowserLimit();
}

// ============================================================================
// Cleanup Operations
// ============================================================================

/**
 * Delete drafts older than specified days
 * @param daysOld - Age threshold in days (default: 30)
 * @returns Count of drafts deleted and bytes freed
 */
export function cleanupOldDrafts(daysOld: number = 30): CleanupResult {
  const result: CleanupResult = {
    deletedCount: 0,
    bytesFreed: 0,
    errors: [],
  };

  try {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const drafts = loadAllDrafts();

    // Calculate size before cleanup
    const sizeBefore = drafts.reduce((total, draft) => {
      return total + estimateDataSize(draft);
    }, 0);

    // Filter to keep only recent drafts
    const toKeep = drafts.filter(d => d._timestamp > cutoff);
    const deleted = drafts.length - toKeep.length;

    if (deleted === 0) {
      return result;
    }

    // Calculate size of drafts to delete
    const sizeAfter = toKeep.reduce((total, draft) => {
      return total + estimateDataSize(draft);
    }, 0);

    // Save filtered collection
    if (toKeep.length === 0) {
      clearCollection();
    } else {
      const collection = {
        drafts: toKeep,
        _schemaVersion: '2.0',
        _lastUpdated: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.DRAFTS_COLLECTION, JSON.stringify(collection));
    }

    result.deletedCount = deleted;
    result.bytesFreed = sizeBefore - sizeAfter;
  } catch (error) {
    result.errors.push({
      draftId: 'collection',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}

/**
 * Get largest storage keys by size
 * @param limit - Number of keys to return (default: 10)
 * @returns Array of keys with their sizes
 */
export function getLargestKeys(limit: number = 10): Array<{ key: string; size: number }> {
  const usage = getUsage();
  const entries = Object.entries(usage.byKey);

  return entries
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([key, size]) => ({ key, size }));
}

/**
 * Get formatted storage usage string for display
 * @returns Human-readable usage (e.g., "4.5 MB of 5 MB used (90%)")
 */
export function formatStorageUsage(): string {
  const usage = getUsage();
  const usedMB = (usage.used / (1024 * 1024)).toFixed(1);
  const totalMB = (usage.total / (1024 * 1024)).toFixed(1);
  const percentage = usage.percentage.toFixed(0);

  return `${usedMB} MB of ${totalMB} MB used (${percentage}%)`;
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
