# Config Preview Impact Testing Methodology

**Version**: 1.0.0  
**Date**: 2025-12-31  
**Purpose**: Comprehensive methodology for testing configuration changes and their visual impact on preview components

## Overview

This methodology provides a structured approach to testing how configuration changes affect preview components in real-time. It ensures visual consistency, performance requirements, and reliable user experience across all configuration categories.

## Core Testing Principles

### 1. Real-Time Validation

Configuration changes must be reflected in the preview within **50ms** to maintain perceived responsiveness. This timing requirement ensures smooth user experience without noticeable lag.

**Testing Approach**:
```typescript
it('should apply config changes within 50ms', async () => {
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

### 2. Visual Accuracy

CSS properties applied to preview components must exactly match the expected configuration values. Tests verify computed styles rather than React state to ensure actual rendering.

**Testing Approach**:
```typescript
it('should apply exact CSS properties', async () => {
  render(<TeleprompterText text="Test" />)
  setConfigState(createTestConfigUpdate.typography({
    fontSize: 72,
    fontWeight: 700
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const styles = window.getComputedStyle(element)
    expect(styles.fontSize).toBe('72px')
    expect(styles.fontWeight).toBe('700')
  })
})
```

### 3. Cross-Browser Consistency

Testing methodology must ensure consistent behavior across supported browsers (Chrome, Firefox, Safari). Tests use standard DOM APIs and computed styles for cross-browser compatibility.

**Key Considerations**:
- Use `getComputedStyle()` for style verification
- Avoid browser-specific APIs
- Test vendor-prefixed properties when necessary
- Verify color representation (rgb, hex, hsl)

### 4. Performance Bounds

Tests must validate that configuration changes don't cause:
- Memory leaks
- Excessive re-renders
- Frame rate drops during animations
- Increasing response times over successive changes

**Testing Approach**:
```typescript
it('should not cause memory leaks', async () => {
  const initialMemory = performance.memory?.usedJSHeapSize
  
  for (let i = 0; i < 100; i++) {
    setConfigState(createTestConfigUpdate.typography({ fontSize: 48 + i }))
    await waitFor(() => {})
  }
  
  const finalMemory = performance.memory?.usedJSHeapSize
  const memoryGrowth = finalMemory - initialMemory
  
  // Memory growth should be minimal (< 10MB)
  expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024)
})
```

### 5. Idempotent Operations

Configuration updates should produce the same result when applied multiple times with the same values.

**Testing Approach**:
```typescript
it('should be idempotent', async () => {
  render(<TeleprompterText text="Test" />)
  
  const config = { fontSize: 72, fontWeight: 700 }
  
  // Apply same config twice
  setConfigState(createTestConfigUpdate.typography(config))
  await waitFor(() => {})
  
  setConfigState(createTestConfigUpdate.typography(config))
  await waitFor(() => {})
  
  const element = screen.getByTestId('preview-text')
  const styles = window.getComputedStyle(element)
  expect(styles.fontSize).toBe('72px')
  expect(styles.fontWeight).toBe('700')
})
```

## Test Structure

### Standard Test File Organization

```typescript
// __tests__/integration/config-preview/typography-integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '@/__tests__/utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '@/__tests__/utils/test-helpers'

describe('Typography Config Impact Tests', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  describe('Font Size', () => {
    it('should apply minimum font size (32px)', async () => {
      // Test implementation
    })

    it('should apply maximum font size (128px)', async () => {
      // Test implementation
    })

    it('should apply intermediate sizes', async () => {
      // Test implementation
    })
  })
})
```

### Test Utilities

**Config Store Mock**:
```typescript
// __tests__/utils/mock-config-store.ts
import { renderHook } from '@testing-library/react'
import { useConfigStore } from '@/lib/stores/useConfigStore'

export function resetConfigStore() {
  const { result } = renderHook(() => useConfigStore())
  result.current.reset()
}

export function setConfigState(update: Partial<ConfigState>) {
  const { result } = renderHook(() => useConfigStore())
  result.current.setConfig(update)
}

export function createTestConfigUpdate = {
  typography: (props: Partial<TypographyConfig>) => ({ typography: props }),
  colors: (props: Partial<ColorConfig>) => ({ colors: props }),
  // ... other categories
}
```

**Test Environment Setup**:
```typescript
// __tests__/utils/test-helpers.ts
export function setupTestEnvironment() {
  // Configure Jest globals
  // Setup mocks for external services
  // Configure test timeouts
}

