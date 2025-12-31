# Config Preview Impact Testing - Quick Reference

**Purpose**: Fast lookup for common config-preview testing scenarios

## Quick Setup

```typescript
// Imports
import { render, screen, waitFor } from '@testing-library/react'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '@/__tests__/utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '@/__tests__/utils/test-helpers'

// Test template
beforeEach(() => {
  setupTestEnvironment()
  resetConfigStore()
})

afterEach(() => {
  teardownTestEnvironment()
})
```

## Common Patterns

### Typography

```typescript
// Font size
setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).fontSize).toBe('72px')
})

// Font family
setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Roboto' }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).fontFamily).toContain('Roboto')
})
```

### Colors

```typescript
// Primary color
setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ff0000' }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).color).toBe('rgb(255, 0, 0)')
})

// Gradient
setConfigState(createTestConfigUpdate.colors({
  gradientEnabled: true,
  gradientColors: ['#ff0000', '#0000ff']
}))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).backgroundImage).toContain('linear-gradient')
})
```

### Effects

```typescript
// Shadow
setConfigState(createTestConfigUpdate.effects({ shadowEnabled: true }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).textShadow).not.toBe('none')
})

// Glow
setConfigState(createTestConfigUpdate.effects({ glowEnabled: true }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).filter).toContain('drop-shadow')
})
```

### Layout

```typescript
// Alignment
setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).textAlign).toBe('center')
})

// Width
setConfigState(createTestConfigUpdate.layout({ textAreaWidth: 80 }))
await waitFor(() => {
  const container = screen.getByTestId('text-container')
  expect(window.getComputedStyle(container).width).toBe('80%')
})
```

### Animations

```typescript
// Smooth scroll
setConfigState(createTestConfigUpdate.animations({ smoothScrollEnabled: true }))
await waitFor(() => {
  const container = screen.getByTestId('scroll-container')
  expect(container).toHaveClass('smooth-scroll')
})

// Entrance animation
setConfigState(createTestConfigUpdate.animations({ entranceAnimation: 'fade-in' }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(element).toHaveClass('animate-fade-in')
})
```

## Performance Testing

```typescript
// Response time (< 50ms requirement)
const startTime = performance.now()
setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
await waitFor(() => {
  const element = screen.getByTestId('preview-text')
  expect(window.getComputedStyle(element).fontSize).toBe('72px')
})
const responseTime = performance.now() - startTime
expect(responseTime).toBeLessThan(50)

// Frame rate (60 FPS = 16.67ms per frame)
const frameTime = await measureFrameTime(() => {
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
})
expect(frameTime).toBeLessThan(16.67)
```

## Validation Helpers

```typescript
// Exact match
expect(window.getComputedStyle(element).property).toBe('expected-value')

// Contains match
expect(window.getComputedStyle(element).fontFamily).toContain('FontName')

// Range match (numeric)
const value = parseFloat(window.getComputedStyle(element).fontSize)
expect(value).toBeGreaterThanOrEqual(70)
expect(value).toBeLessThanOrEqual(74)
```

## Run Tests

```bash
# Individual test file
npm test -- __tests__/integration/config-preview/typography-integration.test.tsx

# All config tests
npm test -- __tests__/integration/config-preview/

# With coverage
npm test -- --coverage __tests__/integration/config-preview/
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Styles not applying | Check component mounting and config store update |
| Timing issues | Use `waitFor()` for async operations |
| Font not loading | Test font-family property, not actual font rendering |
| Color values differ | Use `getComputedStyle()` to get computed values |
| Memory leaks | Reset stores between tests, proper cleanup |

## Full Documentation

- [Main Methodology](./methodology.md) - Complete testing methodology
- [Typography Testing](./typography-testing.md) - Typography-specific guide
- [Color Testing](./color-testing.md) - Color-specific guide
- [Effects Testing](./effects-testing.md) - Effects-specific guide
- [Layout Testing](./layout-testing.md) - Layout-specific guide
- [Animation Testing](./animation-testing.md) - Animation-specific guide
- [Integration Testing](./integration-testing.md) - Cross-category testing
- [Performance Testing](./performance-testing.md) - Performance guidance
- [Troubleshooting](./troubleshooting.md) - Common issues
