'use client';

/**
 * Grid Configuration Selector Component
 *
 * Allows users to select grid layout configurations for multi-device preview.
 * @feature 015-multi-device-matrix
 */

import React from 'react';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import type { GridConfig } from '@/lib/story-builder/types';
import { GRID_SLOT_COUNTS } from '@/lib/story-builder/types';

export interface GridConfigSelectorProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
}

/**
 * Grid configuration options with display information
 */
const GRID_OPTIONS: Array<{
  value: GridConfig;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    value: '1x',
    label: '1x',
    description: 'Single device',
    icon: '○',
  },
  {
    value: '2x',
    label: '2x',
    description: 'Two devices side by side',
    icon: '○○',
  },
  {
    value: '2x2',
    label: '2x2',
    description: 'Four devices in a grid',
    icon: '○○\n○○',
  },
  {
    value: '3x2',
    label: '3x2',
    description: 'Six devices in a grid',
    icon: '○○○\n○○○',
  },
];

/**
 * Grid configuration selector component
 */
export function GridConfigSelector({ className = '' }: GridConfigSelectorProps) {
  const { gridConfig, setGridConfig } = useMultiDeviceStore();

  return (
    <div className={`grid-config-selector ${className}`}>
      <label
        htmlFor="grid-config-select"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Grid Layout
      </label>
      <select
        id="grid-config-select"
        value={gridConfig}
        onChange={(e) => setGridConfig(e.target.value as GridConfig)}
        className="block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        aria-label="Select grid configuration"
      >
        {GRID_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description} ({GRID_SLOT_COUNTS[option.value]} slots)
          </option>
        ))}
      </select>
    </div>
  );
}
