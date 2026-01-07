'use client';

/**
 * Grid Configuration Component
 *
 * Main toolbar for configuring multi-device preview grid layout and device types.
 * Integrates grid selector, device checklist, and memory display.
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { GridConfigSelector } from './GridConfigSelector';
import { DeviceTypeChecklist } from './DeviceTypeChecklist';
import { MemoryUsageDisplay } from './MemoryUsageDisplay';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import {
  calculateMemoryUsage,
  isAtWarningThreshold,
  isAtHardLimit,
} from '@/lib/story-builder/multi-device/memory';
import { toast } from 'sonner';

export interface GridConfigurationProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * Grid configuration toolbar component
 */
export function GridConfiguration({ className = '' }: GridConfigurationProps) {
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

  // Show toast warning when approaching memory limit
  React.useEffect(() => {
    if (isAtWarningThreshold(memoryUsage) && !isAtHardLimit(memoryUsage)) {
      toast.warning('High memory usage', {
        description: 'Performance may be affected. Consider reducing the number of devices.',
        duration: 5000,
      });
    }
  }, [memoryUsage]);

  // Show toast error when at hard limit
  React.useEffect(() => {
    if (isAtHardLimit(memoryUsage)) {
      toast.error('Memory limit reached', {
        description: 'Cannot enable more devices. Disable some devices or reduce content size.',
        duration: 7000,
      });
    }
  }, [memoryUsage]);

  return (
    <div className={`grid-configuration ${className}`}>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Multi-Device Configuration
        </h3>

        <div className="space-y-4">
          {/* Grid Layout Selector */}
          <GridConfigSelector />

          {/* Device Type Checklist */}
          <DeviceTypeChecklist />

          {/* Memory Usage Display */}
          <MemoryUsageDisplay />
        </div>
      </div>
    </div>
  );
}
