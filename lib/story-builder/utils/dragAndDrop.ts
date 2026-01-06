/**
 * Drag-and-Drop Utilities
 * 
 * Helper functions for @dnd-kit integration.
 * Provides collision detection, sensor configuration, and drag state management.
 * 
 * @feature 013-visual-story-builder
 */

import type { DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, UniqueIdentifier } from '@dnd-kit/core';
import type { DragState } from '../types';

// ============================================================================
// Collision Detection
// ============================================================================

/**
 * Custom collision detection algorithm for story builder.
 * Uses closestCenter with additional distance threshold.
 */
export const collisionDetectionConfig = {
  // Distance threshold for considering a drop zone valid (in pixels)
  threshold: 50,
  
  // Minimum distance to trigger a drag operation (prevents accidental drags)
  activationDistance: 10,
};

// ============================================================================
// Sensor Configuration
// ============================================================================

/**
 * Pointer sensor activation constraint.
 * User must drag at least this many pixels to start dragging.
 */
export const pointerActivationConstraint = {
  distance: collisionDetectionConfig.activationDistance,
};

// ============================================================================
// Drag State Utilities
// ============================================================================

/**
 * Extract drag state from @dnd-kit drag start event.
 */
export function getDragStateFromStartEvent(event: DragStartEvent): DragState {
  const translated = event.active.rect.current.translated;
  
  return {
    isDragging: true,
    draggedSlideId: event.active.id as string,
    dropTargetIndex: undefined,
    dragPosition: {
      x: translated?.left ?? 0,
      y: translated?.top ?? 0,
    },
  };
}

/**
 * Update drag state during drag over event.
 */
export function updateDragStateOnDragOver(event: DragOverEvent, currentState: DragState): DragState {
  const translated = event.active.rect.current.translated;
  
  return {
    ...currentState,
    dropTargetIndex: getDropTargetIndex(event),
    dragPosition: {
      x: translated?.left ?? 0,
      y: translated?.top ?? 0,
    },
  };
}

/**
 * Clear drag state after drag end.
 */
export function clearDragState(): DragState {
  return {
    isDragging: false,
  };
}

// ============================================================================
// Drop Target Detection
// ============================================================================

/**
 * Calculate the drop target index based on cursor position.
 * Used for inserting new slides from the library.
 */
export function getDropTargetIndex(event: DragOverEvent): number | undefined {
  const { active, over } = event;

  if (!over) {
    return undefined;
  }

  // If dragging over a slide card, return that index
  const overId = over.id as string;
  
  // Check if overId is a slide index (e.g., "slide-0", "slide-1")
  if (overId.startsWith('slide-')) {
    return parseInt(overId.replace('slide-', ''), 10);
  }

  return undefined;
}

// ============================================================================
// Animation Helpers
// ============================================================================

/**
 * Calculate the new position for an item being dragged.
 * Used for smooth drag animations.
 */
export function getNewPosition(
  containerRect: DOMRect,
  activeNodeRect: DOMRect,
  overNodeRect: DOMRect | null
): { x: number; y: number } {
  if (!overNodeRect) {
    return {
      x: activeNodeRect.left - containerRect.left,
      y: activeNodeRect.top - containerRect.top,
    };
  }

  return {
    x: overNodeRect.left - containerRect.left,
    y: overNodeRect.top - containerRect.top,
  };
}

// ============================================================================
// Reorder Utilities
// ============================================================================

/**
 * Reorder an array by moving an item from one index to another.
 * Used for slide reordering in the story rail.
 */
export function arrayMove<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
}

/**
 * Insert an item into an array at a specific position.
 * Used for adding new slides from the library.
 */
export function arrayInsert<T>(array: T[], item: T, position: number): T[] {
  const newArray = [...array];
  newArray.splice(position, 0, item);
  return newArray;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a drag event is for a slide from the library.
 * Library items have IDs like "text-highlight", "image", etc.
 */
export function isLibrarySlide(id: UniqueIdentifier): boolean {
  const librarySlideTypes = ['text-highlight', 'image', 'teleprompter', 'poll', 'widget-chart'];
  return librarySlideTypes.includes(id as string);
}

/**
 * Check if a drag event is for an existing slide in the rail.
 * Rail items have IDs like "slide-0", "slide-1", etc.
 */
export function isRailSlide(id: UniqueIdentifier): boolean {
  return (id as string).startsWith('slide-');
}

// ============================================================================
// Accessibility Helpers
// ============================================================================

/**
 * Generate ARIA attributes for draggable items.
 */
export function getDraggableAriaAttributes(type: string, index?: number) {
  return {
    role: 'button' as const,
    'aria-label': index !== undefined
      ? `Slide ${index + 1}, ${type}. Drag to reorder.`
      : `Add ${type} slide. Drag to story rail or press Enter to add.`,
    'aria-grabbed': false,
  };
}

/**
 * Generate ARIA attributes for active drag state.
 */
export function getActiveDragAriaAttributes() {
  return {
    'aria-grabbed': true,
  };
}

// ============================================================================
// Performance Utilities
// ============================================================================

/**
 * Debounce function for drag-related updates.
 * Prevents excessive re-renders during drag operations.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for drag-related updates.
 * Ensures updates don't exceed a maximum frequency.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
