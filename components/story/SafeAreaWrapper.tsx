"use client";

/**
 * Safe Area Wrapper Component
 *
 * Wraps content with safe area insets for notched devices.
 * Ensures content is not obscured by Dynamic Island, notches, or home indicators.
 *
 * @feature 012-standalone-story
 */

import React from 'react';
import { useSafeArea } from '@/lib/story/hooks/useSafeArea';

export interface SafeAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  horizontal?: boolean; // Apply padding to left/right instead of top/bottom
  minimumPadding?: string; // Minimum padding when no safe area (default: '2rem')
}

/**
 * Safe area wrapper component
 *
 * Applies CSS env() variables for safe area insets with fallback padding.
 *
 * @example
 * ```tsx
 * <SafeAreaWrapper>
 *   <p>Content with safe area padding</p>
 * </SafeAreaWrapper>
 *
 * <SafeAreaWrapper horizontal minimumPadding="1rem">
 *   <p>Content with horizontal safe area padding</p>
 * </SafeAreaWrapper>
 * ```
 */
export function SafeAreaWrapper({
  children,
  className = '',
  horizontal = false,
  minimumPadding = '2rem',
}: SafeAreaWrapperProps): React.JSX.Element {
  const safeArea = useSafeArea();

  // Build inline styles with safe area insets and minimum padding fallback
  const style: React.CSSProperties = horizontal
    ? {
        paddingLeft: `max(${minimumPadding}, env(safe-area-inset-left))`,
        paddingRight: `max(${minimumPadding}, env(safe-area-inset-right))`,
      }
    : {
        paddingTop: `max(${minimumPadding}, env(safe-area-inset-top))`,
        paddingBottom: `max(${minimumPadding}, env(safe-area-inset-bottom))`,
      };

  return (
    <div
      className={`safe-area-wrapper ${className}`}
      style={style}
      data-has-safe-area={safeArea.hasSafeArea}
    >
      {children}
    </div>
  );
}
