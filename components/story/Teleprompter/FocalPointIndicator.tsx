"use client";

/**
 * Focal Point Indicator Component
 *
 * Displays a yellow horizontal line indicating the optimal reading position.
 * Positioned at 33% from top (38% with safe area).
 *
 * @feature 012-standalone-story
 */

import { useSafeArea } from '@/lib/story/hooks/useSafeArea';

interface FocalPointIndicatorProps {
  className?: string;
}

const FOCAL_POINT_BASE = 33; // % from top
const FOCAL_POINT_WITH_SAFE_AREA = 38; // % from top with safe area

/**
 * Yellow focal point indicator line
 */
export function FocalPointIndicator({ className = '' }: FocalPointIndicatorProps) {
  const { top, hasSafeArea } = useSafeArea();

  // Adjust focal point based on safe area
  const hasTopInset = top > 0;
  const focalPointVh = hasTopInset ? FOCAL_POINT_WITH_SAFE_AREA : FOCAL_POINT_BASE;

  return (
    <div
      className={`absolute left-0 right-0 h-0.5 bg-yellow-400 opacity-80 pointer-events-none ${className}`}
      style={{ top: `${focalPointVh}vh` }}
      role="presentation"
      aria-label="Focal point indicator"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-yellow-400 blur-sm opacity-50" />
    </div>
  );
}
