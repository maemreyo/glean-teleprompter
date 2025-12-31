# Cross-Category Integration Testing Guide

**Purpose**: Testing patterns that span multiple configuration categories

## Overview

Cross-category integration tests verify that configuration changes across different categories (typography, colors, effects, layout, animations) work correctly together and don't interfere with each other.

## Multi-Category Configuration Testing

### Typography + Colors

```typescript
describe('Typography and Colors Integration', () => {
  it('should apply both typography and color changes', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate({
      typography: { fontSize: 72, fontFamily: 'Roboto' },
      colors: { primaryColor: '#ff0000' }
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.fontSize).toBe('72px')
      expect(styles.fontFamily).toContain('Roboto')
      expect(styles.color).toBe('rgb(255, 0, 0)')
    })
  })
})
```

### Typography + Layout

```typescript
describe('Typography and Layout Integration', () => {
  it('should apply font changes with text alignment', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate({
      typography: { fontSize: 64 },
      layout: { textAlign: 'center' }
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.fontSize).toBe('64px')
      expect(styles.textAlign).toBe('center')
    })
  })
})
```

### All Categories Together

```typescript
describe('Full Configuration Integration', () => {
  it('should apply all configuration categories', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate({
      typography: { fontSize: 72, fontWeight: 700 },
      colors: { primaryColor: '#ff0000' },
      effects: { shadowEnabled: true, shadowBlur: 10 },
      layout: { textAlign: 'center', horizontalMargin: 10 },
      animations: { entranceAnimation: 'fade' }
    }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.fontSize).toBe('72px')
      expect(styles.fontWeight).toBe('700')
      expect(styles.color).toBe('rgb(255, 0, 0)')
      expect(styles.textShadow).not.toBe('none')
      expect(styles.textAlign).toBe('center')
    })
  })
})
```

## Configuration Interference Testing

### No Interference Between Categories

```typescript
describe('Category Interference', () => {
  it('should not let text alignment affect font size', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    // Apply typography
    setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('72px')
    })
    
    // Apply layout - should not affect font size
    setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('72px')
      expect(window.getComputedStyle(element).textAlign).toBe('center')
    })
  })
})
```

### Color Override Behavior

```typescript
it('should handle gradient override of solid color', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  // Apply solid color
  setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ff0000' }))
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
  })
  
  // Enable gradient - should override solid color
  setConfigState(createTestConfigUpdate.colors({
    gradientEnabled: true,
    gradientColors: ['#00ff00', '#0000ff']
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const backgroundImage = window.getComputedStyle(element).backgroundImage
    expect(backgroundImage).toContain('linear-gradient')
  })
})
```

## Sequential Category Updates

### Preserving Previous Changes

```typescript
describe('Sequential Category Updates', () => {
  it('should preserve previous category changes when updating another', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    // Apply typography
    setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
    await waitFor(() => {
      expect(window.getComputedStyle(screen.getByTestId('preview-text')).fontSize).toBe('72px')
    })
    
    // Apply colors - typography should remain
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ff0000' }))
    await waitFor(() => {
      const styles = window.getComputedStyle(screen.getByTestId('preview-text'))
      expect(styles.fontSize).toBe('72px')
      expect(styles.color).toBe('rgb(255, 0, 0)')
    })
    
    // Apply effects - previous changes should remain
    setConfigState(createTestConfigUpdate.effects({ shadowEnabled: true }))
    await waitFor(() => {
      const styles = window.getComputedStyle(screen.getByTestId('preview-text'))
      expect(styles.fontSize).toBe('72px')
      expect(styles.color).toBe('rgb(255, 0, 0)')
      expect(styles.textShadow).not.toBe('none')
    })
  })
})
```

## Batch Configuration Updates

### Atomic Multi-Category Changes

```typescript
describe('Batch Configuration Updates', () => {
  it('should apply multiple categories atomically', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    
    // Apply all changes at once
    setConfigState({
      typography: { fontSize: 64, fontWeight: 700 },
      colors: { primaryColor: '#ff0000' },
      layout: { textAlign: 'right' }
    })
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.fontSize).toBe('64px')
      expect(styles.fontWeight).toBe('700')
      expect(styles.color).toBe('rgb(255, 0, 0)')
      expect(styles.textAlign).toBe('right')
    })
  })
})
```

## Performance with Multiple Categories

### Complex Configuration Performance

```typescript
describe('Multi-Category Performance', () => {
  it('should apply complex configuration within 50ms', async () => {
    render(<TeleprompterContainer testId="container" />)
    
    const startTime = performance.now()
    setConfigState({
      typography: { fontSize: 72, fontWeight: 700 },
      colors: { gradientEnabled: true, gradientColors: ['#ff0000', '#0000ff'] },
      effects: { shadowEnabled: true, outlineEnabled: true },
      layout: { horizontalMargin: 10, textAlign: 'center' },
      animations: { entranceAnimation: 'fade' }
    })
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('72px')
    })
    
    const responseTime = performance.now() - startTime
    expect(responseTime).toBeLessThan(50)
  })
})
```

### Rapid Multi-Category Changes

```typescript
it('should handle rapid multi-category changes', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  const configs = [
    { typography: { fontSize: 48 }, colors: { primaryColor: '#ff0000' } },
    { typography: { fontSize: 64 }, colors: { primaryColor: '#00ff00' } },
    { typography: { fontSize: 72 }, colors: { primaryColor: '#0000ff' } }
  ]
  const responseTimes: number[] = []
  
  for (const config of configs) {
    const start = performance.now()
    setConfigState(config)
    
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
```

## Visual Consistency Testing

### Cross-Category Visual Harmony

```typescript
describe('Visual Consistency', () => {
  it('should maintain visual consistency with outline and dark text', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState({
      colors: { primaryColor: '#000000' },
      effects: { outlineEnabled: true, outlineColor: '#ffffff' }
    })
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const styles = window.getComputedStyle(element)
      expect(styles.color).toBe('rgb(0, 0, 0)')
      expect(styles.webkitTextStroke).toContain('rgb(255, 255, 255)')
    })
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Typography Testing](./typography-testing.md) - Typography-specific tests
- [Color Testing](./color-testing.md) - Color-specific tests
- [Effects Testing](./effects-testing.md) - Effects-specific tests
- [Layout Testing](./layout-testing.md) - Layout-specific tests
- [Animation Testing](./animation-testing.md) - Animation-specific tests
