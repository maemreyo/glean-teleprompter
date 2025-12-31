# Layout Configuration Impact Testing Guide

**Category**: Layout  
**User Story**: US4 - Layout Testing Documentation  
**Purpose**: Comprehensive testing guide for layout configuration changes and their visual impact

## Overview

This guide provides detailed testing patterns for validating layout configuration changes in the preview. Layout includes horizontal margin, vertical padding, text alignment, column layout, text area width, and text area position.

## Configuration Properties

| Property | Type | Range | Default | Description |
|----------|------|-------|---------|-------------|
| `horizontalMargin` | number | 0-50 (%) | 10 | Horizontal margin as percentage |
| `verticalPadding` | number | 0-50 (%) | 10 | Vertical padding as percentage |
| `textAlign` | string | 'left' \| 'center' \| 'right' \| 'justify' | 'center' | Text alignment |
| `columnLayout` | number | 1-3 | 1 | Number of columns |
| `textAreaWidth` | number | 50-100 (%) | 100 | Text area width as percentage |
| `textAreaPosition` | number | -50 to 50 (%) | 0 | Text area horizontal offset |

## Horizontal Margin Testing

### Standard Margins

```typescript
describe('Horizontal Margin', () => {
  const margins = [0, 10, 20, 30, 40, 50]
  
  margins.forEach(margin => {
    it(`should apply horizontal margin: ${margin}%`, async () => {
      render(<TeleprompterContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ horizontalMargin: margin }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).marginLeft).toBe(`${margin}%`)
        expect(window.getComputedStyle(container).marginRight).toBe(`${margin}%`)
      })
    })
  })
})
```

### Symmetrical Margins

```typescript
it('should apply equal left and right margins', async () => {
  render(<TeleprompterContainer testId="container" />)
  setConfigState(createTestConfigUpdate.layout({ horizontalMargin: 15 }))
  
  await waitFor(() => {
    const container = screen.getByTestId('container')
    const marginLeft = window.getComputedStyle(container).marginLeft
    const marginRight = window.getComputedStyle(container).marginRight
    expect(marginLeft).toBe(marginRight)
    expect(marginLeft).toBe('15%')
  })
})
```

## Vertical Padding Testing

### Standard Padding Values

```typescript
describe('Vertical Padding', () => {
  const paddings = [0, 5, 10, 20, 30, 50]
  
  paddings.forEach(padding => {
    it(`should apply vertical padding: ${padding}%`, async () => {
      render(<TeleprompterContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ verticalPadding: padding }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).paddingTop).toBe(`${padding}%`)
        expect(window.getComputedStyle(container).paddingBottom).toBe(`${padding}%`)
      })
    })
  })
})
```

### Padding and Margin Combination

```typescript
it('should apply both padding and margin', async () => {
  render(<TeleprompterContainer testId="container" />)
  setConfigState(createTestConfigUpdate.layout({
    horizontalMargin: 10,
    verticalPadding: 15
  }))
  
  await waitFor(() => {
    const container = screen.getByTestId('container')
    const styles = window.getComputedStyle(container)
    expect(styles.marginLeft).toBe('10%')
    expect(styles.marginRight).toBe('10%')
    expect(styles.paddingTop).toBe('15%')
    expect(styles.paddingBottom).toBe('15%')
  })
})
```

## Text Alignment Testing

### All Alignment Options

```typescript
describe('Text Alignment', () => {
  it('should apply left alignment', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.layout({ textAlign: 'left' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textAlign).toBe('left')
    })
  })
  
  it('should apply center alignment', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textAlign).toBe('center')
    })
  })
  
  it('should apply right alignment', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.layout({ textAlign: 'right' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textAlign).toBe('right')
    })
  })
  
  it('should apply justify alignment', async () => {
    render(<TeleprompterText text="Sample Text" testId="preview-text" />)
    setConfigState(createTestConfigUpdate.layout({ textAlign: 'justify' }))
    
    await waitFor(() => {
      const element = screen.getByTestId('preview-text')
      expect(window.getComputedStyle(element).textAlign).toBe('justify')
    })
  })
})
```

### Alignment Switching

```typescript
it('should switch between alignments', async () => {
  render(<TeleprompterText text="Sample Text" testId="preview-text" />)
  
  // Start with left
  setConfigState(createTestConfigUpdate.layout({ textAlign: 'left' }))
  await waitFor(() => {
    expect(window.getComputedStyle(screen.getByTestId('preview-text')).textAlign).toBe('left')
  })
  
  // Switch to center
  setConfigState(createTestConfigUpdate.layout({ textAlign: 'center' }))
  await waitFor(() => {
    expect(window.getComputedStyle(screen.getByTestId('preview-text')).textAlign).toBe('center')
  })
})
```

## Column Layout Testing

### Column Options

