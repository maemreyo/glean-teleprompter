# Data Model: Studio Page UI/UX Improvements

**Feature**: 004-studio-ui-ux-improvements  
**Date**: 2025-12-31  
**Status**: Complete

## Overview

This document describes the UI state entities and data structures introduced by the Studio Page UI/UX Improvements feature. Since this is a frontend-only feature with no backend changes, all entities are stored in browser localStorage or managed via Zustand stores.

---

## UI State Entities

### 1. AutoSaveStatus

**Purpose**: Track auto-save state and display status to users

**Storage**: localStorage key `teleprompter_autosave_status`

```typescript
interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: number;      // Unix timestamp
  errorMessage?: string;      // Error message if status === 'error'
  retryCount?: number;        // Number of consecutive failures
}
```

**State Transitions**:
```
idle → saving → saved
              ↘ error → saving (retry)
```

**Validation Rules**:
- `lastSavedAt` must be <= current time
- `retryCount` must be >= 0 and <= 5 (max retry attempts)
- `errorMessage` required when `status === 'error'`

**Relationships**:
- References `teleprompter_draft` content (existing)
- Triggers UI updates in ContentPanel header

---

### 2. TextareaPreferences

**Purpose**: Persist user's textarea size preferences

**Storage**: localStorage key `teleprompter_textarea_prefs`

```typescript
interface TextareaPreferences {
  size: 'default' | 'medium' | 'large' | 'fullscreen' | 'custom';
  customHeight?: number;      // Pixels (128-80% viewport)
  isFullscreen: boolean;       // Whether fullscreen mode is active
}
```

**Default Values**:
```typescript
const DEFAULT_TEXTAREA_PREFS: TextareaPreferences = {
  size: 'default',
  isFullscreen: false,
};
```

**Size Mappings**:
- `default`: 128px (existing)
- `medium`: 300px
- `large`: 500px
- `fullscreen`: 100vh (with overlay)
- `custom`: User-defined via drag handle (128px - 80% viewport)

**Validation Rules**:
- `customHeight` must be >= 128 and <= window.innerHeight * 0.8
- Only one of `size` or `customHeight` active at a time

---

### 3. FooterState

**Purpose**: Track footer collapse/expand state

**Storage**: localStorage key `teleprompter_footer_state`

```typescript
interface FooterState {
  isCollapsed: boolean;
  collapsedSince?: number;    // Unix timestamp when collapsed
}
```

**Default Values**:
```typescript
const DEFAULT_FOOTER_STATE: FooterState = {
  isCollapsed: false,
};
```

**Behavior**:
- When collapsed: Only Preview button visible
- When expanded: Preview, Save, Share buttons visible
- State persists across page reloads

---

### 4. PreviewPanelState (Mobile)

**Purpose**: Track mobile preview panel state

**Storage**: localStorage key `teleprompter_preview_state`

```typescript
interface PreviewPanelState {
  isOpen: boolean;
  lastToggledAt?: number;     // Unix timestamp
}
```

**Viewport-Specific Behavior**:
- Mobile (< 768px): Bottom sheet, 60% screen height
- Tablet (768px - 1024px): Right-side panel, 40% width
- Desktop (>= 1024px): Always visible (no state needed)

**Default Values**:
```typescript
const DEFAULT_PREVIEW_STATE: PreviewPanelState = {
  isOpen: false,
};
```

---

### 5. KeyboardShortcutsStats

**Purpose**: Track keyboard shortcuts usage for "Pro tip" feature

**Storage**: localStorage key `teleprompter_shortcuts_stats`

```typescript
interface KeyboardShortcutsStats {
  sessionsCount: number;      // Number of Studio sessions
  modalOpenedCount: number;   // Times shortcuts modal opened
  tipsShown: string[];        // Tips already shown to user
  lastSessionAt?: number;     // Unix timestamp of last session
}
```

**"Pro Tip" Logic**:
- Show tips after 5+ sessions
- Don't repeat same tip (track in `tipsShown`)
- Random tip selection from pool of ~10 tips

