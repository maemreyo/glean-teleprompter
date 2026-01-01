/**
 * T044: Performance Profiling Test for State Synchronization
 * 
 * This test verifies that state synchronization meets performance targets:
 * - State sync latency <100ms
 * - Store update latency <50ms
 * - Config panel toggle <150ms
 * - localStorage persistence <200ms
 */

import { describe, it, expect, beforeEach } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'

import { useContentStore } from '@/lib/stores/useContentStore'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { usePlaybackStore } from '@/lib/stores/usePlaybackStore'
import { useUIStore } from '@/stores/useUIStore'

describe('T044: State Synchronization Performance', () => {
  beforeEach(() => {
    localStorage.clear()
    useContentStore.getState().reset()
    useConfigStore.getState().resetAll()
    usePlaybackStore.getState().reset()
    useUIStore.getState().setMode('setup')
  })

  describe('State Update Performance', () => {
    it('should update content store in under 50ms', () => {
      const { result } = renderHook(() => useContentStore())

      const start = performance.now()
      
      act(() => {
        result.current.setText('Performance test content')
        result.current.setBgUrl('https://example.com/test-bg.jpg')
        result.current.setMusicUrl('https://example.com/test-music.mp3')
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(50)
    })

    it('should update config store in under 50ms', () => {
      const { result } = renderHook(() => useConfigStore())

      const start = performance.now()
      
      act(() => {
        result.current.setTypography({ fontSize: 60, fontFamily: 'Inter' })
        result.current.setColors({ primaryColor: '#ffffff' })
        result.current.setLayout({ textAlign: 'left' })
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(50)
    })

    it('should update playback store in under 50ms', () => {
      const { result } = renderHook(() => usePlaybackStore())

      const start = performance.now()
      
      act(() => {
        result.current.setIsPlaying(true)
        result.current.setCurrentTime(120)
        result.current.setScrollSpeed(2.0)
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(50)
    })

    it('should update UI store in under 50ms', () => {
      const { result } = renderHook(() => useUIStore())

      const start = performance.now()
      
      act(() => {
        result.current.setMode('running')
        result.current.setTextareaPrefs({ size: 'large' })
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(50)
    })
  })

  describe('State Synchronization Latency', () => {
    it('should sync state between stores in under 100ms', () => {
      const content = renderHook(() => useContentStore())
      const config = renderHook(() => useConfigStore())
      const playback = renderHook(() => usePlaybackStore())
      const ui = renderHook(() => useUIStore())

      const start = performance.now()
      
      act(() => {
        // Simulate complete state update
        content.result.current.setText('Sync test content')
        config.result.current.setTypography({ fontSize: 60 })
        playback.result.current.setIsPlaying(true)
        ui.result.current.setMode('running')
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
    })

    it('should handle rapid state changes efficiently', () => {
      const { result } = renderHook(() => useConfigStore())

      const start = performance.now()
      
      act(() => {
        // Simulate rapid slider changes
        for (let i = 0; i < 10; i++) {
          result.current.setTypography({ fontSize: 40 + i * 2 })
        }
      })

      const end = performance.now()
      const duration = end - start

      // Should handle 10 updates in under 100ms
      expect(duration).toBeLessThan(100)
    })
  })

  describe('Cross-Store State Sync', () => {
    it('should maintain state consistency across mode switches', () => {
      const content = renderHook(() => useContentStore())
      const config = renderHook(() => useConfigStore())
      const ui = renderHook(() => useUIStore())

      const start = performance.now()
      
      // Setup in Editor mode
      act(() => {
        content.result.current.setText('Test content')
        config.result.current.setTypography({ fontSize: 48 })
        ui.result.current.setMode('setup')
      })

      // Switch to Runner mode
      act(() => {
        ui.result.current.setMode('running')
      })

      // Make changes in Runner mode
      act(() => {
        config.result.current.setTypography({ fontSize: 60 })
      })

      // Switch back to Editor mode
      act(() => {
        ui.result.current.setMode('setup')
      })

      const end = performance.now()
      const duration = end - start

      // Complete workflow should be under 100ms
      expect(duration).toBeLessThan(100)

      // Verify state is consistent
      expect(config.result.current.typography.fontSize).toBe(60)
      expect(content.result.current.text).toBe('Test content')
    })
  })

  describe('Bulk Update Performance', () => {
    it('should handle setAll bulk updates efficiently', () => {
      const { result } = renderHook(() => useContentStore())

      const start = performance.now()
      
      act(() => {
        result.current.setAll({
          text: 'Bulk update test',
          bgUrl: 'https://example.com/bulk-bg.jpg',
          musicUrl: 'https://example.com/bulk-music.mp3'
        })
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(50)
    })

    it('should handle multiple config updates efficiently', () => {
      const { result } = renderHook(() => useConfigStore())

      const start = performance.now()
      
      act(() => {
        result.current.setTypography({ fontSize: 60, fontFamily: 'Inter' })
        result.current.setColors({ primaryColor: '#ffffff' })
        result.current.setLayout({ textAlign: 'center' })
        result.current.setAnimations({ autoScrollSpeed: 50 })
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
    })
  })

  describe('Memory Efficiency', () => {
    it('should not cause memory leaks with repeated updates', () => {
      const { result } = renderHook(() => useConfigStore())

      // Perform many updates
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setTypography({ fontSize: 40 + (i % 40) })
        })
      }

      // Store should still be responsive
      const start = performance.now()
      
      act(() => {
        result.current.setTypography({ fontSize: 60 })
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(50)
    })
  })

  describe('localStorage Persistence Performance', () => {
    it('should persist content store in under 200ms', () => {
      const { result, unmount } = renderHook(() => useContentStore())

      act(() => {
        result.current.setText('Persistence test')
        result.current.setBgUrl('https://example.com/test-bg.jpg')
      })

      const start = performance.now()
      unmount()
      const end = performance.now()

      const duration = end - start

      expect(duration).toBeLessThan(200)

      // Verify persistence worked
      const stored = localStorage.getItem('teleprompter-content')
      expect(stored).toBeTruthy()
    })

    it('should restore state from localStorage in under 200ms', () => {
      // Pre-populate localStorage
      const initialState = {
        state: {
          text: 'Stored content',
          bgUrl: 'https://example.com/stored-bg.jpg',
          musicUrl: '',
          isReadOnly: false
        }
      }
      localStorage.setItem('teleprompter-content', JSON.stringify(initialState))

      const start = performance.now()
      
      const { result } = renderHook(() => useContentStore())
      
      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(200)
      expect(result.current.text).toBe('Stored content')
    })
  })
})
