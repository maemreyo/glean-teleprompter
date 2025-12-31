# Animation Configuration Impact Testing Guide

**Category**: Animations  
**User Story**: US5 - Animation Testing Documentation  
**Purpose**: Comprehensive testing guide for animation configuration changes and their visual impact

## Overview

This guide provides detailed testing patterns for validating animation configuration changes in the preview. Animations include smooth scroll, entrance animation, word highlight, auto scroll, and animation acceleration.

## Configuration Properties

| Property | Type | Range | Default | Description |
|----------|------|-------|---------|-------------|
| `smoothScrollEnabled` | boolean | true/false | true | Enable/disable smooth scrolling |
| `entranceAnimation` | string | 'none' \| 'fade' \| 'slide' \| 'zoom' | 'fade' | Entrance animation type |
| `wordHighlightEnabled` | boolean | true/false | false | Enable word-by-word highlight |
| `autoScrollEnabled` | boolean | true/false | false | Enable automatic scrolling |
| `autoScrollSpeed` | number | 1-10 | 5 | Auto scroll speed |
| `animationAcceleration` | number | 1-4 | 1 | Animation speed multiplier |

## Smooth Scroll Testing

### Enable/Disable Smooth Scroll

```typescript
describe('Smooth Scroll', () => {
  it('should not apply smooth scroll when disabled', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.animations({
      smoothScrollEnabled: false
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      expect(container).not.toHaveClass('smooth-scroll')
    })
  })
  
  it('should apply smooth scroll when enabled', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.animations({
      smoothScrollEnabled: true
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      expect(container).toHaveClass('smooth-scroll')
    })
  })
})
```

### Scroll Behavior Property

```typescript
it('should set scroll-behavior to smooth', async () => {
  render(<TeleprompterContainer testId="container" />)
  setConfigState(createTestConfigUpdate.animations({
    smoothScrollEnabled: true
  }))
  
  await waitFor(() => {
    const container = screen.getByTestId('container')
    expect(window.getComputedStyle(container).scrollBehavior).toBe('smooth')
  })
})
```

## Entrance Animation Testing

### Animation Types

```typescript
describe('Entrance Animation', () => {
  const animations = ['none', 'fade', 'slide', 'zoom']
  
  animations.forEach(animation => {
    it(`should apply entrance animation: ${animation}`, async () => {
      render(<TeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.animations({
        entranceAnimation: animation
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        if (animation === 'none') {
          expect(element).not.toHaveClass(/animate-/)
        } else {
          expect(element).toHaveClass(`animate-${animation}`)
        }
      })
    })
  })
})
```

### Animation Completion

```typescript
it('should complete entrance animation', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  setConfigState(createTestConfigUpdate.animations({
    entranceAnimation: 'fade'
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(element).toHaveClass('animate-fade')
  })
  
  // Wait for animation to complete (typically 500ms)
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const animation = window.getComputedStyle(element).animationName
    // After animation completes, check that element is visible
    expect(element).toBeVisible()
  }, { timeout: 1000 })
})
```

### Animation Properties

```typescript
it('should apply animation duration and timing', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  setConfigState(createTestConfigUpdate.animations({
    entranceAnimation: 'fade'
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const styles = window.getComputedStyle(element)
    expect(styles.animationDuration).toBeTruthy()
    expect(styles.animationTimingFunction).toBeTruthy()
  })
})
```

## Word Highlight Testing

### Enable/Disable Word Highlight

```typescript
describe('Word Highlight', () => {
  it('should not apply word highlight when disabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.animations({
      wordHighlightEnabled: false
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(element).not.toHaveClass('word-highlight')
    })
  })
  
  it('should apply word highlight when enabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.animations({
      wordHighlightEnabled: true
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(element).toHaveClass('word-highlight')
    })
  })
})
```

### Word Highlight Progress

```typescript
it('should highlight words progressively', async () => {
  render(<TeleprompterText text="Word1 Word2 Word3" testId="preview-text" />)
  setConfigState(createTestConfigUpdate.animations({
    wordHighlightEnabled: true
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(element).toHaveClass('word-highlight')
  })
  
  // Simulate word progression
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const highlightProgress = element.getAttribute('data-highlight-progress')
    expect(highlightProgress).toBeTruthy()
  }, { timeout: 2000 })
})
```

## Auto Scroll Testing

### Enable/Disable Auto Scroll

```typescript
describe('Auto Scroll', () => {
  it('should not auto scroll when disabled', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.animations({
      autoScrollEnabled: false
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      const scrollTop = container.scrollTop
      // Should not scroll after delay
      setTimeout(() => {
        expect(container.scrollTop).toBe(scrollTop)
      }, 100)
    })
  })
  
  it('should auto scroll when enabled', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.animations({
      autoScrollEnabled: true,
      autoScrollSpeed: 5
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      const initialScrollTop = container.scrollTop
      
      // Wait for scroll to occur
      setTimeout(() => {
        expect(container.scrollTop).toBeGreaterThan(initialScrollTop)
      }, 500)
    })
  })
})
```

