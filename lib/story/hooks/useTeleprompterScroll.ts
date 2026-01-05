/**
 * useTeleprompterScroll Hook
 *
 * Custom hook for managing auto-scrolling behavior in teleprompter mode.
 * Uses requestAnimationFrame for smooth 30fps+ scrolling.
 *
 * @feature 012-standalone-story
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';
import { useWakeLock } from './useWakeLock';
import {
  calculateScrollDepth,
  calculateScrollPosition,
  calculateScrollDelta,
  clampScrollPosition,
  isContentScrollable,
} from '@/lib/story/utils/scrollUtils';

/**
 * FPS monitoring utilities (T091 - dev mode only)
 */
const isDevMode = process.env.NODE_ENV === 'development';

interface FPSMetrics {
  currentFPS: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameCount: number;
}

function createFPSMonitor(): {
  recordFrame: () => void;
  getMetrics: () => FPSMetrics;
  reset: () => void;
} {
  let frameCount = 0;
  let lastTime = performance.now();
  let fpsSum = 0;
  let fpsCount = 0;
  let minFPS = Infinity;
  let maxFPS = 0;

  const recordFrame = () => {
    if (!isDevMode) return;

    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;

    const fps = 1000 / delta;
    fpsSum += fps;
    fpsCount++;
    minFPS = Math.min(minFPS, fps);
    maxFPS = Math.max(maxFPS, fps);
    frameCount++;

    // Log every 60 frames (approx 2 seconds at 30fps)
    if (frameCount % 60 === 0) {
      const avgFPS = fpsSum / fpsCount;
      console.debug(
        `[Teleprompter FPS] Current: ${fps.toFixed(1)}, Avg: ${avgFPS.toFixed(1)}, Min: ${minFPS.toFixed(1)}, Max: ${maxFPS.toFixed(1)}`
      );
    }
  };

  const getMetrics = (): FPSMetrics => ({
    currentFPS: fpsCount > 0 ? fpsSum / fpsCount : 0,
    averageFPS: fpsSum / fpsCount || 0,
    minFPS: minFPS === Infinity ? 0 : minFPS,
    maxFPS,
    frameCount,
  });

  const reset = () => {
    frameCount = 0;
    fpsSum = 0;
    fpsCount = 0;
    minFPS = Infinity;
    maxFPS = 0;
    lastTime = performance.now();
  };

  return { recordFrame, getMetrics, reset };
}

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
  wakeLockError: Error | null;
}

