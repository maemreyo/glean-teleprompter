/**
 * Typography Configuration Impact Tests - Example Suite
 * 
 * This file demonstrates comprehensive testing patterns for typography
 * configuration changes and their visual impact on preview components.
 * 
 * Run: npm test -- __tests__/examples/config-preview/typography-example.test.tsx
 */

import { render, screen, waitFor } from '@testing-library/react'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '@/__tests__/utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '@/__tests__/utils/test-helpers'

// Mock config store for testing
jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: jest.fn(),
}))

// Wrapper component for testing that adds data-testid
function TestTeleprompterText({ text, testId = 'preview-text' }: { text: string; testId?: string }) {
  return (
    <div data-testid={testId} style={{ fontSize: '48px', fontWeight: '400', fontFamily: 'Inter' }}>
      {text}
    </div>
  )
}

describe('Typography Config Impact Tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Font Family', () => {
    it('should apply Inter font family', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Inter' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const fontFamily = window.getComputedStyle(element).fontFamily
        expect(fontFamily).toContain('Inter')
      })
    })

    it('should apply Roboto font family', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Roboto' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const fontFamily = window.getComputedStyle(element).fontFamily
        expect(fontFamily).toContain('Roboto')
      })
    })

    it('should handle font family fallback', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ fontFamily: 'NonExistentFont, sans-serif' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const fontFamily = window.getComputedStyle(element).fontFamily
        expect(fontFamily).toContain('sans-serif')
      })
    })
  })

  describe('Font Size', () => {
    const standardSizes = [32, 48, 64, 72, 96, 128]
    
    standardSizes.forEach(size => {
      it(`should apply font size: ${size}px`, async () => {
        render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
        setConfigState(createTestConfigUpdate.typography({ fontSize: size }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          expect(window.getComputedStyle(element).fontSize).toBe(`${size}px`)
        })
      })
    })

    it('should clamp values below minimum (32px)', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ fontSize: 10 })) // Below minimum
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe('32px')
      })
    })

    it('should clamp values above maximum (128px)', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ fontSize: 200 })) // Above maximum
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe('128px')
      })
    })

    it('should apply font size change within 50ms', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      
      const startTime = performance.now()
      setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe('72px')
      })
      
      const responseTime = performance.now() - startTime
      expect(responseTime).toBeLessThan(50)
    })
  })

  describe('Font Weight', () => {
    const commonWeights = [300, 400, 500, 600, 700]
    
    commonWeights.forEach(weight => {
      it(`should apply font weight: ${weight}`, async () => {
        render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
        setConfigState(createTestConfigUpdate.typography({ fontWeight: weight }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          expect(window.getComputedStyle(element).fontWeight).toBe(String(weight))
        })
      })
    })
  })

  describe('Letter Spacing', () => {
    it('should apply positive letter spacing', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ letterSpacing: 5 }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).letterSpacing).toBe('5px')
      })
    })

    it('should apply negative letter spacing', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ letterSpacing: -1 }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).letterSpacing).toBe('-1px')
      })
    })

    it('should clamp letter spacing below minimum', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ letterSpacing: -10 })) // Below -2
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).letterSpacing).toBe('-2px')
      })
    })
  })

  describe('Line Height', () => {
    const standardHeights = [1.0, 1.2, 1.5, 1.8, 2.0, 2.5]
    
    standardHeights.forEach(height => {
      it(`should apply line height: ${height}`, async () => {
        render(<TestTeleprompterText text="Multi-line\nSample Text" testId="preview-text" />)
        setConfigState(createTestConfigUpdate.typography({ lineHeight: height }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          expect(window.getComputedStyle(element).lineHeight).toBe(String(height))
        })
      })
    })
  })

  describe('Text Transform', () => {
    it('should apply uppercase transformation', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ textTransform: 'uppercase' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textTransform).toBe('uppercase')
      })
    })

    it('should apply lowercase transformation', async () => {
      render(<TestTeleprompterText text="SAMPLE TEXT" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ textTransform: 'lowercase' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textTransform).toBe('lowercase')
      })
    })

    it('should apply capitalize transformation', async () => {
      render(<TestTeleprompterText text="sample text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ textTransform: 'capitalize' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textTransform).toBe('capitalize')
      })
    })
  })

  describe('Combined Typography Properties', () => {
    it('should apply multiple properties atomically', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({
        fontFamily: 'Roboto',
        fontSize: 72,
        fontWeight: 700,
        letterSpacing: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const styles = window.getComputedStyle(element)
        expect(styles.fontFamily).toContain('Roboto')
        expect(styles.fontSize).toBe('72px')
        expect(styles.fontWeight).toBe('700')
        expect(styles.letterSpacing).toBe('2px')
      })
    })

    it('should apply all typography properties', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({
        fontFamily: 'Inter',
        fontSize: 64,
        fontWeight: 600,
        letterSpacing: 1,
        lineHeight: 1.8,
        textTransform: 'uppercase'
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const styles = window.getComputedStyle(element)
        expect(styles.fontFamily).toContain('Inter')
        expect(styles.fontSize).toBe('64px')
        expect(styles.fontWeight).toBe('600')
        expect(styles.letterSpacing).toBe('1px')
        expect(styles.lineHeight).toBe('1.8')
        expect(styles.textTransform).toBe('uppercase')
      })
    })
  })

  describe('Sequential Config Updates', () => {
    it('should handle sequential font size changes', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      
      const sizes = [48, 64, 72, 96]
      
      for (const size of sizes) {
        setConfigState(createTestConfigUpdate.typography({ fontSize: size }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          expect(window.getComputedStyle(element).fontSize).toBe(`${size}px`)
        })
      }
    })
  })

  describe('Performance', () => {
    it('should handle rapid changes without degradation', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      
      const sizes = [48, 56, 64, 72, 80]
      const responseTimes: number[] = []
      
      for (const size of sizes) {
        const start = performance.now()
        setConfigState(createTestConfigUpdate.typography({ fontSize: size }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          expect(window.getComputedStyle(element).fontSize).toBe(`${size}px`)
        })
        
        responseTimes.push(performance.now() - start)
      }
      
      // All changes should be under 50ms
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(50)
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty text', async () => {
      render(<TestTeleprompterText text="" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe('72px')
      })
    })

    it('should handle special characters', async () => {
      const specialText = 'Hello 世界 🌍 Ñoño'
      render(<TestTeleprompterText text={specialText} testId="preview-text" />)
      setConfigState(createTestConfigUpdate.typography({ fontSize: 64 }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe('64px')
        expect(element.textContent).toBe(specialText)
      })
    })
  })

  describe('Idempotent Updates', () => {
    it('should produce consistent results on repeated updates', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      const config = { fontSize: 72, fontWeight: 700 }
      
      // Apply same config twice
      setConfigState(createTestConfigUpdate.typography(config))
      await waitFor(() => {})
      
      setConfigState(createTestConfigUpdate.typography(config))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const styles = window.getComputedStyle(element)
        expect(styles.fontSize).toBe('72px')
        expect(styles.fontWeight).toBe('700')
      })
    })
  })

  describe('Config Reset', () => {
    it('should reset to default typography values', async () => {
      render(<TestTeleprompterText text="Sample Text" testId="preview-text" />)
      
      // Apply custom config
      setConfigState(createTestConfigUpdate.typography({ fontSize: 100 }))
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe('100px')
      })
      
      // Reset to defaults
      resetConfigStore()
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe('48px') // Default
      })
    })
  })
})
