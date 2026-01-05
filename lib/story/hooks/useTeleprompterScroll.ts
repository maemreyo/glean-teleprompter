/**
 * useTeleprompterScroll Hook
 * 
 * Custom hook for managing auto-scrolling behavior in teleprompter mode.
 * Uses requestAnimationFrame for smooth 30fps+ scrolling.
 * 
 * @feature 012-standalone-story
 */

import { useRef, useCallback, useEffect } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';
import {
  calculateScrollDepth,
  calculateScrollPosition,
  calculateScrollDelta,
  clampScrollPosition,
  isContentScrollable,
} from '@/lib/story/utils/scrollUtils';

interface UseTeleprompterScrollOptions {
  containerRef: React.RefObject<HTMLElement>;
  onScrollProgress?: (depth: number) => void;
  onScrollComplete?: () => void;
}

interface UseTeleprompterScrollReturn {
  startScrolling: () => void;
  stopScrolling: () => void;
  toggleScrolling: () => void;
  isScrolling: boolean;
}

const PROGRESS_THROTTLE_MS = 100;
const BASE_SCROLL_SPEED = 60; // pixels per second at speed 1
const DECELERATION_FACTOR = 0.95;
const MIN_SPEED = 0.01;

/**
 * Hook for managing teleprompter auto-scrolling
 * 
 * Manages scroll animation loop using requestAnimationFrame,
 * handles smooth deceleration on pause, and reports scroll progress.
 */
export function useTeleprompterScroll({
  containerRef,
  onScrollProgress,
  onScrollComplete,
}: UseTeleprompterScrollOptions): UseTeleprompterScrollReturn {
  const rafIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(0);
  const lastProgressUpdateRef = useRef<number>(0);
  const isStoppingRef = useRef<boolean>(false);
  const previousFontSizeRef = useRef<number | null>(null);
  const scrollRatioBeforeFontChangeRef = useRef<number | null>(null);

  const {
    fontSize,
    scrollSpeed,
    isScrolling,
    startScrolling: startStoreScrolling,
    stopScrolling: stopStoreScrolling,
    updateScrollPosition,
  } = useTeleprompterStore();

  /**
   * Scroll animation frame handler
   */
  const scrollFrame = useCallback(
    (timestamp: number) => {
      const container = containerRef.current;
      if (!container) return;

      // Initialize timestamp on first frame
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
      }

      // Calculate delta time in milliseconds
      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Get current scroll dimensions
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const viewportHeight = container.clientHeight;

      // Check if content is scrollable
      if (!isContentScrollable(scrollHeight, viewportHeight)) {
        stopStoreScrolling();
        return;
      }

      const maxScroll = scrollHeight - viewportHeight;

      // Handle deceleration when stopping
      if (isStoppingRef.current) {
        currentSpeedRef.current *= DECELERATION_FACTOR;
        
        if (currentSpeedRef.current < MIN_SPEED) {
          currentSpeedRef.current = 0;
          isStoppingRef.current = false;
          stopStoreScrolling();
          return;
        }
      } else {
        // Use current scroll speed from store
        currentSpeedRef.current = scrollSpeed;
      }

      // Calculate scroll delta and new position
      const delta = calculateScrollDelta(
        currentSpeedRef.current,
        deltaTime,
        BASE_SCROLL_SPEED
      );

      const newScrollPosition = clampScrollPosition(
        scrollTop + delta,
        maxScroll
      );

      // Apply scroll
      container.scrollTop = newScrollPosition;

      // Calculate scroll depth
      const scrollDepth = calculateScrollDepth(
        newScrollPosition,
        scrollHeight,
        viewportHeight
      );

      // Update store
      updateScrollPosition(newScrollPosition, scrollDepth);

      // Throttle progress updates
      if (timestamp - lastProgressUpdateRef.current >= PROGRESS_THROTTLE_MS) {
        onScrollProgress?.(scrollDepth);
        lastProgressUpdateRef.current = timestamp;
      }

      // Check if we've reached the end
      if (newScrollPosition >= maxScroll - 1 && !isStoppingRef.current) {
        onScrollComplete?.();
        stopStoreScrolling();
        return;
      }

      // Continue animation loop
      rafIdRef.current = requestAnimationFrame(scrollFrame);
    },
    [
      containerRef,
      scrollSpeed,
      startStoreScrolling,
      stopStoreScrolling,
      updateScrollPosition,
      onScrollProgress,
      onScrollComplete,
    ]
  );

  /**
   * Start scrolling animation
   */
  const startScrolling = useCallback(() => {
    if (isScrolling) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const viewportHeight = container.clientHeight;

    // Check if content is scrollable
    if (!isContentScrollable(scrollHeight, viewportHeight)) {
      return;
    }

    isStoppingRef.current = false;
    currentSpeedRef.current = scrollSpeed;
    lastTimestampRef.current = 0;
    startStoreScrolling();

    rafIdRef.current = requestAnimationFrame(scrollFrame);
  }, [containerRef, isScrolling, scrollSpeed, startStoreScrolling, scrollFrame]);

  /**
   * Stop scrolling with smooth deceleration
   */
  const stopScrolling = useCallback(() => {
    if (!isScrolling) return;

    // Enable deceleration mode
    isStoppingRef.current = true;
  }, [isScrolling]);

  /**
   * Toggle scrolling state
   */
  const toggleScrolling = useCallback(() => {
    if (isScrolling) {
      stopScrolling();
    } else {
      startScrolling();
    }
  }, [isScrolling, startScrolling, stopScrolling]);

  /**
   * Preserve scroll position ratio when font size changes (T052)
   *
   * When the user changes font size, the scroll height changes.
   * We preserve the relative scroll position (ratio) so the user
   * continues reading from the same location in the content.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize previous font size on first render
    if (previousFontSizeRef.current === null) {
      previousFontSizeRef.current = fontSize;
      return;
    }

    // Check if font size actually changed
    if (fontSize !== previousFontSizeRef.current) {
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

      // Wait for next frame when layout has updated with new font size
      requestAnimationFrame(() => {
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
        }
      });
    }
  }, [fontSize, containerRef, updateScrollPosition]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return {
    startScrolling,
    stopScrolling,
    toggleScrolling,
    isScrolling,
  };
}
