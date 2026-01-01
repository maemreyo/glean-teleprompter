# API Contract: UIStore Interface

**Feature**: 008-studio-layout-improvements
**File**: `stores/useUIStore.ts`
**Version**: 1.0.0

## Interface Definition

```typescript
interface PanelState {
  visible: boolean;
  isAnimating: boolean;
  lastToggled: number | null;
  isOverlay: boolean;  // NEW: Always true for floating behavior
}

interface UIState {
  panel: PanelState;
  
  // Actions
  togglePanel: () => void;
  setPanelVisible: (visible: boolean) => void;
  setPanelAnimating: (isAnimating: boolean) => void;
}
```

## Action Specifications

### `togglePanel(): void`

Toggles the visibility of the ConfigPanel overlay.

**Behavior**:
1. Toggles `panel.visible` state
2. Sets `panel.lastToggled` to current timestamp
3. Triggers overlay animation
4. No direct DOM manipulation (handled by Radix UI)

**Side Effects**:
- Shows/hides backdrop
- Shows/hides ConfigPanel overlay
- Triggers focus trap (when opening)
- Restores focus (when closing)

**Example Usage**:
```typescript
const { togglePanel, panel } = useUIStore();

// Toggle panel
togglePanel();

// Check visibility
if (panel.visible) {
  console.log('Panel is visible');
}
```

### `setPanelVisible(visible: boolean): void`

Sets the visibility state of the ConfigPanel.

**Parameters**:
- `visible`: Target visibility state

**Behavior**:
1. Sets `panel.visible` to specified value
2. Updates `panel.lastToggled` timestamp
3. Triggers open/close animations

**Example Usage**:
```typescript
const { setPanelVisible } = useUIStore();

// Open panel
setPanelVisible(true);

// Close panel
setPanelVisible(false);
```

### `setPanelAnimating(isAnimating: boolean): void`

Sets the animation state during panel transitions.

**Parameters**:
- `isAnimating`: Animation state

**Behavior**:
1. Sets `panel.isAnimating` state
2. Used to prevent rapid toggling during animations
3. Typically managed by Framer Motion lifecycle

**Example Usage**:
```typescript
const { setPanelAnimating } = useUIStore();

// Animation started
setPanelAnimating(true);

// Animation completed
setPanelAnimating(false);
```

## State Properties

### `panel.visible: boolean`

Current visibility state of the ConfigPanel.

**Default**: `false`

**Usage**:
```typescript
const { panel } = useUIStore();
{panel.visible && <ConfigPanel />}
```

### `panel.isAnimating: boolean`

Animation state during panel open/close transitions.

**Default**: `false`

**Usage**:
```typescript
const { panel } = useUIStore();
const isDisabled = panel.isAnimating;
```

### `panel.lastToggled: number | null`

Timestamp of last panel toggle action.

**Default**: `null`

**Usage**:
```typescript
const { panel } = useUIStore();
const secondsSinceToggle = panel.lastToggled 
  ? (Date.now() - panel.lastToggled) / 1000 
  : null;
```

### `panel.isOverlay: boolean`

Fixed flag indicating overlay rendering mode.

**Default**: `true`

**Usage**:
```typescript
const { panel } = useUIStore();
if (panel.isOverlay) {
  // Render as fixed overlay
  return <ConfigPanelOverlay />;
}
```

## State Persistence

### localStorage Schema

**Key**: `glean-teleprompter-ui`

**Structure**:
```typescript
interface StoredUIState {
  panel: {
    visible: boolean;
    lastToggled: number | null;
    isOverlay: boolean;  // Always true
  };
}
```

**Persistence Behavior**:
1. Panel visibility persists across page reloads
2. Overlay mode is fixed (not user-configurable)
3. Animation state does NOT persist (transient)

## Event Flow

```
User Action (Ctrl/Cmd + , or button click)
    ↓
togglePanel()
    ↓
Update panel.visible
    ↓
Update panel.lastToggled
    ↓
Radix UI Dialog shows/hides
    ↓
Backdrop shows/hides
    ↓
Focus trap activates/deactivates
```

## Integration with Radix UI Dialog

The ConfigPanel uses Radix UI's Dialog primitive for overlay behavior:

```typescript
<Dialog.Root 
  open={panel.visible} 
  onOpenChange={setPanelVisible}
>
  <Dialog.Portal>
    <Dialog.Overlay className="backdrop" />
    <Dialog.Content className="panel">
      {/* Panel content */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### Radix UI Integration Points

1. **Open/Close Control**: `Dialog.Root open={panel.visible}`
2. **Event Handling**: `onOpenChange` calls `setPanelVisible`
3. **Focus Management**: Automatic via Radix UI
4. **Escape Key**: Automatic via Radix UI
5. **Portal Rendering**: Automatic via `Dialog.Portal`

## TypeScript Types

```typescript
// Panel state interface
interface PanelState {
  visible: boolean;
  isAnimating: boolean;
  lastToggled: number | null;
  isOverlay: boolean;
}

// UI state interface
interface UIState {
  panel: PanelState;
  togglePanel: () => void;
  setPanelVisible: (visible: boolean) => void;
  setPanelAnimating: (isAnimating: boolean) => void;
}

// Store selector type
type UIPanelSelector = (state: UIState) => PanelState;
```

## Error Handling

```typescript
// State validation (internal)
function validatePanelState(state: PanelState): void {
  if (typeof state.visible !== 'boolean') {
    throw new Error('panel.visible must be a boolean');
  }
  if (typeof state.isOverlay !== 'boolean') {
    throw new Error('panel.isOverlay must be a boolean');
  }
  if (state.lastToggled !== null && typeof state.lastToggled !== 'number') {
    throw new Error('panel.lastToggled must be number or null');
  }
}
```

## Testing Contract

### Unit Tests Required

1. `togglePanel()` switches `visible` state
2. `togglePanel()` updates `lastToggled` timestamp
3. `setPanelVisible()` sets correct state
4. `setPanelAnimating()` sets animation flag
5. Panel visibility persists to localStorage
6. Overlay mode is always `true`
7. Rapid toggling is handled correctly

### Test Example

```typescript
describe('useUIStore - Panel', () => {
  beforeEach(() => {
    useUIStore.getState().setPanelVisible(false);
  });
  
  it('should toggle panel visibility', () => {
    const { togglePanel, panel } = useUIStore.getState();
    
    togglePanel();
    expect(panel.visible).toBe(true);
    
    togglePanel();
    expect(panel.visible).toBe(false);
  });
  
  it('should update lastToggled timestamp', () => {
    const { togglePanel, panel } = useUIStore.getState();
    
    const before = Date.now();
    togglePanel();
    const after = Date.now();
    
    expect(panel.lastToggled).toBeGreaterThanOrEqual(before);
    expect(panel.lastToggled).toBeLessThanOrEqual(after);
  });
  
  it('should always have overlay mode enabled', () => {
    const { panel } = useUIStore.getState();
    expect(panel.isOverlay).toBe(true);
  });
});
```

## Keyboard Shortcuts

The store integrates with keyboard shortcuts via `useKeyboardShortcuts` hook:

```typescript
// Keyboard shortcut mapping
const shortcuts = {
  'Ctrl+,': togglePanel,     // Windows/Linux
  'Meta+,:': togglePanel,    // macOS
  'Escape': () => setPanelVisible(false),
};
```

---

**Contract Version**: 1.0.0
**Last Updated**: 2026-01-01
**Status**: Final
