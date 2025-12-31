# Common Test Patterns for Config Preview Impact Testing

**Purpose**: Reusable testing patterns for config-preview integration

## Pattern: Basic Config Update

**Use Case**: Verify that a single config change applies correctly to the preview

```typescript
it('should apply single config change', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
})
```

## Pattern: Multiple Config Updates

**Use Case**: Verify that multiple config changes apply together atomically

```typescript
it('should apply multiple config changes atomically', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  setConfigState({
    typography: { fontSize: 72, fontWeight: 700 },
    colors: { primaryColor: '#ff0000' }
  })
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const styles = window.getComputedStyle(element)
    expect(styles.fontSize).toBe('72px')
    expect(styles.fontWeight).toBe('700')
    expect(styles.color).toBe('rgb(255, 0, 0)')
  })
})
```

## Pattern: Sequential Config Updates

**Use Case**: Verify that config can be updated multiple times sequentially

```typescript
it('should handle sequential config updates', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act - First update
  setConfigState(createTestConfigUpdate.typography({ fontSize: 48 }))
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('48px')
  })
  
  // Act - Second update
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
})
```

## Pattern: Response Time Validation

**Use Case**: Verify that config changes apply within 50ms

```typescript
it('should apply config changes within 50ms', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  const startTime = performance.now()
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
  
  const responseTime = performance.now() - startTime
  expect(responseTime).toBeLessThan(50)
})
```

## Pattern: Boundary Value Testing

**Use Case**: Test minimum, maximum, and edge case values

```typescript
describe('Font Size Boundary Values', () => {
  const testCases = [
    { value: 32, description: 'minimum' },
    { value: 48, description: 'default' },
    { value: 128, description: 'maximum' },
  ]
  
  testCases.forEach(({ value, description }) => {
    it(`should apply ${description} font size: ${value}px`, async () => {
      render(<TeleprompterText text="Test Sample" />)
      setConfigState(createTestConfigUpdate.typography({ fontSize: value }))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe(`${value}px`)
      })
    })
  })
})
```

## Pattern: Config Reset

**Use Case**: Verify that config can be reset to default values

```typescript
it('should reset config to defaults', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act - Apply custom config
  setConfigState(createTestConfigUpdate.typography({ fontSize: 100 }))
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('100px')
  })
  
  // Act - Reset to defaults
  resetConfigStore()
  
  // Assert - Should be back to default
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('48px') // default
  })
})
```

## Pattern: Idempotent Config Updates

**Use Case**: Verify that applying the same config twice produces consistent results

```typescript
it('should be idempotent', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  const config = { fontSize: 72, fontWeight: 700 }
  
  // Act - Apply same config twice
  setConfigState(createTestConfigUpdate.typography(config))
  await waitFor(() => {})
  
  setConfigState(createTestConfigUpdate.typography(config))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const styles = window.getComputedStyle(element)
    expect(styles.fontSize).toBe('72px')
    expect(styles.fontWeight).toBe('700')
  })
})
```

## Pattern: Batch Testing

**Use Case**: Test multiple config scenarios efficiently

```typescript
describe('Font Size Batch Tests', () => {
  const scenarios = [
    { config: { fontSize: 32 }, expected: '32px' },
    { config: { fontSize: 48 }, expected: '48px' },
    { config: { fontSize: 64 }, expected: '64px' },
    { config: { fontSize: 72 }, expected: '72px' },
    { config: { fontSize: 96 }, expected: '96px' },
    { config: { fontSize: 128 }, expected: '128px' },
  ]
  
  scenarios.forEach(({ config, expected }) => {
    it(`should apply font size: ${expected}`, async () => {
      render(<TeleprompterText text="Test Sample" />)
      setConfigState(createTestConfigUpdate.typography(config))
      
      await waitFor(() => {
        const element = screen.getByTestId('preview-text')
        expect(window.getComputedStyle(element).fontSize).toBe(expected)
      })
    })
  })
})
```

## Pattern: Contains Validation

**Use Case**: Verify that a CSS property contains an expected substring (useful for font-family, gradients)

```typescript
it('should apply font family that contains Roboto', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Roboto' }))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const fontFamily = window.getComputedStyle(element).fontFamily
    expect(fontFamily).toContain('Roboto')
  })
})
```

## Pattern: Range Validation

**Use Case**: Verify that a numeric CSS property falls within an acceptable range

```typescript
it('should apply font size within acceptable range', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const fontSize = parseFloat(window.getComputedStyle(element).fontSize)
    expect(fontSize).toBeGreaterThanOrEqual(70) // Allow small variance
    expect(fontSize).toBeLessThanOrEqual(74)
  })
})
```

## Pattern: Async Config Updates

**Use Case**: Test scenarios where config updates happen asynchronously

