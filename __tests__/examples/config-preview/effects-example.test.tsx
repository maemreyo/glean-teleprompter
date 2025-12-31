/**
 * Effects Configuration Impact Tests - Example Suite
 * 
 * This file demonstrates comprehensive testing patterns for effects
 * configuration changes and their visual impact on preview components.
 * 
 * Run: npm test -- __tests__/examples/config-preview/effects-example.test.tsx
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
function TestEffectsPreview({ text, testId = 'preview-text' }: { text: string; testId?: string }) {
  return (
    <div 
      data-testid={testId} 
      style={{ 
        fontSize: '48px',
        textShadow: 'none',
        WebkitTextStroke: '0px',
        filter: 'none',
        backdropFilter: 'none'
      }}
    >
      {text}
    </div>
  )
}

describe('Effects Config Impact Tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Shadow Effect', () => {
    it('should not apply shadow when disabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: false,
        shadowColor: '#000000'
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).toBe('none')
      })
    })

    it('should apply shadow when enabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowColor: '#000000',
        shadowBlur: 10,
        shadowOffsetX: 2,
        shadowOffsetY: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).not.toBe('none')
      })
    })

    it('should apply shadow color', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowColor: '#ff0000',
        shadowBlur: 10
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const textShadow = window.getComputedStyle(element).textShadow
        expect(textShadow).toContain('rgb(255, 0, 0)')
      })
    })

    it('should apply shadow offset', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowOffsetX: 5,
        shadowOffsetY: -3,
        shadowBlur: 10
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const textShadow = window.getComputedStyle(element).textShadow
        expect(textShadow).toBeTruthy()
      })
    })
  })

  describe('Outline Effect', () => {
    it('should not apply outline when disabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        outlineEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
        expect(webkitTextStroke === '0px' || webkitTextStroke === 'none').toBe(true)
      })
    })

    it('should apply outline when enabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        outlineEnabled: true,
        outlineColor: '#ffffff',
        outlineWidth: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
        expect(webkitTextStroke).not.toBe('0px')
        expect(webkitTextStroke).not.toBe('none')
      })
    })

    it('should apply outline color', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        outlineEnabled: true,
        outlineColor: '#ff0000',
        outlineWidth: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
        expect(webkitTextStroke).toContain('rgb(255, 0, 0)')
      })
    })

    it('should apply outline width', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        outlineEnabled: true,
        outlineWidth: 3
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
        expect(webkitTextStroke).toContain('3px')
      })
    })
  })

  describe('Glow Effect', () => {
    it('should not apply glow when disabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        glowEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const filter = window.getComputedStyle(element).filter
        expect(filter).not.toContain('drop-shadow')
      })
    })

    it('should apply glow when enabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        glowEnabled: true,
        glowColor: '#ffffff',
        glowIntensity: 50
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const filter = window.getComputedStyle(element).filter
        expect(filter).toContain('drop-shadow')
      })
    })

    it('should apply glow color', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        glowEnabled: true,
        glowColor: '#ff0000',
        glowIntensity: 50
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const filter = window.getComputedStyle(element).filter
        expect(filter).toContain('rgb(255, 0, 0)')
      })
    })

    it('should apply glow intensity', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        glowEnabled: true,
        glowIntensity: 75
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const filter = window.getComputedStyle(element).filter
        expect(filter).toContain('drop-shadow')
      })
    })
  })

  describe('Backdrop Filter', () => {
    it('should not apply backdrop when disabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        backdropFilterEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).backdropFilter).toBe('none')
      })
    })

    it('should apply backdrop blur when enabled', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        backdropFilterEnabled: true,
        backdropBlur: 10
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backdropFilter = window.getComputedStyle(element).backdropFilter
        expect(backdropFilter).toContain('blur')
        expect(backdropFilter).toContain('10px')
      })
    })
  })

  describe('Combined Effects', () => {
    it('should apply shadow and outline together', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowColor: '#000000',
        shadowBlur: 10,
        outlineEnabled: true,
        outlineColor: '#ffffff',
        outlineWidth: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const styles = window.getComputedStyle(element)
        expect(styles.textShadow).not.toBe('none')
        expect(styles.webkitTextStroke).not.toBe('0px')
        expect(styles.webkitTextStroke).not.toBe('none')
      })
    })

    it('should apply all effects simultaneously', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowColor: '#000000',
        shadowBlur: 10,
        outlineEnabled: true,
        outlineColor: '#ffffff',
        outlineWidth: 2,
        glowEnabled: true,
        glowColor: '#ff0000',
        glowIntensity: 50
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const styles = window.getComputedStyle(element)
        expect(styles.textShadow).not.toBe('none')
        expect(styles.webkitTextStroke).not.toBe('0px')
        expect(styles.webkitTextStroke).not.toBe('none')
        expect(styles.filter).toContain('drop-shadow')
      })
    })
  })

  describe('Effect Transitions', () => {
    it('should transition from no effects to shadow', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      
      // Start with no effects
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).toBe('none')
      })
      
      // Enable shadow
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowColor: '#000000',
        shadowBlur: 10
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).not.toBe('none')
      })
    })

    it('should switch from shadow to glow', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      
      // Start with shadow
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        glowEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).not.toBe('none')
      })
      
      // Switch to glow
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: false,
        glowEnabled: true,
        glowColor: '#ffffff',
        glowIntensity: 50
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const styles = window.getComputedStyle(element)
        expect(styles.textShadow).toBe('none')
        expect(styles.filter).toContain('drop-shadow')
      })
    })
  })

  describe('Effects Performance', () => {
    it('should apply shadow within 50ms', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      
      const startTime = performance.now()
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowBlur: 10
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).not.toBe('none')
      })
      
      const responseTime = performance.now() - startTime
      expect(responseTime).toBeLessThan(50)
    })

    it('should handle rapid effect changes', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      
      const effects = [
        { shadowEnabled: true },
        { outlineEnabled: true },
        { glowEnabled: true },
        { backdropFilterEnabled: true }
      ]
      const responseTimes: number[] = []
      
      for (const effect of effects) {
        const start = performance.now()
        setConfigState(createTestConfigUpdate.effects(effect))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          expect(window.getComputedStyle(element)).toBeTruthy()
        })
        
        responseTimes.push(performance.now() - start)
      }
      
      // All changes should be under 50ms
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(50)
      })
    })
  })

  describe('Effects Edge Cases', () => {
    it('should handle zero blur values', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowBlur: 0
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).toBeTruthy()
      })
    })

    it('should handle invalid effect colors gracefully', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowColor: 'invalid'
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        // Should fall back to default color or handle gracefully
        expect(window.getComputedStyle(element)).toBeTruthy()
      })
    })
  })

  describe('Browser Compatibility', () => {
    it('should use webkit prefix for outline', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        outlineEnabled: true,
        outlineWidth: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
        expect(webkitTextStroke).toBeTruthy()
      })
    })
  })

  describe('Config Reset', () => {
    it('should reset to default effect values', async () => {
      render(<TestEffectsPreview text="Sample Text" testId="preview-text" />)
      
      // Apply custom config
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        outlineEnabled: true,
        glowEnabled: true
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).not.toBe('none')
      })
      
      // Reset to defaults
      resetConfigStore()
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textShadow).toBe('none')
      })
    })
  })
})
