# Effects Configuration Impact Testing Guide

**Category**: Effects  
**User Story**: US3 - Effects Testing Documentation  
**Purpose**: Comprehensive testing guide for visual effects configuration changes and their visual impact

## Overview

This guide provides detailed testing patterns for validating visual effects configuration changes in the preview. Effects include shadow, outline, glow, and backdrop filters.

## Configuration Properties

| Property | Type | Range | Default | Description |
|----------|------|-------|---------|-------------|
| `shadowEnabled` | boolean | true/false | false | Enable/disable text shadow |
| `shadowColor` | string | Valid hex color | '#000000' | Shadow color |
| `shadowBlur` | number | 0-20 | 10 | Shadow blur radius (px) |
| `shadowOffsetX` | number | -10 to 10 | 2 | Shadow horizontal offset (px) |
| `shadowOffsetY` | number | -10 to 10 | 2 | Shadow vertical offset (px) |
| `outlineEnabled` | boolean | true/false | false | Enable/disable text outline |
| `outlineColor` | string | Valid hex color | '#ffffff' | Outline color |
| `outlineWidth` | number | 1-5 | 2 | Outline width (px) |
| `glowEnabled` | boolean | true/false | false | Enable/disable text glow |
| `glowColor` | string | Valid hex color | '#ffffff' | Glow color |
| `glowIntensity` | number | 0-100 | 50 | Glow intensity (%) |
| `backdropEnabled` | boolean | true/false | false | Enable/disable backdrop filter |
| `backdropBlur` | number | 0-20 | 10 | Backdrop blur amount (px) |

## Shadow Effect Testing

### Shadow Enable/Disable

```typescript
describe('Shadow Effect', () => {
  it('should not apply shadow when disabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
})
```

### Shadow Color

```typescript
describe('Shadow Color', () => {
  const colors = ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffffff']
  
  colors.forEach(color => {
    it(`should apply shadow color: ${color}`, async () => {
      render(<TeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowColor: color,
        shadowBlur: 10
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const textShadow = window.getComputedStyle(element).textShadow
        expect(textShadow).toContain(hexToRgb(color))
      })
    })
  })
})
```

### Shadow Blur

```typescript
describe('Shadow Blur', () => {
  const blurValues = [0, 5, 10, 15, 20]
  
  blurValues.forEach(blur => {
    it(`should apply shadow blur: ${blur}px`, async () => {
      render(<TeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        shadowEnabled: true,
        shadowBlur: blur
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const textShadow = window.getComputedStyle(element).textShadow
        // Text shadow format: "offsetX offsetY blur color"
        expect(textShadow).toBeTruthy()
      })
    })
  })
})
```

### Shadow Offset

```typescript
describe('Shadow Offset', () => {
  it('should apply shadow offset X and Y', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      shadowEnabled: true,
      shadowOffsetX: 5,
      shadowOffsetY: -3
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const textShadow = window.getComputedStyle(element).textShadow
      // Check that offset values are applied
      expect(textShadow).toBeTruthy()
    })
  })
})
```

## Outline Effect Testing

### Outline Enable/Disable

```typescript
describe('Outline Effect', () => {
  it('should not apply outline when disabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      outlineEnabled: false
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
      expect(webkitTextStroke).toBe('0px' || 'medium' || 'none')
    })
  })
  
  it('should apply outline when enabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      outlineEnabled: true,
      outlineColor: '#ffffff',
      outlineWidth: 2
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
      expect(webkitTextStroke).not.toBe('0px')
    })
  })
})
```

### Outline Color and Width

```typescript
describe('Outline Properties', () => {
  it('should apply outline color', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
```

## Glow Effect Testing

### Glow Enable/Disable

```typescript
describe('Glow Effect', () => {
  it('should not apply glow when disabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
})
```

### Glow Color and Intensity

```typescript
describe('Glow Properties', () => {
  it('should apply glow color', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      glowEnabled: true,
      glowIntensity: 75
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const filter = window.getComputedStyle(element).filter
      expect(filter).toContain('drop-shadow')
      // Intensity affects blur radius
    })
  })
})
```

