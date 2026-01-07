'use client';

/**
 * DeviceGrid Component
 *
 * CSS Grid container for responsive layout of device frames.
 * Adapts to viewport size and grid configuration.
 * Supports drag-and-drop with animations and keyboard navigation.
 * @feature 015-multi-device-matrix
 */

import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useMultiDeviceStore } from '@/lib/stores/useMultiDeviceStore';
import { cn } from '@/lib/utils';

export interface DeviceGridProps {
  /** Child device frames */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Enable drag-and-drop (default: false) */
  enableDragDrop?: boolean;
}

/**
 * Responsive grid container for device previews with drag-and-drop.
 *
 * Grid breakpoints:
 * - Default: 1 column (mobile)
 * - ≥1024px: 2 columns (supports up to 2x2 grid)
 * - ≥1280px: 3 columns (supports up to 3x2 grid)
 */
export function DeviceGrid({
  children,
  className,
  enableDragDrop = false
}: DeviceGridProps) {
  // Keyboard navigation state
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // Get device IDs from children for sortable context
  const deviceIds: string[] = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && 'props' in child) {
      const props = child.props as Record<string, unknown>;
      if ('device' in props && typeof props.device === 'object' && props.device !== null) {
        const device = props.device as Record<string, unknown>;
        if ('id' in device && typeof device.id === 'string') {
          return device.id;
        }
      }
    }
    return '';
  })?.filter((id): id is string => id !== '') ?? [];

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active?.id && over?.id && active.id !== over.id) {
      // Update device order in store
      const deviceOrder = useMultiDeviceStore.getState().deviceOrder;
      
      const fromIndex = deviceOrder.indexOf(active.id as string);
      const toIndex = deviceOrder.indexOf(over.id as string);
      
      if (fromIndex !== -1 && toIndex !== -1) {
        useMultiDeviceStore.getState().reorderDevices(fromIndex, toIndex);
      }
    }
  };

  // Handle keyboard navigation for reordering
  const handleKeyDown = useCallback((event: React.KeyboardEvent, index: number) => {
    if (!enableDragDrop) return;

    const store = useMultiDeviceStore.getState();
    const deviceCount = deviceIds.length;

    // Move device with arrow keys + modifier (Ctrl/Cmd)
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
      let newIndex = index;
      let handled = false;

      switch (event.key) {
        case 'ArrowLeft':
          // Move left if not at first column
          if (index > 0) {
            newIndex = index - 1;
            handled = true;
          }
          break;
        case 'ArrowRight':
          // Move right if not at last position
          if (index < deviceCount - 1) {
            newIndex = index + 1;
            handled = true;
          }
          break;
        case 'ArrowUp':
          // Move up (assuming 3-column grid on xl, 2-column on lg)
          const columnsUp = typeof window !== 'undefined' && window.innerWidth >= 1280 ? 3 : 2;
          if (index >= columnsUp) {
            newIndex = index - columnsUp;
            handled = true;
          }
          break;
        case 'ArrowDown':
          // Move down
          const columnsDown = typeof window !== 'undefined' && window.innerWidth >= 1280 ? 3 : 2;
          if (index < deviceCount - columnsDown) {
            newIndex = index + columnsDown;
            handled = true;
          }
          break;
      }

      if (handled && newIndex !== index) {
        event.preventDefault();
        store.reorderDevices(index, newIndex);
        setFocusedIndex(newIndex);
        
        // Announce change to screen readers
        const announcement = `Moved device from position ${index + 1} to ${newIndex + 1}`;
        const liveRegion = document.getElementById('device-grid-live-region');
        if (liveRegion) {
          liveRegion.textContent = announcement;
        }
      }
    }
  }, [enableDragDrop, deviceIds.length]);

  // Cleanup live region
  useEffect(() => {
    return () => {
      const liveRegion = document.getElementById('device-grid-live-region');
      if (liveRegion) {
        liveRegion.textContent = '';
      }
    };
  }, []);

  // Non-draggable mode (default)
  if (!enableDragDrop || deviceIds.length === 0) {
    return (
      <div
        className={cn(
          // Base grid styles
          'grid gap-4 p-4',
          // Responsive columns
          'grid-cols-1', // Default: 1 column
          'lg:grid-cols-2', // ≥1024px: 2 columns
          'xl:grid-cols-3', // ≥1280px: 3 columns
          // Additional classes
          className
        )}
        role="list"
        aria-label="Device preview grid"
      >
        {children}
      </div>
    );
  }

  // Draggable mode with DndContext
  return (
    <>
      {/* Screen reader live region for keyboard navigation announcements */}
      <div
        id="device-grid-live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
      
      {/* Keyboard navigation instructions */}
      <div className="sr-only" aria-label="Keyboard navigation">
        Use Ctrl or Cmd + Arrow keys to move devices. Drag with mouse to reorder.
      </div>
      
      <DndContext
        id="device-grid-dnd"
        onDragEnd={handleDragEnd}
      >
        <div
          className={cn(
            // Base grid styles
            'grid gap-4 p-4',
            // Responsive columns
            'grid-cols-1', // Default: 1 column
            'lg:grid-cols-2', // ≥1024px: 2 columns
            'xl:grid-cols-3', // ≥1280px: 3 columns
            // Additional classes
            className
          )}
          role="list"
          aria-label="Device preview grid with drag and drop enabled"
        >
          <SortableContext
            items={deviceIds}
            strategy={rectSortingStrategy}
          >
            {React.Children.map(children, (child, index) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child as React.ReactElement<any>, {
                  tabIndex: focusedIndex === index ? 0 : -1,
                  onKeyDown: (e: React.KeyboardEvent) => handleKeyDown(e, index),
                  onFocus: () => setFocusedIndex(index),
                  'aria-posinset': index + 1,
                  'aria-setsize': deviceIds.length,
                });
              }
              return child;
            })}
          </SortableContext>
        </div>
      </DndContext>
    </>
  );
}
