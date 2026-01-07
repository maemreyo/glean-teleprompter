'use client';

/**
 * DeviceMatrix Component
 *
 * Main container for multi-device preview.
 * Manages device frame rendering and coordinates with the sync hook.
 * Integrates grid configuration and handles empty slots.
 * @feature 015-multi-device-matrix
 */

import { useEffect, useRef, useState } from 'react';
import { DeviceGrid } from './DeviceGrid';
import { DeviceFrame } from './DeviceFrame';
import { ViewportWarning } from './ViewportWarning';
import { GridConfiguration } from './GridConfiguration';
import { EmptySlot } from './EmptySlot';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { useMultiDevicePreviewSync } from '@/lib/story-builder/hooks/useMultiDevicePreviewSync';
import { getDeviceById, getAllDeviceIds } from '@/lib/story-builder/multi-device/deviceRegistry';
import { GRID_SLOT_COUNTS } from '@/lib/story-builder/types';
import { cn } from '@/lib/utils';

export interface DeviceMatrixProps {
  /** URL for the preview iframe */
  previewUrl: string;
  /** Additional CSS classes */
  className?: string;
  /** Show grid configuration toolbar */
  showConfig?: boolean;
}

/**
 * Multi-device preview matrix container.
 *
 * Manages:
 * - Collection of device iframes
 * - Grid layout based on configuration
 * - Preview sync coordination
 * - Empty slot placeholders
 * - Grid configuration UI
 */
export function DeviceMatrix({ previewUrl, className, showConfig = false }: DeviceMatrixProps) {
  const { enabledDeviceTypes, deviceOrder, gridConfig } = useMultiDeviceStore();
  const [showSettings, setShowSettings] = useState(showConfig);

  // Create ref for iframe map (passed to sync hook)
  const iframeRefsRef = useRef<Map<string, HTMLIFrameElement>>(new Map());

  // Register iframe refs when devices are mounted
  const registerIframe = (deviceId: string, iframe: HTMLIFrameElement | null) => {
    if (iframe) {
      iframeRefsRef.current.set(deviceId, iframe);
    } else {
      iframeRefsRef.current.delete(deviceId);
    }
  };

  // Use multi-device preview sync
  const syncState = useMultiDevicePreviewSync(iframeRefsRef, {
    onAckTimeout: (deviceId) => {
      console.warn(`Acknowledgment timeout for ${deviceId}`);
    },
  });

  // Get devices to display based on enabled types and order
  const devicesToDisplay = deviceOrder
    .filter((id) => enabledDeviceTypes.includes(id))
    .map((id) => getDeviceById(id))
    .filter((device): device is NonNullable<typeof device> => device !== undefined);

  // Calculate how many empty slots to show
  const gridSlotCount = GRID_SLOT_COUNTS[gridConfig];
  const emptySlotCount = Math.max(0, gridSlotCount - devicesToDisplay.length);

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        className
      )}
      data-device-matrix
      data-testid="device-matrix"
    >
      {/* Settings toggle button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={showSettings ? 'Hide grid configuration' : 'Show grid configuration'}
          aria-expanded={showSettings}
        >
          {showSettings ? '✕' : '⚙️'} {showSettings ? 'Hide' : 'Settings'}
        </button>
      </div>

      {/* Grid configuration panel */}
      {showSettings && (
        <GridConfiguration />
      )}

      {/* Viewport warning */}
      <ViewportWarning />

      {/* Device grid */}
      <DeviceGrid enableDragDrop={true}>
        {devicesToDisplay.map((device) => (
          <DeviceFrame
            key={device.id}
            device={device}
            previewUrl={previewUrl}
            frameId={`${device.id}-${Date.now()}`}
            isDragEnabled={true}
          />
        ))}
        {/* Empty slots */}
        {Array.from({ length: emptySlotCount }).map((_, index) => (
          <EmptySlot key={`empty-${index}`} index={devicesToDisplay.length + index} />
        ))}
      </DeviceGrid>

      {/* Debug info (dev only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-neutral-600 px-4 pb-2">
          Sync: {syncState.iframeCount} iframes, {syncState.pendingAcks} pending |
          Grid: {gridConfig} ({devicesToDisplay.length}/{gridSlotCount} slots)
        </div>
      )}
    </div>
  );
}
