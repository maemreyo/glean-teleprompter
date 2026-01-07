'use client';

/**
 * Device Type Checklist Component
 *
 * Allows users to select which device types to display in the preview.
 * Includes memory management and warnings when approaching limits.
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { DEVICE_REGISTRY } from '@/lib/story-builder/multi-device/deviceRegistry';
import { canEnableDevice, calculateMemoryUsage } from '@/lib/story-builder/multi-device/memory';
import { useStoryBuilderStore } from '@/lib/story-builder/store';
import { MEMORY_THRESHOLDS } from '@/lib/story-builder/types';

export interface DeviceTypeChecklistProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * Device type checklist component
 */
export function DeviceTypeChecklist({ className = '' }: DeviceTypeChecklistProps) {
  const { enabledDeviceTypes, toggleDeviceType } = useMultiDeviceStore();
  const { slides } = useStoryBuilderStore();

  // Calculate current content character count
  const contentCharacterCount = React.useMemo(() => {
    return slides.reduce((count, slide) => {
      // Estimate character count from slide content
      if ('content' in slide && typeof slide.content === 'string') {
        return count + slide.content.length;
      }
      return count;
    }, 0);
  }, [slides]);

  // Check if enabling a device would exceed limits
  const canEnable = (deviceId: string): boolean => {
    const result = canEnableDevice(enabledDeviceTypes.length, contentCharacterCount);
    return result.canEnable || enabledDeviceTypes.includes(deviceId);
  };

  const wouldWarn = (deviceId: string): boolean => {
    if (enabledDeviceTypes.includes(deviceId)) return false;
    const result = canEnableDevice(enabledDeviceTypes.length, contentCharacterCount);
    return result.wouldExceedWarning;
  };

  return (
    <div className={`device-type-checklist ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Device Types
      </label>
      <div className="space-y-2">
        {DEVICE_REGISTRY.map((device) => {
          const isEnabled = enabledDeviceTypes.includes(device.id);
          const isDisabled = !canEnable(device.id);
          const showWarning = wouldWarn(device.id);

          return (
            <div key={device.id} className="flex items-center">
              <input
                type="checkbox"
                id={`device-${device.id}`}
                checked={isEnabled}
                disabled={isDisabled}
                onChange={() => toggleDeviceType(device.id)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Toggle ${device.name} display`}
                aria-describedby={showWarning ? `memory-warning-${device.id}` : undefined}
              />
              <label
                htmlFor={`device-${device.id}`}
                className={`ml-3 text-sm ${
                  isDisabled
                    ? 'text-gray-400 dark:text-gray-600'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {device.name}
                {showWarning && !isEnabled && (
                  <span
                    id={`memory-warning-${device.id}`}
                    className="ml-2 text-xs text-yellow-600 dark:text-yellow-400"
                  >
                    ⚠️ High memory
                  </span>
                )}
              </label>
            </div>
          );
        })}
      </div>
      {enabledDeviceTypes.length === 0 && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Select at least one device type
        </p>
      )}
    </div>
  );
}
