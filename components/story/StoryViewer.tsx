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
import { useProgressPersistence, type SavedProgress } from '@/lib/story/hooks/useProgressPersistence';
import { RestoreProgressDialog } from './RestoreProgressDialog';
import { StoryProgressBar } from './StoryProgressBar';
import { SlideContainer } from './SlideContainer';
import type { StoryScript } from '@/lib/story/types';
import equal from 'fast-deep-equal';

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
  const { currentSlideIndex, isPaused, slideProgress, setSlideProgress, goToSlide, reset: resetStory } = useStoryStore();

  // Track actual slide progress based on duration and pause state
  const [actualProgress, setActualProgress] = useState(0);

  // Restore progress dialog state
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedProgress, setSavedProgress] = useState<{ slideIndex: number } | null>(null);

  // Get the current slide ID for progress persistence
  const currentSlideId = useMemo(
    () => slides[currentSlideIndex]?.id || '',
    [slides, currentSlideIndex]
  );

  // Progress persistence hook - check for saved progress on mount
  const { loadProgress, clearProgress } = useProgressPersistence({
    slideId: currentSlideId,
    onLoad: useCallback((progress: SavedProgress) => {
      // Store the saved progress for the dialog
      const slideIndex = slides.findIndex(s => s.id === progress.slideId);
      if (slideIndex >= 0) {
        setSavedProgress({ slideIndex });
        setShowRestoreDialog(true);
      }
    }, [slides]),
  });

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

  // Check for saved progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      const slideIndex = slides.findIndex(s => s.id === saved.slideId);
      if (slideIndex >= 0) {
        setSavedProgress({ slideIndex });
        setShowRestoreDialog(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - loadProgress and slides intentionally omitted

  // Handle restore progress
  const handleRestore = useCallback(() => {
    if (savedProgress) {
      goToSlide(savedProgress.slideIndex);
    }
  }, [savedProgress, goToSlide]);

  // Handle start over
  const handleStartOver = useCallback(() => {
    resetStory();
    clearProgress();
  }, [resetStory, clearProgress]);

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
        totalSlides={totalSlides}
      />
    )),
    [slides, currentSlideIndex, totalSlides]
  );

  return (
    <div
      className="story-viewer relative h-full w-full overflow-hidden bg-black touch-manipulation-none"
      onClick={handleTap}
      style={{
        // GPU acceleration for smooth rendering (T092)
        transform: 'translateZ(0)',
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

      {/* Restore progress dialog */}
      <RestoreProgressDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        onRestore={handleRestore}
        onStartOver={handleStartOver}
        progress={savedProgress ? {
          slideId: slides[savedProgress.slideIndex]?.id || '',
          scrollRatio: 0,
          timestamp: Date.now(),
        } : null}
        totalSlides={totalSlides}
        currentSlideIndex={savedProgress?.slideIndex}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if story data actually changed
  // Check story ID, slides count, and deep equality of slide content
  // Using fast-deep-equal for performant deep comparison in hot path
  return prevProps.story.id === nextProps.story.id &&
         prevProps.story.slides.length === nextProps.story.slides.length &&
         equal(prevProps.story.slides, nextProps.story.slides);
});
