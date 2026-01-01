# Data Model: Unified State Architecture

**Feature**: 007-unified-state-architecture  
**Date**: 2026-01-01  
**Status**: Complete

## Overview

This document defines the data model for the unified state architecture, which separates concerns across four Zustand stores: useContentStore, useConfigStore, usePlaybackStore, and useUIStore.

## Entity Definitions

### 1. ContentStore

**Purpose**: Manage content data and editor mutability state  
**localStorage Key**: `teleprompter-content`  
**Persistence**: Full persistence via Zustand persist middleware

#### State Properties

| Property | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `text` | `string` | `'Chào mừng! Hãy nhập nội dung của bạn vào đây...'` | The teleprompter script text content | Max length: 1,000,000 chars |
| `bgUrl` | `string` | Unsplash default image URL | Background image URL for Runner display | Valid URL string |
| `musicUrl` | `string` | `''` | Background music URL for audio playback | Valid URL string or empty |
| `isReadOnly` | `boolean` | `false` | Whether editor is in read-only mode | N/A |

#### Derived State (computed)
- `hasContent`: `boolean` - Whether text content exists (text.length > 0)
- `hasBackground`: `boolean` - Whether background image is set (bgUrl.length > 0)
- `hasMusic`: `boolean` - Whether background music is set (musicUrl.length > 0)

#### Actions

```typescript
interface ContentStoreActions {
  // Content setters
  setText: (text: string) => void
  setBgUrl: (url: string) => void
  setMusicUrl: (url: string) => void
  
  // Mutability
  setIsReadOnly: (readOnly: boolean) => void
  
  // Bulk update (for loading from templates/saved scripts)
  setAll: (state: Partial<ContentStoreState>) => void
  
  // Reset
  reset: () => void
  resetContent: () => void
  resetMedia: () => void
}
```

#### State Transitions

```
[Editing Mode] --setIsReadOnly(true)--> [Read-Only Mode]
[Read-Only Mode] --setIsReadOnly(false)--> [Editing Mode]
```

---

### 2. ConfigStore (EXISTING - Extended)

**Purpose**: Manage ALL visual styling configuration  
**localStorage Key**: `teleprompter-config` (existing)  
**Persistence**: Full persistence via Zustand persist middleware

**Note**: This store already exists. It will be extended with one new property: `overlayOpacity` in the effects config.

#### State Properties (Existing)

| Category | Property | Type | Default | Description |
|----------|----------|------|---------|-------------|
| **Typography** | `fontFamily` | `string` | `'Inter'` | CSS font family name |
| | `fontWeight` | `number` | `400` | CSS font weight (100-900) |
| | `fontSize` | `number` | `48` | Font size in pixels (12-120) |
| | `letterSpacing` | `number` | `0` | Letter spacing in pixels (-10 to 20) |
| | `lineHeight` | `number` | `1.5` | Line height as ratio (1.0 to 3.0) |
| | `textTransform` | `string` | `'none'` | CSS text transform |
| **Colors** | `primaryColor` | `string` | `'#ffffff'` | Primary text color (hex) |
| | `gradientEnabled` | `boolean` | `false` | Whether gradient is enabled |
| | `gradientType` | `'linear' \| 'radial'` | `'linear'` | Gradient type |
| | `gradientColors` | `string[]` | `['#ffffff', '#fbbf24']` | Gradient color stops |
| | `gradientAngle` | `number` | `90` | Gradient angle in degrees (0-360) |
| | `outlineColor` | `string` | `'#000000'` | Text outline color (hex) |
| | `glowColor` | `string` | `'#ffffff'` | Text glow color (hex) |
| **Effects** | `shadowEnabled` | `boolean` | `false` | Whether shadow is enabled |
| | `shadowOffsetX` | `number` | `2` | Shadow X offset in pixels |
| | `shadowOffsetY` | `number` | `2` | Shadow Y offset in pixels |
| | `shadowBlur` | `number` | `4` | Shadow blur radius in pixels |
| | `shadowColor` | `string` | `'#000000'` | Shadow color (hex) |
| | `shadowOpacity` | `number` | `0.5` | Shadow opacity (0.0-1.0) |
| | `outlineEnabled` | `boolean` | `false` | Whether outline is enabled |
| | `outlineWidth` | `number` | `2` | Outline width in pixels |
| | `glowEnabled` | `boolean` | `false` | Whether glow is enabled |
| | `glowBlurRadius` | `number` | `10` | Glow blur radius in pixels |
| | `glowIntensity` | `number` | `0.5` | Glow intensity (0.0-1.0) |
| | `backdropFilterEnabled` | `boolean` | `false` | Whether backdrop filter is enabled |
| | `backdropBlur` | `number` | `0` | Backdrop blur in pixels |
| | `backdropBrightness` | `number` | `100` | Backdrop brightness % |
| | `backdropSaturation` | `number` | `100` | Backdrop saturation % |
| | `overlayOpacity` | `number` | `0.5` | **NEW** Background overlay opacity (0.0-1.0) |
| **Layout** | `horizontalMargin` | `number` | `0` | Horizontal margin in pixels |
| | `verticalPadding` | `number` | `0` | Vertical padding in pixels |
| | `textAlign` | `'left' \| 'center' \| 'right' \| 'justify'` | `'center'` | Text alignment |
| | `columnCount` | `number` | `1` | Number of columns (1-3) |
| | `columnGap` | `number` | `20` | Column gap in pixels |
| | `textAreaWidth` | `number` | `100` | Text area width % (10-100) |
| | `textAreaPosition` | `'left' \| 'center' \| 'right'` | `'center'` | Text area position |
| **Animations** | `smoothScrollEnabled` | `boolean` | `true` | Whether smooth scroll is enabled |
| | `scrollDamping` | `number` | `0.5` | Scroll damping factor (0.0-1.0) |
| | `entranceAnimation` | `string` | `'fade-in'` | Entrance animation type |
| | `entranceDuration` | `number` | `500` | Entrance duration in ms |
| | `wordHighlightEnabled` | `boolean` | `false` | Whether word highlight is enabled |
| | `highlightColor` | `string` | `'#fbbf24'` | Highlight color (hex) |
| | `highlightSpeed` | `number` | `200` | Highlight speed in ms |
| | `autoScrollEnabled` | `boolean` | `false` | Whether auto-scroll is enabled |
| | `autoScrollSpeed` | `number` | `50` | **QUICK SETTING** Auto-scroll speed in px/sec (10-200) |
| | `autoScrollAcceleration` | `number` | `0` | Auto-scroll acceleration |

