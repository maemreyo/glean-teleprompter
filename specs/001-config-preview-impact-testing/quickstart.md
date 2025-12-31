# Quickstart: Config Preview Impact Testing Methodology

**Date**: 2025-12-31
**Purpose**: Get started with config-preview impact testing methodology.

## Overview

This methodology provides a structured approach to testing how configuration changes affect preview components in real-time. It ensures visual consistency and performance requirements are met.

## Prerequisites

- Jest 29+ and React Testing Library 13+ installed
- Basic understanding of React component testing
- Familiarity with the application's config system

## Core Concepts

### Test Categories

1. **Typography**: Font properties, spacing, transforms
2. **Colors**: Primary colors, gradients, color schemes
3. **Effects**: Shadows, outlines, glows, filters
4. **Layout**: Margins, alignment, positioning, sizing
5. **Animations**: Transitions, scrolling, entrance effects

### Key Principles

- **Real-time Validation**: Changes must apply within 50ms
- **Visual Accuracy**: CSS properties must match expected values
- **Cross-browser Consistency**: Tests work across supported browsers
- **Performance Bounds**: No memory leaks or performance degradation

## Quick Setup

### 1. Import Testing Utilities

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { resetConfigStore, setConfigState, createTestConfigUpdate } from '@/utils/mock-config-store'
import { setupTestEnvironment, teardownTestEnvironment } from '@/utils/test-helpers'
```

### 2. Basic Test Structure

```typescript
describe('Config Impact Test', () => {
  beforeEach(() => {
    setupTestEnvironment()
    resetConfigStore()
  })

  afterEach(() => {
    teardownTestEnvironment()
  })

  it('should apply config change to preview', async () => {
    // Arrange
    render(<YourComponent />)

    // Act
    setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))

    // Assert
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).fontSize).toBe('72px')
    })
  })
})
```

## Common Testing Patterns

### Typography Testing

```typescript
it('should update font family', async () => {
  render(<TeleprompterText text="Sample" />)
  setConfigState(createTestConfigUpdate.typography({ fontFamily: 'Roboto' }))

  await waitFor(() => {
    const text = screen.getByText('Sample')
    expect(window.getComputedStyle(text).fontFamily).toContain('Roboto')
  })
})
```

### Color Testing

```typescript
it('should apply gradient colors', async () => {
  render(<TeleprompterText text="Sample" />)
  setConfigState(createTestConfigUpdate.colors({
    gradientEnabled: true,
    gradientColors: ['#ff0000', '#0000ff']
  }))

  await waitFor(() => {
    const text = screen.getByText('Sample')
    const style = window.getComputedStyle(text)
    expect(style.backgroundImage).toContain('linear-gradient')
  })
})
```

### Performance Testing

```typescript
it('should apply changes within 50ms', async () => {
  const startTime = performance.now()

  render(<TeleprompterText text="Sample" />)
  setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))

  await waitFor(() => {
    const text = screen.getByText('Sample')
    expect(window.getComputedStyle(text).fontSize).toBe('72px')
  })

  const endTime = performance.now()
  expect(endTime - startTime).toBeLessThan(50)
})
```

## Running Tests

### Individual Test Files

```bash
npm test -- __tests__/integration/config-preview/typography-integration.test.tsx
```

### All Config Tests

```bash
npm test -- __tests__/integration/config-preview/
```

### With Coverage

```bash
npm test -- --coverage __tests__/integration/config-preview/
```

## Troubleshooting

### Common Issues

**Styles not applying**: Check that components are properly mounted and config store is updated.

**Timing issues**: Use `waitFor()` for async operations and ensure proper cleanup between tests.

**Font loading**: Web fonts may not load in test environment - test font-family property application instead.

**Color values**: Use `window.getComputedStyle()` to get actual computed values, not CSS variable references.

### Debug Tips

- Add `console.log()` statements to verify config store updates
- Use browser dev tools to inspect computed styles during test runs
- Check that test components are properly wrapped with providers

## Best Practices

### Test Organization

- Group tests by config category (typography, colors, etc.)
- Use descriptive test names that explain the impact being tested
- Keep test setup and teardown consistent across test files

### Assertion Strategy

- Prefer `getComputedStyle()` for visual property verification
- Use appropriate waiting mechanisms (`waitFor`, `findBy*`)
- Test both positive and negative scenarios

### Performance Considerations

- Keep individual tests under 500ms
- Reset stores between tests to avoid state pollution
- Use proper cleanup to prevent memory leaks

## Advanced Usage

### Custom Validators

```typescript
const expectStyle = (element: HTMLElement, property: string, expected: string) => {
  const computed = window.getComputedStyle(element)
  const actual = computed.getPropertyValue(property)
  expect(actual).toBe(expected)
}
```

### Batch Testing

```typescript
const testScenarios = [
  { config: { fontSize: 48 }, expected: '48px' },
  { config: { fontSize: 72 }, expected: '72px' },
]

testScenarios.forEach(({ config, expected }) => {
  it(`should apply font size ${expected}`, async () => {
    // Test implementation
  })
})
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [CSS Computed Style](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle)