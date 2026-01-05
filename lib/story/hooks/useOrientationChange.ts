/**
 * useOrientationChange Hook
 *
 * Detects device orientation changes and triggers callbacks.
 * Used to recalculate layouts and preserve scroll positions.
 *
 * @feature 012-standalone-story
 */

import { useEffect, useRef } from 'react';

export interface OrientationChangeOptions {
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  onBeforeOrientationChange?: () => void;
}

/**
 * Hook for handling device orientation changes
 *
 * Detects when the device rotates between portrait and landscape,
 * allowing components to recalculate layouts and preserve state.
 *
 * @param options - Callbacks for orientation change events
 * @returns Current orientation
 *
 * @example
 * ```tsx
 * const { currentOrientation } = useOrientationChange({
 *   onOrientationChange: (orientation) => {
 *     console.log('Orientation changed to:', orientation);
 *   },
 *   onBeforeOrientationChange: () => {
 *     // Save current scroll position
 *   },
 * });
 * ```
 */
export function useOrientationChange({
  onOrientationChange,
  onBeforeOrientationChange,
}: OrientationChangeOptions = {}) {
  const previousOrientationRef = useRef<'portrait' | 'landscape' | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getOrientation = (): 'portrait' | 'landscape' => {
      return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    };

    const currentOrientation = getOrientation();
    previousOrientationRef.current = currentOrientation;

    const handleOrientationChange = () => {
      const newOrientation = getOrientation();

      // Only trigger if orientation actually changed
      if (newOrientation !== previousOrientationRef.current) {
        // Call before callback (for saving state)
        onBeforeOrientationChange?.();

        // Clear any pending callbacks (debounce rapid changes)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Delay callback to allow layout to update
        timeoutRef.current = setTimeout(() => {
          onOrientationChange?.(newOrientation);
          previousOrientationRef.current = newOrientation;
        }, 100);
      }
    };

    // Listen for both resize and orientationchange events
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onOrientationChange, onBeforeOrientationChange]);

  const currentOrientation: 'portrait' | 'landscape' =
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

  return {
    currentOrientation,
    previousOrientation: previousOrientationRef.current,
  };
}