export function teardownTestEnvironment() {
  // Clean up DOM
  // Clear mocks
  // Reset timers
}
```

## Configuration Categories

### 1. Typography
- Font family selection and application
- Font size scaling (32px - 128px)
- Font weight (100 - 900)
- Letter spacing (-2px - 10px)
- Line height (1.0 - 2.5)
- Text transformation (none, uppercase, lowercase, capitalize)

**Testing Focus**: Font loading, CSS property application, text rendering accuracy

### 2. Colors
- Primary color selection
- Gradient enable/disable
- Gradient color stops (2-5 colors)
- Gradient type (linear, radial)
- Gradient angle/position

**Testing Focus**: Color format conversion, gradient syntax, contrast requirements

### 3. Effects
- Shadow enable/disable and styling
- Outline enable/disable and styling
- Glow enable/disable and styling
- Backdrop filter application

**Testing Focus**: Composite layers, performance impact, visual rendering

### 4. Layout
- Horizontal margin (0% - 50%)
- Vertical padding (0% - 50%)
- Text alignment (left, center, right, justify)
- Column layout (1-3 columns)
- Text area width (50% - 100%)
- Text area position (horizontal offset)

**Testing Focus**: Layout reflow, responsive behavior, element positioning

### 5. Animations
- Smooth scroll enable/disable
- Entrance animation selection
- Word highlight enable/disable
- Auto scroll enable/disable
- Animation acceleration (1x - 4x)

**Testing Focus**: Frame rate, timing accuracy, smooth transitions

## Validation Methods

### Style Validation

**Exact Match**:
```typescript
expect(window.getComputedStyle(element).fontSize).toBe('72px')
```

**Contains**:
```typescript
expect(window.getComputedStyle(element).fontFamily).toContain('Roboto')
```

**Range** (for numeric values):
```typescript
const fontSize = parseFloat(window.getComputedStyle(element).fontSize)
expect(fontSize).toBeGreaterThanOrEqual(70)
expect(fontSize).toBeLessThanOrEqual(74)
```

### Behavior Validation

**Element Presence**:
```typescript
expect(screen.getByTestId('preview-text')).toBeInTheDocument()
```

**Event Handling**:
```typescript
const user = userEvent.setup()
await user.click(button)
await waitFor(() => {
  expect(configChangeCallback).toHaveBeenCalled()
})
```

**State Changes**:
```typescript
const { result } = renderHook(() => useConfigStore())
expect(result.current.config.typography.fontSize).toBe(72)
```

### Performance Validation

**Response Time**:
```typescript
const start = performance.now()
await configChange
const duration = performance.now() - start
expect(duration).toBeLessThan(50)
```

**Frame Rate**:
```typescript
const frameTime = await measureFrameTime(() => {
  setConfigState(update)
})
expect(frameTime).toBeLessThan(16.67) // 60 FPS = 16.67ms per frame
```

## Common Patterns

### Async Config Updates

```typescript
it('should handle async config updates', async () => {
  render(<TeleprompterText text="Test" />)
  
  const updatePromise = setConfigStateAsync({
    typography: { fontSize: 72 }
  })
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('72px')
  })
  
  await updatePromise
})
```

### Batch Config Updates

```typescript
it('should apply multiple changes atomically', async () => {
  render(<TeleprompterText text="Test" />)
  
  setConfigState({
    typography: { fontSize: 72, fontWeight: 700 },
    colors: { primaryColor: '#ff0000' }
  })
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    const styles = window.getComputedStyle(element)
    expect(styles.fontSize).toBe('72px')
    expect(styles.color).toBe('rgb(255, 0, 0)')
  })
})
```

### Config Reset

```typescript
it('should reset to default config', async () => {
  render(<TeleprompterText text="Test" />)
  
  setConfigState({ typography: { fontSize: 100 } })
  await waitFor(() => {})
  
  resetConfigStore()
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(element).fontSize).toBe('48px') // default
  })
})
```

## Best Practices

### Test Organization

1. **Group by Category**: Organize tests by configuration category (typography, colors, etc.)
2. **Descriptive Names**: Use test names that describe the config change and expected impact
3. **Consistent Setup**: Use `beforeEach` and `afterEach` for setup/teardown
4. **Independent Tests**: Each test should be runnable in isolation

### Assertion Strategy

1. **Use Computed Styles**: Always verify actual rendered styles, not React state
2. **Appropriate Waiting**: Use `waitFor()` for async operations
3. **Specific Selectors**: Use test IDs for reliable element selection
4. **Multiple Assertions**: Group related assertions in single `waitFor` block

### Performance

1. **Keep Tests Fast**: Individual tests should complete in <500ms
2. **Reset Between Tests**: Prevent state pollution across tests
3. **Avoid Unnecessary Renders**: Mock expensive operations
4. **Clean Up Resources**: Proper teardown prevents memory leaks

## Related Documentation

- [Quick Reference Guide](./quick-reference.md) - Fast lookup for common scenarios
- [Typography Testing Guide](./typography-testing.md) - Typography-specific testing
- [Color Testing Guide](./color-testing.md) - Color-specific testing
- [Effects Testing Guide](./effects-testing.md) - Effects-specific testing
- [Layout Testing Guide](./layout-testing.md) - Layout-specific testing
- [Animation Testing Guide](./animation-testing.md) - Animation-specific testing
- [Integration Testing](./integration-testing.md) - Cross-category testing
- [Performance Testing](./performance-testing.md) - Performance-specific guidance
- [Edge Cases](./examples/edge-cases.md) - Edge case handling
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
