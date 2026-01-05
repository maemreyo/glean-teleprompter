/**
 * Speed Slider Component
 * 
 * Allows user to adjust teleprompter scrolling speed from 0 to 5.
 * 
 * @feature 012-standalone-story
 */

import { useCallback } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';
import { calculateWPM } from '@/lib/story/utils/scrollUtils';

interface SpeedSliderProps {
  className?: string;
}

const MIN_SPEED = 0;
const MAX_SPEED = 5;
const STEP = 0.1;

/**
 * Speed slider control for teleprompter scrolling
 */
export function SpeedSlider({ className = '' }: SpeedSliderProps) {
  const { scrollSpeed, setScrollSpeed } = useTeleprompterStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSpeed = parseFloat(e.target.value);
      setScrollSpeed(newSpeed);
    },
    [setScrollSpeed]
  );

  const wpm = calculateWPM(scrollSpeed);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="teleprompter-speed"
          className="text-sm font-medium text-white"
        >
          Speed
        </label>
        <span className="text-sm text-gray-300">
          {wpm} WPM
        </span>
      </div>
      <input
        id="teleprompter-speed"
        type="range"
        min={MIN_SPEED}
        max={MAX_SPEED}
        step={STEP}
        value={scrollSpeed}
        onChange={handleChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
        aria-label="Scroll speed"
        aria-valuemin={MIN_SPEED}
        aria-valuemax={MAX_SPEED}
        aria-valuenow={scrollSpeed}
        aria-valuetext={`${scrollSpeed} (${wpm} words per minute)`}
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>Slow</span>
        <span>{scrollSpeed.toFixed(1)}x</span>
        <span>Fast</span>
      </div>
    </div>
  );
}
