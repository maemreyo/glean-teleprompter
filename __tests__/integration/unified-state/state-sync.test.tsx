/**
 * Integration test for state synchronization between Editor and Runner
 * T015: [US1] Test state synchronization between Editor and Runner
 * Created for 007-unified-state-architecture
 */

import { renderHook, act } from '@testing-library/react'
import { useContentStore } from '@/lib/stores/useContentStore'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { usePlaybackStore } from '@/lib/stores/usePlaybackStore'

describe('State Synchronization Between Editor and Runner', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('ConfigStore synchronization', () => {
    it('should synchronize typography changes within 100ms', async () => {
      const { result: editorResult } = renderHook(() => useConfigStore())
      
      act(() => {
        editorResult.current.setTypography({ fontSize: 60 })
      })

      // Simulate Runner reading the state
      const startTime = Date.now()
      const { result: runnerResult } = renderHook(() => useConfigStore())
      const endTime = Date.now()

      expect(runnerResult.current.typography.fontSize).toBe(60)
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should notify all subscribers when state changes', () => {
      let updateCount = 0
      const { result: editorResult, unmount } = renderHook(() => useConfigStore())

      // Get initial value to ensure we're testing an actual change
      const initialValue = editorResult.current.typography.fontSize
      const newValue = initialValue === 48 ? 60 : 48

      // Subscribe to changes - use getState() to check actual value change
      const unsubscribe = useConfigStore.subscribe(
        (state) => {
          // Only count updates when fontSize actually changes to our target value
          if (state.typography.fontSize === newValue) {
            updateCount++
          }
        }
      )

      act(() => {
        editorResult.current.setTypography({ fontSize: newValue })
      })

      expect(updateCount).toBeGreaterThan(0)
      unsubscribe()
      unmount()
    })

    it('should batch multiple state updates efficiently', async () => {
      const { result: editorResult } = renderHook(() => useConfigStore())

      const startTime = Date.now()

      act(() => {
        editorResult.current.setTypography({ fontSize: 54 })
        editorResult.current.setColors({ primaryColor: '#ff0000' })
        editorResult.current.setEffects({ shadowEnabled: true })
      })

      const endTime = Date.now()

      // All three updates should complete quickly
      expect(endTime - startTime).toBeLessThan(100)

      // Verify all changes applied
      const { result: runnerResult } = renderHook(() => useConfigStore())
      expect(runnerResult.current.typography.fontSize).toBe(54)
      expect(runnerResult.current.colors.primaryColor).toBe('#ff0000')
      expect(runnerResult.current.effects.shadowEnabled).toBe(true)
    })
  })

  describe('ContentStore synchronization', () => {
    it('should synchronize text changes immediately', () => {
      const { result: editorResult } = renderHook(() => useContentStore())

      act(() => {
        editorResult.current.setText('New script content')
      })

      const { result: runnerResult } = renderHook(() => useContentStore())
      expect(runnerResult.current.text).toBe('New script content')
    })

    it('should synchronize background URL changes', () => {
      const { result: editorResult } = renderHook(() => useContentStore())

      act(() => {
        editorResult.current.setBgUrl('https://example.com/background.jpg')
      })

      const { result: runnerResult } = renderHook(() => useContentStore())
      expect(runnerResult.current.bgUrl).toBe('https://example.com/background.jpg')
    })

    it('should synchronize bulk updates via setAll', () => {
      const { result: editorResult } = renderHook(() => useContentStore())

      act(() => {
        editorResult.current.setAll({
          text: 'Bulk updated text',
          bgUrl: 'https://example.com/bulk-bg.jpg',
          musicUrl: 'https://example.com/bulk-music.mp3'
        })
      })

      const { result: runnerResult } = renderHook(() => useContentStore())
      expect(runnerResult.current.text).toBe('Bulk updated text')
      expect(runnerResult.current.bgUrl).toBe('https://example.com/bulk-bg.jpg')
      expect(runnerResult.current.musicUrl).toBe('https://example.com/bulk-music.mp3')
    })
  })

  describe('Cross-store synchronization', () => {
    it('should maintain consistency across ContentStore and ConfigStore', () => {
      const contentHook = renderHook(() => useContentStore())
      const configHook = renderHook(() => useConfigStore())

      // Update both stores
      act(() => {
        contentHook.result.current.setText('Test content')
        configHook.result.current.setTypography({ fontSize: 48 })
      })

      // Create new hooks to simulate Runner
      const contentRunner = renderHook(() => useContentStore())
      const configRunner = renderHook(() => useConfigStore())

      // Both stores should be synchronized
      expect(contentRunner.result.current.text).toBe('Test content')
      expect(configRunner.result.current.typography.fontSize).toBe(48)

      contentHook.unmount()
      configHook.unmount()
      contentRunner.unmount()
      configRunner.unmount()
    })

    it('should handle rapid state changes without inconsistency', () => {
      const configHook = renderHook(() => useConfigStore())

      // Rapidly change the same property
      act(() => {
        configHook.result.current.setTypography({ fontSize: 40 })
        configHook.result.current.setTypography({ fontSize: 50 })
        configHook.result.current.setTypography({ fontSize: 60 })
      })

      const configRunner = renderHook(() => useConfigStore())
      
      // Should have the final value
      expect(configRunner.result.current.typography.fontSize).toBe(60)

      configHook.unmount()
      configRunner.unmount()
    })
  })

  describe('PlaybackStore independence', () => {
    it('should not affect ConfigStore when PlaybackStore updates', () => {
      const configHook = renderHook(() => useConfigStore())
      const playbackHook = renderHook(() => usePlaybackStore())

      // Set initial config
      act(() => {
        configHook.result.current.setAnimations({ autoScrollSpeed: 50 })
      })

      // Update playback state
      act(() => {
        playbackHook.result.current.setIsPlaying(true)
        playbackHook.result.current.setScrollSpeed(5)
      })

      // ConfigStore should be unchanged
      expect(configHook.result.current.animations.autoScrollSpeed).toBe(50)

      configHook.unmount()
      playbackHook.unmount()
    })

    it('should not affect ContentStore when PlaybackStore updates', () => {
      const contentHook = renderHook(() => useContentStore())
      const playbackHook = renderHook(() => usePlaybackStore())

      // Set initial content
      act(() => {
        contentHook.result.current.setText('Initial content')
      })

      // Update playback state
      act(() => {
        playbackHook.result.current.setIsPlaying(true)
        playbackHook.result.current.advanceTime(10)
      })

      // ContentStore should be unchanged
      expect(contentHook.result.current.text).toBe('Initial content')

      contentHook.unmount()
      playbackHook.unmount()
    })
  })

  describe('Synchronization timing guarantees', () => {
    it('should meet 100ms sync target for single property change', async () => {
      const { result: editorResult } = renderHook(() => useConfigStore())

      const startTime = Date.now()

      act(() => {
        editorResult.current.setLayout({ textAlign: 'left' as const })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      const endTime = Date.now()

      expect(runnerResult.current.layout.textAlign).toBe('left')
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should meet 100ms sync target for multiple properties', async () => {
      const { result: editorResult } = renderHook(() => useConfigStore())

      const startTime = Date.now()

      act(() => {
        editorResult.current.setTypography({ fontSize: 56, fontWeight: 700 })
        editorResult.current.setColors({ primaryColor: '#00ff00' })
        editorResult.current.setEffects({ outlineEnabled: true })
      })

      const { result: runnerResult } = renderHook(() => useConfigStore())
      const endTime = Date.now()

      expect(runnerResult.current.typography.fontSize).toBe(56)
      expect(runnerResult.current.typography.fontWeight).toBe(700)
      expect(runnerResult.current.colors.primaryColor).toBe('#00ff00')
      expect(runnerResult.current.effects.outlineEnabled).toBe(true)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })

  describe('State consistency after persistence', () => {
    it('should maintain synchronization after localStorage persistence', () => {
      const editorHook = renderHook(() => useConfigStore())
      const contentHook = renderHook(() => useContentStore())

      // Update state
      act(() => {
        editorHook.result.current.setTypography({ fontSize: 64 })
        contentHook.result.current.setText('Persistent content')
      })

      // Unmount to trigger persistence
      editorHook.unmount()
      contentHook.unmount()

      // Mount new hooks (simulating page reload)
      const configRunner = renderHook(() => useConfigStore())
      const contentRunner = renderHook(() => useContentStore())

      // State should be restored
      expect(configRunner.result.current.typography.fontSize).toBe(64)
      expect(contentRunner.result.current.text).toBe('Persistent content')

      configRunner.unmount()
      contentRunner.unmount()
    })
  })
})
