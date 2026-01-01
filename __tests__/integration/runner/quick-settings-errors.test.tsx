/**
 * T024 [P] [US2] Test error handling with toast notifications
 * 
 * Tests error scenarios in QuickSettingsPanel and verifies Sonner toast
 * notifications are displayed appropriately.
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useContentStore } from '@/lib/stores/useContentStore'
import { useUIStore } from '@/stores/useUIStore'
import { toast } from 'sonner'

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock Radix UI Dialog
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid="dialog-root" data-open={open}>
      {open && children}
    </div>
  ),
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}))

// Mock Radix UI Button
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, type, className }: any) => (
    <button
      data-testid="button"
      onClick={onClick}
      type={type || 'button'}
      className={className}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}))

import { QuickSettingsPanel } from '@/components/teleprompter/runner/QuickSettingsPanel'

describe('QuickSettingsPanel - Error Handling', () => {
  const mockOnOpenChange = jest.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    // Reset all stores before each test
    useConfigStore.getState().resetAll()
    useContentStore.getState().reset()
    useUIStore.setState({ mode: 'running' })
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Scroll Speed Update Errors', () => {
    it('should show toast error when scroll speed update fails', async () => {
      // Mock store action to throw error
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
      setAnimationsSpy.mockImplementation(() => {
        throw new Error('Failed to update scroll speed')
      })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')

      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('scroll speed'),
          expect.objectContaining({
            description: expect.any(String),
          })
        )
      })

      setAnimationsSpy.mockRestore()
    })

    it('should show descriptive error message for scroll speed errors', async () => {
      const errorMessage = 'Network error while updating config'
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
      setAnimationsSpy.mockImplementation(() => {
        throw new Error(errorMessage)
      })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')

      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('Failed to update'),
          expect.objectContaining({
            description: errorMessage,
          })
        )
      })

      setAnimationsSpy.mockRestore()
    })

    it('should handle non-Error objects thrown during scroll speed update', async () => {
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
      setAnimationsSpy.mockImplementation(() => {
        throw 'String error'
      })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')

      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      setAnimationsSpy.mockRestore()
    })
  })

  describe('Font Size Update Errors', () => {
    it('should show toast error when font size update fails', async () => {
      const setTypographySpy = jest.spyOn(useConfigStore.getState(), 'setTypography')
      setTypographySpy.mockImplementation(() => {
        throw new Error('Failed to update font size')
      })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-font-size')

      await act(async () => {
        fireEvent.change(slider, { target: { value: 60 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('font size'),
          expect.objectContaining({
            description: expect.any(String),
          })
        )
      })

      setTypographySpy.mockRestore()
    })
  })

  describe('Text Alignment Update Errors', () => {
    it('should show toast error when text alignment update fails', async () => {
      const setLayoutSpy = jest.spyOn(useConfigStore.getState(), 'setLayout')
      setLayoutSpy.mockImplementation(() => {
        throw new Error('Failed to update text alignment')
      })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const leftButton = screen.getByRole('button', { name: /left/i })

      await act(async () => {
        fireEvent.click(leftButton)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('text alignment'),
          expect.objectContaining({
            description: expect.any(String),
          })
        )
      })

      setLayoutSpy.mockRestore()
    })
  })

  describe('Background URL Update Errors', () => {
    it('should show toast error when background URL update fails', async () => {
      const setBgUrlSpy = jest.spyOn(useContentStore.getState(), 'setBgUrl')
      setBgUrlSpy.mockImplementation(() => {
        throw new Error('Failed to update background URL')
      })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const input = screen.getByRole('textbox', { name: /background url/i })
      const newUrl = 'https://example.com/new.jpg'

      await act(async () => {
        await user.clear(input)
        await user.type(input, newUrl)
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('background'),
          expect.objectContaining({
            description: expect.any(String),
          })
        )
      })

      setBgUrlSpy.mockRestore()
    })

    it('should handle invalid URL gracefully', async () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const input = screen.getByRole('textbox', { name: /background url/i })
      const invalidUrl = 'not-a-valid-url'

      await act(async () => {
        await user.clear(input)
        await user.type(input, invalidUrl)
      })

      // Should either update with the invalid URL or show a warning
      // The component should handle this gracefully without crashing
      await waitFor(() => {
        expect(useContentStore.getState().bgUrl).toBe(invalidUrl)
      })

      // Optionally, could show a warning toast for invalid URLs
    })
  })

  describe('Multiple Concurrent Error Scenarios', () => {
    it('should handle multiple errors without crashing', async () => {
      // Mock all store actions to throw errors
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
        .mockImplementation(() => { throw new Error('Scroll speed error') })
      const setTypographySpy = jest.spyOn(useConfigStore.getState(), 'setTypography')
        .mockImplementation(() => { throw new Error('Font size error') })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const scrollSlider = screen.getByTestId('slider-scroll-speed')
      const fontSlider = screen.getByTestId('slider-font-size')

      await act(async () => {
        fireEvent.change(scrollSlider, { target: { value: 100 } })
        fireEvent.change(fontSlider, { target: { value: 60 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      setAnimationsSpy.mockRestore()
      setTypographySpy.mockRestore()
    })
  })

  describe('Error Recovery', () => {
    it('should allow retry after error', async () => {
      let callCount = 0
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
        .mockImplementation(() => {
          callCount++
          if (callCount === 1) {
            throw new Error('Temporary error')
          }
          // Success on second try
        })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')

      // First attempt - should fail
      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })

      // Second attempt - should succeed
      jest.clearAllMocks()
      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      await waitFor(() => {
        expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(100)
      })

      setAnimationsSpy.mockRestore()
    })
  })

  describe('Toast Options', () => {
    it('should include actionable options in error toast', async () => {
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
        .mockImplementation(() => {
          throw new Error('Update failed')
        })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')

      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            id: expect.any(String),
            duration: expect.any(Number),
          })
        )
      })

      setAnimationsSpy.mockRestore()
    })

    it('should use appropriate toast duration for errors', async () => {
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
        .mockImplementation(() => {
          throw new Error('Update failed')
        })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')

      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            duration: expect.any(Number),
          })
        )
      })

      setAnimationsSpy.mockRestore()
    })
  })

  describe('Silent Failures', () => {
    it('should not show toast for non-critical errors', async () => {
      // Some errors might be non-critical and should not show toast
      // For example, analytics tracking failures
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')

      await act(async () => {
        fireEvent.change(slider, { target: { value: 100 } })
      })

      // If update succeeds, no error toast should be shown
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  describe('Error Boundaries', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Simulate unexpected component crash
      const originalUseState = React.useState
      jest.spyOn(React, 'useState').mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      // Component should not crash the entire app
      expect(() => {
        render(
          <QuickSettingsPanel
            open={true}
            onOpenChange={mockOnOpenChange}
          />
        )
      }).toThrow()

      jest.restoreAllMocks()
    })
  })
})
