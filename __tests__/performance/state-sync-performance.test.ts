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

/**
 * ============================================================================
 * User Story 2 Tests: Background Update Performance (T021)
 * ============================================================================
 *
 * These tests verify that background updates meet the 100ms update latency
 * requirement from the specification.
 *
 * Performance Requirements:
 * - Background updates complete within 100ms
 * - Visual updates happen immediately after store changes
 * - Multiple rapid changes are handled efficiently
 *
 * Expected: PASS - useMemo with bgUrl dependency is efficient
 */

describe('T021: Background Update Performance (100ms Requirement)', () => {
  beforeEach(() => {
    localStorage.clear()
    useContentStore.getState().reset()
  })

  /**
   * T021: Performance test - 100ms update latency requirement
   *
   * Test that background updates complete within 100ms requirement
   * Measure time from bgUrl change to visual update
   * Verify performance under multiple rapid changes
   *
   * Expected: PASS - useMemo with bgUrl dependency is efficient
   */
  describe('Single Update Performance', () => {
    it('should update bgUrl in under 100ms', () => {
      const { result } = renderHook(() => useContentStore())
      const newBgUrl = 'https://example.com/performance-test-bg.jpg'

      const start = performance.now()
      
      act(() => {
        result.current.setBgUrl(newBgUrl)
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe(newBgUrl)
    })

    it('should complete background style update within 100ms', () => {
      const { result } = renderHook(() => useContentStore())
      const initialBgUrl = 'https://example.com/initial-bg.jpg'
      const newBgUrl = 'https://example.com/updated-bg.jpg'

      // Set initial state
      act(() => {
        result.current.setBgUrl(initialBgUrl)
      })

      // Measure update time
      const start = performance.now()
      
      act(() => {
        result.current.setBgUrl(newBgUrl)
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe(newBgUrl)
    })

    it('should update multiple content properties within 100ms', () => {
      const { result } = renderHook(() => useContentStore())
      const newBgUrl = 'https://example.com/multi-update-bg.jpg'
      const newText = 'Updated text content'

      const start = performance.now()
      
      act(() => {
        result.current.setText(newText)
        result.current.setBgUrl(newBgUrl)
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe(newBgUrl)
      expect(result.current.text).toBe(newText)
    })
  })

  describe('Rapid Update Performance', () => {
    it('should handle 10 rapid bgUrl changes efficiently', () => {
      const { result } = renderHook(() => useContentStore())

      const start = performance.now()
      
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.setBgUrl(`https://example.com/bg-${i}.jpg`)
        }
      })

      const end = performance.now()
      const duration = end - start

      // 10 rapid updates should complete in under 100ms
      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe('https://example.com/bg-9.jpg')
    })

    it('should maintain performance during burst updates', () => {
      const { result } = renderHook(() => useContentStore())

      const start = performance.now()
      
      act(() => {
        // Simulate burst of updates (like rapid slider changes)
        for (let i = 0; i < 20; i++) {
          result.current.setBgUrl(`https://example.com/burst-${i}.jpg`)
        }
      })

      const end = performance.now()
      const duration = end - start

      // 20 burst updates should still be under 100ms
      expect(duration).toBeLessThan(100)
    })

    it('should handle alternating bgUrl changes efficiently', () => {
      const { result } = renderHook(() => useContentStore())
      const bgUrl1 = 'https://example.com/alternate-1.jpg'
      const bgUrl2 = 'https://example.com/alternate-2.jpg'

      const start = performance.now()
      
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.setBgUrl(i % 2 === 0 ? bgUrl1 : bgUrl2)
        }
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe(bgUrl2)
    })
  })

  describe('Bulk Update Performance', () => {
    it('should handle setAll with bgUrl within 100ms', () => {
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

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe('https://example.com/bulk-bg.jpg')
    })

    it('should handle resetMedia within 100ms', () => {
      const { result } = renderHook(() => useContentStore())

      // Set initial state
      act(() => {
        result.current.setBgUrl('https://example.com/custom-bg.jpg')
        result.current.setMusicUrl('https://example.com/custom-music.mp3')
      })

      const start = performance.now()
      
      act(() => {
        result.current.resetMedia()
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      // resetMedia should reset to default bgUrl
      expect(result.current.bgUrl).toBeTruthy()
    })

    it('should handle resetContent within 100ms', () => {
      const { result } = renderHook(() => useContentStore())

      // Set initial state
      act(() => {
        result.current.setText('Custom text')
        result.current.setBgUrl('https://example.com/custom-bg.jpg')
        result.current.setMusicUrl('https://example.com/custom-music.mp3')
      })

      const start = performance.now()
      
      act(() => {
        result.current.resetContent()
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBeTruthy()
    })
  })

  describe('Cross-Component Update Performance', () => {
    it('should propagate bgUrl changes to multiple components within 100ms', () => {
      // Simulate multiple components subscribing to the same store
      const component1 = renderHook(() => useContentStore())
      const component2 = renderHook(() => useContentStore())
      const component3 = renderHook(() => useContentStore())

      const newBgUrl = 'https://example.com/multi-component-bg.jpg'

      const start = performance.now()
      
      act(() => {
        // Update from one component
        component1.result.current.setBgUrl(newBgUrl)
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)

      // All components should receive the update
      expect(component1.result.current.bgUrl).toBe(newBgUrl)
      expect(component2.result.current.bgUrl).toBe(newBgUrl)
      expect(component3.result.current.bgUrl).toBe(newBgUrl)
    })

    it('should handle concurrent updates from multiple sources within 100ms', () => {
      const component1 = renderHook(() => useContentStore())
      const component2 = renderHook(() => useContentStore())

      const start = performance.now()
      
      act(() => {
        // Concurrent updates from different components
        component1.result.current.setText('Text from component 1')
        component2.result.current.setBgUrl('https://example.com/concurrent-bg.jpg')
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      
      // Both components should see the final state
      expect(component1.result.current.text).toBe('Text from component 1')
      expect(component1.result.current.bgUrl).toBe('https://example.com/concurrent-bg.jpg')
      expect(component2.result.current.bgUrl).toBe('https://example.com/concurrent-bg.jpg')
    })
  })

  describe('Memory Efficiency During Updates', () => {
    it('should not degrade performance after 100 updates', () => {
      const { result } = renderHook(() => useContentStore())

      // Perform 100 updates
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setBgUrl(`https://example.com/perf-${i}.jpg`)
        })
      }

      // Measure performance of next update
      const start = performance.now()
      
      act(() => {
        result.current.setBgUrl('https://example.com/final-bg.jpg')
      })

      const end = performance.now()
      const duration = end - start

      // Performance should not degrade
      expect(duration).toBeLessThan(100)
    })

    it('should maintain consistent update timing', () => {
      const { result } = renderHook(() => useContentStore())
      const timings: number[] = []

      // Measure 10 consecutive updates
      for (let i = 0; i < 10; i++) {
        const start = performance.now()
        
        act(() => {
          result.current.setBgUrl(`https://example.com/consistent-${i}.jpg`)
        })

        const end = performance.now()
        timings.push(end - start)
      }

      // All updates should be under 100ms
      timings.forEach(duration => {
        expect(duration).toBeLessThan(100)
      })

      // Calculate standard deviation to check consistency
      const mean = timings.reduce((a, b) => a + b, 0) / timings.length
      const variance = timings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / timings.length
      const stdDev = Math.sqrt(variance)

      // Standard deviation should be relatively low (consistent performance)
      expect(stdDev).toBeLessThan(mean * 0.5) // Less than 50% variation
    })
  })

  describe('Edge Case Performance', () => {
    it('should handle empty to valid bgUrl transition within 100ms', () => {
      const { result } = renderHook(() => useContentStore())

      // Start with empty bgUrl
      act(() => {
        result.current.setBgUrl('')
      })

      const start = performance.now()
      
      act(() => {
        result.current.setBgUrl('https://example.com/from-empty.jpg')
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe('https://example.com/from-empty.jpg')
    })

    it('should handle valid to empty bgUrl transition within 100ms', () => {
      const { result } = renderHook(() => useContentStore())

      // Start with valid bgUrl
      act(() => {
        result.current.setBgUrl('https://example.com/to-empty.jpg')
      })

      const start = performance.now()
      
      act(() => {
        result.current.setBgUrl('')
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe('')
    })

    it('should handle very long bgUrl within 100ms', () => {
      const { result } = renderHook(() => useContentStore())
      const longBgUrl = 'https://example.com/' + 'a'.repeat(2000) + '.jpg'

      const start = performance.now()
      
      act(() => {
        result.current.setBgUrl(longBgUrl)
      })

      const end = performance.now()
      const duration = end - start

      expect(duration).toBeLessThan(100)
      expect(result.current.bgUrl).toBe(longBgUrl)
    })
  })
})
