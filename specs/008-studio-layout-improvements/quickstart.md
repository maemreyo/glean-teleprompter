# Quickstart Guide: Studio Layout Improvements

**Feature**: 008-studio-layout-improvements
**Branch**: `008-studio-layout-improvements`
**Date**: 2026-01-01

## Overview

This guide provides step-by-step instructions for developing and testing the studio layout improvements feature, which implements a two-column preview layout and floating ConfigPanel overlay.

## Prerequisites

- Node.js 18+ installed
- Git clone of the repository
- Feature branch created: `008-studio-layout-improvements`

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The dev server will start at `http://localhost:3000`

### 3. Open Studio Page

Navigate to: `http://localhost:3000/studio`

## Component Modification Checklist

### Task 1: Update ConfigStore

**File**: `lib/stores/useConfigStore.ts`

```typescript
// Add to LayoutConfig interface
interface LayoutConfig {
  // Existing properties
  textAlign: 'left' | 'center';
  horizontalMargin: number;
  verticalPadding: number;
  
  // NEW: Column layout support
  columnCount: 1 | 2;
  columnGap: number;
}

// Update defaults
const defaultLayout: LayoutConfig = {
  textAlign: 'left',
  horizontalMargin: 48,
  verticalPadding: 32,
  columnCount: 2,      // NEW
  columnGap: 32,       // NEW
};
```

**Verification**:
```bash
npm run test -- lib/stores/useConfigStore.test.ts
```

### Task 2: Update UIStore

**File**: `stores/useUIStore.ts`

```typescript
// Add to PanelState interface
interface PanelState {
  visible: boolean;
  isAnimating: boolean;
  lastToggled: number | null;
  isOverlay: boolean;    // NEW: Always true
}

// Update defaults
const defaultPanelState: PanelState = {
  visible: false,
  isAnimating: false,
  lastToggled: null,
  isOverlay: true,       // NEW
};
```

**Verification**:
```bash
npm run test -- stores/useUIStore.test.ts
```

### Task 3: Update TeleprompterText

**File**: `components/teleprompter/display/TeleprompterText.tsx`

```typescript
// Add props
interface TeleprompterTextProps {
  text: string;
  className?: string;
  columnCount?: 1 | 2;    // NEW
  columnGap?: number;     // NEW
}

// Apply column styles
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
      role="region"
      aria-label="Teleprompter text display"
    >
      {/* Processed text */}
    </div>
  );
};
```

**Verification**:
```bash
npm run test -- components/teleprompter/display/TeleprompterText.test.tsx
```

### Task 4: Convert ConfigPanel to Overlay

**File**: `components/teleprompter/config/ConfigPanel.tsx`

```typescript
import { Dialog } from '@radix-ui/react-dialog';
import { useUIStore } from '@/stores/useUIStore';

export function ConfigPanel() {
  const { panel, togglePanel } = useUIStore();
  
  return (
    <Dialog.Root open={panel.visible} onOpenChange={togglePanel}>
      <Dialog.Portal>
        <Dialog.Overlay 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
        <Dialog.Content 
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                     w-[400px] max-w-[90vw] h-[80vh] 
                     bg-card rounded-lg shadow-2xl z-50 
                     flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Panel content */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

**Verification**:
```bash
npm run test -- components/teleprompter/config/ConfigPanel.test.tsx
```

### Task 5: Update PreviewPanel

**File**: `components/teleprompter/editor/PreviewPanel.tsx`

```typescript
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { TeleprompterText } from '@/components/teleprompter/display/TeleprompterText';

export function PreviewPanel() {
  const layout = useConfigStore(state => state.layout);
  
  return (
    <div className="absolute inset-0 flex items-center justify-center p-12">
      <TeleprompterText 
        text={scriptContent}
        columnCount={layout.columnCount}
        columnGap={layout.columnGap}
      />
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- components/teleprompter/editor/PreviewPanel.test.tsx
```

### Task 6: Update Editor Layout

**File**: `components/teleprompter/Editor.tsx`

```typescript
export function Editor() {
  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* ContentPanel - always 50% */}
      <ContentPanel className="w-full lg:w-[50%]" />
      
      {/* PreviewPanel - always 50% */}
      <PreviewPanel className="w-full lg:w-[50%]" />
      
      {/* ConfigPanel - overlay (no width constraint) */}
      <ConfigPanel />
    </div>
  );
}
```

**Verification**:
```bash
npm run test -- components/teleprompter/Editor.test.tsx
```

## Testing Commands

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- TeleprompterText.test.tsx

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Run integration tests for studio layout
npm test -- __tests__/integration/studio/layout-two-columns.test.tsx
npm test -- __tests__/integration/studio/layout-overlay-panel.test.tsx
npm test -- __tests__/integration/studio/layout-keyboard-nav.test.tsx
```

### Accessibility Tests

```bash
# Run accessibility tests
npm test -- __tests__/a11y/config/panel-a11y.test.tsx
```

### Linting

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Local Verification Steps

