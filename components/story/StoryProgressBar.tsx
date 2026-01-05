"use client";

/**
 * Story Progress Bar Component
 *
 * Displays progress indicators at the top of the story viewer.
 * One bar per slide, animating from 0% to 100%.
 * Shows completed slides as filled and current slide as animating.
 *
 * @feature 012-standalone-story
 */

import React, { useEffect, useState } from 'react';
import type { StoryScript } from '@/lib/story/types';

export interface StoryProgressBarProps {
  story: StoryScript;
  currentIndex: number;
  slideProgress: number; // 0.0 to 1.0 for current slide
  isPaused: boolean;
}

/**
 * Render progress bars for all slides
 */
export function StoryProgressBar({
  story,
  currentIndex,
  slideProgress,
  isPaused,
}: StoryProgressBarProps): React.ReactElement | null {
  const { slides, showProgress } = story;

  // Animate progress for current slide
  const [animatedProgress, setAnimatedProgress] = useState(slideProgress);

  useEffect(() => {
    if (!isPaused) {
      setAnimatedProgress(slideProgress);
    }
  }, [slideProgress, isPaused]);

  // Don't render if progress bars are disabled
  if (!showProgress) {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 px-2 pt-2">
      {slides.map((slide, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        // For completed slides: 100% filled
        // For current slide: animated progress
        // For future slides: 0% filled
        const progress = isCompleted
          ? 1
          : isCurrent
            ? animatedProgress
            : 0;

        return (
          <div
            key={slide.id}
            className="relative h-1 flex-1 rounded-full bg-white/30"
            aria-label={`Slide ${index + 1} progress`}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Progress fill */}
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
