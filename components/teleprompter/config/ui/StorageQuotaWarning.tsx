/**
 * StorageQuotaWarning - Warning for storage quota issues
 * Displays when localStorage is approaching or has exceeded quota
 */

"use client";

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/storage/storageQuota';
import { StorageUsageMetrics } from '@/lib/storage/types';

export interface StorageQuotaWarningProps {
  /** Current storage usage metrics */
  usage: StorageUsageMetrics;
  /** Callback when user clicks "Clear Old Drafts" */
  onCleanup?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StorageQuotaWarning component
 * 
 * Displays warning when storage is almost full (90%+) or full (100%).
 * Provides cleanup action to free up space.
 * 
 * Accessibility:
 * - role="alert" for screen reader announcement
 * - Descriptive ARIA labels
 * - Keyboard accessible
 */
export function StorageQuotaWarning({
  usage,
  onCleanup,
  className,
}: StorageQuotaWarningProps) {
  const isFull = usage.percentage >= 100;
  const isAlmostFull = usage.percentage >= 90 && usage.percentage < 100;

  if (!isFull && !isAlmostFull) {
    return null;
  }

  const getMessage = () => {
    if (isFull) {
      return 'Storage full. Clear old drafts or save to your account to continue.';
    }
    return `Storage almost full (${usage.percentage.toFixed(0)}% used). Consider clearing old drafts.`;
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'relative w-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800',
        'px-4 py-3 rounded-md',
        'transition-opacity duration-300',
        isFull ? 'animate-pulse' : '',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
        
        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            {isFull ? 'Storage Full' : 'Storage Almost Full'}
          </p>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            {getMessage()}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {formatBytes(usage.used)} of {formatBytes(usage.total)} used
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onCleanup}
            className="h-8 text-xs bg-white dark:bg-gray-800 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear Old Drafts
          </Button>
        </div>
      </div>
    </div>
  );
}
