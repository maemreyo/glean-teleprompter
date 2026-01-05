/**
 * Teleprompter Hooks Index
 *
 * Exports all teleprompter-related hooks for easy importing.
 *
 * @feature 012-standalone-story
 */

// Main scroll hook (composes the smaller hooks)
export { useTeleprompterScroll } from './useTeleprompterScroll';

// Extracted hooks for more granular use
export { useTeleprompterFPS } from './useTeleprompterFPS';
export { useTeleprompterScrollDetection } from './useTeleprompterScrollDetection';
export { useTeleprompterFontSize } from './useTeleprompterFontSize';

// Other teleprompter hooks
export { useWakeLock } from './useWakeLock';
export { useKeyboardShortcuts } from './useKeyboardShortcuts';
export { useOrientationChange } from './useOrientationChange';
export { useProgressPersistence } from './useProgressPersistence';
export { useSafeArea } from './useSafeArea';
export { useStoryNavigation } from './useStoryNavigation';
export { useVHFix } from './useVHFix';

// Types
export type {
  UseTeleprompterScrollOptions,
  UseTeleprompterScrollReturn,
} from './useTeleprompterScroll';

export type {
  UseTeleprompterFPSReturn,
  FPSMetrics,
} from './useTeleprompterFPS';

export type {
  UseTeleprompterScrollDetectionReturn,
  ScrollDirection,
} from './useTeleprompterScrollDetection';

export type {
  UseTeleprompterFontSizeReturn,
} from './useTeleprompterFontSize';
