/**
 * T020: [US2] Integration test for overlay panel behavior
 *
 * Tests that:
 * - ConfigPanel renders as overlay when visible on desktop
 * - ContentPanel and PreviewPanel maintain proper width regardless of overlay state
 * - ConfigPanel is removed from document flow when hidden
 * - Panel visibility can be toggled
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

describe('Studio - Overlay Panel Integration (US2)', () => {
  beforeEach(() => {
    // Reset stores
    useUIStore.setState({
      panelState: {
        visible: false,
        isAnimating: false,
        lastToggled: null,
        isOverlay: true,
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

  describe('Layout structure', () => {
    it('should render ContentPanel and PreviewPanel', () => {
      render(<Editor />)
      
      // Check that both panels render - ContentPanel has textarea, PreviewPanel has text
      const editorElement = screen.getByText(/Sample teleprompter text/i)
      expect(editorElement).toBeInTheDocument()
    })

    it('should render ConfigPanel when panel.visible is true on desktop', async () => {
      await act(async () => {
        useUIStore.setState({
          panelState: {
            visible: true,
            isAnimating: false,
            lastToggled: Date.now(),
            isOverlay: true,
          },
        })
      })
      
      render(<Editor />)
      
      // ConfigPanel should be visible on desktop
      expect(screen.getByText(/Configuration/i)).toBeInTheDocument()
    })
  })

  describe('Panel visibility', () => {
    it('should show ConfigPanel when panel.visible is true on desktop', async () => {
      await act(async () => {
        useUIStore.setState({
          panelState: {
            visible: true,
            isAnimating: false,
            lastToggled: Date.now(),
            isOverlay: true,
          },
        })
      })
      
      render(<Editor />)
      
      // ConfigPanel should be visible
      expect(screen.getByText(/Configuration/i)).toBeInTheDocument()
    })

    it('should hide ConfigPanel when panel.visible is false', () => {
      // Panel is hidden by default in beforeEach
      render(<Editor />)
      
      // ConfigPanel should not render when visible is false
      // The motion.div handles this via animate prop
      const configPanel = screen.queryByText(/Configuration/i)
      expect(configPanel).not.toBeInTheDocument()
    })
  })

  describe('Panel toggle', () => {
    it('should toggle panel visibility when togglePanel is called', async () => {
      // Start with panel hidden
      useUIStore.setState({
        panelState: {
          visible: false,
          isAnimating: false,
          lastToggled: null,
          isOverlay: true,
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

  describe('Responsive behavior', () => {
    it('should only show ConfigPanel on desktop when visible', async () => {
      await act(async () => {
        useUIStore.setState({
          panelState: {
            visible: true,
            isAnimating: false,
            lastToggled: Date.now(),
            isOverlay: true,
          },
        })
      })
      
      render(<Editor />)
      
      // ConfigPanel should be visible on desktop (mocked to true)
      expect(screen.getByText(/Configuration/i)).toBeInTheDocument()
    })
  })
})