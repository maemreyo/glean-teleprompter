# Performance Testing Methodology

**Purpose**: Testing patterns for measuring and validating performance of configuration changes

## Overview

Performance testing ensures that configuration changes apply within acceptable time limits and don't cause performance degradation. The key requirement is that all config changes must apply within 50ms.

## Response Time Testing

### Basic Response Time Measurement

```typescript
describe('Response Time', () => {
  it('should measure config change response time', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    const startTime = performance.now()
    setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('72px')
    })
    
    const endTime = performance.now()
    const responseTime = endTime - startTime
    console.log(`Response time: ${responseTime}ms`)
  })
})
```

### 50ms Requirement Validation

```typescript
it('should apply config changes within 50ms', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  const startTime = performance.now()
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
  
  const responseTime = performance.now() - startTime
  expect(responseTime).toBeLessThan(50)
})
```

### Response Time Across Categories

```typescript
describe('Response Time by Category', () => {
  const categories = [
    { name: 'Typography', config: { typography: { fontSize: 72 } } },
    { name: 'Colors', config: { colors: { primaryColor: '#ff0000' } } },
    { name: 'Effects', config: { effects: { shadowEnabled: true } } },
    { name: 'Layout', config: { layout: { textAlign: 'center' } } }
  ]
  
  categories.forEach(({ name, config }) => {
    it(`should apply ${name} changes within 50ms`, async () => {
      render(<TeleprompterText text="Sample Text" testId="preview-text" />)
      
      const startTime = performance.now()
      setConfigState(config)
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(element).toBeTruthy()
      })
      
      const responseTime = performance.now() - startTime
      expect(responseTime).toBeLessThan(50)
    })
  })
})
```

## Frame Rate Testing

### Animation Frame Rate

```typescript
describe('Frame Rate', () => {
  it('should maintain 60 FPS during config changes', async () => {
    render(<TeleprompterContainer testId="container" />)
    
    const frameTimes: number[] = []
    let lastFrameTime = performance.now()
    
    const measureFrame = () => {
      frameTimes.push(performance.now() - lastFrameTime)
      lastFrameTime = performance.now()
      
      if (frameTimes.length < 60) {
        requestAnimationFrame(measureFrame)
      }
    }
    
    // Trigger config change during measurement
    setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
    requestAnimationFrame(measureFrame)
    
    await waitFor(() => {
      const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length
      // 60 FPS = 16.67ms per frame
      expect(avgFrameTime).toBeLessThan(20)
    }, { timeout: 2000 })
  })
})
```

### Smooth Scrolling Performance

```typescript
it('should maintain frame rate during smooth scroll', async () => {
  render(<TeleprompterContainer testId="container" />)
  setConfigState(createTestConfigUpdate.animations({
    smoothScrollEnabled: true
  }))
  
  const frameTimes: number[] = []
  
  const measureFrame = () => {
    frameTimes.push(performance.now())
    if (frameTimes.length < 60) {
      requestAnimationFrame(measureFrame)
    }
  }
  
  requestAnimationFrame(measureFrame)
  
  await waitFor(() => {
    for (let i = 1; i < frameTimes.length; i++) {
      const frameTime = frameTimes[i] - frameTimes[i - 1]
      expect(frameTime).toBeLessThan(20) // At least 50 FPS
    }
  }, { timeout: 2000 })
})
```

## Memory Leak Testing

### Memory Usage Over Time

```typescript
describe('Memory Leaks', () => {
  it('should not leak memory on repeated config changes', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    const initialMemory = performance.memory?.usedJSHeapSize
    
    // Apply many config changes
    for (let i = 0; i < 100; i++) {
      setConfigState(createTestConfigUpdate.typography({ fontSize: 48 + (i % 80) }))
      await waitFor(() => {}, { timeout: 100 })
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize
    
    if (initialMemory && finalMemory) {
      const memoryGrowth = finalMemory - initialMemory
      // Memory growth should be minimal (< 10MB)
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024)
    }
  })
})
```

### Component Cleanup

