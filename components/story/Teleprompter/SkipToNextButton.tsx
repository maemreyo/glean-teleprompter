/**
 * Skip to Next Button Component
 * 
 * Explicit button to advance to the next slide from teleprompter mode.
 * Prevents accidental slide advancement during reading.
 * 
 * @feature 012-standalone-story
 */

import { useCallback } from 'react';
import { useStoryStore } from '@/lib/stores/useStoryStore';

interface SkipToNextButtonProps {
  hasNextSlide: boolean;
  className?: string;
}

/**
 * Button to explicitly advance to next slide
 */
export function SkipToNextButton({
  hasNextSlide,
  className = '',
}: SkipToNextButtonProps) {
  const { nextSlide } = useStoryStore();

  const handleClick = useCallback(() => {
    if (hasNextSlide) {
      nextSlide();
    }
  }, [hasNextSlide, nextSlide]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasNextSlide}
      className={`w-full h-10 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors ${className}`}
      aria-label="Skip to next slide"
      aria-disabled={!hasNextSlide}
    >
      Skip to Next
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}
