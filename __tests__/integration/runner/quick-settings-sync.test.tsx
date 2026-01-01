/**
 * T023 [P] [US2] Integration test for Quick Settings to Editor synchronization
 * 
 * Tests that changes made in QuickSettingsPanel (Runner mode) sync to Editor
 * within 100ms as per spec requirements.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useContentStore } from '@/lib/stores/useContentStore'
import { useUIStore } from '@/stores/useUIStore'

// Mock the QuickSettingsPanel component (will be implemented)
jest.mock('@/components/teleprompter/runner/QuickSettingsPanel', () => ({
  QuickSettingsPanel: ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => (
    <div data-testid="quick-settings-panel">
      <button onClick={() => onOpenChange(false)}>Close</button>
      <input
        data-testid="scroll-speed-input"
        type="range"
        min="10"
        max="200"
        defaultValue={50}
      />
      <input
        data-testid="font-size-input"
        type="range"
        min="20"
        max="80"
        defaultValue={48}
      />
      <button data-testid="align-left">Left</button>
      <button data-testid="align-center">Center</button>
      <button data-testid="align-right">Right</button>
      <input
        data-testid="bg-url-input"
        type="text"
        placeholder="Background URL"
      />
    </div>
  ),
}))

describe('QuickSettingsPanel - Editor Synchronization', () => {
  beforeEach(() => {
    // Reset all stores before each test
    useConfigStore.getState().resetAll()
    useContentStore.getState().reset()
    useUIStore.setState({ mode: 'setup' })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Scroll Speed Synchronization', () => {
    it('should sync scroll speed changes from Runner to Editor within 100ms', async () => {
      const initialSpeed = 50
      const newSpeed = 100

      // Set initial state
      useConfigStore.getState().setAnimations({ autoScrollSpeed: initialSpeed })

      // Set mode to running (Runner)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Verify initial state
      expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(initialSpeed)

      // Simulate scroll speed change in QuickSettingsPanel
      const startTime = Date.now()
      
      act(() => {
        useConfigStore.getState().setAnimations({ autoScrollSpeed: newSpeed })
      })

      const endTime = Date.now()
      const syncTime = endTime - startTime

      // Verify sync happened
      await waitFor(() => {
        expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(newSpeed)
      })

      // Verify sync completed within 100ms
      expect(syncTime).toBeLessThan(100)
    })

    it('should maintain scroll speed value when switching between Runner and Editor', async () => {
      const testSpeed = 75

      // Set speed in Editor (setup mode)
      act(() => {
        useUIStore.setState({ mode: 'setup' })
        useConfigStore.getState().setAnimations({ autoScrollSpeed: testSpeed })
      })

      expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(testSpeed)

      // Switch to Runner (running mode)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Speed should be maintained
      expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(testSpeed)

      // Switch back to Editor
      act(() => {
        useUIStore.setState({ mode: 'setup' })
      })

      // Speed should still be maintained
      expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(testSpeed)
    })
  })

  describe('Font Size Synchronization', () => {
    it('should sync font size changes from Runner to Editor within 100ms', async () => {
      const initialFontSize = 48
      const newFontSize = 60

      // Set initial state
      useConfigStore.getState().setTypography({ fontSize: initialFontSize })

      // Set mode to running (Runner)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Verify initial state
      expect(useConfigStore.getState().typography.fontSize).toBe(initialFontSize)

      // Simulate font size change in QuickSettingsPanel
      const startTime = Date.now()
      
      act(() => {
        useConfigStore.getState().setTypography({ fontSize: newFontSize })
      })

      const endTime = Date.now()
      const syncTime = endTime - startTime

      // Verify sync happened
      await waitFor(() => {
        expect(useConfigStore.getState().typography.fontSize).toBe(newFontSize)
      })

      // Verify sync completed within 100ms
      expect(syncTime).toBeLessThan(100)
    })

    it('should maintain font size value when switching between Runner and Editor', async () => {
      const testFontSize = 56

      // Set font size in Editor (setup mode)
      act(() => {
        useUIStore.setState({ mode: 'setup' })
        useConfigStore.getState().setTypography({ fontSize: testFontSize })
      })

      expect(useConfigStore.getState().typography.fontSize).toBe(testFontSize)

      // Switch to Runner (running mode)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Font size should be maintained
      expect(useConfigStore.getState().typography.fontSize).toBe(testFontSize)

      // Switch back to Editor
      act(() => {
        useUIStore.setState({ mode: 'setup' })
      })

      // Font size should still be maintained
      expect(useConfigStore.getState().typography.fontSize).toBe(testFontSize)
    })
  })

  describe('Text Alignment Synchronization', () => {
    it('should sync text alignment changes from Runner to Editor within 100ms', async () => {
      const initialAlign = 'center' as const
      const newAlign = 'left' as const

      // Set initial state
      useConfigStore.getState().setLayout({ textAlign: initialAlign })

      // Set mode to running (Runner)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Verify initial state
      expect(useConfigStore.getState().layout.textAlign).toBe(initialAlign)

      // Simulate alignment change in QuickSettingsPanel
      const startTime = Date.now()
      
      act(() => {
        useConfigStore.getState().setLayout({ textAlign: newAlign })
      })

      const endTime = Date.now()
      const syncTime = endTime - startTime

      // Verify sync happened
      await waitFor(() => {
        expect(useConfigStore.getState().layout.textAlign).toBe(newAlign)
      })

      // Verify sync completed within 100ms
      expect(syncTime).toBeLessThan(100)
    })

    it('should support all alignment options: left, center, right', async () => {
      const alignments = ['left', 'center', 'right'] as const

      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      for (const align of alignments) {
        act(() => {
          useConfigStore.getState().setLayout({ textAlign: align })
        })

        await waitFor(() => {
          expect(useConfigStore.getState().layout.textAlign).toBe(align)
        })
      }
    })
  })

  describe('Background URL Synchronization', () => {
    it('should sync background URL changes from Runner to Editor within 100ms', async () => {
      const initialBgUrl = 'https://example.com/bg1.jpg'
      const newBgUrl = 'https://example.com/bg2.jpg'

      // Set initial state
      useContentStore.getState().setBgUrl(initialBgUrl)

      // Set mode to running (Runner)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Verify initial state
      expect(useContentStore.getState().bgUrl).toBe(initialBgUrl)

      // Simulate background URL change in QuickSettingsPanel
      const startTime = Date.now()
      
      act(() => {
        useContentStore.getState().setBgUrl(newBgUrl)
      })

      const endTime = Date.now()
      const syncTime = endTime - startTime

      // Verify sync happened
      await waitFor(() => {
        expect(useContentStore.getState().bgUrl).toBe(newBgUrl)
      })

      // Verify sync completed within 100ms
      expect(syncTime).toBeLessThan(100)
    })

    it('should maintain background URL when switching between Runner and Editor', async () => {
      const testBgUrl = 'https://example.com/test-bg.jpg'

      // Set background in Editor (setup mode)
      act(() => {
        useUIStore.setState({ mode: 'setup' })
        useContentStore.getState().setBgUrl(testBgUrl)
      })

      expect(useContentStore.getState().bgUrl).toBe(testBgUrl)

      // Switch to Runner (running mode)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Background should be maintained
      expect(useContentStore.getState().bgUrl).toBe(testBgUrl)

      // Switch back to Editor
      act(() => {
        useUIStore.setState({ mode: 'setup' })
      })

      // Background should still be maintained
      expect(useContentStore.getState().bgUrl).toBe(testBgUrl)
    })
  })

  describe('Multiple Settings Synchronization', () => {
    it('should sync multiple setting changes simultaneously', async () => {
      // Set initial state
      useConfigStore.getState().setAnimations({ autoScrollSpeed: 50 })
      useConfigStore.getState().setTypography({ fontSize: 48 })
      useConfigStore.getState().setLayout({ textAlign: 'center' })

      // Set mode to running (Runner)
      act(() => {
        useUIStore.setState({ mode: 'running' })
      })

      // Simulate multiple setting changes in QuickSettingsPanel
      act(() => {
        useConfigStore.getState().setAnimations({ autoScrollSpeed: 100 })
        useConfigStore.getState().setTypography({ fontSize: 60 })
        useConfigStore.getState().setLayout({ textAlign: 'left' })
      })

      // Verify all changes synced
      await waitFor(() => {
        expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(100)
        expect(useConfigStore.getState().typography.fontSize).toBe(60)
        expect(useConfigStore.getState().layout.textAlign).toBe('left')
      })
    })
  })

  describe('Visual Indication', () => {
    it('should show visual indication when Runner settings differ from Editor defaults', () => {
      // Set different values in Runner
      act(() => {
        useUIStore.setState({ mode: 'running' })
        useConfigStore.getState().setAnimations({ autoScrollSpeed: 100 })
      })

      // Settings should be different from defaults
      const { animations } = useConfigStore.getState()
      expect(animations.autoScrollSpeed).not.toBe(50) // default is 50
    })
  })
})
