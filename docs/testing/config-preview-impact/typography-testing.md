# Typography Configuration Impact Testing Guide

**Category**: Typography  
**User Story**: US1 - Typography Testing Documentation  
**Purpose**: Comprehensive testing guide for typography configuration changes and their visual impact

## Overview

This guide provides detailed testing patterns for validating typography configuration changes in the preview. Typography includes font family, size, weight, letter spacing, line height, and text transformation.

## Configuration Properties

| Property | Type | Range | Default | Description |
|----------|------|-------|---------|-------------|
| `fontFamily` | string | Available fonts | 'Inter' | Font family for teleprompter text |
| `fontSize` | number | 32 - 128 | 48 | Font size in pixels |
| `fontWeight` | number | 100 - 900 | 400 | Font weight (thickness) |
| `letterSpacing` | number | -2 - 10 | 0 | Letter spacing in pixels |
| `lineHeight` | number | 1.0 - 2.5 | 1.5 | Line height as multiplier |
| `textTransform` | string | 'none' \| 'uppercase' \| 'lowercase' \| 'capitalize' | 'none' | Text transformation |

## Font Family Testing

### Single Font Family

```typescript
describe('Font Family', () => {
  it('should apply Inter font family', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Inter' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const fontFamily = window.getComputedStyle(element).fontFamily
      expect(fontFamily).toContain('Inter')
    })
  })
  
  it('should apply Roboto font family', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Roboto' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const fontFamily = window.getComputedStyle(element).fontFamily
      expect(fontFamily).toContain('Roboto')
    })
  })
  
  it('should apply Open Sans font family', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Open Sans' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const fontFamily = window.getComputedStyle(element).fontFamily
      expect(fontFamily).toContain('Open Sans')
    })
  })
})
```

### Font Family Fallback

```typescript
it('should use fallback font when primary is not available', async () => {
  render(<TeleprompterText text="Sample Text" />)
  setConfigState(createTestConfigUpdate.typography({ fontFamily: 'NonExistentFont, sans-serif' }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const fontFamily = window.getComputedStyle(element).fontFamily
    // Should fall back to sans-serif
    expect(fontFamily).toContain('sans-serif')
  })
})
```

## Font Size Testing

### Standard Font Sizes

```typescript
describe('Font Size', () => {
  const standardSizes = [32, 48, 64, 72, 96, 128]
  
  standardSizes.forEach(size => {
    it(`should apply font size: ${size}px`, async () => {
      render(<TeleprompterText text="Sample Text" />)
      setConfigState(createTestConfigUpdate.typography({ fontSize: size }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe(`${size}px`)
      })
    })
  })
})
```

### Boundary Values

```typescript
describe('Font Size Boundaries', () => {
  it('should apply minimum font size (32px)', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontSize: 32 }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('32px')
    })
  })
  
  it('should apply maximum font size (128px)', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontSize: 128 }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('128px')
    })
  })
  
  it('should clamp values below minimum', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontSize: 10 })) // Below minimum
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('32px') // Should clamp to min
    })
  })
  
  it('should clamp values above maximum', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontSize: 200 })) // Above maximum
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('128px') // Should clamp to max
    })
  })
})
```

### Font Size Response Time

