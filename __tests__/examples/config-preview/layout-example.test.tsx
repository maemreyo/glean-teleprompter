/**
 * Layout Configuration Impact Tests - Example Suite
 * 
 * This file demonstrates comprehensive testing patterns for layout
 * configuration changes and their visual impact on preview components.
 * 
 * Run: npm test -- __tests__/examples/config-preview/layout-example.test.tsx
 */

import { render, screen, waitFor } from '@testing-library/react'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '@/__tests__/utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '@/__tests__/utils/test-helpers'

// Mock config store for testing
jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: jest.fn(),
}))

// Wrapper component for testing
function TestLayoutContainer({ testId = 'container' }: { testId?: string }) {
  return (
    <div 
      data-testid={testId} 
      style={{ 
        marginLeft: '0%',
        marginRight: '0%',
        paddingTop: '0%',
        paddingBottom: '0%',
        textAlign: 'left' as const,
        columnCount: 1,
        width: '100%',
        transform: 'none'
      }}
    >
      <div data-testid="preview-text" style={{ fontSize: '48px' }}>
        Sample Text
      </div>
    </div>
  )
}

describe('Layout Config Impact Tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Horizontal Margin', () => {
    const margins = [0, 10, 20, 30, 40, 50]
    
    margins.forEach(margin => {
      it(`should apply horizontal margin: ${margin}%`, async () => {
        render(<TestLayoutContainer testId="container" />)
        setConfigState(createTestConfigUpdate.layout({ horizontalMargin: margin }))
        
        await waitFor(() => {
          const container = screen.getByTestId('container')
          expect(window.getComputedStyle(container).marginLeft).toBe(`${margin}%`)
          expect(window.getComputedStyle(container).marginRight).toBe(`${margin}%`)
        })
      })
    })

    it('should apply equal left and right margins', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ horizontalMargin: 15 }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        const marginLeft = window.getComputedStyle(container).marginLeft
        const marginRight = window.getComputedStyle(container).marginRight
        expect(marginLeft).toBe(marginRight)
        expect(marginLeft).toBe('15%')
      })
    })
  })

  describe('Vertical Padding', () => {
    const paddings = [0, 5, 10, 20, 30, 50]
    
    paddings.forEach(padding => {
      it(`should apply vertical padding: ${padding}%`, async () => {
        render(<TestLayoutContainer testId="container" />)
        setConfigState(createTestConfigUpdate.layout({ verticalPadding: padding }))
        
        await waitFor(() => {
          const container = screen.getByTestId('container')
          expect(window.getComputedStyle(container).paddingTop).toBe(`${padding}%`)
          expect(window.getComputedStyle(container).paddingBottom).toBe(`${padding}%`)
        })
      })
    })

    it('should apply both padding and margin', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({
        horizontalMargin: 10,
        verticalPadding: 15
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        const styles = window.getComputedStyle(container)
        expect(styles.marginLeft).toBe('10%')
        expect(styles.marginRight).toBe('10%')
        expect(styles.paddingTop).toBe('15%')
        expect(styles.paddingBottom).toBe('15%')
      })
    })
  })

  describe('Text Alignment', () => {
    it('should apply left alignment', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAlign: 'left' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textAlign).toBe('left')
      })
    })

    it('should apply center alignment', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textAlign).toBe('center')
      })
    })

    it('should apply right alignment', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAlign: 'right' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textAlign).toBe('right')
      })
    })

    it('should apply justify alignment', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAlign: 'justify' }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).textAlign).toBe('justify')
      })
    })

    it('should switch between alignments', async () => {
      render(<TestLayoutContainer testId="container" />)
      
      // Start with left
      setConfigState(createTestConfigUpdate.layout({ textAlign: 'left' }))
      await waitFor(() => {
        expect(window.getComputedStyle(screen.getByTestId('preview-text')).textAlign).toBe('left')
      })
      
      // Switch to center
      setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))
      await waitFor(() => {
        expect(window.getComputedStyle(screen.getByTestId('preview-text')).textAlign).toBe('center')
      })
    })
  })

  describe('Column Layout', () => {
    it('should apply single column layout', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ columnLayout: 1 }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).columnCount).toBe('1')
      })
    })

    it('should apply two column layout', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ columnLayout: 2 }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).columnCount).toBe('2')
      })
    })

    it('should apply three column layout', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ columnLayout: 3 }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).columnCount).toBe('3')
      })
    })
  })

  describe('Text Area Width', () => {
    const widths = [50, 60, 70, 80, 90, 100]
    
    widths.forEach(width => {
      it(`should apply text area width: ${width}%`, async () => {
        render(<TestLayoutContainer testId="container" />)
        setConfigState(createTestConfigUpdate.layout({ textAreaWidth: width }))
        
        await waitFor(() => {
          const container = screen.getByTestId('container')
          expect(window.getComputedStyle(container).width).toBe(`${width}%`)
        })
      })
    })
  })

  describe('Text Area Position', () => {
    it('should apply positive horizontal offset', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAreaPosition: 20 }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        const transform = window.getComputedStyle(container).transform
        // Transform will be set when position is non-zero
        expect(transform).toBeTruthy()
      })
    })

    it('should apply negative horizontal offset', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAreaPosition: -20 }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        const transform = window.getComputedStyle(container).transform
        expect(transform).toBeTruthy()
      })
    })

    it('should apply no offset at position 0', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAreaPosition: 0 }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        const transform = window.getComputedStyle(container).transform
        expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
      })
    })
  })

  describe('Combined Layout Properties', () => {
    it('should apply all layout properties', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({
        horizontalMargin: 10,
        verticalPadding: 15,
        textAlign: 'center',
        columnLayout: 1,
        textAreaWidth: 80,
        textAreaPosition: 0
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        const styles = window.getComputedStyle(container)
        expect(styles.marginLeft).toBe('10%')
        expect(styles.marginRight).toBe('10%')
        expect(styles.paddingTop).toBe('15%')
        expect(styles.paddingBottom).toBe('15%')
        expect(styles.width).toBe('80%')
      })
    })

    it('should apply multi-column layout with alignment', async () => {
      render(<TestLayoutContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({
        columnLayout: 2,
        textAlign: 'justify'
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        const styles = window.getComputedStyle(container)
        expect(styles.columnCount).toBe('2')
      })
    })
  })

  describe('Layout Performance', () => {
    it('should apply layout changes within 50ms', async () => {
      render(<TestLayoutContainer testId="container" />)
      
      const startTime = performance.now()
      setConfigState(createTestConfigUpdate.layout({
        horizontalMargin: 15,
        verticalPadding: 20
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).marginLeft).toBe('15%')
      })
      
      const responseTime = performance.now() - startTime
      expect(responseTime).toBeLessThan(50)
    })
  })

  describe('Config Reset', () => {
    it('should reset to default layout values', async () => {
      render(<TestLayoutContainer testId="container" />)
      
      // Apply custom config
      setConfigState(createTestConfigUpdate.layout({
        horizontalMargin: 20,
        verticalPadding: 25
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).marginLeft).toBe('20%')
      })
      
      // Reset to defaults
      resetConfigStore()
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        // Default margin is 10%
        expect(window.getComputedStyle(container).marginLeft).toBe('10%')
      })
    })
  })
})
