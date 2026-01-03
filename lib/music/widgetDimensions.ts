/**
 * Widget Dimensions
 *
 * Defines size constraints and position validation for the music player widget.
 * Ensures widgets remain visible within viewport boundaries.
 *
 * @feature 011-music-player-widget
 */

import type { WidgetStyle, WidgetPosition } from '../../types/music';

// Re-export types for convenience
export type { WidgetStyle, WidgetPosition };

/**
 * Size constraints for a widget style
 */
export interface WidgetDimensions {
  /** Default width in pixels */
  width: number;

  /** Default height in pixels */
  height: number;

  /** Minimum width */
  minWidth?: number;

  /** Minimum height */
  minHeight?: number;

  /** Maximum width */
  maxWidth?: number;

  /** Maximum height */
  maxHeight?: number;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Widget dimensions for each style
 */
export const WIDGET_DIMENSIONS: Record<WidgetStyle, WidgetDimensions> = {
  capsule: {
    width: 280,
    height: 80,
    minWidth: 240,
    minHeight: 72,
    maxWidth: 400,
    maxHeight: 96,
  },
  vinyl: {
    width: 200,
    height: 200,
    minWidth: 160,
    minHeight: 160,
    maxWidth: 280,
    maxHeight: 280,
  },
  spectrum: {
    width: 320,
    height: 120,
    minWidth: 280,
    minHeight: 100,
    maxWidth: 480,
    maxHeight: 160,
  },
} as const;

/**
 * Default position (bottom-right corner with margin)
 */
export const DEFAULT_POSITION: WidgetPosition = {
  // Will be calculated dynamically based on viewport size
  x: 0,
  y: 0,
} as const;

/**
 * Margin from viewport edges in pixels
 */
export const VIEWPORT_MARGIN = 16;

/**
 * Minimum visible percentage (widget must keep at least 50% visible)
 */
export const MIN_VISIBLE_PERCENTAGE = 0.5;

// ============================================================================
// Position Utilities
// ============================================================================

/**
 * Calculate default position for a widget style
 * Places widget in bottom-right corner with margin
 */
export function calculateDefaultPosition(style: WidgetStyle, viewportWidth: number, viewportHeight: number): WidgetPosition {
  const dimensions = WIDGET_DIMENSIONS[style];
  
  return {
    x: viewportWidth - dimensions.width - VIEWPORT_MARGIN,
    y: viewportHeight - dimensions.height - VIEWPORT_MARGIN,
  };
}

/**
 * Constrain position to keep widget within viewport bounds
 * Ensures at least MIN_VISIBLE_PERCENTAGE of the widget is visible
 */
export function constrainPosition(
  position: WidgetPosition,
  style: WidgetStyle,
  viewportWidth: number,
  viewportHeight: number
): WidgetPosition {
  const dimensions = WIDGET_DIMENSIONS[style];
  
  // Calculate minimum visible dimensions
  const minVisibleWidth = dimensions.width * MIN_VISIBLE_PERCENTAGE;
  const minVisibleHeight = dimensions.height * MIN_VISIBLE_PERCENTAGE;
  
  // Calculate bounds
  // Widget can be partially off-screen but must keep minVisibleWidth/Height visible
  const minX = -(dimensions.width - minVisibleWidth);
  const maxX = viewportWidth - minVisibleWidth;
  const minY = -(dimensions.height - minVisibleHeight);
  const maxY = viewportHeight - minVisibleHeight;
  
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y)),
  };
}

/**
 * Calculate constrained position after a drag delta
 */
export function calculateDragDelta(
  currentPosition: WidgetPosition,
  deltaX: number,
  deltaY: number,
  style: WidgetStyle,
  viewportWidth: number,
  viewportHeight: number
): WidgetPosition {
  const newPosition = {
    x: currentPosition.x + deltaX,
    y: currentPosition.y + deltaY,
  };
  
  return constrainPosition(newPosition, style, viewportWidth, viewportHeight);
}

/**
 * Check if a position is valid (widget is at least partially visible)
 */
export function isPositionValid(
  position: WidgetPosition,
  style: WidgetStyle,
  viewportWidth: number,
  viewportHeight: number
): boolean {
  const dimensions = WIDGET_DIMENSIONS[style];
  
  // Check if any part of widget is visible
  const isHorizontallyVisible = position.x < viewportWidth && position.x + dimensions.width > 0;
  const isVerticallyVisible = position.y < viewportHeight && position.y + dimensions.height > 0;
  
  return isHorizontallyVisible && isVerticallyVisible;
}

/**
 * Get the visible percentage of a widget (0-1)
 */
export function getVisiblePercentage(
  position: WidgetPosition,
  style: WidgetStyle,
  viewportWidth: number,
  viewportHeight: number
): number {
  const dimensions = WIDGET_DIMENSIONS[style];
  
  // Calculate visible area
  const visibleLeft = Math.max(0, position.x);
  const visibleTop = Math.max(0, position.y);
  const visibleRight = Math.min(viewportWidth, position.x + dimensions.width);
  const visibleBottom = Math.min(viewportHeight, position.y + dimensions.height);
  
  const visibleWidth = Math.max(0, visibleRight - visibleLeft);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  
  const visibleArea = visibleWidth * visibleHeight;
  const totalArea = dimensions.width * dimensions.height;
  
  return totalArea > 0 ? visibleArea / totalArea : 0;
}

/**
 * Get viewport dimensions
 */
export function getViewportDimensions(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1920, height: 1080 }; // Server-side default
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