const PROGRESS_THROTTLE_MS = 100;
const BASE_SCROLL_SPEED = 60; // pixels per second at speed 1
const DECELERATION_FACTOR = 0.95;
const MIN_SPEED = 0.01;
const SCROLL_END_TOLERANCE = 1; // pixels - tolerance for detecting scroll end (handles floating-point rounding errors)

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
  const userScrolledRef = useRef<boolean>(false); // T114 - Detect user manual scroll
  const isTabVisibleRef = useRef<boolean>(true); // T117 - Track tab visibility
  const isAutoScrollingRef = useRef<boolean>(false); // Flag to differentiate auto-scroll from user scroll
  
  // FPS monitor for development (T091)
  const fpsMonitor = useRef(createFPSMonitor());

  const {
    fontSize,
    scrollSpeed,
    isScrolling,
    startScrolling: startStoreScrolling,
    stopScrolling: stopStoreScrolling,
    updateScrollPosition,
  } = useTeleprompterStore();

  // Wake lock integration (T061, T063, T064, T067)
  const { requestWakeLock, releaseWakeLock, isWakeLockSupported, error: wakeLockError } = useWakeLock({
    onRequest: () => {
      // Wake lock acquired successfully
    },
    onRelease: () => {
      // Wake lock released
    },
    onError: (error) => {
      // Log wake lock errors but don't block scrolling
      console.warn('Wake lock error:', error);
    },
  });

  const [hasAttemptedWakeLock, setHasAttemptedWakeLock] = useState(false);

  /**
   * Scroll animation frame handler
   */
  const scrollFrame = useCallback(
    (timestamp: number) => {
      const container = containerRef.current;
      if (!container) return;

      // T117: Pause auto-scrolling when browser tab is inactive
      if (!isTabVisibleRef.current) {
        // Don't process frames when tab is hidden
        rafIdRef.current = requestAnimationFrame(scrollFrame);
        return;
      }

      // Record FPS in development mode (T091)
      if (isDevMode) {
        fpsMonitor.current.recordFrame();
      }

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

      // T113: Check if content is scrollable - disable auto-scrolling when content height < viewport
      if (!isContentScrollable(scrollHeight, viewportHeight)) {
        // Content fits on screen, no scrolling needed
        stopStoreScrolling();
        return;
      }

      // T114: Pause auto-scrolling when user manually scrolls
      // Detect if current scrollTop doesn't match expected position from auto-scroll
      const expectedScrollDelta = calculateScrollDelta(
        currentSpeedRef.current,
        deltaTime,
        BASE_SCROLL_SPEED
      );
      // If user scrolled, we detect it and pause
      // This is handled by a separate scroll event listener below
      
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
      // Mark that we're about to auto-scroll so the scroll event handler knows this isn't a user action
      isAutoScrollingRef.current = true;
      container.scrollTop = newScrollPosition;
      // Reset flag after a microtask - the scroll event will have fired by then
      Promise.resolve().then(() => {
        isAutoScrollingRef.current = false;
      });

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
      if (newScrollPosition >= maxScroll - SCROLL_END_TOLERANCE && !isStoppingRef.current) {
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
   * Start scrolling animation (T063 - request wake lock)
   */
  const startScrolling = useCallback(async () => {
    if (isScrolling) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollHeight = container.scrollHeight;
    const viewportHeight = container.clientHeight;

    // Check if content is scrollable
    if (!isContentScrollable(scrollHeight, viewportHeight)) {
      return;
    }

    // Attempt to request wake lock (T067 - block if both fail)
    if (!hasAttemptedWakeLock) {
      setHasAttemptedWakeLock(true);
      if (isWakeLockSupported) {
        try {
          await requestWakeLock();
        } catch (err) {
          // If wake lock fails on first attempt, this is a critical error
          // that should block teleprompter mode (T067)
          stopStoreScrolling();
          return;
        }
      }
    } else {
      // Re-request wake lock on subsequent starts
      if (isWakeLockSupported) {
        try {
          await requestWakeLock();
        } catch (err) {
          // Log but don't block - wake lock may have been released by system
          console.warn('Failed to re-request wake lock:', err);
        }
      }
    }

    isStoppingRef.current = false;
    currentSpeedRef.current = scrollSpeed;
    lastTimestampRef.current = 0;
    startStoreScrolling();

    rafIdRef.current = requestAnimationFrame(scrollFrame);
  }, [
    containerRef,
    isScrolling,
    scrollSpeed,
    startStoreScrolling,
    scrollFrame,
    hasAttemptedWakeLock,
    isWakeLockSupported,
    requestWakeLock,
  ]);

  /**
   * Stop scrolling with smooth deceleration (T064 - release wake lock)
   */
  const stopScrolling = useCallback(() => {
    if (!isScrolling) return;

    // Enable deceleration mode
    isStoppingRef.current = true;

    // Release wake lock when scrolling stops completely
    // Note: We don't release immediately - we wait for deceleration to complete
    // The actual release happens in the scrollFrame when speed reaches 0
  }, [isScrolling]);

  /**
   * Release wake lock when scrolling fully stops
   */
  useEffect(() => {
    if (!isScrolling && hasAttemptedWakeLock && isWakeLockSupported) {
      releaseWakeLock();
    }
  }, [isScrolling, hasAttemptedWakeLock, isWakeLockSupported, releaseWakeLock]);

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
   *
   * Note: This effect only runs when fontSize actually changes by comparing
   * with the previous value stored in previousFontSizeRef. This prevents
   * unnecessary recalculations on every render where fontSize is read from
   * the Zustand store.
   */
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
  }, [fontSize, containerRef, updateScrollPosition]);

  /**
   * T114: Detect and handle user manual scroll
   * When user manually scrolls, pause auto-scrolling
   *
   * Note: We differentiate between user scroll and auto-scroll by using
   * isAutoScrollingRef, which is set to true before we programmatically
   * set scrollTop and reset to false after the scroll event fires.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Only pause if this is NOT an auto-scroll event
      if (isScrolling && !isStoppingRef.current && !isAutoScrollingRef.current) {
        // User manually scrolled - pause auto-scrolling
        userScrolledRef.current = true;
        stopScrolling();
        
        // T115: Show toast notification
        toast('Auto-scroll paused - tap to resume');
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isScrolling, stopScrolling, containerRef]);

  /**
   * T117: Pause auto-scrolling when browser tab becomes inactive
   * Uses Page Visibility API
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;
      
      if (document.hidden && isScrolling) {
        // Tab became hidden - pause scrolling
        stopScrolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isScrolling, stopScrolling]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      // Reset FPS monitor on unmount (T091)
      if (isDevMode) {
        fpsMonitor.current.reset();
      }
    };
  }, []);

  /**
   * Expose FPS metrics in development (T091)
   * Cleanup on unmount to prevent memory leaks
   */
  useEffect(() => {
    if (!isDevMode) return;
    
    // Make FPS metrics available via window for debugging
    if (typeof window !== 'undefined') {
      (window as any).__teleprompterFPS = {
        getMetrics: () => fpsMonitor.current.getMetrics(),
      };
    }

    // Cleanup: remove the window attachment on unmount
    return () => {
      if (typeof window !== 'undefined' && (window as any).__teleprompterFPS) {
        delete (window as any).__teleprompterFPS;
      }
    };
  }, []);

  return {
    startScrolling,
    stopScrolling,
    toggleScrolling,
    isScrolling,
    wakeLockError,
  };
}
