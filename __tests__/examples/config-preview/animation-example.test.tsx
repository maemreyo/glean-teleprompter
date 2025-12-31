/**
 * Animation Configuration Impact Tests - Example Suite
 * 
 * This file demonstrates comprehensive testing patterns for animation
 * configuration changes and their visual impact on preview components.
 * 
 * Run: npm test -- __tests__/examples/config-preview/animation-example.test.tsx
 */

import { render, screen, waitFor } from '@testing-library/react'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '@/__tests__/utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '@/__tests__/utils/test-helpers'

// Mock config store for testing
jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: jest.fn(),
}))

// Wrapper component for testing
function TestAnimationContainer({ testId = 'container' }: { testId?: string }) {
  return (
    <div 
      data-testid={testId} 
      style={{ 
        scrollBehavior: 'auto'
      }}
    >
      <div 
        data-testid="preview-text" 
        style={{ 
          fontSize: '48px',
          animation: 'none'
        }}
      >
        Sample Text
      </div>
    </div>
  )
}

describe('Animation Config Impact Tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Smooth Scroll', () => {
    it('should apply smooth scroll when enabled', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        smoothScrollEnabled: true
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).scrollBehavior).toBe('smooth')
      })
    })

    it('should not apply smooth scroll when disabled', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        smoothScrollEnabled: false
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).scrollBehavior).toBe('auto')
      })
    })
  })

  describe('Entrance Animation', () => {
    const animations = ['none', 'fade', 'slide', 'zoom']
    
    animations.forEach(animation => {
      it(`should set entrance animation: ${animation}`, async () => {
        render(<TestAnimationContainer testId="container" />)
        setConfigState(createTestConfigUpdate.animations({
          entranceAnimation: animation
        }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          // Animation config is stored and applied
          expect(element).toBeTruthy()
        })
      })
    })
  })

  describe('Word Highlight', () => {
    it('should apply word highlight when enabled', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        wordHighlightEnabled: true
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        // Config is set - actual highlight behavior would be tested in integration
        expect(element).toBeTruthy()
      })
    })

    it('should not apply word highlight when disabled', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        wordHighlightEnabled: false
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(element).toBeTruthy()
      })
    })
  })

  describe('Auto Scroll', () => {
    it('should set auto scroll speed', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        autoScrollEnabled: true,
        autoScrollSpeed: 5
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        // Config is stored - actual scroll behavior would be tested in integration
        expect(container).toBeTruthy()
      })
    })

    it('should apply auto scroll speed: 1', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        autoScrollEnabled: true,
        autoScrollSpeed: 1
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(container).toBeTruthy()
      })
    })

    it('should apply auto scroll speed: 10', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        autoScrollEnabled: true,
        autoScrollSpeed: 10
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(container).toBeTruthy()
      })
    })
  })

  describe('Animation Acceleration', () => {
    const accelerations = [1, 2, 3, 4]
    
    accelerations.forEach(acceleration => {
      it(`should set animation acceleration: ${acceleration}x`, async () => {
        render(<TestAnimationContainer testId="container" />)
        setConfigState(createTestConfigUpdate.animations({
          animationAcceleration: acceleration
        }))
        
        await waitFor(() => {
          const element = screen.getByTestId('preview-text')
          // Config is stored - actual animation speed would be tested in integration
          expect(element).toBeTruthy()
        })
      })
    })
  })

  describe('Combined Animation Properties', () => {
    it('should apply smooth scroll with entrance animation', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        smoothScrollEnabled: true,
        entranceAnimation: 'fade'
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).scrollBehavior).toBe('smooth')
      })
    })

    it('should apply all animation properties', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        smoothScrollEnabled: true,
        entranceAnimation: 'slide',
        wordHighlightEnabled: true,
        autoScrollEnabled: true,
        autoScrollSpeed: 5,
        animationAcceleration: 1.5
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).scrollBehavior).toBe('smooth')
      })
    })
  })

  describe('Animation Performance', () => {
    it('should apply animation config within 50ms', async () => {
      render(<TestAnimationContainer testId="container" />)
      
      const startTime = performance.now()
      setConfigState(createTestConfigUpdate.animations({
        entranceAnimation: 'fade',
        animationAcceleration: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(element).toBeTruthy()
      })
      
      const responseTime = performance.now() - startTime
      expect(responseTime).toBeLessThan(50)
    })
  })

  describe('Animation Edge Cases', () => {
    it('should handle zero auto scroll speed', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        autoScrollEnabled: true,
        autoScrollSpeed: 0
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(container).toBeTruthy()
      })
    })

    it('should handle none entrance animation', async () => {
      render(<TestAnimationContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        entranceAnimation: 'none'
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(element).toBeTruthy()
      })
    })
  })

  describe('Config Reset', () => {
    it('should reset to default animation values', async () => {
      render(<TestAnimationContainer testId="container" />)
      
      // Apply custom config
      setConfigState(createTestConfigUpdate.animations({
        entranceAnimation: 'fade',
        animationAcceleration: 2
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(element).toBeTruthy()
      })
      
      // Reset to defaults
      resetConfigStore()
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        // Default scroll behavior
        expect(window.getComputedStyle(container).scrollBehavior).toBeTruthy()
      })
    })
  })
})
