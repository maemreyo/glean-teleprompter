/**
 * Story Viewer Component
 *
 * Main component for displaying stories with slide navigation,
 * progress bars, and transitions. Implements the core story viewing experience.
 *
 * @feature 012-standalone-story
 */

import React, { useEffect, useState } from 'react';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { useStoryNavigation } from '@/lib/story/hooks/useStoryNavigation';
import { StoryProgressBar } from './StoryProgressBar';
import { SlideContainer } from './SlideContainer';
import type { StoryScript } from '@/lib/story/types';

export interface StoryViewerProps {
  story: StoryScript;
}

/**
 * Main story viewer component
 */
export function StoryViewer({ story }: StoryViewerProps): React.ReactElement {
  const slides = story.slides;
  const totalSlides = slides.length;

  // Get navigation state from store
  const { currentSlideIndex, isPaused, slideProgress, setSlideProgress } = useStoryStore();

  // Track actual slide progress based on duration and pause state
  const [actualProgress, setActualProgress] = useState(0);

  // Update slide progress for time-based slides
  useEffect(() => {
    const currentSlide = slides[currentSlideIndex];
    
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

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setActualProgress(progress);
      setSlideProgress(progress);
    }, 100);

    return () => clearInterval(interval);
  }, [currentSlideIndex, isPaused, slides, setSlideProgress]);

  // Navigation handlers
  const { handleTap, goToNextSlide, goToPreviousSlide } = useStoryNavigation({
    totalSlides,
    currentSlide: slides[currentSlideIndex],
    onSlideChange: (index) => {
      // Reset progress when changing slides
      setActualProgress(0);
      setSlideProgress(0);
    },
    onPauseChange: () => {
      // Progress is handled by the effect above
    },
  });

  return (
    <div
      className="story-viewer relative h-full w-full overflow-hidden bg-black touch-manipulation-none"
      onClick={handleTap}
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
        {slides.map((slide, index) => (
          <SlideContainer
            key={slide.id}
            slide={slide}
            index={index}
            isCurrent={index === currentSlideIndex}
          />
        ))}
      </div>

      {/* Pause indicator when paused */}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-full bg-black/70 p-4">
            <p className="text-center text-sm text-white">
              Paused • Tap to resume
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
