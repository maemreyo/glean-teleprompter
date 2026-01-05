/**
 * Scroll Utilities
 * 
 * Utility functions for calculating scroll positions, depths, and ratios
 * for teleprompter functionality.
 * 
 * @feature 012-standalone-story
 */

/**
 * Calculate scroll depth ratio (0.0 - 1.0) from scroll position
 * 
 * @param scrollTop - Current scroll position in pixels
 * @param scrollHeight - Total scrollable height in pixels
 * @param viewportHeight - Viewport height in pixels
 * @returns Scroll depth ratio between 0.0 and 1.0
 */
export function calculateScrollDepth(
  scrollTop: number,
  scrollHeight: number,
  viewportHeight: number
): number {
  if (scrollHeight <= viewportHeight) {
    return 0; // No scrolling possible
  }

  const maxScroll = scrollHeight - viewportHeight;
  const depth = Math.max(0, Math.min(1, scrollTop / maxScroll));
  return depth;
}

/**
 * Calculate scroll position from depth ratio
 * 
 * @param depth - Scroll depth ratio (0.0 - 1.0)
 * @param scrollHeight - Total scrollable height in pixels
 * @param viewportHeight - Viewport height in pixels
 * @returns Scroll position in pixels
 */
export function calculateScrollPosition(
  depth: number,
  scrollHeight: number,
  viewportHeight: number
): number {
  if (scrollHeight <= viewportHeight) {
    return 0; // No scrolling possible
  }

  const maxScroll = scrollHeight - viewportHeight;
  const clampedDepth = Math.max(0, Math.min(1, depth));
  return clampedDepth * maxScroll;
}

/**
 * Calculate WPM (Words Per Minute) from scroll speed
 * 
 * @param scrollSpeed - Scroll speed multiplier (0-5)
 * @returns Estimated WPM
 */
export function calculateWPM(scrollSpeed: number): number {
  return Math.round(scrollSpeed * 150);
}

/**
 * Calculate scroll delta for current frame
 * 
 * @param speed - Scroll speed multiplier
 * @param deltaTime - Time elapsed since last frame in ms
 * @param baseSpeed - Base scroll speed in pixels per second
 * @returns Scroll delta in pixels
 */
export function calculateScrollDelta(
  speed: number,
  deltaTime: number,
  baseSpeed: number = 60
): number {
  return (speed * baseSpeed * deltaTime) / 1000;
}

/**
 * Check if content is scrollable
 * 
 * @param scrollHeight - Total scrollable height in pixels
 * @param viewportHeight - Viewport height in pixels
 * @returns True if content can scroll
 */
export function isContentScrollable(
  scrollHeight: number,
  viewportHeight: number
): boolean {
  return scrollHeight > viewportHeight;
}

/**
 * Clamp scroll position within valid bounds
 * 
 * @param position - Desired scroll position
 * @param maxScroll - Maximum scroll position
 * @returns Clamped scroll position
 */
export function clampScrollPosition(
  position: number,
  maxScroll: number
): number {
  return Math.max(0, Math.min(maxScroll, position));
}
