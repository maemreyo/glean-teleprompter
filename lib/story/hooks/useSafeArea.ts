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
    // Check if CSS env() is supported
    const testElement = document.createElement('div');
    testElement.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const hasEnvSupport = computedStyle.paddingTop !== 'env(safe-area-inset-top)';
    document.body.removeChild(testElement);

    if (hasEnvSupport) {
      // Use getComputedStyle to get actual values
      const updateSafeArea = () => {
        const rootStyle = window.getComputedStyle(document.documentElement);
        const top = parseInt(rootStyle.getPropertyValue('env(safe-area-inset-top)') || '0', 10);
        const bottom = parseInt(rootStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10);
        const left = parseInt(rootStyle.getPropertyValue('env(safe-area-inset-left)') || '0', 10);
        const right = parseInt(rootStyle.getPropertyValue('env(safe-area-inset-right)') || '0', 10);

        setSafeArea({
          top,
          bottom,
          left,
          right,
          hasSafeArea: top > 0 || bottom > 0 || left > 0 || right > 0,
        });
      };

      updateSafeArea();

      // Update on resize/orientation change
      const handleResize = () => {
        requestAnimationFrame(updateSafeArea);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }

    // Fallback for older browsers
    setSafeArea({ top: 0, bottom: 0, left: 0, right: 0, hasSafeArea: false });
  }, []);

  return safeArea;
}
