/**
 * Unit tests for usePlaybackStore
 * T013: [US1] Unit test for usePlaybackStore actions
 * Created for 007-unified-state-architecture
 */

import { renderHook, act } from '@testing-library/react'
import { usePlaybackStore } from '@/lib/stores/usePlaybackStore'

describe('usePlaybackStore', () => {
  describe('Initial State', () => {
    it('should have default isPlaying as false', () => {
      const { result } = renderHook(() => usePlaybackStore())
      expect(result.current.isPlaying).toBe(false)
    })

    it('should have default currentTime as 0', () => {
      const { result } = renderHook(() => usePlaybackStore())
      expect(result.current.currentTime).toBe(0)
    })

    it('should have default scrollSpeed as 1', () => {
      const { result } = renderHook(() => usePlaybackStore())
      expect(result.current.scrollSpeed).toBe(1)
    })
  })

  describe('setIsPlaying action', () => {
    it('should update isPlaying to true', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setIsPlaying(true)
      })

      expect(result.current.isPlaying).toBe(true)
    })

    it('should update isPlaying to false', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setIsPlaying(true)
        result.current.setIsPlaying(false)
      })

      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('togglePlaying action', () => {
    it('should toggle from false to true', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.togglePlaying()
      })

      expect(result.current.isPlaying).toBe(true)
    })

    it('should toggle from true to false', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setIsPlaying(true)
        result.current.togglePlaying()
      })

      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('setCurrentTime action', () => {
    it('should update currentTime', () => {
      const { result } = renderHook(() => usePlaybackStore())
      const newTime = 100

      act(() => {
        result.current.setCurrentTime(newTime)
      })

      expect(result.current.currentTime).toBe(newTime)
    })

    it('should accept 0 as valid time', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setCurrentTime(50)
        result.current.setCurrentTime(0)
      })

      expect(result.current.currentTime).toBe(0)
    })
  })

  describe('advanceTime action', () => {
    it('should advance time by delta', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setCurrentTime(10)
        result.current.advanceTime(5)
      })

      expect(result.current.currentTime).toBe(15)
    })

    it('should not go below 0 when advancing negative delta', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setCurrentTime(2)
        result.current.advanceTime(-5)
      })

      expect(result.current.currentTime).toBe(0)
    })

    it('should handle negative delta when at 0', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.advanceTime(-10)
      })

      expect(result.current.currentTime).toBe(0)
    })
  })

  describe('setScrollSpeed action', () => {
    it('should update scrollSpeed', () => {
      const { result } = renderHook(() => usePlaybackStore())
      const newSpeed = 5

      act(() => {
        result.current.setScrollSpeed(newSpeed)
      })

      expect(result.current.scrollSpeed).toBe(newSpeed)
    })
  })

  describe('reset action', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setIsPlaying(true)
        result.current.setCurrentTime(100)
        result.current.setScrollSpeed(5)
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.currentTime).toBe(0)
      expect(result.current.scrollSpeed).toBe(1)
    })
  })

  describe('Runtime-only behavior', () => {
    it('should not persist to localStorage', () => {
      const { result, unmount } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setIsPlaying(true)
        result.current.setCurrentTime(50)
        result.current.setScrollSpeed(3)
      })

      unmount()

      // PlaybackStore should not persist to localStorage
      // Check that no teleprompter-playback key exists
      const playbackData = localStorage.getItem('teleprompter-playback')
      expect(playbackData).toBeNull()
    })

    it('should start fresh on each mount', () => {
      const { result: firstHook, unmount: unmountFirst } = renderHook(() => usePlaybackStore())

      act(() => {
        firstHook.current.setIsPlaying(true)
        firstHook.current.setCurrentTime(100)
        firstHook.current.setScrollSpeed(5)
      })

      unmountFirst()

      // Create new hook instance
      const { result: secondHook } = renderHook(() => usePlaybackStore())

      // Should have default values, not previous values
      expect(secondHook.current.isPlaying).toBe(false)
      expect(secondHook.current.currentTime).toBe(0)
      expect(secondHook.current.scrollSpeed).toBe(1)
    })
  })

  describe('Derived state behavior', () => {
    it('should correctly reflect paused state when not playing', () => {
      const { result } = renderHook(() => usePlaybackStore())

      // isPaused = !isPlaying
      const isPaused = !result.current.isPlaying
      expect(isPaused).toBe(true)
    })

    it('should correctly reflect playing state when playing', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setIsPlaying(true)
      })

      const isPaused = !result.current.isPlaying
      expect(isPaused).toBe(false)
    })

    it('should correctly reflect hasStarted when currentTime > 0', () => {
      const { result } = renderHook(() => usePlaybackStore())

      act(() => {
        result.current.setCurrentTime(10)
      })

      // hasStarted = currentTime > 0
      const hasStarted = result.current.currentTime > 0
      expect(hasStarted).toBe(true)
    })
  })
})
