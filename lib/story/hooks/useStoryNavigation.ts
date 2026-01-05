/**
 * Story Navigation Hook
 *
 * Handles tap zone navigation, slide advancement, and pause/resume logic.
 * Implements tap zones: left (previous), right (next), center (pause/resume).
 * Supports auto-advance for time-based slides and disables navigation for teleprompter slides.
 *
 * @feature 012-standalone-story
 */

import { useCallback, useEffect, useRef } from 'react';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import type { AnySlide } from '@/lib/story/types';

export interface NavigationHandlers {
  handleTap: (event: React.MouseEvent | React.TouchEvent) => void;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  togglePause: () => void;
}

export interface UseStoryNavigationOptions {
  /** Total number of slides in the story */
  totalSlides: number;
  /** Current slide being rendered */
  currentSlide?: AnySlide;
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;
  /** Callback when pause state changes */
  onPauseChange?: (isPaused: boolean) => void;
}

/**
 * Hook for story navigation logic
 *
 * @param options - Navigation options
 * @returns Navigation handlers and state
 *
 * @example
 * ```tsx
 * const { handleTap, goToNextSlide, goToPreviousSlide, togglePause } = useStoryNavigation({
 *   totalSlides: story.slides.length,
 *   currentSlide: story.slides[currentIndex],
 *   onSlideChange: (index) => console.log('Changed to slide', index),
 * });
 * ```
 */
export function useStoryNavigation(options: UseStoryNavigationOptions): NavigationHandlers {
  const { totalSlides, currentSlide, onSlideChange, onPauseChange } = options;
  
  const {
    currentSlideIndex,
    nextSlide,
    previousSlide,
    togglePause: storeTogglePause,
    isPaused,
  } = useStoryStore();

  // Track auto-advance timer
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Determine tap zone based on click/touch position
   * - Left 30%: Previous slide
   * - Right 30%: Next slide
   * - Center 40%: Pause/Resume (or do nothing for teleprompter)
   */
  const handleTap = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      // Disable tap navigation for teleprompter slides (FR-023, US5)
      if (currentSlide?.type === 'teleprompter') {
        return;
      }

      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      // Get X coordinate (works for both mouse and touch)
      let clientX: number;
      if ('touches' in event) {
        clientX = event.touches[0].clientX;
      } else {
        clientX = event.clientX;
      }

      const x = clientX - rect.left;
      const width = rect.width;

      // Center zone (40% of width)
      const isCenter = x > width * 0.3 && x < width * 0.7;

      if (isCenter) {
        // Center tap: toggle pause (FR-005)
        storeTogglePause();
        if (onPauseChange) {
          onPauseChange(!isPaused);
        }
        return;
      }

      // Right side (30%): Next slide
      if (x >= width * 0.7) {
        goToNextSlide();
        return;
      }

      // Left side (30%): Previous slide
      goToPreviousSlide();
    },
    [currentSlide, isPaused, storeTogglePause, onPauseChange]
  );

  /**
   * Navigate to next slide with bounds checking
   */
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      nextSlide();
      if (onSlideChange) {
        onSlideChange(currentSlideIndex + 1);
      }
    }
  }, [currentSlideIndex, totalSlides, nextSlide, onSlideChange]);

  /**
   * Navigate to previous slide with bounds checking
   */
  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      previousSlide();
      if (onSlideChange) {
        onSlideChange(currentSlideIndex - 1);
      }
    }
  }, [currentSlideIndex, previousSlide, onSlideChange]);

  /**
   * Toggle pause state
   */
  const togglePause = useCallback(() => {
    storeTogglePause();
    if (onPauseChange) {
      onPauseChange(!isPaused);
    }
  }, [isPaused, storeTogglePause, onPauseChange]);

  /**
   * Auto-advance logic for time-based slides (FR-009, FR-033)
   * Only applies to non-teleprompter slides with numeric duration
   */
  useEffect(() => {
    // Clear any existing timer
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

    // Don't auto-advance if:
    // - Story is paused
    // - Current slide is teleprompter (manual control only)
    // - Current slide has manual duration
    // - No current slide data
    if (
      isPaused ||
      !currentSlide ||
      currentSlide.type === 'teleprompter' ||
      currentSlide.duration === 'manual'
    ) {
      return;
    }

    // Auto-advance after slide duration
    const duration = currentSlide.duration;
    autoAdvanceTimerRef.current = setTimeout(() => {
      goToNextSlide();
    }, duration);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [currentSlide, isPaused, goToNextSlide, currentSlideIndex]);

  return {
    handleTap,
    goToNextSlide,
    goToPreviousSlide,
    togglePause,
  };
}