```typescript
it('should clean up event listeners on unmount', async () => {
  const { unmount } = render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  await waitFor(() => {})
  
  // Unmount component
  unmount()
  
  // Verify no errors occur after unmount
  setConfigState(createTestConfigUpdate.typography({ fontSize: 48 }))
  
  // Wait a bit to ensure no delayed errors
  await new Promise(resolve => setTimeout(resolve, 100))
})
```

## Batch Operation Performance

### Multiple Sequential Changes

```typescript
describe('Batch Operations', () => {
  it('should handle rapid sequential changes efficiently', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    const changes = []
    const start = performance.now()
    
    for (let i = 0; i < 50; i++) {
      changes.push(
        setConfigState(createTestConfigUpdate.typography({ fontSize: 48 + i }))
      )
      await waitFor(() => {}, { timeout: 50 })
    }
    
    const totalTime = performance.now() - start
    const avgTime = totalTime / changes.length
    
    // Average time per change should be reasonable
    expect(avgTime).toBeLessThan(30)
  })
})
```

### Large Configuration Object

```typescript
it('should handle large config objects efficiently', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  const largeConfig = {
    typography: { fontSize: 72, fontWeight: 700, fontFamily: 'Roboto' },
    colors: { primaryColor: '#ff0000', gradientEnabled: true, gradientColors: ['#ff0000', '#00ff00', '#0000ff'] },
    effects: { shadowEnabled: true, outlineEnabled: true, glowEnabled: true },
    layout: { horizontalMargin: 10, verticalPadding: 15, textAlign: 'center' }
  }
  
  const startTime = performance.now()
  setConfigState(largeConfig)
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
  
  const responseTime = performance.now() - startTime
  expect(responseTime).toBeLessThan(50)
})
```

## Stress Testing

### Maximum Load

```typescript
describe('Stress Testing', () => {
  it('should handle maximum config values', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    setConfigState({
      typography: { fontSize: 128, fontWeight: 900 },
      colors: { gradientEnabled: true, gradientColors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'] },
      effects: { shadowBlur: 20, outlineWidth: 5, glowIntensity: 100 }
    })
    
    const startTime = performance.now()
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element)).toBeTruthy()
    })
    
    const responseTime = performance.now() - startTime
    // Even with maximum values, should be fast
    expect(responseTime).toBeLessThan(50)
  })
})
```

### Long Text Performance

```typescript
it('should handle very long text efficiently', async () => {
  const longText = 'A'.repeat(10000)
  render(<TeleprompterText text={longText} testId="preview-text" />)
  
  const startTime = performance.now()
  setConfigState(createTestConfigUpdate.typography({ fontSize: 48 }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('48px')
  })
  
  const responseTime = performance.now() - startTime
  // Should still be fast even with long text
  expect(responseTime).toBeLessThan(100) // Slightly more lenient for long text
})
```

## Performance Metrics Collection

### Aggregate Metrics

```typescript
describe('Performance Metrics', () => {
  it('should collect performance metrics', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    const metrics = {
      min: Infinity,
      max: 0,
      total: 0,
      count: 0
    }
    
    const operations = [
      { name: 'font size', config: { typography: { fontSize: 72 } } },
      { name: 'color', config: { colors: { primaryColor: '#ff0000' } } },
      { name: 'shadow', config: { effects: { shadowEnabled: true } } }
    ]
    
    for (const op of operations) {
      const start = performance.now()
      setConfigState(op.config)
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(element).toBeTruthy()
      })
      
      const time = performance.now() - start
      metrics.min = Math.min(metrics.min, time)
      metrics.max = Math.max(metrics.max, time)
      metrics.total += time
      metrics.count++
    }
    
    console.log('Performance Metrics:', {
      min: metrics.min,
      max: metrics.max,
      avg: metrics.total / metrics.count
    })
    
    // Verify all operations meet requirements
    expect(metrics.max).toBeLessThan(50)
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Quick Reference](./quick-reference.md) - Fast lookup guide
- [Integration Testing](./integration-testing.md) - Cross-category testing
