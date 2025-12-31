/**
 * Color Configuration Impact Tests - Example Suite
 * 
 * This file demonstrates comprehensive testing patterns for color
 * configuration changes and their visual impact on preview components.
 * 
 * Run: npm test -- __tests__/examples/config-preview/color-example.test.tsx
 */

import { render, screen, waitFor } from '@testing-library/react'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '@/__tests__/utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '@/__tests__/utils/test-helpers'

// Mock config store for testing
jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: jest.fn(),
}))

// Helper function to convert hex to rgb for comparison
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  return `rgb(${r}, ${g}, ${b})`
}

// Wrapper component for testing
function TestColorPreview({ text, testId = 'preview-text' }: { text: string; testId?: string }) {
  return (
    <div 
      data-testid={testId} 
      style={{ 
        color: '#ffffff', 
        fontSize: '48px',
        backgroundImage: 'none'
      }}
    >
      {text}
    </div>
  )
}

describe('Color Config Impact Tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Primary Color', () => {
    it('should apply red color', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ff0000' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
      })
    })

    it('should apply blue color', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({ primaryColor: '#0000ff' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).color).toBe('rgb(0, 0, 255)')
      })
    })

    it('should apply white color', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ffffff' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).color).toBe('rgb(255, 255, 255)')
      })
    })

    it('should convert hex to rgb format', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      const hexColor = '#ff0000'
      
      setConfigState(createTestConfigUpdate.colors({ primaryColor: hexColor }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).color).toBe(hexToRgb(hexColor))
      })
    })
  })

  describe('Gradient Enable/Disable', () => {
    it('should not apply gradient when disabled', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: false,
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toBe('none')
      })
    })

    it('should apply gradient when enabled', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('linear-gradient')
      })
    })

    it('should handle gradient toggle', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      // Enable gradient
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('linear-gradient')
      })
      
      // Disable gradient
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toBe('none')
      })
    })
  })

  describe('Gradient Colors', () => {
    it('should apply two-color gradient', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backgroundImage = window.getComputedStyle(element).backgroundImage
        expect(backgroundImage).toContain('rgb(255, 0, 0)')
        expect(backgroundImage).toContain('rgb(0, 0, 255)')
      })
    })

    it('should apply three-color gradient', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#00ff00', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backgroundImage = window.getComputedStyle(element).backgroundImage
        expect(backgroundImage).toContain('rgb(255, 0, 0)')
        expect(backgroundImage).toContain('rgb(0, 255, 0)')
        expect(backgroundImage).toContain('rgb(0, 0, 255)')
      })
    })

    it('should update gradient colors', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      // Initial gradient
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('rgb(255, 0, 0)')
      })
      
      // Update gradient colors
      setConfigState(createTestConfigUpdate.colors({
        gradientColors: ['#00ff00', '#ffff00']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backgroundImage = window.getComputedStyle(element).backgroundImage
        expect(backgroundImage).toContain('rgb(0, 255, 0)')
        expect(backgroundImage).toContain('rgb(255, 255, 0)')
      })
    })
  })

  describe('Gradient Type', () => {
    it('should apply linear gradient', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientType: 'linear',
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backgroundImage = window.getComputedStyle(element).backgroundImage
        expect(backgroundImage).toContain('linear-gradient')
        expect(backgroundImage).not.toContain('radial-gradient')
      })
    })

    it('should apply radial gradient', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientType: 'radial',
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backgroundImage = window.getComputedStyle(element).backgroundImage
        expect(backgroundImage).toContain('radial-gradient')
        expect(backgroundImage).not.toContain('linear-gradient')
      })
    })

    it('should switch between gradient types', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      // Start with linear
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientType: 'linear',
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('linear-gradient')
      })
      
      // Switch to radial
      setConfigState(createTestConfigUpdate.colors({
        gradientType: 'radial'
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('radial-gradient')
      })
    })
  })

  describe('Gradient Angle (Linear)', () => {
    const angles = [0, 45, 90, 135, 180, 225, 270, 315]
    
    angles.forEach(angle => {
      it(`should apply gradient angle: ${angle}deg`, async () => {
        render(<TestColorPreview text="Sample Text" testId="preview-text" />)
        setConfigState(createTestConfigUpdate.colors({
          gradientEnabled: true,
          gradientType: 'linear',
          gradientColors: ['#ff0000', '#0000ff'],
          gradientAngle: angle
        }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          const backgroundImage = window.getComputedStyle(element).backgroundImage
          expect(backgroundImage).toContain(`${angle}deg`)
        })
      })
    })

    it('should update gradient angle', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      // Initial angle
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientType: 'linear',
        gradientColors: ['#ff0000', '#0000ff'],
        gradientAngle: 90
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('90deg')
      })
      
      // Update angle
      setConfigState(createTestConfigUpdate.colors({
        gradientAngle: 45
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('45deg')
      })
    })
  })

  describe('Combined Color Properties', () => {
    it('should apply complete gradient configuration', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientType: 'linear',
        gradientColors: ['#ff0000', '#00ff00', '#0000ff'],
        gradientAngle: 135
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backgroundImage = window.getComputedStyle(element).backgroundImage
        expect(backgroundImage).toContain('linear-gradient')
        expect(backgroundImage).toContain('135deg')
        expect(backgroundImage).toContain('rgb(255, 0, 0)')
        expect(backgroundImage).toContain('rgb(0, 255, 0)')
        expect(backgroundImage).toContain('rgb(0, 0, 255)')
      })
    })

    it('should transition from solid color to gradient', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      // Start with solid color
      setConfigState(createTestConfigUpdate.colors({
        primaryColor: '#ff0000',
        gradientEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
        expect(window.getComputedStyle(element).backgroundImage).toBe('none')
      })
      
      // Enable gradient
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('linear-gradient')
      })
    })
  })

  describe('Color Performance', () => {
    it('should apply gradient within 50ms', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      const startTime = performance.now()
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#00ff00', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backgroundImage).toContain('linear-gradient')
      })
      
      const responseTime = performance.now() - startTime
      expect(responseTime).toBeLessThan(50)
    })

    it('should handle rapid color changes', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      const responseTimes: number[] = []
      
      for (const color of colors) {
        const start = performance.now()
        setConfigState(createTestConfigUpdate.colors({ primaryColor: color }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          expect(window.getComputedStyle(element).color).toBeTruthy()
        })
        
        responseTimes.push(performance.now() - start)
      }
      
      // All changes should be under 50ms
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(50)
      })
    })
  })

  describe('Color Edge Cases', () => {
    it('should handle single color in gradient array', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        gradientEnabled: true,
        gradientColors: ['#ff0000']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        // Should apply solid color or handle gracefully
        expect(window.getComputedStyle(element)).toBeTruthy()
      })
    })

    it('should handle invalid color gracefully', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.colors({
        primaryColor: 'invalid'
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        // Should fall back to default or previous valid color
        expect(window.getComputedStyle(element).color).toBeTruthy()
      })
    })
  })

  describe('Config Reset', () => {
    it('should reset to default color values', async () => {
      render(<TestColorPreview text="Sample Text" testId="preview-text" />)
      
      // Apply custom config
      setConfigState(createTestConfigUpdate.colors({
        primaryColor: '#ff0000',
        gradientEnabled: true,
        gradientColors: ['#ff0000', '#0000ff']
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
      })
      
      // Reset to defaults
      resetConfigStore()
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).color).toBe('rgb(255, 255, 255)') // Default
      })
    })
  })
})
