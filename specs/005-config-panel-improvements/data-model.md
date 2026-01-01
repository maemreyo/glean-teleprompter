# Data Model: Configuration Panel UI/UX Improvements

**Feature**: Configuration Panel UI/UX Improvements  
**Branch**: `005-config-panel-improvements`  
**Version**: 1.0.0  
**Created**: 2026-01-01  

---

## Overview

This document defines the data model extensions and new entities required for the Configuration Panel UI/UX Improvements feature. The feature introduces four main areas of state management:

1. **Panel Visibility State** - For toggle functionality
2. **Configuration History** - For undo/redo capability
3. **Textarea Scaling State** - For proportional UI scaling
4. **Enhanced UI State** - Mobile responsiveness and footer behavior

---

## New Entities

### 1. PanelState

**Purpose**: Manages the visibility and animation state of the configuration panel

**Interface Definition**:

```typescript
interface PanelState {
  // Whether the configuration panel is currently visible
  isVisible: boolean
  
  // Whether an animation is currently in progress
  isAnimating: boolean
  
  // Progress value for animation (0-1), used for tracking animation state
  animationProgress?: number
  
  // Timestamp of last toggle action (used for debouncing rapid clicks)
  lastToggled: number
  
  // Current animation direction (for coordinating open/close animations)
  animationDirection?: 'opening' | 'closing' | null
}
```

**State Transitions**:

```
[Hidden, Not Animating]
    ↓ user toggles open
[Visible, Animating] (animationProgress: 0 → 1)
    ↓ animation completes
[Visible, Not Animating]
    ↓ user toggles closed
[Hidden, Animating] (animationProgress: 1 → 0)
    ↓ animation completes
[Hidden, Not Animating]
```

**Related Components**:
- [`ConfigPanel.tsx`](../../components/teleprompter/config/ConfigPanel.tsx)
- [`Editor.tsx`](../../components/teleprompter/Editor.tsx)

---

### 2. HistoryEntry

**Purpose**: Represents a single snapshot of configuration state in the undo/redo history

**Interface Definition**:

```typescript
interface HistoryEntry {
  // Unique identifier for this history entry (timestamp + sequence)
  id: string
  
  // Sequential number indicating order in history (0-indexed)
  sequenceNumber: number
  
  // Timestamp when this entry was created
  timestamp: number
  
  // Complete configuration state snapshot at this point in time
  config: ConfigurationState
  
  // Optional human-readable description of what changed (e.g., "Increased font size to 24px")
  description?: string
  
  // Which category of configuration was changed (for filtering/search)
  changeCategory?: 'typography' | 'colors' | 'effects' | 'layout' | 'animations' | 'media' | 'multiple'
}
```

**Immutable**: History entries are never modified once created

**Related To**:
- Part of **HistoryStack** collection
- Read by undo/redo functionality

---

### 3. HistoryStack

**Purpose**: Manages the collection of configuration states for undo/redo functionality with FIFO (First In, First Out) behavior

**Interface Definition**:

```typescript
interface HistoryStack {
  // Array of history entries (limited to maxEntries)
  entries: HistoryEntry[]
  
  // Current position in history stack (index of active entry, -1 if at latest)
  currentIndex: number
  
  // Maximum number of entries to maintain (performance/memory constraint)
  maxEntries: number
  
  // Total number of changes made (including those removed due to limit)
  totalChanges: number
}
```

**Operations**:

**Push**: Add new entry to history
- Input: `config: ConfigurationState, description?: string, changeCategory?: ChangeCategory`
- Logic: Create new HistoryEntry, append to entries, enforce maxEntries limit (remove from front if needed)
- Returns: `id` of new entry

**Undo**: Move to previous state
- Input: none
- Logic: Decrement currentIndex (if > -1)
- Returns: `ConfigurationState` at new currentIndex, or null if at beginning

**Redo**: Move to next state
- Input: none
- Logic: Increment currentIndex (if < entries.length - 1)
- Returns: `ConfigurationState` at new currentIndex, or null if at latest

**Reset**: Clear history and start fresh
- Input: `reason: 'preset-applied' | 'template-loaded' | 'script-loaded' | 'manual'`
- Logic: Clear entries array, reset currentIndex to -1

**CanUndo**: Check if undo available
- Returns: `currentIndex > -1`

**CanRedo**: Check if redo available
- Returns: `currentIndex < entries.length - 1`

**GetPosition**: Get current position indicator
- Returns: `"current / total"` string (e.g., "5/10 changes")

**State Invariants**:
- `currentIndex` is always in range `[-1, entries.length - 1]`
- When `currentIndex === -1`, at "latest" state (can only redo)
- When `currentIndex === entries.length - 1`, at "earliest" state (can only undo)
- `entries.length` never exceeds `maxEntries`

