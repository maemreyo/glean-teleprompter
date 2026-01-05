/**
 * useTeleprompterScroll Hook
 *
 * Custom hook for managing auto-scrolling behavior in teleprompter mode.
 * Uses requestAnimationFrame for smooth 30fps+ scrolling.
 *
 * Refactored from original 551-line monolith into smaller, focused hooks:
 * - useTeleprompterFPS: FPS monitoring (dev only)
 * - useTeleprompterScrollDetection: User scroll detection, end-of-content, direction
 * - useTeleprompterFontSize: Font size preservation with ResizeObserver
 *
 * @feature 012-standalone-story
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';
import { useWakeLock } from './useWakeLock';
import { useTeleprompterFPS } from './useTeleprompterFPS';
import { useTeleprompterScrollDetection } from './useTeleprompterScrollDetection';
import { useTeleprompterFontSize } from './useTeleprompterFontSize';
import {
  calculateScrollDepth,
  calculateScrollDelta,
  clampScrollPosition,
  isContentScrollable,
} from '@/lib/story/utils/scrollUtils';

/**
 * Options for useTeleprompterScroll hook
 */
interface UseTeleprompterScrollOptions {
  /** Reference to the scrollable container element (can be null) */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Callback when scroll progress changes (throttled) */
  onScrollProgress?: (depth: number) => void;
  /** Callback when scroll reaches end of content */
  onScrollComplete?: () => void;
}

/**
 * Return type for useTeleprompterScroll hook
 */
interface UseTeleprompterScrollReturn {
  /** Start auto-scrolling */
  startScrolling: () => void;
  /** Stop auto-scrolling (with deceleration) */
  stopScrolling: () => void;
  /** Toggle auto-scrolling state */
  toggleScrolling: () => void;
  /** Whether currently scrolling (including deceleration) */
  isScrolling: boolean;
  /** Wake lock error, if any */
  wakeLockError: Error | null;
}

/**
 * Throttle for scroll progress updates (ms)
 */
const PROGRESS_THROTTLE_MS = 100;

/**
 * Base scroll speed: pixels per second at speed 1
 */
const BASE_SCROLL_SPEED = 60;

/**
 * Deceleration factor when stopping (multiplied each frame)
 */
const DECELERATION_FACTOR = 0.95;

/**
 * Minimum speed threshold to stop deceleration
 */
const MIN_SPEED = 0.01;


export function useTeleprompterScroll({
  containerRef,
  onScrollProgress,
  onScrollComplete,
}: UseTeleprompterScrollOptions): UseTeleprompterScrollReturn {
  // Compose smaller hooks
  const { recordFrame } = useTeleprompterFPS();
  const {
    markAutoScrolling,
    resetUserScrolled,
    checkAtEnd,
  } = useTeleprompterScrollDetection({
    containerRef,
    isScrolling: useTeleprompterStore((s) => s.isScrolling),
    onStopScrolling: () => {
      // Triggered when user scrolls during auto-scroll
      stopStoreScrolling();
    },
  });
  
  const { isProcessingChange: isProcessingFontChange } = useTeleprompterFontSize({
    containerRef,
    fontSize: useTeleprompterStore((s) => s.fontSize),
    updateScrollPosition: (scrollTop, scrollDepth) => {
      updateScrollPosition(scrollTop, scrollDepth);
    },
  });

  // Animation loop refs
  const rafIdRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const currentSpeedRef = useRef<number>(0);
  const lastProgressUpdateRef = useRef<number>(0);
  
  // Store integration
  const {
    scrollSpeed,
    isScrolling,
    startScrolling: startStoreScrolling,
    stopScrolling: stopStoreScrolling,
    updateScrollPosition,
  } = useTeleprompterStore();

  // Deceleration state ref (separate from store's isScrolling)
  const isStoppingRef = useRef<boolean>(false);

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

      // Record FPS in development mode
      recordFrame();

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

      // Check if content is scrollable - disable auto-scrolling when content height < viewport
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
      // Mark that we're about to auto-scroll so the scroll event handler knows this isn't a user action
      markAutoScrolling();
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
      if (checkAtEnd(newScrollPosition, maxScroll) && !isStoppingRef.current) {
        onScrollComplete?.();
        stopStoreScrolling();
        return;
      }

      // Continue animation loop
      rafIdRef.current = requestAnimationFrame(scrollFrame);
    },
    [
      scrollSpeed,
      stopStoreScrolling,
      updateScrollPosition,
      onScrollProgress,
      onScrollComplete,
      containerRef,
      recordFrame,
      markAutoScrolling,
      checkAtEnd,
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

    // Reset user scrolled flag when starting auto-scroll
    resetUserScrolled();

    currentSpeedRef.current = scrollSpeed;
    lastTimestampRef.current = 0;
    isStoppingRef.current = false;
    startStoreScrolling();

    rafIdRef.current = requestAnimationFrame(scrollFrame);
  }, [
    containerRef,
    isScrolling,
    scrollSpeed,
    scrollFrame,
    hasAttemptedWakeLock,
    isWakeLockSupported,
    requestWakeLock,
    resetUserScrolled,
    startStoreScrolling,
    stopStoreScrolling,
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
   * T117: Pause auto-scrolling when browser tab becomes inactive
   * Uses Page Visibility API
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
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

export type { UseTeleprompterScrollOptions, UseTeleprompterScrollReturn };
