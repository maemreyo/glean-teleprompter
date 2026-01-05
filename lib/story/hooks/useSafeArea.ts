"use client";

/**
 * Safe Area Detection Hook
 *
 * Detect safe area insets for notched devices (iPhone, Android).
 * Provides CSS env() values for padding adjustments.
 *
 * @feature 012-standalone-story
 */

import { useState, useEffect } from 'react';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
  hasSafeArea: boolean;
}

/**
 * Hook to detect and track safe area insets
 * 
 * @returns Current safe area insets
 * 
 * @example
 * ```tsx
 * const safeArea = useSafeArea();
 * 
 * <div style={{
 *   paddingTop: safeArea.hasSafeArea ? safeArea.top : '2rem',
 *   paddingBottom: safeArea.hasSafeArea ? safeArea.bottom : '2rem',
 * }}>
 *   {/* Content *\/}
 * </div>
 * ```
 */
export function useSafeArea(): SafeAreaInsets {
  const [safeArea, setSafeArea] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    hasSafeArea: false,
  });

  useEffect(() => {
    // Create a test element with env() values applied to read actual pixel values
    const measureElement = document.createElement('div');
    measureElement.style.position = 'fixed';
    measureElement.style.top = '0';
    measureElement.style.left = '0';
    measureElement.style.right = '0';
    measureElement.style.bottom = '0';
    measureElement.style.paddingTop = 'env(safe-area-inset-top)';
    measureElement.style.paddingBottom = 'env(safe-area-inset-bottom)';
    measureElement.style.paddingLeft = 'env(safe-area-inset-left)';
    measureElement.style.paddingRight = 'env(safe-area-inset-right)';
    measureElement.style.pointerEvents = 'none';
    measureElement.style.visibility = 'hidden';
    document.body.appendChild(measureElement);

    // Read the computed values from the element
    const updateSafeArea = () => {
      const computedStyle = window.getComputedStyle(measureElement);
      const top = parseInt(computedStyle.paddingTop || '0', 10);
      const bottom = parseInt(computedStyle.paddingBottom || '0', 10);
      const left = parseInt(computedStyle.paddingLeft || '0', 10);
      const right = parseInt(computedStyle.paddingRight || '0', 10);

      setSafeArea({
        top,
        bottom,
        left,
        right,
        hasSafeArea: top > 0 || bottom > 0 || left > 0 || right > 0,
      });
    };

    updateSafeArea();

    // Update on orientation change (safe areas can change when rotating)
    const handleOrientationChange = () => {
      requestAnimationFrame(updateSafeArea);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.body.removeChild(measureElement);
    };
  }, []);

  return safeArea;
}
