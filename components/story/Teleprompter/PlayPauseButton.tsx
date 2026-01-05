"use client";

/**
 * Play/Pause Button Component
 *
 * Toggles teleprompter auto-scrolling with smooth deceleration on pause.
 *
 * @feature 012-standalone-story
 */

import { useCallback } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';

interface PlayPauseButtonProps {
  onToggleScrolling: () => void;
  className?: string;
}

/**
 * Play/pause button for teleprompter scrolling
 */
export function PlayPauseButton({
  onToggleScrolling,
  className = '',
}: PlayPauseButtonProps) {
  const { isScrolling } = useTeleprompterStore();

  const handleClick = useCallback(() => {
    onToggleScrolling();
  }, [onToggleScrolling]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full h-12 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold rounded-lg transition-colors ${className}`}
      aria-label={isScrolling ? 'Pause scrolling' : 'Start scrolling'}
      aria-pressed={isScrolling}
    >
      {isScrolling ? (
        <>
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
          Pause
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          Start
        </>
      )}
    </button>
  );
}
