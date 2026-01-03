/**
 * useReducedMotion - Custom hook to detect user's reduced motion preference
 *
 * Respects the `prefers-reduced-motion` media query for accessibility.
 * Use this to conditionally disable animations for users who prefer reduced motion.
 *
 * @returns boolean indicating if the user prefers reduced motion
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * <motion.div
 *   animate={prefersReducedMotion ? {} : { rotate: 360 }}
 * />
 * ```
 *
 * @feature 011-music-player-widget
 * @task T034
 */

import { useMediaQuery } from '@/hooks/useMediaQuery';

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