### 1. Verify Two-Column Layout

1. Open `/studio` page
2. Add sample text (at least 3 paragraphs)
3. Open ConfigPanel (Ctrl/Cmd + ,)
4. Navigate to "Layout" tab
5. Verify column count shows "2" as default
6. Verify text displays in 2 equal-width columns
7. Verify 32px gap between columns

### 2. Verify Overlay Behavior

1. Open `/studio` page
2. Note ContentPanel and PreviewPanel positions
3. Toggle ConfigPanel (Ctrl/Cmd + ,)
4. **Verify**: ContentPanel and PreviewPanel do NOT shift
5. **Verify**: Backdrop appears with semi-transparent black
6. **Verify**: ConfigPanel appears centered on screen
7. Close ConfigPanel (Escape or click outside)
8. **Verify**: Panels return to original state

### 3. Verify Keyboard Navigation

1. Open `/studio` page
2. Press `Ctrl/Cmd + ,` to open ConfigPanel
3. Press `Tab` - focus should move to first control
4. Press `Tab` repeatedly - cycle through all controls
5. Press `Shift + Tab` - reverse cycle
6. Press `Escape` - panel should close
7. **Verify**: Focus returns to trigger button

### 4. Verify Mobile Behavior

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl/Cmd + Shift + M)
3. Select mobile device (e.g., iPhone 14)
4. **Verify**: Text displays in single column
5. **Verify**: ConfigPanel is bottom sheet (not overlay)

### 5. Verify Performance

1. Open Chrome DevTools
2. Go to Performance tab
3. Start recording
4. Toggle ConfigPanel on/off 5 times
5. Stop recording
6. **Verify**: Frame rate ≥60 FPS during animations
7. **Verify**: Animation time ≤300ms

## Debugging Tips

### Issue: Columns Not Displaying

**Check**:
```typescript
// Verify columnCount is being passed
console.log('columnCount:', layout.columnCount);

// Verify CSS is applied
const element = document.querySelector('.teleprompter-text');
console.log('columnCount style:', getComputedStyle(element).columnCount);
```

**Solution**: Ensure `columnCount` is extracted from `useConfigStore` and passed to `TeleprompterText`.

### Issue: Panel Not Centered

**Check**:
```typescript
// Verify fixed positioning
const panel = document.querySelector('[role="dialog"]');
console.log('position:', getComputedStyle(panel).position);
console.log('transform:', getComputedStyle(panel).transform);
```

**Solution**: Ensure `-translate-x-1/2 -translate-y-1/2` classes are applied.

### Issue: Layout Shift Still Occurs

**Check**:
```typescript
// Verify widths are static
const content = document.querySelector('.content-panel');
const preview = document.querySelector('.preview-panel');
console.log('Content width:', getComputedStyle(content).width);
console.log('Preview width:', getComputedStyle(preview).width);
```

**Solution**: Ensure both panels have `lg:w-[50%]` and ConfigPanel is removed from flex layout.

## Common Development Tasks

### Add New Column Count Option

1. Update `LayoutConfig` type:
```typescript
columnCount: 1 | 2 | 3;  // Add 3
```

2. Update validation in `useConfigStore.ts`
3. Update tests to cover 3-column case

### Adjust Panel Size

1. Update `ConfigPanel.tsx`:
```typescript
// Change width
className="fixed ... w-[500px] ..."  // Instead of 400px

// Change height
className="fixed ... h-[90vh] ..."  // Instead of 80vh
```

2. Update `layout-behavior.md` contract

### Modify Animation Duration

1. Update animation variants:
```typescript
const panelVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  transition: { duration: 0.2 }  // Instead of 0.3
};
```

2. Update `layout-behavior.md` contract

## Running Specific Tests

### Column Layout Tests

```bash
npm test -- --testNamePattern="column layout"
```

### Overlay Tests

```bash
npm test -- --testNamePattern="overlay panel"
```

### Accessibility Tests

```bash
npm test -- --testNamePattern="accessibility"
```

## Code Quality Checks

Before committing, run:

```bash
# All tests
npm test && npm run lint

# Type checking
npx tsc --noEmit

# Format check
npx prettier --check "**/*.{ts,tsx}"
```

## Commit Guidelines

```
feat(layout): add two-column preview layout

- Add columnCount and columnGap to LayoutConfig
- Implement CSS columns in TeleprompterText
- Add migration for existing configs
- Tests: unit tests for column layout
```

```
feat(panel): convert ConfigPanel to floating overlay

- Use Radix UI Dialog for overlay behavior
- Add backdrop with blur effect
- Remove layout shift when toggling
- Implement focus trap and keyboard navigation
- Tests: integration tests for overlay behavior
```

## Additional Resources

- [Spec](./spec.md) - Full feature specification
- [Research](./research.md) - Technical research findings
- [Data Model](./data-model.md) - State management design
- [Contracts](./contracts/) - API contracts for all components

---

**Last Updated**: 2026-01-01
**Feature Branch**: `008-studio-layout-improvements`