```typescript
it('should apply font size change within 50ms', async () => {
  render(<TeleprompterText text="Sample Text" />)
  
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

## Font Weight Testing

### Standard Font Weights

```typescript
describe('Font Weight', () => {
  const standardWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]
  
  standardWeights.forEach(weight => {
    it(`should apply font weight: ${weight}`, async () => {
      render(<TeleprompterText text="Sample Text" />)
      setConfigState(createTestConfigUpdate.typography({ fontWeight: weight }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontWeight).toBe(String(weight))
      })
    })
  })
})
```

### Common Font Weights

```typescript
describe('Common Font Weights', () => {
  it('should apply light weight (300)', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontWeight: 300 }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontWeight).toBe('300')
    })
  })
  
  it('should apply normal weight (400)', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontWeight: 400 }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontWeight).toBe('400')
    })
  })
  
  it('should apply bold weight (700)', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ fontWeight: 700 }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontWeight).toBe('700')
    })
  })
})
```

## Letter Spacing Testing

### Positive Letter Spacing

```typescript
describe('Letter Spacing (Positive)', () => {
  const positiveValues = [0, 2, 5, 10]
  
  positiveValues.forEach(spacing => {
    it(`should apply letter spacing: ${spacing}px`, async () => {
      render(<TeleprompterText text="Sample Text" />)
      setConfigState(createTestConfigUpdate.typography({ letterSpacing: spacing }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).letterSpacing).toBe(`${spacing}px`)
      })
    })
  })
})
```

### Negative Letter Spacing

```typescript
describe('Letter Spacing (Negative)', () => {
  const negativeValues = [-2, -1]
  
  negativeValues.forEach(spacing => {
    it(`should apply negative letter spacing: ${spacing}px`, async () => {
      render(<TeleprompterText text="Sample Text" />)
      setConfigState(createTestConfigUpdate.typography({ letterSpacing: spacing }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).letterSpacing).toBe(`${spacing}px`)
      })
    })
  })
})
```

### Letter Spacing Boundary

```typescript
it('should clamp letter spacing below minimum', async () => {
  render(<TeleprompterText text="Sample Text" />)
  setConfigState(createTestConfigUpdate.typography({ letterSpacing: -10 })) // Below -2
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).letterSpacing).toBe('-2px') // Should clamp
  })
})
```

## Line Height Testing

### Standard Line Heights

```typescript
describe('Line Height', () => {
  const standardHeights = [1.0, 1.2, 1.5, 1.8, 2.0, 2.5]
  
  standardHeights.forEach(height => {
    it(`should apply line height: ${height}`, async () => {
      render(<TeleprompterText text="Multi-line\nSample Text" />)
      setConfigState(createTestConfigUpdate.typography({ lineHeight: height }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).lineHeight).toBe(String(height))
      })
    })
  })
})
```

### Line Height with Multi-line Text

```typescript
it('should apply line height to multi-line text', async () => {
  const multilineText = 'First line\nSecond line\nThird line'
  render(<TeleprompterText text={multilineText} />)
  setConfigState(createTestConfigUpdate.typography({ lineHeight: 2.0 }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const lineHeight = window.getComputedStyle(element).lineHeight
    expect(lineHeight).toBe('2')
    
    // Verify spacing between lines
    const elementHeight = element.offsetHeight
    const numberOfLines = 3
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize)
    const expectedHeight = fontSize * 2.0 * numberOfLines
    
    // Allow small variance
    expect(elementHeight).toBeGreaterThanOrEqual(expectedHeight * 0.9)
    expect(elementHeight).toBeLessThanOrEqual(expectedHeight * 1.1)
  })
})
```

## Text Transform Testing

### All Transform Options

```typescript
describe('Text Transform', () => {
  it('should apply none transformation', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ textTransform: 'none' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textTransform).toBe('none')
    })
  })
  
  it('should apply uppercase transformation', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({ textTransform: 'uppercase' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textTransform).toBe('uppercase')
      expect(element.textContent).toBe('Sample Text') // Original text unchanged
    })
  })
  
  it('should apply lowercase transformation', async () => {
    render(<TeleprompterText text="SAMPLE TEXT" />)
    setConfigState(createTestConfigUpdate.typography({ textTransform: 'lowercase' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textTransform).toBe('lowercase')
    })
  })
  
  it('should apply capitalize transformation', async () => {
    render(<TeleprompterText text="sample text" />)
    setConfigState(createTestConfigUpdate.typography({ textTransform: 'capitalize' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textTransform).toBe('capitalize')
    })
  })
})
```

## Combined Typography Properties

### Multiple Properties Together

```typescript
describe('Combined Typography Properties', () => {
  it('should apply font family and size together', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({
      fontFamily: 'Roboto',
      fontSize: 72
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.fontFamily).toContain('Roboto')
      expect(styles.fontSize).toBe('72px')
    })
  })
  
  it('should apply size, weight, and spacing together', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({
      fontSize: 64,
      fontWeight: 700,
      letterSpacing: 2
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.fontSize).toBe('64px')
      expect(styles.fontWeight).toBe('700')
      expect(styles.letterSpacing).toBe('2px')
    })
  })
  
  it('should apply all typography properties', async () => {
    render(<TeleprompterText text="Sample Text" />)
    setConfigState(createTestConfigUpdate.typography({
      fontFamily: 'Inter',
      fontSize: 72,
      fontWeight: 600,
      letterSpacing: 1,
      lineHeight: 1.8,
      textTransform: 'uppercase'
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.fontFamily).toContain('Inter')
      expect(styles.fontSize).toBe('72px')
      expect(styles.fontWeight).toBe('600')
      expect(styles.letterSpacing).toBe('1px')
      expect(styles.lineHeight).toBe('1.8')
      expect(styles.textTransform).toBe('uppercase')
    })
  })
})
```

## Performance Tests

### Rapid Config Changes

```typescript
it('should handle rapid typography changes without performance degradation', async () => {
  render(<TeleprompterText text="Sample Text" />)
  
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
  
  // Average should be reasonable
  const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  expect(avgTime).toBeLessThan(30)
})
```

## Edge Cases

### Empty Text

```typescript
it('should handle typography changes with empty text', async () => {
  render(<TeleprompterText text="" />)
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
})
```

### Very Long Text

```typescript
it('should handle typography changes with very long text', async () => {
  const longText = 'A'.repeat(10000)
  render(<TeleprompterText text={longText} />)
  setConfigState(createTestConfigUpdate.typography({ fontSize: 48 }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('48px')
  })
})
```

### Special Characters

```typescript
it('should handle typography changes with special characters', async () => {
  const specialText = 'Hello 世界 🌍 Ñoño'
  render(<TeleprompterText text={specialText} />)
  setConfigState(createTestConfigUpdate.typography({ fontSize: 64 }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('64px')
    expect(element.textContent).toBe(specialText)
  })
})
```

## Accessibility

### Font Size Readability

```typescript
it('should maintain minimum readable font size', async () => {
  render(<TeleprompterText text="Sample Text" />)
  setConfigState(createTestConfigUpdate.typography({ fontSize: 32 })) // Minimum
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize)
    // Should be at least 16px for accessibility (WCAG AA)
    expect(fontSize).toBeGreaterThanOrEqual(16)
  })
})
```

### Line Height Readability

```typescript
it('should maintain readable line height', async () => {
  render(<TeleprompterText text="Multi-line\nText" />)
  setConfigState(createTestConfigUpdate.typography({ lineHeight: 1.5 }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const lineHeight = parseFloat(window.getComputedStyle(element).lineHeight)
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize)
    const lineHeightRatio = lineHeight / fontSize
    
    // WCAG recommends line height of at least 1.5 times the font size
    expect(lineHeightRatio).toBeGreaterThanOrEqual(1.5)
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Quick Reference](./quick-reference.md) - Fast lookup guide
- [Test Patterns](./examples/test-patterns.md) - Common patterns
- [Color Testing Guide](./color-testing.md) - Color configuration testing
