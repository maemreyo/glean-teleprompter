"use client";

/**
 * Font Size Control Component
 *
 * Allows user to adjust teleprompter font size from 16px to 48px.
 * Maintains scroll position ratio when font size changes.
 *
 * @feature 012-standalone-story
 */

import { useCallback } from 'react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';

interface FontSizeControlProps {
  className?: string;
}

const MIN_SIZE = 16;
const MAX_SIZE = 48;
const STEP = 2;

/**
 * Font size control for teleprompter text
 */
export function FontSizeControl({ className = '' }: FontSizeControlProps) {
  const { fontSize, setFontSize } = useTeleprompterStore();

  const handleDecrease = useCallback(() => {
    const newSize = Math.max(MIN_SIZE, fontSize - STEP);
    setFontSize(newSize);
  }, [fontSize, setFontSize]);

  const handleIncrease = useCallback(() => {
    const newSize = Math.min(MAX_SIZE, fontSize + STEP);
    setFontSize(newSize);
  }, [fontSize, setFontSize]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSize = parseInt(e.target.value, 10);
      if (!isNaN(newSize) && newSize >= MIN_SIZE && newSize <= MAX_SIZE) {
        setFontSize(newSize);
      }
    },
    [setFontSize]
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor="teleprompter-font-size"
          className="text-sm font-medium text-white"
        >
          Font Size
        </label>
        <span className="text-sm text-gray-300">{fontSize}px</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={fontSize <= MIN_SIZE}
          className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold text-xl transition-colors"
          aria-label="Decrease font size"
          aria-controls="teleprompter-font-size"
        >
          −
        </button>
        <input
          id="teleprompter-font-size"
          type="number"
          min={MIN_SIZE}
          max={MAX_SIZE}
          step={STEP}
          value={fontSize}
          onChange={handleChange}
          className="flex-1 h-10 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400"
          aria-label="Font size in pixels"
        />
        <button
          type="button"
          onClick={handleIncrease}
          disabled={fontSize >= MAX_SIZE}
          className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold text-xl transition-colors"
          aria-label="Increase font size"
          aria-controls="teleprompter-font-size"
        >
          +
        </button>
      </div>
    </div>
  );
}