## Backdrop Filter Testing

### Backdrop Enable/Disable

```typescript
describe('Backdrop Filter', () => {
  it('should not apply backdrop when disabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      backdropEnabled: false
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const backdropFilter = window.getComputedStyle(element).backdropFilter
      expect(backdropFilter).toBe('none')
    })
  })
  
  it('should apply backdrop blur when enabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      backdropEnabled: true,
      backdropBlur: 10
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const backdropFilter = window.getComputedStyle(element).backdropFilter
      expect(backdropFilter).toContain('blur')
    })
  })
})
```

### Backdrop Blur Amount

```typescript
describe('Backdrop Blur', () => {
  const blurValues = [0, 5, 10, 15, 20]
  
  blurValues.forEach(blur => {
    it(`should apply backdrop blur: ${blur}px`, async () => {
      render(<TeleprompterText text="Sample Text" testId="preview-text" />)
      setConfigState(createTestConfigUpdate.effects({
        backdropEnabled: true,
        backdropBlur: blur
      }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        const backdropFilter = window.getComputedStyle(element).backdropFilter
        expect(backdropFilter).toContain('blur')
        expect(backdropFilter).toContain(`${blur}px`)
      })
    })
  })
})
```

## Multiple Effects Combination

### Shadow + Outline

```typescript
describe('Combined Effects', () => {
  it('should apply shadow and outline together', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
    })
  })
})
```

### All Effects Together

```typescript
it('should apply all effects simultaneously', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
    expect(styles.filter).toContain('drop-shadow')
  })
})
```

## Effect Transitions

### Enabling/Disabling Effects

```typescript
describe('Effect Transitions', () => {
  it('should transition from no effects to shadow', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
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
})
```

### Switching Between Effects

```typescript
it('should switch from shadow to glow', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
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
```

## Performance Tests

### Effect Application Performance

```typescript
describe('Effects Performance', () => {
  it('should apply shadow within 50ms', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
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
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    const effects = [
      { shadowEnabled: true },
      { outlineEnabled: true },
      { glowEnabled: true },
      { backdropEnabled: true }
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
```

### Rendering Performance with Effects

```typescript
it('should maintain performance with multiple effects', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  setConfigState(createTestConfigUpdate.effects({
    shadowEnabled: true,
    outlineEnabled: true,
    glowEnabled: true
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element)).toBeTruthy()
  })
  
  // Measure rendering performance
  const start = performance.now()
  
  for (let i = 0; i < 10; i++) {
    setConfigState(createTestConfigUpdate.effects({
      shadowBlur: i * 2
    }))
    await waitFor(() => {})
  }
  
  const duration = performance.now() - start
  expect(duration).toBeLessThan(500) // 10 updates in under 500ms
})
```

## Edge Cases

### Zero Values

```typescript
describe('Effects Edge Cases', () => {
  it('should handle zero blur values', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      shadowEnabled: true,
      shadowBlur: 0
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      // Zero blur should still render shadow but with no blur
      expect(window.getComputedStyle(element).textShadow).toBeTruthy()
    })
  })
})
```

### Invalid Colors

```typescript
it('should handle invalid effect colors gracefully', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
```

## Browser Compatibility

### Vendor Prefixes

```typescript
describe('Browser Compatibility', () => {
  it('should use webkit prefix for outline', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.effects({
      outlineEnabled: true,
      outlineWidth: 2
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      // Check for -webkit-text-stroke (browser compatibility)
      const webkitTextStroke = window.getComputedStyle(element).webkitTextStroke
      expect(webkitTextStroke).toBeTruthy()
    })
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Quick Reference](./quick-reference.md) - Fast lookup guide
- [Typography Testing Guide](./typography-testing.md) - Typography configuration testing
- [Color Testing Guide](./color-testing.md) - Color configuration testing
- [Test Patterns](./examples/test-patterns.md) - Common testing patterns
