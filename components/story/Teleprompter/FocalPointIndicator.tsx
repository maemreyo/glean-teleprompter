"use client";

/**
 * Focal Point Indicator Component
 *
 * Displays a yellow horizontal line indicating the optimal reading position.
 * Positioned at 33% from top (38% with safe area).
 * Includes tooltip for user clarity.
 *
 * @feature 012-standalone-story
 * @feature 014-teleprompter-preview-sync
 */

import { useSafeArea } from '@/lib/story/hooks/useSafeArea';
import { useState } from 'react';

interface FocalPointIndicatorProps {
  className?: string;
  /** Focal point position (0-100), overrides default if provided */
  focalPoint?: number;
  /** Whether to hide tooltip (for playback mode) */
  hideTooltip?: boolean;
}

const FOCAL_POINT_BASE = 33; // % from top
const FOCAL_POINT_WITH_SAFE_AREA = 38; // % from top with safe area

/**
 * Yellow focal point indicator line with tooltip
 */
export function FocalPointIndicator({
  className = '',
  focalPoint: focalPointProp,
  hideTooltip = false
}: FocalPointIndicatorProps) {
  const { top, hasSafeArea } = useSafeArea();
  const [showTooltip, setShowTooltip] = useState(false);

  // Use provided focal point or calculate default based on safe area
  const hasTopInset = top > 0;
  const focalPointVh = focalPointProp !== undefined
    ? focalPointProp
    : (hasTopInset ? FOCAL_POINT_WITH_SAFE_AREA : FOCAL_POINT_BASE);

  const tooltipText = hideTooltip
    ? ''
    : `Focal Point: ${Math.round(focalPointVh)}% - Optimal reading area during recording`;

  return (
    <div
      className={`absolute left-0 right-0 h-0.5 bg-yellow-400 opacity-80 group ${className}`}
      style={{
        top: `${focalPointVh}vh`,
        backgroundImage: 'linear-gradient(to right, transparent, #facc15 10%, #facc15 90%, transparent)',
      }}
      role="presentation"
      aria-label="Focal point indicator"
      onMouseEnter={() => !hideTooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => !hideTooltip && setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={hideTooltip ? -1 : 0}
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-50 animate-pulse" />
      
      {/* Dashed line overlay for enhanced visibility */}
      <div
        className="absolute inset-0 border-t border-dashed border-yellow-300 opacity-60"
        style={{ backgroundSize: '20px 1px' }}
      />
      
      {/* Tooltip */}
      {!hideTooltip && showTooltip && (
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-12 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none"
          role="tooltip"
        >
          {tooltipText}
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
        </div>
      )}
      
      {/* Position label (shown when near indicator) */}
      {focalPointProp !== undefined && (
        <div className="absolute right-2 -top-5 bg-yellow-400 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {Math.round(focalPointProp)}%
        </div>
      )}
    </div>
  );
}