#### UI State (Existing)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `activeTab` | `TabId` | `'typography'` | Currently active config tab |
| `isPanelOpen` | `boolean` | `false` | Whether config panel is open |

#### History State (Existing)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `historyStack` | `HistoryStack` | FIFO stack | Undo/redo history |
| `currentHistoryIndex` | `number` | `-1` | Current history position |
| `isUndoing` | `boolean` | `false` | Currently undoing |
| `isRedoing` | `boolean` | `false` | Currently redoing |
| `isRecording` | `boolean` | `false` | Currently recording history |

#### Actions (Existing)

```typescript
interface ConfigStoreActions {
  // Config setters
  setTypography: (config: Partial<TypographyConfig>) => void
  setColors: (config: Partial<ColorConfig>) => void
  setEffects: (config: Partial<EffectConfig>) => void
  setLayout: (config: Partial<LayoutConfig>) => void
  setAnimations: (config: Partial<AnimationConfig>) => void
  
  // Debounced versions (50ms window)
  setTypographyDebounced: (config: Partial<TypographyConfig>) => void
  setColorsDebounced: (config: Partial<ColorConfig>) => void
  setEffectsDebounced: (config: Partial<EffectConfig>) => void
  setLayoutDebounced: (config: Partial<LayoutConfig>) => void
  setAnimationsDebounced: (config: Partial<AnimationConfig>) => void
  
  // UI state
  setActiveTab: (tab: TabId) => void
  togglePanel: () => void
  
  // Bulk update
  setAll: (config: ConfigSnapshot) => void
  
  // History
  pushHistoryEntry: (entry: HistoryEntry) => void
  clearHistory: () => void
  getCurrentHistoryEntry: () => HistoryEntry | null
  resetHistory: () => void
  performUndo: () => void
  performRedo: () => void
  canUndoHistory: () => boolean
  canRedoHistory: () => boolean
  recordDiscreteChange: (action: string, config: HistoryConfig) => void
  recordContinuousChange: (action: string, config: HistoryConfig) => void
  
  // Reset
  resetTypography: () => void
  resetColors: () => void
  resetEffects: () => void
  resetLayout: () => void
  resetAnimations: () => void
  resetAll: () => void
}
```

#### State Transitions

```
[Default Config] --setTypography/Colors/Effects/Layout/Animations--> [Custom Config]
[Custom Config] --resetAll--> [Default Config]
[Custom Config] --undo/redo--> [Previous/Next Config State]
```

