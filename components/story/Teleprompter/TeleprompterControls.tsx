/**
 * Teleprompter Controls Component
 *
 * Floating control panel with speed slider, font controls, mirror toggle,
 * and play/pause button. Auto-hides after 3 seconds of inactivity.
 *
 * Accessibility: ARIA labels (T108), WPM display (T111)
 *
 * @feature 012-standalone-story
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';
import { calculateWPM } from '@/lib/story/hooks/useKeyboardShortcuts';
import { SpeedSlider } from './SpeedSlider';
import { FontSizeControl } from './FontSizeControl';
import { MirrorToggle } from './MirrorToggle';
import { PlayPauseButton } from './PlayPauseButton';
import { SkipToNextButton } from './SkipToNextButton';

interface TeleprompterControlsProps {
  onToggleScrolling: () => void;
  hasNextSlide: boolean;
  className?: string;
}

const AUTO_HIDE_DELAY = 3000; // 3 seconds

/**
 * Floating control panel for teleprompter
 */
export function TeleprompterControls({
  onToggleScrolling,
  hasNextSlide,
  className = '',
}: TeleprompterControlsProps) {
  const { scrollSpeed, isScrolling } = useTeleprompterStore();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Calculate WPM for display (T111)
  const wpm = calculateWPM(scrollSpeed);

  /**
   * Reset auto-hide timer
   */
  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(true);

    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, AUTO_HIDE_DELAY);
  }, []);

  /**
   * Show controls on interaction
   */
  const handleInteraction = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  /**
   * Handle tap to show controls
   */
  const handleTap = useCallback(() => {
    setIsVisible((prev) => !prev);
    if (!isVisible) {
      resetTimer();
    }
  }, [isVisible, resetTimer]);

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      } ${className}`}
      onClick={handleTap}
      role="region"
      aria-label="Teleprompter controls"
      aria-live="polite"
    >
      <div
        className="max-w-md mx-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* WPM Display (T111) */}
        <div
          className="flex items-center justify-between text-white text-sm"
          role="status"
          aria-live="polite"
        >
          <span className="font-medium">Reading Speed</span>
          <span className="font-bold text-yellow-400" aria-label={`${wpm} words per minute`}>
            {wpm} WPM
          </span>
        </div>

        {/* Play/Pause Button */}
        <PlayPauseButton onToggleScrolling={onToggleScrolling} />

        {/* Speed Slider */}
        <SpeedSlider />

        {/* Font Size Control */}
        <FontSizeControl />

        {/* Mirror Toggle */}
        <MirrorToggle />

        {/* Skip to Next Button */}
        <SkipToNextButton hasNextSlide={hasNextSlide} />
        
        {/* Keyboard Shortcuts Hint (desktop only) */}
        <div className="hidden md:block text-xs text-white/60 text-center space-y-1" role="note" aria-label="Keyboard shortcuts">
          <div className="flex justify-center gap-4">
            <span><kbd className="px-1 bg-white/20 rounded">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1 bg-white/20 rounded">↑↓</kbd> Speed</span>
            <span><kbd className="px-1 bg-white/20 rounded">R</kbd> Reset</span>
          </div>
        </div>
      </div>
    </div>
  );
}
