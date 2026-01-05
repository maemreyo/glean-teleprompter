/**
 * useTeleprompterFontSize Hook
 *
 * Preserves scroll position ratio when font size changes.
 * Uses ResizeObserver for more robust layout change detection.
 *
 * @feature 012-standalone-story
 */

import { useEffect, useRef, useState } from 'react';
import {
  calculateScrollDepth,
  calculateScrollPosition,
} from '@/lib/story/utils/scrollUtils';

/**
 * Return type for useTeleprompterFontSize hook
 */
export interface UseTeleprompterFontSizeReturn {
  /**
   * Whether a font size change is currently being processed
   */
  isProcessingChange: boolean;
}

/**
 * Maximum number of ResizeObserver callbacks to wait for layout to settle
 * This handles cases where layout takes multiple frames to stabilize
 */
const MAX_LAYOUT_SETTLE_FRAMES = 5;

/**
 * Hook for preserving scroll position when font size changes
 *
 * When the user changes font size, the scroll height changes.
 * This hook preserves the relative scroll position (ratio) so the user
 * continues reading from the same location in the content.
 *
 * Uses ResizeObserver instead of requestAnimationFrame for more robust
 * handling of layout changes that may take multiple frames to settle.
 *
 * @param containerRef - Reference to the scrollable container element
 * @param fontSize - Current font size from store
 * @param updateScrollPosition - Callback to update scroll position in store
 * @returns Font size processing state
 *
 * @example
 * ```tsx
 * const { isProcessingChange } = useTeleprompterFontSize({
 *   containerRef,
 *   fontSize,
 *   updateScrollPosition: (scrollTop, scrollDepth) => {
 *     updateScrollPosition(scrollTop, scrollDepth);
 *   },
 * });
 * ```
 */
export function useTeleprompterFontSize({
  containerRef,
  fontSize,
  updateScrollPosition,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  fontSize: number;
  updateScrollPosition: (scrollTop: number, scrollDepth: number) => void;
}): UseTeleprompterFontSizeReturn {
  const previousFontSizeRef = useRef<number | null>(null);
  const scrollRatioBeforeFontChangeRef = useRef<number | null>(null);
  const [isProcessingChange, setIsProcessingChange] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize previous font size on first render
    if (previousFontSizeRef.current === null) {
      previousFontSizeRef.current = fontSize;
      return;
    }

    // Early return if font size hasn't actually changed
    // This prevents unnecessary recalculations when fontSize is read from Zustand store
    if (fontSize === previousFontSizeRef.current) {
      return;
    }

    const scrollHeight = container.scrollHeight;
    const viewportHeight = container.clientHeight;
    const currentScrollTop = container.scrollTop;

    // Calculate current scroll ratio before the change
    const currentRatio = calculateScrollDepth(
      currentScrollTop,
      scrollHeight,
      viewportHeight
    );

    // Store the ratio for restoration after layout update
    scrollRatioBeforeFontChangeRef.current = currentRatio;
    previousFontSizeRef.current = fontSize;
    setIsProcessingChange(true);

    // Use ResizeObserver to wait for layout to settle
    // This is more robust than RAF timing and handles cases where layout takes >1 frame
    let settleCount = 0;
    let resizeObserver: ResizeObserver | null = null;

    const restoreScrollPosition = () => {
      if (!containerRef.current) return;

      const newScrollHeight = containerRef.current.scrollHeight;
      const newViewportHeight = containerRef.current.clientHeight;
      const savedRatio = scrollRatioBeforeFontChangeRef.current;

      if (savedRatio !== null) {
        // Calculate new scroll position that maintains the same ratio
        const newScrollTop = calculateScrollPosition(
          savedRatio,
          newScrollHeight,
          newViewportHeight
        );

        // Apply the new scroll position
        containerRef.current.scrollTop = newScrollTop;

        // Update store with new position
        const newScrollDepth = calculateScrollDepth(
          newScrollTop,
          newScrollHeight,
          newViewportHeight
        );
        updateScrollPosition(newScrollTop, newScrollDepth);

        // Clear saved ratio
        scrollRatioBeforeFontChangeRef.current = null;
        setIsProcessingChange(false);
      }
    };

    // Set up ResizeObserver to detect when layout settles
    resizeObserver = new ResizeObserver((entries) => {
      settleCount++;

      // Wait for a few frames to ensure layout has settled
      if (settleCount >= MAX_LAYOUT_SETTLE_FRAMES) {
        if (resizeObserver) {
          resizeObserver.disconnect();
          resizeObserver = null;
        }
        restoreScrollPosition();
      }
    });

    // Start observing the container
    resizeObserver.observe(container);

    // Cleanup function
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      // If we still have a saved ratio when the effect cleans up, restore it immediately
      if (scrollRatioBeforeFontChangeRef.current !== null) {
        restoreScrollPosition();
      }
    };
  }, [fontSize, containerRef, updateScrollPosition]);

  return {
    isProcessingChange,
  };
}
