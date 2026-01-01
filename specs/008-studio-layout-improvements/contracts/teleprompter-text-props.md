# API Contract: TeleprompterText Component Props

**Feature**: 008-studio-layout-improvements
**File**: `components/teleprompter/display/TeleprompterText.tsx`
**Version**: 1.0.0

## Props Interface

```typescript
interface TeleprompterTextProps {
  // Core props
  text: string;
  className?: string;
  
  // NEW: Column layout props
  columnCount?: 1 | 2;
  columnGap?: number;
}
```

## Props Specification

### `text: string` (Required)

The text content to display in the teleprompter.

**Type**: `string`
**Required**: Yes
**Default**: N/A

**Behavior**:
- Text is processed for line breaks and whitespace
- Supports multiline text
- Empty string renders empty component

**Example**:
```typescript
<TeleprompterText text="Hello world" />
```

### `className?: string` (Optional)

Additional CSS classes to apply to the text container.

**Type**: `string`
**Required**: No
**Default**: `undefined`

**Behavior**:
- Merged with base classes using `clsx` or `cn`
- Does not override column layout classes

**Example**:
```typescript
<TeleprompterText 
  text="Hello" 
  className="custom-text-styles" 
/>
```

### `columnCount?: 1 | 2` (Optional)

Number of text columns to display.

**Type**: `1 | 2` (literal type)
**Required**: No
**Default**: `1`

**Behavior**:
- `1`: Single column layout (default)
- `2`: Two-column newspaper-style layout
- Applied via CSS `column-count` property
- Responsive: Falls back to 1 column on mobile (<1024px)

**CSS Implementation**:
```css
.teleprompter-text {
  column-count: var(--column-count, 1);
  column-gap: var(--column-gap, 32px);
}
```

**Example**:
```typescript
// Single column (default)
<TeleprompterText text="Hello" columnCount={1} />

// Two columns
<TeleprompterText text="Hello world" columnCount={2} />

// From store
<TeleprompterText 
  text={text} 
  columnCount={layout.columnCount} 
/>
```

### `columnGap?: number` (Optional)

Gap between columns in pixels.

**Type**: `number`
**Required**: No
**Default**: `32`

**Constraints**:
- Minimum: `0`
- Maximum: `100`
- Values outside range fall back to default

**Behavior**:
- Only applies when `columnCount === 2`
- Applied via CSS `column-gap` property
- Unit: pixels (px)

**Example**:
```typescript
// Default gap (32px)
<TeleprompterText text="Hello" columnCount={2} />

// Custom gap (48px)
<TeleprompterText 
  text="Hello" 
  columnCount={2} 
  columnGap={48} 
/>

// From store
<TeleprompterText 
  text={text}
  columnCount={layout.columnCount}
  columnGap={layout.columnGap}
/>
```

## Default Props

```typescript
const defaultProps: Partial<TeleprompterTextProps> = {
  columnCount: 1,
  columnGap: 32,
};
```

## Prop Validation

```typescript
// PropTypes validation
TeleprompterText.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  columnCount: PropTypes.oneOf([1, 2]),
  columnGap: PropTypes.number,
};

// Runtime validation
if (props.columnGap !== undefined) {
  if (props.columnGap < 0 || props.columnGap > 100) {
    console.warn('columnGap must be between 0 and 100, using default 32');
    props.columnGap = 32;
  }
}
```

## Render Behavior

### Column Layout Rendering

```typescript
const TeleprompterText: React.FC<TeleprompterTextProps> = ({
  text,
  className,
  columnCount = 1,
  columnGap = 32,
}) => {
  const columnStyle = {
    columnCount,
    columnGap: `${columnGap}px`,
    columnFill: 'auto',
  };
  
  return (
    <div 
      className={cn('teleprompter-text', className)}
      style={columnStyle}
    >
      {processedText}
    </div>
  );
};
```

### Text Processing

```typescript
// Process text for display
const processedText = useMemo(() => {
  return text
    .split('\n')
    .map((line, i) => (
      <p key={i} className="mb-4 last:mb-0">
        {line}
      </p>
    ));
}, [text]);
```

## Responsive Behavior

```typescript
// Mobile fallback (<1024px)
const isMobile = useMediaQuery('(max-width: 1023px)');
const effectiveColumnCount = isMobile ? 1 : columnCount;

<TeleprompterText 
  text={text}
  columnCount={effectiveColumnCount}
  columnGap={columnGap}
/>
```

## Accessibility

### ARIA Attributes

```typescript
<div
  className="teleprompter-text"
  role="region"
  aria-label="Teleprompter text display"
  aria-live="polite"
  style={columnStyle}
>
  {processedText}
</div>
```

### Screen Reader Behavior

- CSS columns are transparent to screen readers
- Text flows naturally in DOM order
- No special handling required

## Performance Considerations

### CSS Columns Performance

```typescript
// Optimize for 60 FPS
const optimizedStyle = {
  columnCount,
  columnGap: `${columnGap}px`,
  columnFill: 'auto',
  willChange: 'auto',  // Let browser optimize
  contain: 'content',  // Isolate layout recalculations
};
```

### Text Rendering Optimization

```typescript
// Use useMemo for text processing
const processedText = useMemo(() => {
  // Expensive text processing
  return processText(text);
}, [text]);
```

## TypeScript Types

```typescript
// Column count literal type
type ColumnCount = 1 | 2;

// Props interface
interface TeleprompterTextProps {
  text: string;
  className?: string;
  columnCount?: ColumnCount;
  columnGap?: number;
}

// Component type
type TeleprompterTextComponent = React.FC<TeleprompterTextProps>;
```

## Testing Contract

### Unit Tests Required

1. Renders with default props
2. Renders with custom className
3. Renders single column when `columnCount={1}`
4. Renders two columns when `columnCount={2}`
5. Applies correct `columnGap` style
6. Falls back to single column on mobile
7. Validates `columnGap` range (0-100)
8. Handles empty text
9. Handles long text with column balancing

### Test Example

```typescript
describe('TeleprompterText', () => {
  it('should render single column by default', () => {
    render(<TeleprompterText text="Hello" />);
    const container = screen.getByRole('region');
    expect(container).toHaveStyle({ columnCount: 1 });
  });
  
  it('should render two columns when specified', () => {
    render(<TeleprompterText text="Hello world" columnCount={2} />);
    const container = screen.getByRole('region');
    expect(container).toHaveStyle({ columnCount: 2 });
  });
  
  it('should apply columnGap style', () => {
    render(
      <TeleprompterText 
        text="Hello" 
        columnCount={2} 
        columnGap={48} 
      />
    );
    const container = screen.getByRole('region');
    expect(container).toHaveStyle({ columnGap: '48px' });
  });
  
  it('should warn on invalid columnGap', () => {
    const consoleWarn = jest.spyOn(console, 'warn');
    render(
      <TeleprompterText 
        text="Hello" 
        columnGap={150}  // Invalid
      />
    );
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('columnGap must be between 0 and 100')
    );
  });
});
```

## Integration Example

```typescript
// In PreviewPanel.tsx
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText';

export function PreviewPanel() {
  const layout = useConfigStore(state => state.layout);
  
  return (
    <div className="preview-panel">
      <TeleprompterText
        text={scriptContent}
        columnCount={layout.columnCount}
        columnGap={layout.columnGap}
      />
    </div>
  );
}
```

---

**Contract Version**: 1.0.0
**Last Updated**: 2026-01-01
**Status**: Final
