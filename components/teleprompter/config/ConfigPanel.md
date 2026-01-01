# ConfigPanel Component

## Overview

The `ConfigPanel` component is an always-visible configuration panel on desktop that provides comprehensive styling controls for the teleprompter. It features tabbed organization, undo/redo functionality, and smooth animations.

## Features

### Toggle Visibility
- **Animation**: 300ms smooth slide-in/slide-out animation
- **Keyboard Shortcut**: `Ctrl/Cmd + ,` to toggle panel visibility
- **Persistence**: Panel visibility state persists across page reloads via localStorage
- **Responsive**: Hidden by default on mobile/tablet devices

### Undo/Redo System
- **History Limit**: Maintains up to 50 configuration states
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + Z`: Undo
  - `Ctrl/Cmd + Shift + Z`: Redo
  - `Ctrl/Cmd + Y`: Alternative redo
- **Visual Indicator**: Shows current position in history (e.g., "5/10 changes")
- **Clear History**: Confirmation dialog to clear all undo/redo history

### Mobile View
- On mobile devices, the config panel opens as a bottom sheet
- **90% viewport height** in portrait mode
- **50% width** in landscape mode
- **Swipe-to-close** gesture with 100px threshold
- **"Done" button** to close the panel
- Touch-optimized controls with 48px minimum touch targets

## Props

This component does not accept any props. It uses Zustand stores for state management.

## State Management

### useUIStore
```typescript
const { panelState } = useUIStore()
// panelState.visible: boolean - Whether the panel is currently visible
```

### useConfigStore
```typescript
const {
  canUndoHistory,       // () => boolean - Check if undo is available
  canRedoHistory,       // () => boolean - Check if redo is available
  performUndo,          // () => void - Perform undo action
  performRedo,          // () => void - Perform redo action
  clearHistory,         // () => void - Clear all history
  historyStack,         // HistoryStack - The full history stack
  currentHistoryIndex   // number - Current position in history
} = useConfigStore()
```

## Usage Examples

### Basic Usage
```tsx
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel'

function Editor() {
  return (
    <div className="flex h-full">
      <ConfigPanel />
      <PreviewPanel />
    </div>
  )
}
```

### With Toggle Control
```tsx
import { useUIStore } from '@/stores/useUIStore'
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel'

function Editor() {
  const { panelState, togglePanel } = useUIStore()

  return (
    <div className="flex h-full">
      {panelState.visible && <ConfigPanel />}
      <button onClick={togglePanel}>
        {panelState.visible ? 'Hide' : 'Show'} Config
      </button>
    </div>
  )
}
```

### Keyboard Shortcut Example
```tsx
// The panel automatically handles keyboard shortcuts:
// - Ctrl/Cmd + , : Toggle panel visibility
// - Ctrl/Cmd + Z : Undo last change
// - Ctrl/Cmd + Shift + Z : Redo
// - Ctrl/Cmd + Y : Alternative redo
```

## Accessibility

### ARIA Labels
- Undo button: `aria-label="Undo"`
- Redo button: `aria-label="Redo"`
- Clear history button: `aria-label="Clear history"`

### Reduced Motion
The component respects the `prefers-reduced-motion` media query:
- When reduced motion is preferred, the slide animation is disabled
- Panel visibility changes use simple opacity transitions
- No layout shift occurs during animations

### Keyboard Navigation
- All controls are fully keyboard accessible
- Tab order follows visual layout
- Disabled buttons have `disabled` attribute set

### Focus Management
- Dialog traps focus when open (clear history confirmation)
- Focus returns to triggering element after dialog close

## Component Structure

```
ConfigPanel
├── Header
│   ├── Title ("Configuration")
│   └── Actions
│       ├── Undo Button
│       └── Redo Button
├── History Indicator Bar (when history exists)
│   ├── Position Display (e.g., "5/10 changes")
│   └── Clear History Button
└── ConfigTabs
    ├── Typography Tab
    ├── Colors Tab
    ├── Effects Tab
    ├── Layout Tab
    ├── Animations Tab
    ├── Presets Tab
    └── Media Tab
```

## Animation Variants

### Reduced Motion
```typescript
{
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: 0 }
}
```

### Normal Motion
```typescript
{
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  hidden: {
    opacity: 0,
    x: '100%',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
}
```

## Dialogs

### Clear History Confirmation
```tsx
<Dialog open={showClearHistoryDialog}>
  <DialogTitle>Clear History</DialogTitle>
  <DialogDescription>
    Are you sure you want to clear all undo/redo history? 
    This action cannot be undone.
  </DialogDescription>
  <DialogFooter>
    <Button variant="outline">Cancel</Button>
    <Button variant="destructive">Clear History</Button>
  </DialogFooter>
</Dialog>
```

## Performance Considerations

- Uses `useMemo` for animation variants to prevent unnecessary recalculations
- History position indicator is memoized
- Keyboard event listeners are properly cleaned up on unmount
- Animation uses CSS transforms for GPU acceleration

## Related Components

- [`ConfigTabs`](./ConfigTabs.tsx) - Tab navigation for config sections
- [`TabBottomSheet`](./TabBottomSheet.tsx) - Mobile bottom sheet variant
- [`useConfigStore`](../../../lib/stores/useConfigStore.ts) - Configuration state management
- [`useUIStore`](../../../stores/useUIStore.ts) - UI state management

## Specification

This component implements:
- **T020**: Panel slide animation with Framer Motion
- **T058-T063**: Undo/redo functionality with visual indicators
- **T027**: Respects prefers-reduced-motion
- **T069-T078**: Mobile-optimized bottom sheet interface

See: [specs/005-config-panel-improvements/](../../../specs/005-config-panel-improvements/)