```typescript
it('should handle async config updates', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  const updatePromise = new Promise<void>((resolve) => {
    setTimeout(() => {
      setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
      resolve()
    }, 10)
  })
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
  
  await updatePromise
})
```

## Pattern: Performance Memory Leak Check

**Use Case**: Verify that repeated config updates don't cause memory leaks

```typescript
it('should not leak memory on repeated updates', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  const initialMemory = performance.memory?.usedJSHeapSize
  
  // Act - Apply many config updates
  for (let i = 0; i < 100; i++) {
    setConfigState(createTestConfigUpdate.typography({ fontSize: 48 + (i % 80) }))
    await waitFor(() => {}, { timeout: 100 })
  }
  
  // Assert - Memory growth should be minimal (< 10MB)
  const finalMemory = performance.memory?.usedJSHeapSize
  if (initialMemory && finalMemory) {
    const memoryGrowth = finalMemory - initialMemory
    expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024)
  }
})
```

## Pattern: Color Format Conversion

**Use Case**: Verify that color values are correctly converted from hex to rgb

```typescript
it('should convert hex color to rgb format', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  const hexColor = '#ff0000'
  
  // Act
  setConfigState(createTestConfigUpdate.colors({ primaryColor: hexColor }))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const color = window.getComputedStyle(element).color
    expect(color).toBe('rgb(255, 0, 0)')
  })
})
```

## Pattern: Gradient Validation

**Use Case**: Verify that gradient is correctly applied with all properties

```typescript
it('should apply linear gradient with correct colors and angle', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  setConfigState(createTestConfigUpdate.colors({
    gradientEnabled: true,
    gradientType: 'linear',
    gradientColors: ['#ff0000', '#0000ff'],
    gradientAngle: 45
  }))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const backgroundImage = window.getComputedStyle(element).backgroundImage
    expect(backgroundImage).toContain('linear-gradient')
    expect(backgroundImage).toContain('rgb(255, 0, 0)')
    expect(backgroundImage).toContain('rgb(0, 0, 255)')
    expect(backgroundImage).toContain('45deg')
  })
})
```

## Pattern: Cross-Browser Style Testing

**Use Case**: Test that styles work consistently across browsers

```typescript
it('should apply consistent styles across browsers', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
  
  // Assert - Use standard CSS properties for cross-browser compatibility
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const styles = window.getComputedStyle(element)
    
    // Test standard properties (not browser-specific)
    expect(styles.fontSize).toBe('72px')
    expect(styles.fontWeight).toBe('400') // default numeric value
    expect(styles.lineHeight).toBeTruthy()
  })
})
```

## Pattern: Conditional Feature Testing

**Use Case**: Test features that are conditionally enabled

```typescript
describe('Gradient Feature', () => {
  it('should not apply gradient when disabled', async () => {
    render(<TeleprompterText text="Test Sample" />)
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
    render(<TeleprompterText text="Test Sample" />)
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

## Pattern: Element State Verification

**Use Case**: Verify that elements have expected state classes/attributes

```typescript
it('should add animation class when animation is enabled', async () => {
  // Arrange
  render(<TeleprompterText text="Test Sample" />)
  
  // Act
  setConfigState(createTestConfigUpdate.animations({
    entranceAnimation: 'fade-in'
  }))
  
  // Assert
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(element).toHaveClass('animate-fade-in')
  })
})
```

## Custom Helper Functions

### Style Assertion Helper

```typescript
function expectStyle(
  element: HTMLElement,
  property: string,
  expected: string,
  validator: 'exact' | 'contains' = 'exact'
) {
  const computed = window.getComputedStyle(element)
  const actual = computed.getPropertyValue(property)
  
  if (validator === 'exact') {
    expect(actual).toBe(expected)
  } else {
    expect(actual).toContain(expected)
  }
}

// Usage
it('should use helper function', async () => {
  render(<TeleprompterText text="Test" />)
  setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Roboto' }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expectStyle(element, 'font-family', 'Roboto', 'contains')
  })
})
```

### Config Change Helper

```typescript
async function applyConfigAndVerify(
  configChange: Partial<ConfigState>,
  selector: string,
  expectedStyles: Record<string, string>
) {
  setConfigState(configChange)
  
  await waitFor(() => {
    const element = screen.getByTestId(selector)
    Object.entries(expectedStyles).forEach(([property, value]) => {
      expect(window.getComputedStyle(element).getPropertyValue(property)).toBe(value)
    })
  })
}

// Usage
it('should use config change helper', async () => {
  render(<TeleprompterText text="Test" />)
  
  await applyConfigAndVerify(
    createTestConfigUpdate.typography({ fontSize: 72 }),
    'preview-text',
    { 'font-size': '72px' }
  )
})
```

## Related Documentation

- [Jest Setup Guide](./jest-setup.md) - Environment configuration
- [Main Methodology](../methodology.md) - Complete testing methodology
- [Quick Reference](../quick-reference.md) - Fast lookup guide