---

### 3. PlaybackStore (NEW)

**Purpose**: Manage runtime playback state  
**localStorage Key**: None (runtime-only state, no persistence)  
**Persistence**: None - state resets on page refresh

#### State Properties

| Property | Type | Default | Description | Validation |
|----------|------|---------|-------------|------------|
| `isPlaying` | `boolean` | `false` | Whether teleprompter is currently scrolling | N/A |
| `currentTime` | `number` | `0` | Current playback position in seconds | >= 0 |
| `scrollSpeed` | `number` | `1` | Current runtime scroll velocity multiplier (1-10) | 1-10 range |

#### Derived State (computed)
- `isPaused`: `boolean` - Whether playback is paused (!isPlaying)
- `hasStarted`: `boolean` - Whether playback has ever started (currentTime > 0)

#### Actions

```typescript
interface PlaybackStoreActions {
  // Playback control
  setIsPlaying: (playing: boolean) => void
  togglePlaying: () => void
  
  // Time tracking
  setCurrentTime: (time: number) => void
  advanceTime: (delta: number) => void
  
  // Speed tracking (runtime only, separate from config.autoScrollSpeed)
  setScrollSpeed: (speed: number) => void
  
  // Reset
  reset: () => void
}
```

#### State Transitions

```
[Stopped] --setIsPlaying(true)--> [Playing]
[Playing] --setIsPlaying(false)--> [Paused]
[Paused] --setIsPlaying(true)--> [Playing]
[Playing/Paused] --reset--> [Stopped]
```

---

### 4. UIStore (EXISTING - Extended)

**Purpose**: Manage UI navigation and visibility state  
**localStorage Key**: `teleprompter-ui-store` (existing)  
**Persistence**: Full persistence via Zustand persist middleware

**Note**: This store already exists. It will be extended with one new property: `mode`.

#### State Properties (Existing)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `textareaPrefs` | `TextareaPreferences` | Default | Textarea user preferences |
| `footerState` | `FooterState` | Default | Footer collapsed state |
| `previewState` | `PreviewPanelState` | Default | Preview panel open state |
| `shortcutsStats` | `KeyboardShortcutsStats` | Default | Keyboard shortcuts stats |
| `autoSaveStatus` | `AutoSaveStatus` | Default | Auto-save status |
| `errorContext` | `ErrorContext \| null` | `null` | Error context |
| `panelState` | `PanelState` | Default | Config panel visibility |
| `textareaScale` | `TextareaScaleState` | Default | Textarea scale |
| `configFooterState` | `ConfigFooterState` | Default | Config footer state |

#### NEW Property

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `mode` | `'setup' \| 'running'` | `'setup'` | **NEW** App view state - controls Editor vs Runner display |

#### Actions (Existing)

```typescript
interface UIStoreActions {
  // Textarea
  setTextareaPrefs: (prefs: Partial<TextareaPreferences>) => void
  toggleTextareaSize: () => void
  
  // Footer
  setFooterState: (state: Partial<FooterState>) => void
  toggleFooter: () => void
  
  // Preview
  setPreviewState: (state: Partial<PreviewPanelState>) => void
  togglePreview: () => void
  
  // Shortcuts
  incrementSessionsCount: () => void
  recordModalOpened: () => void
  markTipShown: (tip: string) => void
  
  // Auto-save
  setAutoSaveStatus: (status: Partial<AutoSaveStatus>) => void
  
  // Error
  setErrorContext: (error: ErrorContext | null) => void
  clearError: () => void
  
  // Panel
  setPanelVisible: (visible: boolean, isAnimating?: boolean) => void
  togglePanel: () => void
  
  // Textarea scale
  setTextareaSize: (size: 'compact' | 'medium' | 'large') => void
  
  // Config footer
  setConfigFooterVisible: (visible: boolean, height?: number) => void
  toggleConfigFooterCollapsed: () => void
  
  // NEW: Mode
  setMode: (mode: 'setup' | 'running') => void
}
```

#### State Transitions

```
[setup] --setMode('running')--> [running]
[running] --setMode('setup')--> [setup]
```

---

## Relationships

### Store Dependency Graph

