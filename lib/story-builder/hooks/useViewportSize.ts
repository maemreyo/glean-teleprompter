'use client';

/**
 * useViewportSize Hook
 *
 * Detects and tracks viewport dimensions for responsive layout.
 * Used by ViewportWarning to show warnings below minimum width.
 */

import { useState, useEffect } from 'react';

export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Hook for tracking viewport size.
 *
 * Updates on window resize with debouncing.
 * Returns current viewport dimensions.
 */
export function useViewportSize(debounceMs = 100): ViewportSize {
  const [viewportSize, setViewportSize] = useState<ViewportSize>(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout | undefined;

    const handleResize = () => {
      // Clear existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Debounce the update
      timeoutId = setTimeout(() => {
        setViewportSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceMs);
    };

    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [debounceMs]);

  return viewportSize;
}