### Auto Scroll Speed

```typescript
describe('Auto Scroll Speed', () => {
  const speeds = [1, 3, 5, 7, 10]
  
  speeds.forEach(speed => {
    it(`should apply auto scroll speed: ${speed}`, async () => {
      render(<TeleprompterContainer testId="container" />)
      setConfigState(createTestConfigUpdate.animations({
        autoScrollEnabled: true,
        autoScrollSpeed: speed
      }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(container).toHaveAttribute('data-scroll-speed', String(speed))
      })
    })
  })
})
```

## Animation Acceleration Testing

### Speed Multiplier

```typescript
describe('Animation Acceleration', () => {
  const accelerations = [1, 2, 3, 4]
  
  accelerations.forEach(acceleration => {
    it(`should apply animation acceleration: ${acceleration}x`, async () => {
      render(<TeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.animations({
        animationAcceleration: acceleration
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const duration = parseFloat(window.getComputedStyle(element).animationDuration)
        // Higher acceleration = shorter duration
        const expectedDuration = 0.5 / acceleration // Base duration 500ms
        expect(Math.abs(duration - expectedDuration)).toBeLessThan(0.1)
      })
    })
  })
})
```

### Acceleration with Different Animations

```typescript
it('should apply acceleration to entrance animation', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  setConfigState(createTestConfigUpdate.animations({
    entranceAnimation: 'fade',
    animationAcceleration: 2
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const duration = parseFloat(window.getComputedStyle(element).animationDuration)
    // With 2x acceleration, duration should be half
    expect(duration).toBeLessThan(0.3) // Less than 300ms
  })
})
```

## Combined Animation Properties

### Multiple Animations Together

```typescript
describe('Combined Animation Properties', () => {
  it('should apply smooth scroll with entrance animation', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.animations({
      smoothScrollEnabled: true,
      entranceAnimation: 'fade'
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      expect(container).toHaveClass('smooth-scroll')
      expect(container.querySelector('[data-testid="preview-text"]')).toHaveClass('animate-fade')
    })
  })
  
  it('should apply all animation properties', async () => {
    render(<TeleprompterContainer testId="container" />)
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
      expect(container).toHaveClass('smooth-scroll')
    })
  })
})
```

## Performance Tests

### Animation Frame Rate

```typescript
describe('Animation Performance', () => {
  it('should maintain 60 FPS during smooth scroll', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.animations({
      smoothScrollEnabled: true
    }))
    
    const frameTimes: number[] = []
    let lastFrameTime = performance.now()
    
    const measureFrame = () => {
      frameTimes.push(performance.now() - lastFrameTime)
      lastFrameTime = performance.now()
      
      if (frameTimes.length < 60) {
        requestAnimationFrame(measureFrame)
      }
    }
    
    requestAnimationFrame(measureFrame)
    
    await waitFor(() => {
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
      // 60 FPS = 16.67ms per frame
      expect(avgFrameTime).toBeLessThan(20) // Allow some variance
    }, { timeout: 2000 })
  })
})
```

### Animation Completion Time

```typescript
it('should complete entrance animation within expected time', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  setConfigState(createTestConfigUpdate.animations({
    entranceAnimation: 'fade',
    animationAcceleration: 1
  }))
  
  const startTime = performance.now()
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(element).toHaveClass('animate-fade')
  })
  
  // Wait for animation to complete
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const animationState = window.getComputedStyle(element).animationPlayState
    expect(animationState).toBe('running' || 'finished')
  })
  
  const endTime = performance.now()
  const duration = endTime - startTime
  
  // Base animation is 500ms, allow 100ms variance
  expect(duration).toBeGreaterThan(400)
  expect(duration).toBeLessThan(700)
})
```

## Accessibility Tests

### Reduced Motion Preference

```typescript
describe('Animation Accessibility', () => {
  it('should respect prefers-reduced-motion', async () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
    
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.animations({
      entranceAnimation: 'fade'
    }))
    
    await waitFor(() => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      expect(mediaQuery.matches).toBe(true)
    })
  })
})
```

## Edge Cases

### Zero Speed

```typescript
describe('Animation Edge Cases', () => {
  it('should handle zero auto scroll speed', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.animations({
      autoScrollEnabled: true,
      autoScrollSpeed: 0
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      // Should not scroll with speed 0
      const initialScrollTop = container.scrollTop
      setTimeout(() => {
        expect(container.scrollTop).toBe(initialScrollTop)
      }, 100)
    })
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Quick Reference](./quick-reference.md) - Fast lookup guide
- [Typography Testing Guide](./typography-testing.md) - Typography configuration testing
- [Test Patterns](./examples/test-patterns.md) - Common testing patterns
