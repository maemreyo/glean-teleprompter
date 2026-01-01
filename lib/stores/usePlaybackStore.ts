import { create } from 'zustand'

/**
 * PlaybackStore - Manages runtime playback state
 *
 * Responsibilities:
 * - Track whether teleprompter is currently scrolling
 * - Track current playback position (time)
 * - Track current scroll velocity (runtime speed)
 *
 * Persistence: None (runtime-only state, no localStorage)
 * State resets on page refresh
 */

interface PlaybackStoreState {
  /** Whether teleprompter is currently scrolling/playing */
  isPlaying: boolean
  /** Current playback position in seconds */
  currentTime: number
  /**
   * Current runtime scroll velocity multiplier
   * This is separate from config.autoScrollSpeed
   * config.autoScrollSpeed defines the target speed
   * scrollSpeed tracks the actual current velocity
   */
  scrollSpeed: number
}

interface PlaybackStoreActions {
  /** Set the playing state */
  setIsPlaying: (playing: boolean) => void
  /** Toggle the playing state */
  togglePlaying: () => void
  /** Set the current playback time */
  setCurrentTime: (time: number) => void
  /** Advance the current time by a delta */
  advanceTime: (delta: number) => void
  /** Set the current scroll speed */
  setScrollSpeed: (speed: number) => void
  /** Reset all playback state to defaults */
  reset: () => void
}

type PlaybackStore = PlaybackStoreState & PlaybackStoreActions

export const usePlaybackStore = create<PlaybackStore>()((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTime: 0,
  scrollSpeed: 1,

  // Actions
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  togglePlaying: () => set((state) => ({
    isPlaying: !state.isPlaying
  })),

  setCurrentTime: (currentTime) => set({ currentTime }),

  advanceTime: (delta) => set((state) => ({
    currentTime: Math.max(0, state.currentTime + delta)
  })),

  setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),

  reset: () => set({
    isPlaying: false,
    currentTime: 0,
    scrollSpeed: 1
  })
}))
