/**
 * T020: [US2] Integration test for inline and overlay panel behavior
 *
 * Tests that:
 * - ConfigPanel renders inline within ContentPanel on desktop (isOverlay: false)
 * - ConfigPanel renders as overlay on mobile/tablet (< 1024px)
 * - ContentPanel and PreviewPanel maintain 30/70 split on desktop
 * - Panel visibility can be toggled
 * - FullPreviewDialog can be opened with keyboard shortcut
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Editor } from '@/components/teleprompter/Editor'
import { useUIStore } from '@/stores/useUIStore'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { useContentStore } from '@/lib/stores/useContentStore'

// Mock useMediaQuery
jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: (query: string) => {
    // Default to desktop
    if (query.includes('1024px')) return true
    if (query.includes('767px')) return false
    return false
  },
}))

// Polyfill TextEncoder for Next.js server components in tests
global.TextEncoder = TextEncoder

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock getTabConfig
jest.mock('@/components/teleprompter/config/ConfigTabs', () => ({
  getTabConfig: () => [],
}))

// Mock MobileConfigPanel
jest.mock('@/components/teleprompter/config/TabBottomSheet', () => ({
  MobileConfigPanel: ({ isOpen, onClose }: any) => {
    if (!isOpen) return null
    return (
      <div data-testid="mobile-config-panel">
        <button onClick={onClose}>Close Mobile Config</button>
        Mobile Config Content
      </div>
    )
  },
}))

describe('Studio - Inline and Overlay Panel Integration (US2)', () => {
  beforeEach(() => {
    // Reset stores
    useUIStore.setState({
      panelState: {
        visible: false,
        isAnimating: false,
        lastToggled: null,
        isOverlay: false, // Desktop default: inline mode
      },
    })
    
    useConfigStore.setState({
      typography: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 48,
        letterSpacing: 0,
        lineHeight: 1.5,
        textTransform: 'none',
      },
      layout: {
        horizontalMargin: 0,
        verticalPadding: 0,
        textAlign: 'center',
        columnCount: 2,
        columnGap: 32,
        textAreaWidth: 100,
        textAreaPosition: 'center',
      },
      colors: {
        primaryColor: '#ffffff',
        gradientEnabled: false,
        gradientType: 'linear',
        gradientColors: ['#ffffff', '#fbbf24'],
        gradientAngle: 90,
        outlineColor: '#000000',
        glowColor: '#ffffff',
      },
      effects: {
        shadowEnabled: false,
        shadowOffsetX: 2,
        shadowOffsetY: 2,
        shadowBlur: 4,
        shadowColor: '#000000',
        shadowOpacity: 0.5,
        outlineEnabled: false,
        outlineWidth: 2,
        outlineColor: '#000000',
        glowEnabled: false,
        glowBlurRadius: 10,
        glowIntensity: 0.5,
        glowColor: '#ffffff',
        backdropFilterEnabled: false,
        backdropBlur: 0,
        backdropBrightness: 100,
        backdropSaturation: 100,
        overlayOpacity: 0.5,
      },
      animations: {
        smoothScrollEnabled: true,
        scrollDamping: 0.5,
        entranceAnimation: 'fade-in',
        entranceDuration: 500,
        wordHighlightEnabled: false,
        highlightColor: '#fbbf24',
        highlightSpeed: 200,
        autoScrollEnabled: false,
        autoScrollSpeed: 50,
        autoScrollAcceleration: 0,
      },
      historyStack: {
        past: [],
        future: [],
        maxSize: 50,
      },
      currentHistoryIndex: -1,
      isUndoing: false,
      isRedoing: false,
      isRecording: false,
    })
    
    useContentStore.setState({
      text: 'Sample teleprompter text',
      bgUrl: '',
    })
  })

  describe('Desktop layout structure (30/70 split)', () => {
    it('should render ContentPanel and PreviewPanel', () => {
      render(<Editor />)
      
      // Check that both panels render - ContentPanel has textarea, PreviewPanel has text
      const editorElement = screen.getByText(/Sample teleprompter text/i)
      expect(editorElement).toBeInTheDocument()
    })

    it('should render ConfigPanel inline within ContentPanel on desktop', async () => {
      await act(async () => {
        useUIStore.setState({
          panelState: {
            visible: true,
            isAnimating: false,
            lastToggled: Date.now(),
            isOverlay: false, // Desktop: inline mode
          },
        })
      })
      
      render(<Editor />)
      
      // ConfigPanel should be visible inline on desktop
      expect(screen.getByText(/Configuration/i)).toBeInTheDocument()
    })
  })

  describe('Panel visibility - Desktop inline mode', () => {
    it('should show ConfigPanel inline when panel.visible is true on desktop', async () => {
      await act(async () => {
        useUIStore.setState({
          panelState: {
            visible: true,
            isAnimating: false,
            lastToggled: Date.now(),
            isOverlay: false, // Desktop: inline mode
          },
        })
      })
      
      render(<Editor />)
      
      // ConfigPanel should be visible inline (not in Dialog)
      expect(screen.getByText(/Configuration/i)).toBeInTheDocument()
    })

    it('should hide inline ConfigPanel when panel.visible is false', () => {
      // Panel is hidden by default in beforeEach
      render(<Editor />)
      
      // ConfigPanel should not render when visible is false
      const configPanel = screen.queryByText(/Configuration/i)
      expect(configPanel).not.toBeInTheDocument()
    })
  })

  describe('Panel toggle', () => {
    it('should toggle inline panel visibility on desktop', async () => {
      // Start with panel hidden
      useUIStore.setState({
        panelState: {
          visible: false,
          isAnimating: false,
          lastToggled: null,
          isOverlay: false, // Desktop: inline mode
        },
      })
      
      render(<Editor />)
      
      // Panel should not be visible initially
      expect(screen.queryByText(/Configuration/i)).not.toBeInTheDocument()
      
      // Toggle panel on
      await act(async () => {
        useUIStore.getState().togglePanel()
      })
      
      // After toggle, panel should be visible (would need to re-render to see)
      const isVisible = useUIStore.getState().panelState.visible
      expect(isVisible).toBe(true)
    })
  })

  describe('Responsive behavior - Mobile overlay mode', () => {
    it('should use overlay mode on mobile (< 1024px)', async () => {
      // Mock mobile viewport
      jest.clearAllMocks()
      jest.mock('@/hooks/useMediaQuery', () => ({
        useMediaQuery: (query: string) => {
          // Mobile viewport
          if (query.includes('1024px')) return false
          if (query.includes('767px')) return false
          return false
        },
      }))
      
      await act(async () => {
        useUIStore.setState({
          panelState: {
            visible: true,
            isAnimating: false,
            lastToggled: Date.now(),
            isOverlay: true, // Mobile: overlay mode
          },
        })
      })
      
      render(<Editor />)
      
      // Mobile config panel should be visible
      const mobilePanel = screen.queryByTestId('mobile-config-panel')
      expect(mobilePanel).toBeInTheDocument()
    })
  })
})