---

### 4. TextareaScaleState

**Purpose**: Manages the scaling multiplier for UI elements based on textarea expansion state

**Interface Definition**:

```typescript
type TextareaSize = 'default' | 'medium' | 'large' | 'fullscreen'

interface TextareaScaleState {
  // Current size state of textarea
  size: TextareaSize
  
  // Scale multiplier to apply to interactive elements (buttons, icons)
  scaleMultiplier: 1.0 | 1.2 | 1.4 | 1.5
  
  // Calculated scale for specific element types
  buttonScale: 1.0 | 1.2 | 1.1 | 1.05  // Buttons scale differently
  
  // Font scale with maximum cap
  labelScale: 1.0 | 1.2 | 1.4 | 1.33  // Capped at 16px
}
```

**Scale Multipliers by Size**:

| Size | scaleMultiplier | buttonScale | labelScale |
|------|----------------|-------------|-----------|
| default | 1.0 | 1.0 | 1.0 |
| medium | 1.2 | 1.2 | 1.2 |
| large | 1.4 | 1.4 | 1.4 (capped at 16px) |
| fullscreen | 1.5 | 1.05 (buttons don't grow much) | 1.33 (16px cap) |

**Derived Calculations**:
- **Button Scale**: `scaleMultiplier` × buttonScaleMultiplier`
- **Button Padding**: Base padding × (scaleMultiplier × buttonScaleMultiplier)
- **Icon Size**: Base icon size × (scaleMultiplier × buttonScaleMultiplier)
- **Label Font Size**: `calc(var(--base-label-size) × labelScale)` with `max-width: 16px`

**Related Components**:
- [`TextareaExpandButton.tsx`](../../components/teleprompter/editor/TextareaExpandButton.tsx)
- [`ContentPanel.tsx`](../../components/teleprompter/editor/ContentPanel.tsx) - footer actions

---

### 5. FooterState

**Purpose**: Manages footer visibility, positioning, and collapse state across textarea sizes

**Interface Definition**:

```typescript
interface FooterState {
  // Whether footer is currently visible (hidden in fullscreen mode)
  isVisible: boolean
  
  // Whether footer is collapsed (shows only Preview button) or expanded
  isCollapsed: boolean
  
  // Current footer height in pixels (calculated dynamically)
  height: number
  
  // Scale multiplier for footer elements (matches textarea scale)
  scaleMultiplier: 1.0 | 1.2 | 1.4 | 1.5
  
  // Fixed positioning state (when true, footer is bottom of viewport)
  isFixed: boolean
}
```

**Height Calculations**:
- **Default**: ~100px (base height)
- **Medium**: 100px × 1.2 = 120px (capped)
- **Large**: 100px × 1.4 = 140px (capped at 120px maximum per FR-054)
- **Fullscreen**: Hidden (isVisible = false)

**Content Padding**:
- `padding-bottom: var(--footer-height)` applied to content area
- Ensures no content is hidden behind footer
- Updates dynamically when footer size changes

**Related Components**:
- [`ContentPanel.tsx`](../../components/teleprompter/editor/ContentPanel.tsx) - footer implementation

---

## Extended Existing Interfaces

### Extended ConfigurationState

The existing [`ConfigurationState`](../../lib/config/types.ts) is used by history entries. No changes required - existing structure already contains:

- `typography: TypographyState`
- `colors: ColorsState`
- `effects: EffectsState`
- `layout: LayoutState`
- `animations: AnimationsState`

### Extended UIStore

The existing [`useUIStore`](stores/useUIStore.ts) needs to be extended with new state:

```typescript
interface UIStoreExtensions {
  // Panel visibility state
  panelState: PanelState
  setPanelVisible(visible: boolean): void
  togglePanel(): void
  
  // Textarea scaling state
  textareaScale: TextareaScaleState
  setTextareaSize(size: TextareaSize): void
  
  // Footer state
  footerState: FooterState
  setFooterVisible(visible: boolean): void
  toggleFooterCollapsed(): void
}
```

---

### Extended ConfigStore

The existing [`useConfigStore`](lib/stores/useConfigStore.ts) needs history management extensions:

```typescript
interface ConfigStoreHistoryExtensions {
  // History management
  history: HistoryStack
  recordChange(change: Partial<ConfigurationState>, isBatched: boolean): void
  
  // History navigation
  undo(): void
  redo(): void
  canUndo(): boolean
  canRedo(): boolean
  clearHistory(): void
  
  // Position indicator
  getHistoryPosition(): string  // e.g., "5/10 changes"
}
```

**Recording Logic** (from FR-026 - Hybrid Approach):

**Discrete Changes** (recorded immediately):
- Checkbox toggles
- Select/dropdown value changes
- Button clicks (preset apply, etc.)

**Continuous Changes** (batched on interaction end):
- Slider movements (record on `onMouseUp`/`onTouchEnd`)
- Color picker changes (record on input blur)
- Any rapid changes within 50ms window (batched)

---

## Entity Relationships

```
┌─────────────────────────────────────────────┐
│              ConfigurationState               │
│  (existing, useConfigStore)                  │
│  - typography                                │
│  - colors                                   │
│  - effects                                  │
│  - layout                                   │
│  - animations                              │
└─────────────────┬──────────────────────────────┘
                  │
                  │ ┌────────────────────────┐
                  │ │  HistoryEntry (new)    │
                  │ │  - id                   │
                  │ │  - sequenceNumber       │
                  │ │  - timestamp           │
                  │ │  - config (full state)  │
                  │ │  - description          │
                  │ └────────┬───────────────┴
                  │          │
                  │          ▼
┌─────────────────┴──────────────────────────────────┐
│             HistoryStack (new)                        │
│  - entries: HistoryEntry[]                           │
│  - currentIndex: number                             │
│  - maxEntries: 50                                │
│  - totalChanges: number                            │
└───────────────────────────────────────────────────┘
```

```
┌─────────────────┐          ┌─────────────────┐
│   PanelState (new) │          │ FooterState (new) │
│  - isVisible       │          │  - isVisible     │
│  - isAnimating    │          │  - isCollapsed   │
│  - lastToggled    │          │  - height        │
└─────────┬─────────┘          └────────┬─────────┘
          │                              │
          ▼                              ▼
┌────────────────────────────────────────────────────────┐
│                    UIStore (extended)                             │
│  - panelState: PanelState                                        │
│  - textareaScale: TextareaScaleState                               │
│  - footerState: FooterState                                         │
└──────────────────────────────────────────────────────────┘
```

---

## State Transition Diagrams

### Panel Visibility State

```
User Action → [Toggle Panel] → Check Animation State
                                  ↓
                          ┌────[Panel Hidden]────┐
                          │                         │
                          ▼                         │
                   [Panel Animating In]         │
                          │                         │
                          ▼                         │
                   [Panel Visible] ←─────────────┘
                          │
                    ┌────[User Dismiss/Shortcut]───┐
                    │                               │
                    ▼                               │
             [Panel Animating Out]───────────────┘
                    │
                    ▼
              [Panel Hidden]
```

### History Navigation State

```
User Makes Change → RecordChange → [Push to History]
                                           ↓
                                    ┌──[Max Entries?───┐
                                    │                  │
                                    ▼                  │
                           [Enforced FIFO]←───────────────┘
                                           ↓
                           [Increment Total Changes]
                                           ↓
                           [Set currentIndex = current]
                                           ↓
                           [Enable Undo, Disable Redo]
```

```
User Action → Undo → [Check Can Undo?] → [No: No Effect]
                            ↓ Yes
                  [Decrement currentIndex]
                            ↓
                  [Apply Config at currentIndex]
                            ↓
                  [Update UI, Enable Redo, Check Undo]
```

---

## Data Validation Rules

### HistoryEntry Validation

1. **Sequence Uniqueness**: Each `id` must be unique (using timestamp + random ensures this)
2. **Timestamp Validity**: Must be positive integer representing milliseconds since epoch
3. **Config Completeness**: All config categories must be present (can use default values for undefined)
4. **Category Validity**: If provided, `changeCategory` must be one of the defined categories

### HistoryStack Validation

1. **Size Constraint**: `entries.length <= maxEntries`
2. **Index Bounds**: `-1 <= currentIndex < entries.length`
3. **Total Changes**: `totalChanges >= entries.length` (includes removed entries)
4. **Non-Negative**: `totalChanges >= 0`

### PanelState Validation

1. **Animation Invariant**: If `isAnimating` is true, `animationProgress` must be defined
2. **Animation Direction**: If `isAnimating` is true, `animationDirection` must not be null
3. **Timestamp Check**: If `lastToggled` > 0, must be <= current time

### TextareaScaleState Validation

1. **Size Enum**: `size` must be one of the defined TextareaSize values
2. **Multiplier Range**: All scale values must be between 1.0 and 2.0
3. **Label Cap**: When `size === 'large'`, `labelScale` must cap at ~1.33 (16px cap)
4. **Proportional Constraint**: `buttonScale` should closely track `scaleMultiplier` but may have slight variations

---

## Persistence Strategies

### localStorage Keys

**Panel Visibility**:
- Key: `'configPanelVisible'`
- Type: `boolean`
- Default: `false` (hidden for first-time users)
- Fallback: If localStorage unavailable, default to `true` (visible)

**History State**:
- Key: `'configHistory'`
- Type: `HistoryStack` (JSON serialized)
- Includes: `entries`, `currentIndex`, `totalChanges`
- Persist on every state change
- Load on component mount

**Textarea Preferences**:
- Key: `'textareaPrefs'`
- Type: `{ size: TextareaSize, isFullscreen: boolean, ... }`
- Used by existing TextareaExpandButton functionality

### Persistence Triggers

- **On Change**: Every state change writes to localStorage (debounced to avoid I/O spam)
- **On Mount**: Read persisted state and initialize stores
- **On Unmount**: Save final state to prevent data loss

---

## Performance Considerations

### Memory Management

- **History Size Limit**: 50 entries max, with FIFO removal
- **Entry Size**: Each entry contains full config snapshot (~2-5KB estimated)
- **Total History Memory**: ~250KB maximum (50 × 5KB)
- **Cleanup Strategy**: Remove oldest entries when limit reached, reset on preset/template/script load

### Update Frequency

- **Discrete Changes**: Immediate write to history (checkboxes, selects)
- **Continuous Changes**: Write on interaction end (sliders, pickers)
- **Batch Updates**: If multiple changes within 50ms window, batch as single history entry
- **Panel Animation**: State updates only (no persistence during animation)

### Optimization Targets

- **History Overhead**: <5ms per configuration change (SC-020)
- **Storage Size**: <500KB total for all persisted data
- **Write Frequency**: Maximum 1 write per 50ms window
- **Load Time**: <100ms to load persisted state on mount

---

## Migration Notes

### Breaking Changes

None - All changes are additions to existing state

### Backward Compatibility

- History feature introduces new localStorage key; existing data remains untouched
- Panel visibility defaults to hidden for new users; existing users see visible panel initially
- Textarea scaling uses existing `size` property; multipliers calculated at runtime

### Rollback Plan

If history management causes issues:
1. Remove history middleware from useConfigStore
2. Users can still change configuration, just can't undo/redo
3. Panel visibility and scaling remain functional (independent features)

If real-time preview causes performance issues:
1. Disable auto-update frequency (increase batch window)
2. Add manual "Refresh Preview" button
3. Keep loading/error states for user feedback

---

## Testing Requirements

### Unit Tests

1. **PanelState**: Toggle state changes, animation states
2. **HistoryStack**: FIFO removal, index bounds checking, push/pop operations
3. **HistoryEntry**: ID uniqueness, timestamp validity, config completeness
4. **TextareaScaleState**: Multiplier calculations, size enum validation
5. **FooterState**: Height calculations, visibility states

### Integration Tests

1. **Panel Toggle**: Animation smoothness, localStorage persistence
2. **Undo/Redo**: Full workflow with multiple changes
3. **Real-Time Preview**: Config changes reflect in preview within 100ms
4. **Proportional Scaling**: Elements scale correctly at each textarea size
5. **Mobile Bottom Sheet**: Swipe gestures, orientation changes

### Performance Tests

1. **History Overhead**: <5ms per change measured
2. **Preview Update Latency**: <100ms for 95% of changes
3. **Memory Usage**: History <500KB total
4. **Animation Frame Rate**: 60 FPS maintained

---

## Related Files

### State Management
- [`lib/stores/useConfigStore.ts`](../../lib/stores/useConfigStore.ts) - Extended with history
- [`stores/useUIStore.ts`](stores/useUIStore.ts) - Extended with panel/scale/footer state
- [`stores/useTeleprompterStore.ts`](stores/useTeleprompterStore.ts) - Text content store

### Components
- [`components/teleprompter/config/ConfigPanel.tsx`](../../components/teleprompter/config/ConfigPanel.tsx) - Panel wrapper
- [`components/teleprompter/editor/ContentPanel.tsx`](../../components/teleprompter/editor/ContentPanel.tsx) - Toggle button, footer
- [`components/teleprompter/editor/PreviewPanel.tsx`](../../components/teleprompter/editor/PreviewPanel.tsx) - Preview subscriber

### Types
- [`lib/config/types.ts`](../../lib/config/types.ts) - ConfigurationState interfaces
- [`lib/config/types.ts`](../../lib/config/types.ts) - HistoryEntry, HistoryStack if defined

### Testing
- [`__tests__/mocks/local-storage.mock.ts`](../../__tests__/mocks/local-storage.mock.ts) - localStorage mocking
- [`__tests__/utils/test-helpers.tsx`](../../__tests__/utils/test-helpers.tsx) - Test utilities
