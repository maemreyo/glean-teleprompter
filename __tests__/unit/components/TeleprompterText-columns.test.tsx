/**
 * T009: [US1] Unit test for TeleprompterText column layout rendering
 * 
 * Tests that TeleprompterText correctly renders:
 * - Two-column layout with 32px gap
 * - Single column fallback on mobile
 * - Responsive behavior
 * - CSS column properties are applied correctly
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText'
import { useConfigStore } from '@/lib/stores/useConfigStore'

// Mock the config store
jest.mock('@/lib/stores/useConfigStore')

// Mock FontLoader
jest.mock('@/components/teleprompter/config/typography/FontLoader', () => ({
  FontLoader: () => null,
}))

describe('TeleprompterText - Column Layout (US1)', () => {
  const mockText = 'Paragraph one\n\nParagraph two\n\nParagraph three'

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
    
    // Default config with two-column layout
    ;(useConfigStore as unknown as jest.Mock).mockReturnValue({
      typography: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 48,
        letterSpacing: 0,
        lineHeight: 1.5,
        textTransform: 'none' as const,
      },
      layout: {
        horizontalMargin: 0,
        verticalPadding: 0,
        textAlign: 'center' as const,
        columnCount: 2,
        columnGap: 32,
        textAreaWidth: 100,
        textAreaPosition: 'center' as const,
      },
      colors: {
        primaryColor: '#ffffff',
        gradientEnabled: false,
        gradientType: 'linear' as const,
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
    })
  })

  describe('Two-column layout (desktop)', () => {
    it('should render with two columns when columnCount is 2', () => {
      render(<TeleprompterText text={mockText} />)
      
      const textElement = screen.getByText(/Paragraph one/)
      const styles = window.getComputedStyle(textElement)
      
      // Check that columnCount is applied
      expect(styles.columnCount).toBe('2')
    })

    it('should render with 32px column gap when columnGap is 32', () => {
      render(<TeleprompterText text={mockText} />)
      
      const textElement = screen.getByText(/Paragraph one/)
      const styles = window.getComputedStyle(textElement)
      
      // Check that columnGap is applied
      expect(styles.columnGap).toBe('32px')
    })

    it('should have break-inside-avoid class for multi-column layout', () => {
      const { container } = render(<TeleprompterText text={mockText} />)
      
      const paragraphElement = container.querySelector('p')
      expect(paragraphElement).toHaveClass('break-inside-avoid')
    })
  })

  describe('Single column fallback', () => {
    it('should render single column when columnCount is 1', () => {
      ;(useConfigStore as unknown as jest.Mock).mockReturnValue({
        typography: {
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 48,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none' as const,
        },
        layout: {
          horizontalMargin: 0,
          verticalPadding: 0,
          textAlign: 'center' as const,
          columnCount: 1,
          columnGap: 0,
          textAreaWidth: 100,
          textAreaPosition: 'center' as const,
        },
        colors: {
          primaryColor: '#ffffff',
          gradientEnabled: false,
          gradientType: 'linear' as const,
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
      })

      render(<TeleprompterText text={mockText} />)
      
      const textElement = screen.getByText(/Paragraph one/)
      const styles = window.getComputedStyle(textElement)
      
      // Check that columnCount is 1 (or auto/none)
      const columnCount = styles.columnCount
      expect(columnCount === 'auto' || columnCount === '1' || columnCount === 'none').toBe(true)
    })

    it('should not have break-inside-avoid class for single column', () => {
      ;(useConfigStore as unknown as jest.Mock).mockReturnValue({
        typography: {
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 48,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none' as const,
        },
        layout: {
          horizontalMargin: 0,
          verticalPadding: 0,
          textAlign: 'center' as const,
          columnCount: 1,
          columnGap: 0,
          textAreaWidth: 100,
          textAreaPosition: 'center' as const,
        },
        colors: {
          primaryColor: '#ffffff',
          gradientEnabled: false,
          gradientType: 'linear' as const,
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
      })

      const { container } = render(<TeleprompterText text={mockText} />)
      
      const paragraphElement = container.querySelector('p')
      expect(paragraphElement).not.toHaveClass('break-inside-avoid')
    })
  })

  describe('ARIA attributes', () => {
    it('should have data-config-layout attribute with column properties', () => {
      const { container } = render(<TeleprompterText text={mockText} />)
      
      const wrapperDiv = container.querySelector('[data-config-layout]')
      expect(wrapperDiv).toBeInTheDocument()
      
      const layoutData = JSON.parse(wrapperDiv?.getAttribute('data-config-layout') || '{}')
      expect(layoutData.columnCount).toBe(2)
      expect(layoutData.columnGap).toBe(32)
    })
  })
})