**Default Values**:
```typescript
const DEFAULT_SHORTCUTS_STATS: KeyboardShortcutsStats = {
  sessionsCount: 0,
  modalOpenedCount: 0,
  tipsShown: [],
};
```

---

### 6. ErrorContext

**Purpose**: Provide contextual error information to users

**Storage**: In-memory only (not persisted)

```typescript
interface ErrorContext {
  type: 'network' | 'not_found' | 'permission' | 'quota' | 'unknown';
  message: string;
  details?: string;           // Technical details for debugging
  timestamp: number;          // Unix timestamp
  action?: 'retry' | 'browse_templates' | 'sign_up' | 'copy_error';
}
```

**Error Type Mappings**:
```typescript
const ERROR_MESSAGES = {
  network: {
    message: "Network error. Check your connection and try again",
    action: 'retry',
  },
  not_found: {
    message: "Script not found. It may have been deleted or the link is incorrect",
    action: 'browse_templates',
  },
  permission: {
    message: "You don't have permission to view this script",
    action: 'sign_up',
  },
  quota: {
    message: "Storage full. Some browsers limit storage. Try saving to your account instead",
    action: 'sign_up',
  },
};
```

---

## Zustand Store Extensions

### Extended useTeleprompterStore

**New State**:

```typescript
interface AutoSaveState {
  autoSaveStatus: AutoSaveStatus;
  setAutoSaveStatus: (status: AutoSaveStatus) => void;
}

// Extend existing store
interface TeleprompterStore extends AutoSaveState {
  // ... existing state
}
```

### New useUIStore

**Purpose**: Centralize UI state management for preferences and ephemeral UI state

```typescript
interface UIStore {
  // Textarea preferences
  textareaPrefs: TextareaPreferences;
  setTextareaPrefs: (prefs: Partial<TextareaPreferences>) => void;
  toggleTextareaSize: () => void;  // Cycle through sizes
  
  // Footer state
  footerState: FooterState;
  setFooterState: (state: Partial<FooterState>) => void;
  toggleFooter: () => void;
  
  // Preview panel state (mobile)
  previewState: PreviewPanelState;
  setPreviewState: (state: Partial<PreviewPanelState>) => void;
  togglePreview: () => void;
  
  // Keyboard shortcuts stats
  shortcutsStats: KeyboardShortcutsStats;
  incrementSessionsCount: () => void;
  recordModalOpened: () => void;
  markTipShown: (tip: string) => void;
  
  // Error context
  errorContext: ErrorContext | null;
  setErrorContext: (error: ErrorContext | null) => void;
  clearError: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  textareaPrefs: loadFromStorage('teleprompter_textarea_prefs', DEFAULT_TEXTAREA_PREFS),
  footerState: loadFromStorage('teleprompter_footer_state', DEFAULT_FOOTER_STATE),
  previewState: loadFromStorage('teleprompter_preview_state', DEFAULT_PREVIEW_STATE),
  shortcutsStats: loadFromStorage('teleprompter_shortcuts_stats', DEFAULT_SHORTCUTS_STATS),
  errorContext: null,
  
  // Actions
  setTextareaPrefs: (prefs) => set((state) => {
    const updated = { ...state.textareaPrefs, ...prefs };
    saveToStorage('teleprompter_textarea_prefs', updated);
    return { textareaPrefs: updated };
  }),
  
  toggleTextareaSize: () => set((state) => {
    const sizeOrder = ['default', 'medium', 'large', 'fullscreen'] as const;
    const currentIndex = sizeOrder.indexOf(state.textareaPrefs.size);
    const nextSize = sizeOrder[(currentIndex + 1) % sizeOrder.length];
    const updated = { ...state.textareaPrefs, size: nextSize };
    saveToStorage('teleprompter_textarea_prefs', updated);
    return { textareaPrefs: updated };
  }),
  
  setFooterState: (state) => set((state) => {
    // Similar pattern
  }),
  
  toggleFooter: () => set((state) => {
    const updated = { ...state.footerState, isCollapsed: !state.footerState.isCollapsed };
    saveToStorage('teleprompter_footer_state', updated);
    return { footerState: updated };
  }),
  
  // ... similar for preview, shortcuts, error
}));
```

