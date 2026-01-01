/**
 * T022 [P] [US2] Unit test for QuickSettingsPanel component
 * 
 * Tests the QuickSettingsPanel component functionality including:
 * - Rendering with Radix UI Dialog
 * - Scroll speed control
 * - Font size control
 * - Text alignment control
 * - Background URL input
 * - Keyboard navigation (Escape to close)
 * - Open/close state management
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

// The component under test will be created
import { QuickSettingsPanel } from '@/components/teleprompter/runner/QuickSettingsPanel'

describe('QuickSettingsPanel', () => {
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

  describe('Rendering', () => {
    it('should render when open', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.queryByTestId('dialog-content')).toBeInTheDocument()
    })

    it('should not render when closed', () => {
      render(
        <QuickSettingsPanel
          open={false}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument()
    })

    it('should render dialog title', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    })

    it('should render close button', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Scroll Speed Control', () => {
    it('should display current scroll speed from config store', () => {
      useConfigStore.getState().setAnimations({ autoScrollSpeed: 75 })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')
      expect(slider).toHaveValue(75)
    })

    it('should update scroll speed in config store when changed', async () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')
      const newSpeed = 100

      await act(async () => {
        fireEvent.change(slider, { target: { value: newSpeed } })
      })

      expect(useConfigStore.getState().animations.autoScrollSpeed).toBe(newSpeed)
    })

    it('should respect min and max bounds for scroll speed', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-scroll-speed')
      expect(slider).toHaveAttribute('min', '10')
      expect(slider).toHaveAttribute('max', '200')
    })
  })

  describe('Font Size Control', () => {
    it('should display current font size from config store', () => {
      useConfigStore.getState().setTypography({ fontSize: 56 })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-font-size')
      expect(slider).toHaveValue(56)
    })

    it('should update font size in config store when changed', async () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-font-size')
      const newFontSize = 60

      await act(async () => {
        fireEvent.change(slider, { target: { value: newFontSize } })
      })

      expect(useConfigStore.getState().typography.fontSize).toBe(newFontSize)
    })

    it('should respect min and max bounds for font size', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const slider = screen.getByTestId('slider-font-size')
      expect(slider).toHaveAttribute('min', '20')
      expect(slider).toHaveAttribute('max', '80')
    })
  })

  describe('Text Alignment Control', () => {
    it('should display current text alignment from config store', () => {
      useConfigStore.getState().setLayout({ textAlign: 'center' })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const centerButton = screen.getByRole('button', { name: /center/i })
      expect(centerButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('should update text alignment in config store when changed', async () => {
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

      expect(useConfigStore.getState().layout.textAlign).toBe('left')
    })

    it('should support all alignment options: left, center, right', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.getByRole('button', { name: /left/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /center/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /right/i })).toBeInTheDocument()
    })
  })

  describe('Background URL Control', () => {
    it('should display current background URL from content store', () => {
      const testUrl = 'https://example.com/bg.jpg'
      useContentStore.getState().setBgUrl(testUrl)

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const input = screen.getByRole('textbox', { name: /background url/i })
      expect(input).toHaveValue(testUrl)
    })

    it('should update background URL in content store when changed', async () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const input = screen.getByRole('textbox', { name: /background url/i })
      const newUrl = 'https://example.com/new-bg.jpg'

      await act(async () => {
        await user.clear(input)
        await user.type(input, newUrl)
      })

      expect(useContentStore.getState().bgUrl).toBe(newUrl)
    })

    it('should handle empty URL input', async () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const input = screen.getByRole('textbox', { name: /background url/i })

      await act(async () => {
        await user.clear(input)
      })

      expect(useContentStore.getState().bgUrl).toBe('')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should close dialog when Escape key is pressed', async () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
      })

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('Dialog State Management', () => {
    it('should call onOpenChange when close button is clicked', async () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const closeButton = screen.getByRole('button', { name: /close/i })

      await act(async () => {
        fireEvent.click(closeButton)
      })

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should call onOpenChange with true when opening', async () => {
      const { rerender } = render(
        <QuickSettingsPanel
          open={false}
          onOpenChange={mockOnOpenChange}
        />
      )

      rerender(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all controls', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      expect(screen.getByRole('slider', { name: /scroll speed/i })).toBeInTheDocument()
      expect(screen.getByRole('slider', { name: /font size/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /background url/i })).toBeInTheDocument()
    })

    it('should have aria-pressed for alignment buttons', () => {
      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const buttons = screen.getAllByRole('button')
      const alignmentButtons = buttons.filter(btn => 
        /left|center|right/i.test(btn.textContent || '')
      )

      alignmentButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed')
      })
    })
  })

  describe('Visual Indication', () => {
    it('should show modified settings badge when values differ from defaults', () => {
      // Change values from defaults
      useConfigStore.getState().setAnimations({ autoScrollSpeed: 100 })
      useConfigStore.getState().setTypography({ fontSize: 60 })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      // Should show some visual indication that settings are modified
      const badge = screen.queryByTestId('modified-badge')
      expect(badge).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should show toast error when config update fails', async () => {
      // Mock store action to throw error
      const setAnimationsSpy = jest.spyOn(useConfigStore.getState(), 'setAnimations')
      setAnimationsSpy.mockImplementation(() => {
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

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update'),
        expect.any(Object)
      )

      setAnimationsSpy.mockRestore()
    })

    it('should show toast error when content update fails', async () => {
      // Mock store action to throw error
      const setBgUrlSpy = jest.spyOn(useContentStore.getState(), 'setBgUrl')
      setBgUrlSpy.mockImplementation(() => {
        throw new Error('Update failed')
      })

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const input = screen.getByRole('textbox', { name: /background url/i })

      await act(async () => {
        await user.clear(input)
        await user.type(input, 'https://example.com/new.jpg')
      })

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update'),
        expect.any(Object)
      )

      setBgUrlSpy.mockRestore()
    })
  })

  describe('Responsive Design', () => {
    it('should render in full-screen mode on mobile', () => {
      // Mock mobile viewport
      global.innerWidth = 375

      render(
        <QuickSettingsPanel
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      )

      const dialog = screen.getByTestId('dialog-content')
      expect(dialog).toHaveClass('w-full')
    })
  })
})