```typescript
describe('Column Layout', () => {
  it('should apply single column layout', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({ columnLayout: 1 }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      expect(window.getComputedStyle(container).columnCount).toBe('1')
    })
  })
  
  it('should apply two column layout', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({ columnLayout: 2 }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      expect(window.getComputedStyle(container).columnCount).toBe('2')
    })
  })
  
  it('should apply three column layout', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({ columnLayout: 3 }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      expect(window.getComputedStyle(container).columnCount).toBe('3')
    })
  })
})
```

### Column Gap

```typescript
it('should apply column gap with multiple columns', async () => {
  render(<TeleprompterContainer testId="container" />)
  setConfigState(createTestConfigUpdate.layout({ columnLayout: 2 }))
  
  await waitFor(() => {
    const container = screen.getByTestId('container')
    const columnGap = window.getComputedStyle(container).columnGap
    expect(columnGap).toBeTruthy()
    expect(columnGap).not.toBe('0px')
  })
})
```

## Text Area Width Testing

### Standard Widths

```typescript
describe('Text Area Width', () => {
  const widths = [50, 60, 70, 80, 90, 100]
  
  widths.forEach(width => {
    it(`should apply text area width: ${width}%`, async () => {
      render(<TeleprompterContainer testId="container" />)
      setConfigState(createTestConfigUpdate.layout({ textAreaWidth: width }))
      
      await waitFor(() => {
        const container = screen.getByTestId('container')
        expect(window.getComputedStyle(container).width).toBe(`${width}%`)
      })
    })
  })
})
```

### Width Responsiveness

```typescript
it('should maintain width on resize', async () => {
  render(<TeleprompterContainer testId="container" />)
  setConfigState(createTestConfigUpdate.layout({ textAreaWidth: 80 }))
  
  await waitFor(() => {
    const container = screen.getByTestId('container')
    expect(window.getComputedStyle(container).width).toBe('80%')
  })
  
  // Simulate resize
  act(() => {
    window.innerWidth = 800
    window.dispatchEvent(new Event('resize'))
  })
  
  await waitFor(() => {
    const container = screen.getByTestId('preview-text')
    expect(window.getComputedStyle(container).width).toBe('80%')
  })
})
```

## Text Area Position Testing

### Horizontal Offset

```typescript
describe('Text Area Position', () => {
  it('should apply positive horizontal offset', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({ textAreaPosition: 20 }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      const transform = window.getComputedStyle(container).transform
      expect(transform).toContain('translateX')
    })
  })
  
  it('should apply negative horizontal offset', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({ textAreaPosition: -20 }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      const transform = window.getComputedStyle(container).transform
      expect(transform).toContain('translateX')
    })
  })
  
  it('should apply no offset at position 0', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({ textAreaPosition: 0 }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      const transform = window.getComputedStyle(container).transform
      expect(transform).toBe('none' || 'matrix(1, 0, 0, 1, 0, 0)')
    })
  })
})
```

## Combined Layout Properties

### Full Layout Configuration

```typescript
describe('Combined Layout Properties', () => {
  it('should apply all layout properties', async () => {
    render(<TeleprompterContainer testId="container" />)
    setConfigState(createTestConfigUpdate.layout({
      horizontalMargin: 10,
      verticalPadding: 15,
      textAlign: 'center',
      columnLayout: 1,
      textAreaWidth: 80,
      textAreaPosition: 0
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      const styles = window.getComputedStyle(container)
      expect(styles.marginLeft).toBe('10%')
      expect(styles.marginRight).toBe('10%')
      expect(styles.paddingTop).toBe('15%')
      expect(styles.paddingBottom).toBe('15%')
      expect(styles.width).toBe('80%')
    })
  })
})
```

### Multi-Column with Alignment

```typescript
it('should apply multi-column layout with alignment', async () => {
  render(<TeleprompterContainer testId="container" />)
  setConfigState(createTestConfigUpdate.layout({
    columnLayout: 2,
    textAlign: 'justify'
  }))
  
  await waitFor(() => {
    const container = screen.getByTestId('container')
    const styles = window.getComputedStyle(container)
    expect(styles.columnCount).toBe('2')
    expect(styles.textAlign).toBe('justify')
  })
})
```

## Performance Tests

### Layout Change Performance

```typescript
describe('Layout Performance', () => {
  it('should apply layout changes within 50ms', async () => {
    render(<TeleprompterContainer testId="container" />)
    
    const startTime = performance.now()
    setConfigState(createTestConfigUpdate.layout({
      horizontalMargin: 15,
      verticalPadding: 20
    }))
    
    await waitFor(() => {
      const container = screen.getByTestId('container')
      expect(window.getComputedStyle(container).marginLeft).toBe('15%')
    })
    
    const responseTime = performance.now() - startTime
    expect(responseTime).toBeLessThan(50)
  })
})
```

## Related Documentation

- [Main Methodology](./methodology.md) - Core testing principles
- [Quick Reference](./quick-reference.md) - Fast lookup guide
- [Typography Testing Guide](./typography-testing.md) - Typography configuration testing
- [Test Patterns](./examples/test-patterns.md) - Common testing patterns
