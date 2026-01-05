/**
 * Progress Utilities
 * 
 * Utility functions for synchronizing progress bars with scroll depth
 * for teleprompter functionality.
 * 
 * @feature 012-standalone-story
 */

import { calculateScrollDepth } from './scrollUtils';

/**
 * Calculate progress bar value from scroll position
 * 
 * This function accounts for the top gradient zone (35vh) to ensure
 * the progress bar accurately reflects visible content scroll depth.
 * 
 * @param scrollTop - Current scroll position in pixels
 * @param scrollHeight - Total scrollable height in pixels
 * @param viewportHeight - Viewport height in pixels
 * @param topGradientHeight - Height of top gradient overlay in pixels (default: 35vh)
 * @returns Progress value between 0.0 and 1.0
 */
export function calculateProgressFromScroll(
  scrollTop: number,
  scrollHeight: number,
  viewportHeight: number,
  topGradientHeight: number = 0
): number {
  // Use scroll depth calculation from scrollUtils
  const depth = calculateScrollDepth(scrollTop, scrollHeight, viewportHeight);
  
  // Adjust for top gradient zone if specified
  // The top gradient covers content that's not yet in the focal point
  // so we adjust progress to account for this
  if (topGradientHeight > 0) {
    const maxScroll = scrollHeight - viewportHeight;
    if (maxScroll > 0) {
      // Calculate effective scroll considering gradient zone
      const effectiveScrollTop = Math.max(0, scrollTop - topGradientHeight);
      const effectiveMaxScroll = maxScroll - topGradientHeight;
      
      if (effectiveMaxScroll > 0) {
        return Math.max(0, Math.min(1, effectiveScrollTop / effectiveMaxScroll));
      }
    }
  }
  
  return depth;
}

/**
 * Calculate scroll position from progress value
 * 
 * Inverse of calculateProgressFromScroll - converts progress bar value
 * back to scroll position in pixels.
 * 
 * @param progress - Progress value between 0.0 and 1.0
 * @param scrollHeight - Total scrollable height in pixels
 * @param viewportHeight - Viewport height in pixels
 * @param topGradientHeight - Height of top gradient overlay in pixels (default: 35vh)
 * @returns Scroll position in pixels
 */
export function calculateScrollFromProgress(
  progress: number,
  scrollHeight: number,
  viewportHeight: number,
  topGradientHeight: number = 0
): number {
  if (scrollHeight <= viewportHeight) {
    return 0; // No scrolling possible
  }

  const maxScroll = scrollHeight - viewportHeight;
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  // Adjust for top gradient zone if specified
  if (topGradientHeight > 0) {
    const effectiveMaxScroll = maxScroll - topGradientHeight;
    if (effectiveMaxScroll > 0) {
      return (clampedProgress * effectiveMaxScroll) + topGradientHeight;
    }
  }
  
  return clampedProgress * maxScroll;
}

/**
 * Throttle progress updates to avoid excessive re-renders
 * 
 * @param callback - Function to call with throttled updates
 * @param throttleMs - Minimum time between updates in milliseconds
 * @returns Throttled function that accepts progress value
 */
export function createProgressThrottle(
  callback: (progress: number) => void,
  throttleMs: number = 100
): (progress: number) => void {
  let lastUpdate = 0;
  let pendingProgress: number | null = null;
  
  return (progress: number) => {
    const now = performance.now();
    const timeSinceLastUpdate = now - lastUpdate;
    
    if (timeSinceLastUpdate >= throttleMs) {
      // Enough time has passed, execute immediately
      lastUpdate = now;
      callback(progress);
      pendingProgress = null;
    } else {
      // Store pending progress to update on next throttle cycle
      pendingProgress = progress;
      
      // Schedule update for next available time slot
      const timeUntilNextUpdate = throttleMs - timeSinceLastUpdate;
      setTimeout(() => {
        if (pendingProgress !== null) {
          lastUpdate = performance.now();
          callback(pendingProgress);
          pendingProgress = null;
        }
      }, timeUntilNextUpdate);
    }
  };
}

/**
 * Validate progress value is within valid range
 * 
 * @param progress - Progress value to validate
 * @returns True if progress is valid (0.0 to 1.0)
 */
export function isValidProgress(progress: number): boolean {
  return typeof progress === 'number' && 
         !isNaN(progress) && 
         isFinite(progress) && 
         progress >= 0 && 
         progress <= 1;
}

/**
 * Clamp progress value to valid range
 * 
 * @param progress - Progress value to clamp
 * @returns Clamped progress value between 0.0 and 1.0
 */
export function clampProgress(progress: number): number {
  return Math.max(0, Math.min(1, progress));
}
