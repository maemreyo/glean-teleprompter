/**
 * Story Viewer Component
 *
 * Main component for displaying stories with slide navigation,
 * progress bars, and transitions. Implements the core story viewing experience.
 *
 * Performance optimizations (T092):
 * - Memoized to prevent unnecessary re-renders
 * - Optimized progress updates
 * - WillUnmount cleanup
 *
 * @feature 012-standalone-story
 */

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { useStoryNavigation } from '@/lib/story/hooks/useStoryNavigation';
import { StoryProgressBar } from './StoryProgressBar';
import { SlideContainer } from './SlideContainer';
import type { StoryScript } from '@/lib/story/types';

export interface StoryViewerProps {
  story: StoryScript;
}

/**
 * Pause indicator component - memoized for performance
 */
const PauseIndicator = memo(function PauseIndicator() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="rounded-full bg-black/70 p-4">
        <p className="text-center text-sm text-white">
          Paused • Tap to resume
        </p>
      </div>
    </div>
  );
});

/**
 * Main story viewer component
 *
 * Memoized to prevent re-renders when story data hasn't changed (T092)
 */
export const StoryViewer = memo(function StoryViewer({
  story
}: StoryViewerProps): React.ReactElement {
  const slides = useMemo(() => story.slides, [story.slides]);
  const totalSlides = slides.length;

  // Get navigation state from store
  const { currentSlideIndex, isPaused, slideProgress, setSlideProgress } = useStoryStore();

  // Track actual slide progress based on duration and pause state
  const [actualProgress, setActualProgress] = useState(0);

  // Memoize current slide to prevent unnecessary recalculations
  const currentSlide = useMemo(
    () => slides[currentSlideIndex] || null,
    [slides, currentSlideIndex]
  );

  // Update slide progress for time-based slides
  useEffect(() => {
    // Only track progress for time-based slides (not teleprompter or manual)
    if (
      isPaused ||
      !currentSlide ||
      currentSlide.type === 'teleprompter' ||
      currentSlide.duration === 'manual'
    ) {
      return;
    }

    const duration = currentSlide.duration;
    const startTime = Date.now();

    // Optimize interval timing to align with browser paint cycles (T092)
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setActualProgress(progress);
      setSlideProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, [currentSlide, isPaused, setSlideProgress]);

  // Memoize navigation handlers to prevent recreating on every render (T092)
  const onSlideChange = useCallback((index: number) => {
    // Reset progress when changing slides
    setActualProgress(0);
    setSlideProgress(0);
  }, [setSlideProgress]);

  const navigationParams = useMemo(
    () => ({
      totalSlides,
      currentSlide,
      onSlideChange,
      onPauseChange: () => {
        // Progress is handled by the effect above
      },
    }),
    [totalSlides, currentSlide, onSlideChange]
  );

  const { handleTap } = useStoryNavigation(navigationParams);

  // Memoize slides rendering to only update when current slide changes (T092)
  const slidesElements = useMemo(
    () => slides.map((slide, index) => (
      <SlideContainer
        key={slide.id}
        slide={slide}
        index={index}
        isCurrent={index === currentSlideIndex}
      />
    )),
    [slides, currentSlideIndex]
  );

  return (
    <div
      className="story-viewer relative h-full w-full overflow-hidden bg-black touch-manipulation-none"
      onClick={handleTap}
      style={{
        // GPU acceleration for smooth rendering (T092)
        transform: 'translateZ(0)',
        willChange: 'contents',
      }}
    >
      {/* Progress bars */}
      <StoryProgressBar
        story={story}
        currentIndex={currentSlideIndex}
        slideProgress={actualProgress}
        isPaused={isPaused}
      />

      {/* Slides */}
      <div className="relative h-full w-full">
        {slidesElements}
      </div>

      {/* Pause indicator when paused */}
      {isPaused && <PauseIndicator />}
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if story data actually changed
  return prevProps.story.id === nextProps.story.id &&
         prevProps.story.slides.length === nextProps.story.slides.length;
});
