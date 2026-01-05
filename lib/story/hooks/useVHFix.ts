"use client";

/**
 * Viewport Height Fix Hook
 *
 * Fix mobile viewport height issues by setting --vh CSS custom property.
 * Addresses address bar overlap on mobile browsers.
 *
 * @feature 012-standalone-story
 */

import { useEffect } from 'react';

/**
 * Hook to fix mobile viewport height issues
 * 
 * On mobile browsers, the address bar can hide/show and affect viewport height.
 * This hook sets a --vh custom property that accounts for the actual visible height.
 * 
 * @example
 * ```css
 * .story-container {
 *   height: 100vh;
 *   height: calc(var(--vh, 1vh) * 100);
 * }
 * ```
 */
export function useVHFix(): void {
  useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial value
    setVH();

    // Update on resize and orientation change
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);
}
