/**
 * Teleprompter Slide Component
 * 
 * Main component for teleprompter slide type.
 * Integrates auto-scrolling, focal point indicator, control panel,
 * and progress synchronization.
 * 
 * @feature 012-standalone-story
 */

import { useCallback, useRef } from 'react';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import { useTeleprompterScroll } from '@/lib/story/hooks/useTeleprompterScroll';
import { TeleprompterContent } from '../Teleprompter/TeleprompterContent';
import { TeleprompterControls } from '../Teleprompter/TeleprompterControls';
import type { TeleprompterSlide as TeleprompterSlideType } from '@/lib/story/types';

interface TeleprompterSlideProps {
  slide: TeleprompterSlideType;
  slideIndex: number;
  totalSlides: number;
  onComplete?: () => void;
  className?: string;
}

/**
 * Teleprompter slide with auto-scrolling and controls
 */
export function TeleprompterSlide({
  slide,
  slideIndex,
  totalSlides,
  onComplete,
  className = '',
}: TeleprompterSlideProps) {
  const hasNextSlide = slideIndex < totalSlides - 1;
  const { setProgressOverride, setSlideProgress } = useStoryStore();

  /**
   * Handle scroll progress updates
   */
  const handleScrollProgress = useCallback(
    (depth: number) => {
      // Update progress bar with scroll depth (not time-based)
      setProgressOverride(depth);
      setSlideProgress(depth);
    },
    [setProgressOverride, setSlideProgress]
  );

  /**
   * Handle scroll completion
   */
  const handleScrollComplete = useCallback(() => {
    setSlideProgress(1); // Mark as 100% complete

    if (hasNextSlide) {
      // Don't auto-advance - wait for user to tap "Skip to next"
      // This prevents accidental advancement
    } else {
      // Last slide - mark story complete
      onComplete?.();
    }
  }, [hasNextSlide, setSlideProgress, onComplete]);

  /**
   * Create a ref for the scroll container
   * Note: The ref is managed here but the actual scrolling is handled
   * by TeleprompterContent which receives the callbacks
   */
  const containerRef = useRef<HTMLElement>(null);

  /**
   * Get scroll hook with proper ref initialization
   */
  const { toggleScrolling } = useTeleprompterScroll({
    containerRef,
    onScrollProgress: handleScrollProgress,
    onScrollComplete: handleScrollComplete,
  });

  /**
   * Handle tap to show controls (not to advance slide)
   * This prevents accidental slide advancement during reading
   */
  const handleTap = useCallback(() => {
    // Controls are shown by tap in TeleprompterControls component
    // This handler just prevents event bubbling
  }, []);

  return (
    <div
      className={`relative w-full h-full bg-black ${className}`}
      onClick={handleTap}
      role="article"
      aria-label={`Teleprompter slide ${slideIndex + 1} of ${totalSlides}`}
    >
      {/* Teleprompter content area */}
      <TeleprompterContent
        content={slide.content}
        onScrollProgress={handleScrollProgress}
        onScrollComplete={handleScrollComplete}
        className="absolute inset-0"
      />

      {/* Floating control panel */}
      <TeleprompterControls
        onToggleScrolling={toggleScrolling}
        hasNextSlide={hasNextSlide}
        className="absolute inset-x-0 bottom-0 z-20"
      />
    </div>
  );
}
