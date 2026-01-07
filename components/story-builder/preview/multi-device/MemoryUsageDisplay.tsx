'use client';

/**
 * Memory Usage Display Component
 *
 * Shows current memory usage for multi-device preview with warnings.
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import {
  calculateMemoryUsage,
  getMemoryStatus,
  formatMemoryUsage,
} from '@/lib/story-builder/multi-device/memory';
import { MEMORY_THRESHOLDS } from '@/lib/story-builder/types';

export interface MemoryUsageDisplayProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * Memory usage display component
 */
export function MemoryUsageDisplay({ className = '' }: MemoryUsageDisplayProps) {
  const { enabledDeviceTypes } = useMultiDeviceStore();
  const { slides } = useStoryBuilderStore();

  // Calculate memory usage
  const memoryUsage = React.useMemo(() => {
    const contentCharacterCount = slides.reduce((count, slide) => {
      if ('content' in slide && typeof slide.content === 'string') {
        return count + slide.content.length;
      }
      return count;
    }, 0);

    return calculateMemoryUsage(enabledDeviceTypes.length, contentCharacterCount);
  }, [enabledDeviceTypes.length, slides]);

  const memoryStatus = React.useMemo(() => getMemoryStatus(memoryUsage), [memoryUsage]);

  // Calculate percentage for progress bar
  const percentage = Math.min((memoryUsage / MEMORY_THRESHOLDS.HARD_LIMIT) * 100, 100);

  // Determine bar color based on status
  const getBarColor = (): string => {
    switch (memoryStatus.status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className={`memory-usage-display ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Memory Usage
        </span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatMemoryUsage(memoryUsage)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`${getBarColor()} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={memoryUsage}
          aria-valuemin={0}
          aria-valuemax={MEMORY_THRESHOLDS.HARD_LIMIT}
          aria-label={`Memory usage: ${memoryStatus.message}`}
        />
      </div>

      {/* Status message */}
      {memoryStatus.status !== 'normal' && (
        <p
          className={`mt-1 text-xs ${
            memoryStatus.status === 'critical'
              ? 'text-red-600 dark:text-red-400'
              : 'text-yellow-600 dark:text-yellow-400'
          }`}
        >
          {memoryStatus.message}
        </p>
      )}

      {/* Percentage display */}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {memoryStatus.percentage.toFixed(0)}% of limit
      </p>
    </div>
  );
}