---

## localStorage Schema

### Key Summary

| Key | Type | Description |
|-----|------|-------------|
| `teleprompter_autosave_status` | AutoSaveStatus | Auto-save state and last saved timestamp |
| `teleprompter_textarea_prefs` | TextareaPreferences | Textarea size preferences |
| `teleprompter_footer_state` | FooterState | Footer collapse/expand state |
| `teleprompter_preview_state` | PreviewPanelState | Mobile preview panel state |
| `teleprompter_shortcuts_stats` | KeyboardShortcutsStats | Keyboard shortcuts usage stats |
| `teleprompter_draft` | (existing) | Main draft content (teleprompter text, settings) |

### Migration Strategy

**Version 1.0 → 2.0**:
- Add new localStorage keys
- Existing `teleprompter_draft` unchanged
- No data migration needed (all new keys)

**Fallback Handling**:
```typescript
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.warn(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
}
```

---

## Component Props Interfaces

### AutoSaveStatus Component

```typescript
interface AutoSaveStatusProps {
  status: AutoSaveStatus['status'];
  lastSavedAt?: number;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}
```

### TextareaExpandButton Component

```typescript
interface TextareaExpandButtonProps {
  currentSize: TextareaPreferences['size'];
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
}
```

### FooterCollapseButton Component

```typescript
interface FooterCollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
  className?: string;
}
```

### MobilePreviewToggle Component

```typescript
interface MobilePreviewToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  viewport: 'mobile' | 'tablet' | 'desktop';
  className?: string;
}
```

### KeyboardShortcutsModal Component

```typescript
interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: ShortcutCategory[];
  stats: KeyboardShortcutsStats;
}

interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

interface Shortcut {
  keys: string[];           // e.g., ['Ctrl', 'Z'] or ['?']
  description: string;
  action: () => void;
}
```

### ErrorDialog Component

```typescript
interface ErrorDialogProps {
  error: ErrorContext;
  onRetry?: () => void;
  onBrowseTemplates?: () => void;
  onSignUp?: () => void;
  onCopyError?: () => void;
  onClose?: () => void;
}
```

---

## Data Flow Diagrams

### Auto-Save Status Flow

```
User types text
    ↓
ContentPanel detects onChange
    ↓
Debounce timer (5 seconds)
    ↓
requestIdleCallback triggers
    ↓
localStorage.setItem('teleprompter_draft', data)
    ↓
Update AutoSaveStatus: saving → saved
    ↓
ContentPanel re-renders with "Saved ✓" indicator
```

### Textarea Size Change Flow

```
User clicks expand button
    ↓
toggleTextareaSize()
    ↓
Cycle: default → medium → large → fullscreen → default
    ↓
saveToStorage('teleprompter_textarea_prefs', updated)
    ↓
Textarea re-renders with new height
```

### Keyboard Shortcut Flow

```
User presses keyboard shortcut
    ↓
useKeyboardShortcuts hook detects key combo
    ↓
Execute associated action
    ↓
If shortcut = '?', open modal
    ↓
Increment shortcutsStats.modalOpenedCount
    ↓
Save to localStorage
```

---

## Validation Summary

**Client-Side Validation**:
- All localStorage writes wrapped in try-catch
- Fallback to defaults on parse errors
- Quota exceeded detection with user notification

**TypeScript Validation**:
- All interfaces defined with strict types
- No `any` types used
- Runtime validation via zod or similar for critical values (optional)

---

## Next Steps

1. ✅ Data model defined
2. ✅ localStorage schema documented
3. ✅ Component props interfaces defined
4. ⏳ Implement components using these interfaces
5. ⏳ Add integration tests for state management

---

**Data Model Status**: ✅ Complete
