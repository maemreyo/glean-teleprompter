/**
 * useTeleprompterScrollDetection Hook
 *
 * Handles scroll detection logic for teleprompter:
 * - Detects when user manually scrolls during auto-scroll
 * - Detects end-of-content
 * - Tracks scroll direction
 *
 * @feature 012-standalone-story
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * Scroll direction states
 */
export type ScrollDirection = 'up' | 'down' | 'none';

/**
 * Return type for useTeleprompterScrollDetection hook
 */
export interface UseTeleprompterScrollDetectionReturn {
  /**
   * Whether the scroll has reached the end of content
   */
  isAtEnd: boolean;
  /**
   * Whether the user has manually scrolled during auto-scroll
   */
  userScrolled: boolean;
  /**
   * Current scroll direction
   */
  scrollDirection: ScrollDirection;
  /**
   * Mark that auto-scroll is in progress (to distinguish from user scroll)
   */
  markAutoScrolling: () => void;
  /**
   * Reset the user scrolled flag
   */
  resetUserScrolled: () => void;
  /**
   * Check if current position is at end of content
   */
  checkAtEnd: (scrollTop: number, maxScroll: number) => boolean;
}

/**
 * Tolerance for detecting scroll end (pixels)
 * Handles floating-point rounding errors and ensures we detect completion
 */
const SCROLL_END_TOLERANCE = 1;

/**
 * Debounce time for toast notifications (ms)
 * Prevents spamming toasts when user scrolls during auto-scroll
 */
const TOAST_DEBOUNCE_MS = 1000;

/**
 * Hook for detecting scroll-related events in teleprompter
 *
 * Detects user manual scroll, end-of-content, and scroll direction.
 * Debounces toast notifications to prevent spam.
 *
 * @param containerRef - Reference to the scrollable container element
 * @param isScrolling - Whether auto-scrolling is active
 * @param onStopScrolling - Callback when user scroll should stop auto-scrolling
 * @returns Scroll detection utilities and state
 *
 * @example
 * ```tsx
 * const { isAtEnd, userScrolled, scrollDirection, markAutoScrolling, resetUserScrolled, checkAtEnd } = useTeleprompterScrollDetection({
 *   containerRef,
 *   isScrolling,
 *   onStopScrolling: () => stopScrolling(),
 * });
 *
 * // When auto-scrolling
 * markAutoScrolling();
 * container.scrollTop = newScrollPosition;
 *
 * // Check if at end
 * const atEnd = checkAtEnd(container.scrollTop, maxScroll);
 * ```
 */
export function useTeleprompterScrollDetection({
  containerRef,
  isScrolling,
  onStopScrolling,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  isScrolling: boolean;
  onStopScrolling: () => void;
}): UseTeleprompterScrollDetectionReturn {
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>('none');
  
  const isAutoScrollingRef = useRef<boolean>(false);
  const lastScrollTopRef = useRef<number>(0);
  const lastToastTimeRef = useRef<number>(0);

  /**
   * Mark that auto-scroll is in progress
   * Call this before programmatically setting scrollTop
   */
  const markAutoScrolling = useCallback(() => {
    isAutoScrollingRef.current = true;
    // Reset flag after a microtask - the scroll event will have fired by then
    // This uses queueMicrotask instead of Promise.resolve() for better timing control
    queueMicrotask(() => {
      isAutoScrollingRef.current = false;
    });
  }, []);

  /**
   * Reset the user scrolled flag
   */
  const resetUserScrolled = useCallback(() => {
    setUserScrolled(false);
  }, []);

  /**
   * Check if current position is at end of content
   * @param scrollTop - Current scroll position
   * @param maxScroll - Maximum scroll position
   * @returns Whether at end of content
   */
  const checkAtEnd = useCallback(
    (scrollTop: number, maxScroll: number): boolean => {
      // Use tolerance to handle floating-point rounding errors
      // Also handles edge case where content is EXACTLY at maxScroll
      return scrollTop >= maxScroll - SCROLL_END_TOLERANCE;
    },
    []
  );

  /**
   * T114: Detect and handle user manual scroll
   * When user manually scrolls during auto-scrolling, pause auto-scrolling
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Check if container has addEventListener (may not in test mocks)
    if (typeof container.addEventListener !== 'function') return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      
      // Determine scroll direction
      if (currentScrollTop > lastScrollTopRef.current) {
        setScrollDirection('down');
      } else if (currentScrollTop < lastScrollTopRef.current) {
        setScrollDirection('up');
      }
      lastScrollTopRef.current = currentScrollTop;

      // Only pause if this is NOT an auto-scroll event and we're currently auto-scrolling
      if (isScrolling && !isAutoScrollingRef.current) {
        // Check if we should show toast (debounced)
        const now = Date.now();
        const timeSinceLastToast = now - lastToastTimeRef.current;
        
        if (timeSinceLastToast >= TOAST_DEBOUNCE_MS) {
          lastToastTimeRef.current = now;
          
          // T115: Show toast notification (debounced)
          toast('Auto-scroll paused - tap to resume');
        }
        
        // User manually scrolled - pause auto-scrolling
        setUserScrolled(true);
        onStopScrolling();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, isScrolling, onStopScrolling]);

  return {
    isAtEnd,
    userScrolled,
    scrollDirection,
    markAutoScrolling,
    resetUserScrolled,
    checkAtEnd,
  };
}
