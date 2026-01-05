/**
 * Teleprompter Store
 * 
 * Zustand store for teleprompter scroll state.
 * Manages scrolling behavior, font settings, mirror mode, and scroll position.
 * 
 * @feature 012-standalone-story
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TeleprompterStore } from '@/lib/story/types';

/**
 * Persisted state structure for localStorage
 */
interface PersistedTeleprompterData {
  scrollSpeed: number;
  fontSize: number;
  isMirrored: boolean;
}

/**
 * Default values for teleprompter state
 */
const DEFAULT_SCROLL_SPEED = 1.5;
const DEFAULT_FONT_SIZE = 28;

/**
 * Teleprompter Store with localStorage persistence
 * 
 * State persists across page reloads to remember user preferences.
 * Scroll position and isScrolling are NOT persisted as they're runtime-only.
 */
export const useTeleprompterStore = create<TeleprompterStore>()(
  persist(
    (set) => ({
      // Initial state
      scrollSpeed: DEFAULT_SCROLL_SPEED,
      fontSize: DEFAULT_FONT_SIZE,
      isScrolling: false,
      isMirrored: false,
      scrollPosition: 0,
      scrollDepth: 0,

      // Actions
      setScrollSpeed: (speed) => set({ scrollSpeed: speed }),

      setFontSize: (size) => set({ fontSize: size }),

      startScrolling: () => set({ isScrolling: true }),

      stopScrolling: () => set({ isScrolling: false }),

      toggleMirror: () => set((state) => ({ isMirrored: !state.isMirrored })),

      updateScrollPosition: (position, depth) => set({
        scrollPosition: position,
        scrollDepth: depth,
      }),

      reset: () => set({
        scrollSpeed: DEFAULT_SCROLL_SPEED,
        fontSize: DEFAULT_FONT_SIZE,
        isScrolling: false,
        isMirrored: false,
        scrollPosition: 0,
        scrollDepth: 0,
      }),
    }),
    {
      name: 'teleprompter-settings',
      version: 1,
      partialize: (state): PersistedTeleprompterData => ({
        scrollSpeed: state.scrollSpeed,
        fontSize: state.fontSize,
        isMirrored: state.isMirrored,
      }),
    }
  )
);