```
┌─────────────────┐
│  ContentStore   │
│  - text         │──────┐
│  - bgUrl        │      │
│  - musicUrl     │      │
│  - isReadOnly   │      │
└─────────────────┘      │
                         │
                         │ supplies content
                         ▼
┌─────────────────┐      ┌─────────────────┐
│  ConfigStore    │      │  PlaybackStore  │
│  - typography   │◄─────┤  - isPlaying    │
│  - colors       │      │  - currentTime  │
│  - effects      │      │  - scrollSpeed  │
│  - layout       │      └─────────────────┘
│  - animations   │              │
└─────────────────┘              │
         │                       │
         │ provides styling      │ provides playback state
         ▼                       │
    ┌─────────────────────────────┘
    │
    ▼
┌─────────────────┐
│    UIStore      │
│  - mode         │──► controls which view (Editor vs Runner)
│  - panelState   │──► controls config panel visibility
│  - other UI     │
└─────────────────┘
```

### Component Usage

| Component | ContentStore | ConfigStore | PlaybackStore | UIStore |
|-----------|--------------|-------------|---------------|---------|
| Editor | ✓ (text) | ✓ (styling) | - | ✓ (panel visibility) |
| Runner | ✓ (text, bgUrl, musicUrl) | ✓ (styling) | ✓ (isPlaying) | ✓ (mode) |
| ContentPanel | ✓ | - | - | - |
| PreviewPanel | ✓ | ✓ | - | - |
| TeleprompterText | ✓ (text prop) | ✓ (styling) | - | - |
| QuickSettingsPanel | - | ✓ (read/write) | ✓ (read/write) | - |

---

## State Synchronization

### Mechanism

Zustand's built-in pub/sub via React hooks automatically handles synchronization:

```typescript
// In any component
const { fontSize } = useConfigStore() // Auto-subscribes to changes

// When QuickSettingsPanel updates fontSize:
useConfigStore.getState().setFontSize(60)

// All subscribed components automatically re-render with new value
```

### Performance

- State updates are batched by React
- Only components using the changed state re-render
- No manual polling or event handling needed
- 100ms sync target is easily achievable

---

## Validation Rules

### ContentStore

```typescript
// Text validation
const MAX_TEXT_LENGTH = 1_000_000
if (text.length > MAX_TEXT_LENGTH) throw new Error('Text too long')

// URL validation
const isValidUrl = (url: string) => {
  try { new URL(url); return true }
  catch { return false }
}
```

### ConfigStore

```typescript
// Range validations
const fontSize = Math.max(12, Math.min(120, fontSize))
const letterSpacing = Math.max(-10, Math.min(20, letterSpacing))
const autoScrollSpeed = Math.max(10, Math.min(200, autoScrollSpeed))
```

### PlaybackStore

```typescript
// Non-negative time
if (currentTime < 0) throw new Error('Time cannot be negative')

// Speed range 1-10
const scrollSpeed = Math.max(1, Math.min(10, scrollSpeed))
```

---

## Migration from Legacy Store

### Properties to Remove from useTeleprompterStore

| Legacy Property | Destination Store | New Property Name |
|-----------------|-------------------|-------------------|
| `text` | ContentStore | `text` (same) |
| `bgUrl` | ContentStore | `bgUrl` (same) |
| `musicUrl` | ContentStore | `musicUrl` (same) |
| `isReadOnly` | ContentStore | `isReadOnly` (same) |
| `font` | REMOVED | Use `ConfigStore.typography.fontFamily` |
| `colorIndex` | REMOVED | Use `ConfigStore.colors` |
| `fontSize` | ConfigStore | `typography.fontSize` |
| `align` | ConfigStore | `layout.textAlign` |
| `lineHeight` | ConfigStore | `typography.lineHeight` |
| `margin` | ConfigStore | `layout.horizontalMargin` |
| `overlayOpacity` | ConfigStore | `effects.overlayOpacity` (NEW) |
| `speed` | ConfigStore | `animations.autoScrollSpeed` |
| `mode` | UIStore | `mode` (same) |
| `isPlaying` | PlaybackStore | `isPlaying` (same) |
| `currentTime` | PlaybackStore | `currentTime` (same) |

### No Data Migration Required

Since the app is unpublished with no existing users:
- No localStorage data migration needed
- Start fresh with new store keys
- No backward compatibility layer needed

---

## Testing Strategy

### Unit Tests

- Test store actions with valid inputs
- Test store actions with invalid inputs (validation)
- Test state transitions
- Test derived state calculations

### Integration Tests

- Test component-store interactions
- Test state synchronization between components
- Test QuickSettingsPanel → ConfigStore → Editor propagation
- Test Editor → Runner visual consistency

### Test Migration

- Create mocks for new stores
- Update existing tests to use new stores
- Test that all old useTeleprompterStore references are removed
