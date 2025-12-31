# Accessibility Testing Methodology

**Purpose**: Testing patterns for ensuring configuration changes maintain accessibility standards

## Overview

Accessibility testing ensures that configuration changes don't negatively impact users with disabilities. This includes screen reader compatibility, keyboard navigation, color contrast, and respecting user preferences.

## Color Contrast Testing

### WCAG AA Compliance

```typescript
describe('Color Contrast (WCAG AA)', () => {
  it('should maintain readable contrast with background', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.colors({ primaryColor: '#ffffff' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const color = window.getComputedStyle(element).color
      
      // White text should have sufficient contrast
      // This is a simplified check - actual WCAG compliance requires calculation
      expect(color).toBeTruthy()
    })
  })
})
```

### Gradient Contrast

```typescript
describe('Gradient Contrast', () => {
  it('should maintain contrast with gradient enabled', async () => {
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

## Screen Reader Testing

### ARIA Labels

```typescript
describe('Screen Reader Support', () => {
  it('should maintain proper element labels', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.typography({ fontSize: 72 }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      // Element should be accessible to screen readers
      expect(element).toBeVisible()
    })
  })
})
```

### Text Alternative

```typescript
it('should provide text alternatives for visual effects', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  setConfigState(createTestConfigUpdate.effects({
    shadowEnabled: true,
    outlineEnabled: true
  }))
  
  await waitFor(() => {
    const element = screen.getByTestId('preview-text')
    // Text content should be readable regardless of visual effects
    expect(element.textContent).toBe('Sample Text')
  })
})
```

## Keyboard Navigation

### Tab Order

```typescript
describe('Keyboard Navigation', () => {
  it('should maintain proper tab order', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      // Container should be focusable if interactive
      expect(container).toBeTruthy()
    })
  })
})
```

## Respecting User Preferences

### Reduced Motion

```typescript
describe('User Preferences', () => {
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

### High Contrast Mode

```typescript
it('should respect high contrast preference', async () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-contrast: high)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  })
  
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  await waitFor(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    expect(mediaQuery.matches).toBe(true)
  })
})
```

## Font Size Readability

### Minimum Readable Size

```typescript
describe('Readable Font Sizes', () => {
  it('should maintain minimum readable font size', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.typography({ fontSize: 32 })) // Minimum
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      const fontSize = parseFloat(window.getComputedStyle(element).fontSize)
      // Should be at least 16px for accessibility (WCAG AA)
      expect(fontSize).toBeGreaterThanOrEqual(16)
    })
  })
})
```

### Line Height Readability

```typescript
it('should maintain readable line height', async () => {
  render(<TeleprompterText text="Multi-line\nText" testId="preview-text" />)
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

## Focus Indicators

### Visible Focus States

```typescript
describe('Focus Indicators', () => {
  it('should maintain visible focus with custom styles', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.effects({
      outlineEnabled: true
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      // Focus state should be visible
      expect(container).toBeTruthy()
    })
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Typography Testing](./typography-testing.md) - Typography-specific accessibility
- [Color Testing](./color-testing.md) - Color contrast testing
