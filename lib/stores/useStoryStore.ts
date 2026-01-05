/**
 * Story Store
 * 
 * Zustand store for story navigation state.
 * Manages slide navigation, pause state, and slide progress.
 * 
 * @feature 012-standalone-story
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoryStore } from '@/lib/story/types';

/**
 * Persisted state structure for localStorage
 */
interface PersistedStoryData {
  currentSlideIndex: number;
  isPaused: boolean;
  slideProgress: number;
}

/**
 * Story Store with localStorage persistence
 * 
 * State persists across page reloads to allow recovery of reading position.
 * Direction is NOT persisted as it's only used for transition animations.
 */
export const useStoryStore = create<StoryStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSlideIndex: 0,
      direction: 0,
      isPaused: false,
      slideProgress: 0,
      progressOverride: null,

      // Actions
      nextSlide: () => set((state) => ({
        currentSlideIndex: state.currentSlideIndex + 1,
        direction: 1,
        slideProgress: 0, // Reset progress on slide change
      })),

      previousSlide: () => set((state) => ({
        currentSlideIndex: Math.max(0, state.currentSlideIndex - 1),
        direction: -1,
        slideProgress: 0, // Reset progress on slide change
      })),

      goToSlide: (index) => set((state) => ({
        currentSlideIndex: index,
        direction: index > state.currentSlideIndex ? 1 : index < state.currentSlideIndex ? -1 : 0,
        slideProgress: 0, // Reset progress on slide change
      })),

      togglePause: () => set((state) => ({
        isPaused: !state.isPaused,
      })),

      setSlideProgress: (progress) => set({
        slideProgress: progress,
      }),

      setProgressOverride: (override) => set({
        progressOverride: override,
      }),

      reset: () => set({
        currentSlideIndex: 0,
        direction: 0,
        isPaused: false,
        slideProgress: 0,
        progressOverride: null,
      }),
    }),
    {
      name: 'story-navigation',
      version: 1,
      partialize: (state): PersistedStoryData => ({
        currentSlideIndex: state.currentSlideIndex,
        isPaused: state.isPaused,
        slideProgress: state.slideProgress,
      }),
    }
  )
);
