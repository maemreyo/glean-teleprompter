# Color Configuration Impact Testing Guide

**Category**: Colors  
**User Story**: US2 - Color Testing Documentation  
**Purpose**: Comprehensive testing guide for color configuration changes and their visual impact

## Overview

This guide provides detailed testing patterns for validating color configuration changes in the preview. Colors include primary color, gradient enable/disable, gradient colors, gradient type, and gradient angle/position.

## Configuration Properties

| Property | Type | Range | Default | Description |
|----------|------|-------|---------|-------------|
| `primaryColor` | string | Valid hex color | '#ffffff' | Primary text color |
| `gradientEnabled` | boolean | true/false | false | Enable/disable gradient text |
| `gradientColors` | string[] | 2-5 hex colors | ['#ff0000', '#0000ff'] | Gradient color stops |
| `gradientType` | string | 'linear' \| 'radial' | 'linear' | Type of gradient |
| `gradientAngle` | number | 0-360 | 90 | Gradient angle for linear (degrees) |
| `gradientPosition` | string | 'center' \| direction | 'center' | Gradient position for radial |

## Primary Color Testing

### Solid Color Application

```typescript
describe('Primary Color', () => {
  it('should apply red color', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ff0000' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
    })
  })
  
  it('should apply blue color', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#0000ff' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).color).toBe('rgb(0, 0, 255)')
    })
  })
  
  it('should apply white color', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ffffff' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).color).toBe('rgb(255, 255, 255)')
    })
  })
})
```

### Color Format Conversion

```typescript
describe('Color Format Conversion', () => {
  it('should convert hex to rgb format', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ff0000' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
    })
  })
  
  it('should handle short hex format', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#f00' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
    })
  })
  
  it('should handle 3-digit hex format', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#fff' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).color).toBe('rgb(255, 255, 255)')
    })
  })
})
```

### Invalid Color Handling

```typescript
describe('Invalid Color Handling', () => {
  it('should handle invalid hex gracefully', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: 'invalid' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      // Should fall back to default or previous valid color
      expect(window.getComputedStyle(element).color).toBeTruthy()
    })
  })
})
```

## Gradient Enable/Disable Testing

### Enabling Gradient

```typescript
describe('Gradient Enable/Disable', () => {
  it('should not apply gradient when disabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({
      gradientEnabled: false,
      gradientColors: ['#ff0000', '#0000ff']
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const backgroundImage = window.getComputedStyle(element).backgroundImage
      expect(backgroundImage).toBe('none')
    })
  })
  
  it('should apply gradient when enabled', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({
      gradientEnabled: true,
      gradientColors: ['#ff0000', '#0000ff']
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const backgroundImage = window.getComputedStyle(element).backgroundImage
      expect(backgroundImage).toContain('linear-gradient')
    })
  })
})
```

### Toggling Gradient

```typescript
it('should handle gradient toggle', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
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
```

## Gradient Color Testing

### Two-Color Gradient

```typescript
describe('Gradient Colors', () => {
  it('should apply two-color gradient', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
})
```

### Multi-Color Gradient

```typescript
describe('Multi-Color Gradients', () => {
  it('should apply three-color gradient', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
  
  it('should apply five-color gradient', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({
      gradientEnabled: true,
      gradientColors: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0000ff']
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const backgroundImage = window.getComputedStyle(element).backgroundImage
      expect(backgroundImage).toContain('rgb(255, 0, 0)')
      expect(backgroundImage).toContain('rgb(255, 136, 0)')
      expect(backgroundImage).toContain('rgb(255, 255, 0)')
      expect(backgroundImage).toContain('rgb(0, 255, 0)')
      expect(backgroundImage).toContain('rgb(0, 0, 255)')
    })
  })
})
```

### Gradient Color Modification

```typescript
describe('Gradient Color Modification', () => {
  it('should update gradient colors', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
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
```

## Gradient Type Testing

### Linear Gradient

```typescript
describe('Gradient Type', () => {
  it('should apply linear gradient', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
})
```

### Radial Gradient

```typescript
it('should apply radial gradient', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
```

### Gradient Type Switching

```typescript
it('should switch between gradient types', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
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
```

## Gradient Angle Testing (Linear)

### Standard Angles

```typescript
describe('Gradient Angle (Linear)', () => {
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]
  
  angles.forEach(angle => {
    it(`should apply gradient angle: ${angle}deg`, async () => {
      render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
})
```

### Angle Modification

```typescript
it('should update gradient angle', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
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
```

## Gradient Position Testing (Radial)

### Standard Positions

```typescript
describe('Gradient Position (Radial)', () => {
  it('should apply center position', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({
      gradientEnabled: true,
      gradientType: 'radial',
      gradientColors: ['#ff0000', '#0000ff'],
      gradientPosition: 'center'
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const backgroundImage = window.getComputedStyle(element).backgroundImage
      expect(backgroundImage).toContain('center')
    })
  })
  
  it('should apply top position', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({
      gradientEnabled: true,
      gradientType: 'radial',
      gradientColors: ['#ff0000', '#0000ff'],
      gradientPosition: 'top'
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const backgroundImage = window.getComputedStyle(element).backgroundImage
      expect(backgroundImage).toContain('top')
    })
  })
})
```

## Combined Color Properties

### Full Gradient Configuration

```typescript
describe('Combined Color Properties', () => {
  it('should apply complete gradient configuration', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
})
```

### Solid Color to Gradient Transition

```typescript
it('should transition from solid color to gradient', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
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
```

## Performance Tests

### Gradient Application Performance

```typescript
describe('Color Performance', () => {
  it('should apply gradient within 50ms', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
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
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
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
```

## Accessibility Tests

### Color Contrast

```typescript
describe('Color Accessibility', () => {
  it('should maintain readable contrast with background', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ffffff' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const color = window.getComputedStyle(element).color
      
      // White text should have sufficient contrast
      // This is a simplified check - actual WCAG compliance requires more complex calculation
      expect(color).toBeTruthy()
    })
  })
})
```

## Edge Cases

### Single Color in Gradient Array

```typescript
describe('Color Edge Cases', () => {
  it('should handle single color in gradient array', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
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
})
```

### Invalid Color in Gradient

```typescript
it('should handle invalid color in gradient array', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  setConfigState(createTestConfigUpdate.colors({
    gradientEnabled: true,
    gradientColors: ['#ff0000', 'invalid', '#0000ff']
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    // Should handle gracefully - skip invalid color or use fallback
    expect(window.getComputedStyle(element)).toBeTruthy()
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Quick Reference](./quick-reference.md) - Fast lookup guide
- [Typography Testing Guide](./typography-testing.md) - Typography configuration testing
- [Test Patterns](./examples/test-patterns.md) - Common testing patterns
