/**
 * Hook for monitoring localStorage quota usage
 * Provides metrics and warning levels for storage management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUsage,
  getWarningLevel,
  cleanupOldDrafts,
  formatStorageUsage,
  formatBytes,
} from '@/lib/storage/storageQuota';
import { StorageUsageMetrics, QuotaWarningLevel, CleanupResult } from '@/lib/storage/types';

export interface UseStorageQuotaOptions {
  /**
   * Polling interval for checking quota (ms)
   * @default 10000 (10 seconds)
   */
  checkInterval?: number;
  
  /**
   * Enable polling (otherwise checks on mount only)
   * @default false
   */
  enablePolling?: boolean;
  
  /**
   * Show warning when usage exceeds threshold
   * @default 90
   */
  warningThreshold?: number;
}

export interface UseStorageQuotaReturn {
  /**
   * Current storage usage metrics
   */
  usage: StorageUsageMetrics;
  
  /**
   * Current warning level
   */
  warningLevel: QuotaWarningLevel;
  
  /**
   * Whether storage is full
   */
  isFull: boolean;
  
  /**
   * Whether storage is almost full
   */
  isAlmostFull: boolean;
  
  /**
   * Refresh usage metrics
   */
  refresh: () => void;
  
  /**
   * Clean up old drafts
   */
  cleanup: (daysOld?: number) => Promise<CleanupResult>;
  
  /**
   * Get formatted usage string for display
   */
  formatUsage: () => string;
}

/**
 * Hook for storage quota monitoring
 * 
 * Tracks localStorage usage and provides cleanup tools.
 * Optionally polls for usage updates.
 * 
 * @param options - Configuration options
 * @returns Storage quota metrics and utilities
 */
export function useStorageQuota(
  options: UseStorageQuotaOptions = {}
): UseStorageQuotaReturn {
  const {
    checkInterval = 10000,
    enablePolling = false,
    warningThreshold = 90,
  } = options;

  const [usage, setUsage] = useState<StorageUsageMetrics>(() => getUsage());
  const [warningLevel, setWarningLevel] = useState<QuotaWarningLevel>(() => getWarningLevel());

  const refresh = useCallback(() => {
    const newUsage = getUsage();
    const newWarningLevel = getWarningLevel();
    setUsage(newUsage);
    setWarningLevel(newWarningLevel);
  }, []);

  const cleanup = useCallback(async (daysOld?: number): Promise<CleanupResult> => {
    const result = cleanupOldDrafts(daysOld);
    // Refresh usage after cleanup
    refresh();
    return result;
  }, [refresh]);

  const formatUsage = useCallback(() => {
    return formatStorageUsage();
  }, []);

  // Initial check
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Polling if enabled
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      refresh();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [enablePolling, checkInterval, refresh]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      refresh();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refresh]);

  const isFull = warningLevel === 'critical';
  const isAlmostFull = warningLevel === 'warning' || warningLevel === 'critical';

  return {
    usage,
    warningLevel,
    isFull,
    isAlmostFull,
    refresh,
    cleanup,
    formatUsage,
  };
}
