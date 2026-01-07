'use client';

/**
 * Empty Slot Component
 *
 * Displays a placeholder for grid slots without enabled devices.
 * @feature 015-multi-device-matrix
 */

import React from 'react';

export interface EmptySlotProps {
  /**
   * Optional className for custom styling
   */
  className?: string;
  /**
   * Optional index for accessibility
   */
  index?: number;
}

/**
 * Empty slot placeholder component
 */
export function EmptySlot({ className = '', index }: EmptySlotProps) {
  return (
    <div
      className={`empty-slot ${className}`}
      role="presentation"
      aria-label={`Empty device slot ${index !== undefined ? index + 1 : ''}`}
    >
      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No device
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Enable devices in settings
          </p>
        </div>
      </div>
    </div>
  );
}
