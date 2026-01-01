# API Contracts: Unified State Architecture

**Feature**: 007-unified-state-architecture  
**Date**: 2026-01-01  
**Status**: Complete

## Overview

This document defines the API contracts for the four Zustand stores in the unified state architecture. These contracts specify the public interface for each store, including state properties, actions, and their expected behavior.

## Contract Notation

- **State**: Immutable state properties
- **Actions**: Functions that modify state
- **Selectors**: Derived state (computed values)
- **Events**: Side effects or notifications

---

## 1. ContentStore Contract

```typescript
/**
 * ContentStore - Manages content data and editor mutability state
 * 
 * Responsibilities:
 * - Store and manage teleprompter text content
 * - Store and manage media URLs (background image, background music)
 * - Track editor read-only state
 * 
 * Persistence: localStorage key 'teleprompter-content'
 */
interface ContentStoreContract {
  // ============================================================
  // STATE
  // ============================================================
  
  /**
   * The teleprompter script text content
   * @default 'Chào mừng! Hãy nhập nội dung của bạn vào đây...'
   * @validation maxLength: 1,000,000 characters
   */
  text: string
  
  /**
   * Background image URL displayed in Runner mode
   * @default Unsplash image URL
   * @validation Must be valid URL string
   */
  bgUrl: string
  
  /**
   * Background music URL for audio playback in Runner mode
   * @default '' (empty)
   * @validation Must be valid URL string or empty
   */
  musicUrl: string
  
  /**
   * Whether the editor is in read-only mode
   * When true, user cannot edit text or change media
   * @default false
   */
  isReadOnly: boolean
  
  // ============================================================
  // ACTIONS
  // ============================================================
  
  /**
   * Set the teleprompter text content
   * @param text - New text content (max 1,000,000 chars)
   * @throws Error if text exceeds max length
   */
  setText: (text: string) => void
  
  /**
   * Set the background image URL
   * @param url - Valid URL string
   * @throws Error if URL is invalid
   */
  setBgUrl: (url: string) => void
  
  /**
   * Set the background music URL
   * @param url - Valid URL string or empty string
   * @throws Error if URL is invalid
   */
  setMusicUrl: (url: string) => void
  
  /**
   * Set the editor read-only state
   * @param readOnly - Whether editor should be read-only
   */
  setIsReadOnly: (readOnly: boolean) => void
  
  /**
   * Bulk update multiple state properties at once
   * Used when loading from templates or saved scripts
   * @param state - Partial state object with properties to update
   */
  setAll: (state: Partial<ContentStoreState>) => void
  
  /**
   * Reset all state to default values
   */
  reset: () => void
  
  /**
   * Reset only content properties (text, bgUrl, musicUrl)
   * Preserves isReadOnly state
   */
  resetContent: () => void
  
  /**
   * Reset only media properties (bgUrl, musicUrl)
   * Preserves text and isReadOnly state
   */
  resetMedia: () => void
  
  // ============================================================
  // SELECTORS (Derived State)
  // ============================================================
  
  /**
   * Whether text content exists
   * @returns true if text.length > 0
   */
  hasContent: boolean
  
  /**
   * Whether background image is set
   * @returns true if bgUrl.length > 0
   */
  hasBackground: boolean
  
  /**
   * Whether background music is set
   * @returns true if musicUrl.length > 0
   */
  hasMusic: boolean
}

type ContentStoreState = Pick<ContentStoreContract, 
  'text' | 'bgUrl' | 'musicUrl' | 'isReadOnly'
>
```

---

## 2. ConfigStore Contract (Extended)

```typescript
/**
 * ConfigStore - Manages ALL visual styling configuration
 * 
 * Responsibilities:
 * - Store typography settings (font, size, weight, spacing)
 * - Store color settings (primary, gradients, outline, glow)
 * - Store visual effects (shadow, outline, glow, backdrop)
 * - Store layout settings (alignment, margins, columns)
 * - Store animation settings (scroll behavior, entrance effects)
 * - Manage undo/redo history for configuration changes
 * 
 * Persistence: localStorage key 'teleprompter-config' (existing)
 */
interface ConfigStoreContract {
  // ============================================================
  // STATE - Typography
  // ============================================================
  
  typography: {
    /**
     * CSS font family name (real font name, not enum)
     * @default 'Inter'
     * @range Any valid CSS font family
     */
    fontFamily: string
    
    /**
     * CSS font weight
     * @default 400
     * @range 100-900
     */
    fontWeight: number
    
    /**
     * Font size in pixels
     * @default 48
     * @range 12-120
     */
    fontSize: number
    
    /**
     * Letter spacing in pixels
     * @default 0
     * @range -10 to 20
     */
    letterSpacing: number
    
    /**
     * Line height as ratio
     * @default 1.5
     * @range 1.0 to 3.0
     */
    lineHeight: number
    
    /**
     * CSS text transform
     * @default 'none'
     * @range 'none' | 'uppercase' | 'lowercase' | 'capitalize'
     */
    textTransform: string
  }
  
  // ============================================================
  // STATE - Colors
  // ============================================================
  
  colors: {
    /**
     * Primary text color (hex format)
     * @default '#ffffff'
     */
    primaryColor: string
    
    /**
     * Whether gradient text is enabled
     * @default false
     */
    gradientEnabled: boolean
    
    /**
     * Gradient type
     * @default 'linear'
     */
    gradientType: 'linear' | 'radial'
    
    /**
     * Array of gradient color stops (hex format)
     * @default ['#ffffff', '#fbbf24']
     */
    gradientColors: string[]
    
    /**
     * Gradient angle in degrees (for linear gradients)
     * @default 90
     * @range 0-360
     */
    gradientAngle: number
    
    /**
     * Text outline color (hex format)
     * @default '#000000'
     */
    outlineColor: string
    
    /**
     * Text glow color (hex format)
     * @default '#ffffff'
     */
    glowColor: string
  }
  
  // ============================================================
  // STATE - Effects
  // ============================================================
  
  effects: {
    /**
     * Whether text shadow is enabled
     * @default false
     */
    shadowEnabled: boolean
    
    /**
     * Shadow X offset in pixels
     * @default 2
     */
    shadowOffsetX: number
    
    /**
     * Shadow Y offset in pixels
     * @default 2
     */
    shadowOffsetY: number
    
    /**
     * Shadow blur radius in pixels
     * @default 4
     */
    shadowBlur: number
    
    /**
     * Shadow color (hex format)
     * @default '#000000'
     */
    shadowColor: string
    
    /**
     * Shadow opacity
     * @default 0.5
     * @range 0.0-1.0
     */
    shadowOpacity: number
    
    /**
     * Whether text outline is enabled
     * @default false
     */
    outlineEnabled: boolean
    
    /**
     * Outline width in pixels
     * @default 2
     */
    outlineWidth: number
    
    /**
     * Outline color (hex format)
     * @default '#000000'
     */
    outlineColor: string
    
    /**
     * Whether text glow is enabled
     * @default false
     */
    glowEnabled: boolean
    
    /**
     * Glow blur radius in pixels
     * @default 10
     */
    glowBlurRadius: number
    
    /**
     * Glow intensity
     * @default 0.5
     * @range 0.0-1.0
     */
    glowIntensity: number
    
    /**
     * Glow color (hex format)
     * @default '#ffffff'
     */
    glowColor: string
    
    /**
     * Whether backdrop filter is enabled
     * @default false
     */
    backdropFilterEnabled: boolean
    
    /**
     * Backdrop blur in pixels
     * @default 0
     */
    backdropBlur: number
    
    /**
     * Backdrop brightness percentage
     * @default 100
     */
    backdropBrightness: number
    
    /**
     * Backdrop saturation percentage
     * @default 100
     */
    backdropSaturation: number
    
    /**
     * Background overlay opacity (NEW in 007)
     * Controls the darkness of the background overlay in Runner
     * @default 0.5
     * @range 0.0-1.0
     */
    overlayOpacity: number
  }
  
  // ============================================================
  // STATE - Layout
  // ============================================================
  
  layout: {
    /**
     * Horizontal margin in pixels
     * @default 0
     */
    horizontalMargin: number
    
    /**
     * Vertical padding in pixels
     * @default 0
     */
    verticalPadding: number
    
    /**
     * Text alignment
     * @default 'center'
     */
    textAlign: 'left' | 'center' | 'right' | 'justify'
    
    /**
     * Number of text columns
     * @default 1
     * @range 1-3
     */
    columnCount: number
    
    /**
     * Column gap in pixels
     * @default 20
     */
    columnGap: number
    
    /**
     * Text area width as percentage
     * @default 100
     * @range 10-100
     */
    textAreaWidth: number
    
    /**
     * Text area horizontal position
     * @default 'center'
     */
    textAreaPosition: 'left' | 'center' | 'right'
  }
  
  // ============================================================
  // STATE - Animations
  // ============================================================
  
  animations: {
    /**
     * Whether smooth scrolling is enabled
     * @default true
     */
    smoothScrollEnabled: boolean
    
    /**
     * Scroll damping factor
     * @default 0.5
     * @range 0.0-1.0
     */
    scrollDamping: number
    
    /**
     * Entrance animation type
     * @default 'fade-in'
     */
    entranceAnimation: string
    
    /**
     * Entrance animation duration in milliseconds
     * @default 500
     */
    entranceDuration: number
    
    /**
     * Whether word highlight is enabled
     * @default false
     */
    wordHighlightEnabled: boolean
    
    /**
     * Highlight color (hex format)
     * @default '#fbbf24'
     */
    highlightColor: string
    
    /**
     * Highlight speed in milliseconds
     * @default 200
     */
    highlightSpeed: number
    
    /**
     * Whether auto-scroll is enabled
     * @default false
     */
    autoScrollEnabled: boolean
    
    /**
     * Auto-scroll speed in pixels per second
     * This is a QUICK SETTING adjustable in Runner
     * @default 50
     * @range 10-200
     */
    autoScrollSpeed: number
    
    /**
     * Auto-scroll acceleration
     * @default 0
     */
    autoScrollAcceleration: number
  }
  
  // ============================================================
  // STATE - UI (Config Panel)
  // ============================================================
  
  /**
   * Currently active configuration tab
   * @default 'typography'
   */
  activeTab: TabId
  
  /**
   * Whether the configuration panel is open
   * @default false
   */
  isPanelOpen: boolean
  
  // ============================================================
  // STATE - History (Undo/Redo)
  // ============================================================
  
  /**
   * History stack for undo/redo
   */
  historyStack: HistoryStack
  
  /**
   * Current position in history stack
   * @default -1 (no history)
   */
  currentHistoryIndex: number
  
  /**
   * Whether currently performing an undo operation
   * @internal
   */
  isUndoing: boolean
  
  /**
   * Whether currently performing a redo operation
   * @internal
   */
  isRedoing: boolean
  
  /**
   * Whether currently recording history (prevents history entries during bulk updates)
   * @internal
   */
  isRecording: boolean
  
  // ============================================================
  // ACTIONS - Configuration Setters
  // ============================================================
  
  /**
   * Update typography configuration
   * Automatically records to history
   */
  setTypography: (config: Partial<TypographyConfig>) => void
  
  /**
   * Update color configuration
   * Automatically records to history
   */
  setColors: (config: Partial<ColorConfig>) => void
  
  /**
   * Update effects configuration
   * Automatically records to history
   */
  setEffects: (config: Partial<EffectConfig>) => void
  
  /**
   * Update layout configuration
   * Automatically records to history
   */
  setLayout: (config: Partial<LayoutConfig>) => void
  
  /**
   * Update animation configuration
   * Automatically records to history
   */
  setAnimations: (config: Partial<AnimationConfig>) => void
  
  // ============================================================
  // ACTIONS - Debounced Setters (50ms window)
  // ============================================================
  
  /**
   * Debounced typography update for batch operations
   * Records as continuous change (single history entry)
   */
  setTypographyDebounced: (config: Partial<TypographyConfig>) => void
  
  /**
   * Debounced color update for batch operations
   * Records as continuous change (single history entry)
   */
  setColorsDebounced: (config: Partial<ColorConfig>) => void
  
  /**
   * Debounced effects update for batch operations
   * Records as continuous change (single history entry)
   */
  setEffectsDebounced: (config: Partial<EffectConfig>) => void
  
  /**
   * Debounced layout update for batch operations
   * Records as continuous change (single history entry)
   */
  setLayoutDebounced: (config: Partial<LayoutConfig>) => void
  
  /**
   * Debounced animation update for batch operations
   * Records as continuous change (single history entry)
   */
  setAnimationsDebounced: (config: Partial<AnimationConfig>) => void
  
  // ============================================================
  // ACTIONS - UI State
  // ============================================================
  
  /**
   * Set the active configuration tab
   */
  setActiveTab: (tab: TabId) => void
  
  /**
   * Toggle configuration panel visibility
   * Debounced by 150ms to prevent animation glitches
   */
  togglePanel: () => void
  
  // ============================================================
  // ACTIONS - Bulk Update
  // ============================================================
  
  /**
   * Set all configuration at once
   * Used when loading from presets, templates, or saved scripts
   * Clears history and prevents recording during load
   */
  setAll: (config: ConfigSnapshot) => void
  
  // ============================================================
  // ACTIONS - History Management
  // ============================================================
  
  /**
   * Push a history entry to the stack
   * @internal Automatically called by setters
   */
  pushHistoryEntry: (entry: HistoryEntry) => void
  
  /**
   * Clear all history
   */
  clearHistory: () => void
  
  /**
   * Get the current history entry
   */
  getCurrentHistoryEntry: () => HistoryEntry | null
  
  /**
   * Reset history (clear stack and index)
   * Called when loading presets/templates/scripts
   */
  resetHistory: () => void
  
  /**
   * Perform undo operation
   * Restores previous configuration from history
   */
  performUndo: () => void
  
  /**
   * Perform redo operation
   * Restores next configuration from history
   */
  performRedo: () => void
  
  /**
   * Check if undo is possible
   */
  canUndoHistory: () => boolean
  
  /**
   * Check if redo is possible
   */
  canRedoHistory: () => boolean
  
  /**
   * Record a discrete change (immediate history entry)
   * @internal Automatically called by setters
   */
  recordDiscreteChange: (action: string, config: HistoryConfig) => void
  
  /**
   * Record a continuous change (batched, 50ms debounce)
   * @internal Automatically called by debounced setters
   */
  recordContinuousChange: (action: string, config: HistoryConfig) => void
  
  // ============================================================
  // ACTIONS - Reset
  // ============================================================
  
  /**
   * Reset typography to defaults
   */
  resetTypography: () => void
  
  /**
   * Reset colors to defaults
   */
  resetColors: () => void
  
  /**
   * Reset effects to defaults
   */
  resetEffects: () => void
  
  /**
   * Reset layout to defaults
   */
  resetLayout: () => void
  
  /**
   * Reset animations to defaults
   */
  resetAnimations: () => void
  
  /**
   * Reset all configuration to defaults
   */
  resetAll: () => void
}

type ConfigSnapshot = {
  version: string
  typography: TypographyConfig
  colors: ColorConfig
  effects: EffectConfig
  layout: LayoutConfig
  animations: AnimationConfig
  metadata: {
    createdAt: string
    updatedAt: string
    appVersion: string
  }
}

type HistoryEntry = {
  timestamp: number
  config: HistoryConfig
  action: string
}

type HistoryConfig = {
  typography?: TypographyConfig
  colors?: ColorConfig
  effects?: EffectConfig
  layout?: LayoutConfig
  animations?: AnimationConfig
}

type HistoryStack = {
  past: HistoryEntry[]
  future: HistoryEntry[]
  maxSize: number
}

type TabId = 'typography' | 'colors' | 'effects' | 'layout' | 'animations' | 'media'
```

---

## 3. PlaybackStore Contract

```typescript
/**
 * PlaybackStore - Manages runtime playback state
 * 
 * Responsibilities:
 * - Track whether teleprompter is currently scrolling
 * - Track current playback position (time)
 * - Track current scroll velocity (runtime speed)
 * 
 * Persistence: None (runtime-only state, no localStorage)
 * State resets on page refresh
 */
interface PlaybackStoreContract {
  // ============================================================
  // STATE
  // ============================================================
  
  /**
   * Whether teleprompter is currently scrolling/playing
   * @default false
   */
  isPlaying: boolean
  
  /**
   * Current playback position in seconds
   * @default 0
   * @range >= 0
   */
  currentTime: number
  
  /**
   * Current runtime scroll velocity multiplier
   * This is separate from config.autoScrollSpeed
   * config.autoScrollSpeed defines the target speed
   * scrollSpeed tracks the actual current velocity
   * @default 1
   * @range 1-10
   */
  scrollSpeed: number
  
  // ============================================================
  // ACTIONS
  // ============================================================
  
  /**
   * Set the playing state
   * @param playing - Whether to start or stop scrolling
   */
  setIsPlaying: (playing: boolean) => void
  
  /**
   * Toggle the playing state
   * If playing, pauses. If paused, starts playing.
   */
  togglePlaying: () => void
  
  /**
   * Set the current playback time
   * @param time - Time in seconds (must be >= 0)
   * @throws Error if time < 0
   */
  setCurrentTime: (time: number) => void
  
  /**
   * Advance the current time by a delta
   * @param delta - Time to advance in seconds
   */
  advanceTime: (delta: number) => void
  
  /**
   * Set the current scroll speed
   * @param speed - Speed multiplier (1-10)
   * @throws Error if speed < 1 or > 10
   */
  setScrollSpeed: (speed: number) => void
  
  /**
   * Reset all playback state to defaults
   * Stops playback and resets time to 0
   */
  reset: () => void
  
  // ============================================================
  // SELECTORS (Derived State)
  // ============================================================
  
  /**
   * Whether playback is currently paused
   * @returns !isPlaying
   */
  isPaused: boolean
  
  /**
   * Whether playback has ever started
   * @returns currentTime > 0
   */
  hasStarted: boolean
}

type PlaybackStoreState = Pick<PlaybackStoreContract,
  'isPlaying' | 'currentTime' | 'scrollSpeed'
>
```

---

## 4. UIStore Contract (Extended)

```typescript
/**
 * UIStore - Manages UI navigation and visibility state
 * 
 * Responsibilities:
 * - Track app view mode (Editor vs Runner)
 * - Track configuration panel visibility
 * - Track textarea preferences
 * - Track footer and preview panel states
 * - Track keyboard shortcuts statistics
 * - Track auto-save status
 * - Track error context
 * 
 * Persistence: localStorage key 'teleprompter-ui-store' (existing)
 */
interface UIStoreContract {
  // ============================================================
  // STATE - App View Mode (NEW in 007)
  // ============================================================
  
  /**
   * App view state - controls which view is displayed
   * 'setup' = Editor mode (configuration interface)
   * 'running' = Runner mode (teleprompter display)
   * @default 'setup'
   */
  mode: 'setup' | 'running'
  
  // ============================================================
  // STATE - Textarea Preferences
  // ============================================================
  
  textareaPrefs: {
    /**
     * Textarea size preset
     * @default 'default'
     */
    size: 'default' | 'medium' | 'large' | 'fullscreen' | 'custom'
    
    /**
     * Custom height when size is 'custom'
     */
    customHeight?: number
    
    /**
     * Whether textarea is in fullscreen mode
     * @default false
     */
    isFullscreen: boolean
  }
  
  // ============================================================
  // STATE - Footer State
  // ============================================================
  
  footerState: {
    /**
     * Whether footer is collapsed
     * @default false
     */
    isCollapsed: boolean
    
    /**
     * Timestamp when footer was collapsed
     */
    collapsedSince?: number
  }
  
  // ============================================================
  // STATE - Preview Panel State
  // ============================================================
  
  previewState: {
    /**
     * Whether preview panel is open
     * @default false
     */
    isOpen: boolean
    
    /**
     * Timestamp when preview panel was last toggled
     */
    lastToggledAt?: number
  }
  
  // ============================================================
  // STATE - Keyboard Shortcuts Statistics
  // ============================================================
  
  shortcutsStats: {
    /**
     * Number of keyboard shortcut sessions
     * @default 0
     */
    sessionsCount: number
    
    /**
     * Number of times shortcuts modal was opened
     * @default 0
     */
    modalOpenedCount: number
    
    /**
     * List of tips that have been shown
     * @default []
     */
    tipsShown: string[]
    
    /**
     * Timestamp of last session
     */
    lastSessionAt?: number
  }
  
  // ============================================================
  // STATE - Auto-save Status
  // ============================================================
  
  autoSaveStatus: {
    /**
     * Current auto-save status
     * @default 'idle'
     */
    status: 'idle' | 'saving' | 'saved' | 'error'
    
    /**
     * Timestamp of last successful save
     */
    lastSavedAt?: number
    
    /**
     * Error message if status is 'error'
     */
    errorMessage?: string
    
    /**
     * Number of retry attempts
     */
    retryCount?: number
  }
  
  // ============================================================
  // STATE - Error Context
  // ============================================================
  
  /**
   * Current error context (if any)
   * @default null
   */
  errorContext: {
    /**
     * Error type category
     */
    type: 'network' | 'not_found' | 'permission' | 'quota' | 'unknown'
    
    /**
     * Human-readable error message
     */
    message: string
    
    /**
     * Additional error details
     */
    details?: string
    
    /**
     * Error timestamp
     */
    timestamp: number
    
    /**
     * Suggested user action
     */
    action?: 'retry' | 'browse_templates' | 'sign_up' | 'copy_error' | 'none'
  } | null
  
  // ============================================================
  // STATE - Configuration Panel
  // ============================================================
  
  panelState: {
    /**
     * Whether configuration panel is visible
     * @default false
     */
    visible: boolean
    
    /**
     * Whether panel is currently animating
     * @internal
     */
    isAnimating: boolean
    
    /**
     * Timestamp of last toggle
     */
    lastToggled: number | null
  }
  
  // ============================================================
  // STATE - Textarea Scale
  // ============================================================
  
  textareaScale: {
    /**
     * Textarea size preset
     * @default 'medium'
     */
    size: 'compact' | 'medium' | 'large'
    
    /**
     * Scale multiplier for textarea
     */
    scale: number
  }
  
  // ============================================================
  // STATE - Config Footer
  // ============================================================
  
  configFooterState: {
    /**
     * Whether config footer is visible
     * @default true
     */
    visible: boolean
    
    /**
     * Whether config footer is collapsed
     * @default false
     */
    collapsed: boolean
    
    /**
     * Config footer height in pixels
     * @default 60
     */
    height: number
  }
  
  // ============================================================
  // ACTIONS - Textarea
  // ============================================================
  
  /**
   * Update textarea preferences
   */
  setTextareaPrefs: (prefs: Partial<TextareaPreferences>) => void
  
  /**
   * Cycle through textarea size presets
   * Order: default -> medium -> large -> fullscreen -> default
   */
  toggleTextareaSize: () => void
  
  // ============================================================
  // ACTIONS - Footer
  // ============================================================
  
  /**
   * Update footer state
   */
  setFooterState: (state: Partial<FooterState>) => void
  
  /**
   * Toggle footer collapsed state
   */
  toggleFooter: () => void
  
  // ============================================================
  // ACTIONS - Preview Panel
  // ============================================================
  
  /**
   * Update preview panel state
   */
  setPreviewState: (state: Partial<PreviewPanelState>) => void
  
  /**
   * Toggle preview panel visibility
   */
  togglePreview: () => void
  
  // ============================================================
  // ACTIONS - Keyboard Shortcuts
  // ============================================================
  
  /**
   * Increment keyboard shortcuts session count
   */
  incrementSessionsCount: () => void
  
  /**
   * Record that shortcuts modal was opened
   */
  recordModalOpened: () => void
  
  /**
   * Mark a tip as shown
   */
  markTipShown: (tip: string) => void
  
  // ============================================================
  // ACTIONS - Auto-save
  // ============================================================
  
  /**
   * Update auto-save status
   */
  setAutoSaveStatus: (status: Partial<AutoSaveStatus>) => void
  
  // ============================================================
  // ACTIONS - Error Context
  // ============================================================
  
  /**
   * Set error context
   */
  setErrorContext: (error: ErrorContext | null) => void
  
  /**
   * Clear error context
   */
  clearError: () => void
  
  // ============================================================
  // ACTIONS - Panel Visibility
  // ============================================================
  
  /**
   * Set panel visibility with optional animation flag
   */
  setPanelVisible: (visible: boolean, isAnimating?: boolean) => void
  
  /**
   * Toggle panel visibility
   * Debounced by 150ms to prevent animation glitches
   */
  togglePanel: () => void
  
  // ============================================================
  // ACTIONS - Textarea Scale
  // ============================================================
  
  /**
   * Set textarea size preset
   */
  setTextareaSize: (size: 'compact' | 'medium' | 'large') => void
  
  // ============================================================
  // ACTIONS - Config Footer
  // ============================================================
  
  /**
   * Set config footer visibility
   */
  setConfigFooterVisible: (visible: boolean, height?: number) => void
  
  /**
   * Toggle config footer collapsed state
   */
  toggleConfigFooterCollapsed: () => void
  
  // ============================================================
  // ACTIONS - Mode (NEW in 007)
  // ============================================================
  
  /**
   * Set app view mode
   * @param mode - 'setup' for Editor, 'running' for Runner
   */
  setMode: (mode: 'setup' | 'running') => void
}

// Type aliases for state groups
type TextareaPreferences = Pick<UIStoreContract['textareaPrefs'], 
  'size' | 'customHeight' | 'isFullscreen'
>

type FooterState = Pick<UIStoreContract['footerState'],
  'isCollapsed' | 'collapsedSince'
>

type PreviewPanelState = Pick<UIStoreContract['previewState'],
  'isOpen' | 'lastToggledAt'
>

type KeyboardShortcutsStats = UIStoreContract['shortcutsStats']

type AutoSaveStatus = UIStoreContract['autoSaveStatus']

type ErrorContext = NonNullable<UIStoreContract['errorContext']>
```

---

## 5. QuickSettingsPanel Contract (New Component)

```typescript
/**
 * QuickSettingsPanel - Collapsible floating panel in Runner mode
 * 
 * Responsibilities:
 * - Provide quick access to 4 common settings in Runner
 * - Update ConfigStore for styling settings
 * - Update ContentStore for background setting
 * - Show visual indication of modified settings
 * - Handle errors gracefully with toast notifications
 * 
 * Settings exposed (Quick Settings):
 * 1. Scroll speed (ConfigStore.animations.autoScrollSpeed)
 * 2. Font size (ConfigStore.typography.fontSize)
 * 3. Alignment (ConfigStore.layout.textAlign)
 * 4. Background (ContentStore.bgUrl)
 */
interface QuickSettingsPanelContract {
  // ============================================================
  // STATE (Component-local)
  // ============================================================
  
  /**
   * Whether the panel is currently open
   * @default false (collapsed)
   */
  isOpen: boolean
  
  /**
   * Which setting tab is active (if multi-tab design)
   * Not needed if all 4 settings are visible at once
   */
  activeTab?: 'scroll' | 'typography' | 'layout' | 'media'
  
  /**
   * Track which settings were modified via Quick Settings
   * Used to show visual indication in Editor
   * Map of setting path to boolean
   * @default {}
   */
  modifiedSettings: {
    'animations.autoScrollSpeed'?: boolean
    'typography.fontSize'?: boolean
    'layout.textAlign'?: boolean
    'content.bgUrl'?: boolean
  }
  
  // ============================================================
  // ACTIONS (Component-local)
  // ============================================================
  
  /**
   * Toggle panel open/closed
   */
  togglePanel: () => void
  
  /**
   * Update scroll speed via Quick Settings
   * @param speed - New scroll speed in px/sec (10-200)
   * @throws Error if validation fails
   */
  updateScrollSpeed: (speed: number) => void
  
  /**
   * Update font size via Quick Settings
   * @param size - New font size in pixels (12-120)
   * @throws Error if validation fails
   */
  updateFontSize: (size: number) => void
  
  /**
   * Update text alignment via Quick Settings
   * @param align - New text alignment
   * @throws Error if validation fails
   */
  updateAlignment: (align: 'left' | 'center' | 'right') => void
  
  /**
   * Update background image via Quick Settings
   * @param url - New background image URL
   * @throws Error if URL is invalid
   */
  updateBackground: (url: string) => void
  
  /**
   * Clear modification indicator for a specific setting
   * Called when user manually changes that setting in Editor
   * @param settingPath - Path of setting to clear (e.g., 'typography.fontSize')
   */
  clearModification: (settingPath: string) => void
}

// Error handling contract
interface QuickSettingsError {
  type: 'validation' | 'storage' | 'unknown'
  message: string
  originalError?: Error
}

// When an error occurs:
// 1. Show toast notification using Sonner
// 2. Revert UI control to last valid state
// 3. Log error for debugging
```

---

## Event Contracts

### State Change Events

All stores use Zustand's built-in pub/sub mechanism:

```typescript
// Subscribe to state changes
const unsubscribe = useConfigStore.subscribe(
  (state) => state.typography.fontSize,
  (fontSize) => {
    console.log('Font size changed to:', fontSize)
  }
)

// Unsubscribe when done
unsubscribe()
```

### Visual Indication Events

When settings are modified via Quick Settings:

```typescript
// Event: QuickSettings modification
interface QuickSettingsModifiedEvent {
  settingPath: string  // e.g., 'typography.fontSize'
  timestamp: number
  source: 'runner-quick-settings'
}

// Event: Clear modification indicator
interface ClearModificationEvent {
  settingPath: string
  timestamp: number
  source: 'editor-manual-change'
}
```

---

## Validation Contracts

### ContentStore Validation

```typescript
interface ContentStoreValidation {
  setText: {
    maxLength: 1_000_000
    error: 'Text exceeds maximum length of 1,000,000 characters'
  }
  setBgUrl: {
    pattern: /^https?:\/\/.+/  // Valid HTTP/HTTPS URL
    error: 'Invalid background URL'
  }
  setMusicUrl: {
    pattern: /^https?:\/\/.+|^$/  // Valid URL or empty
    error: 'Invalid music URL'
  }
}
```

### ConfigStore Validation

```typescript
interface ConfigStoreValidation {
  typography: {
    fontSize: { min: 12, max: 120 }
    fontWeight: { min: 100, max: 900, step: 100 }
    letterSpacing: { min: -10, max: 20 }
    lineHeight: { min: 1.0, max: 3.0 }
  }
  animations: {
    autoScrollSpeed: { min: 10, max: 200 }
    entranceDuration: { min: 0, max: 5000 }
  }
  colors: {
    gradientAngle: { min: 0, max: 360 }
    gradientColors: { minItems: 2, maxItems: 5 }
  }
  effects: {
    overlayOpacity: { min: 0.0, max: 1.0 }
  }
  layout: {
    columnCount: { min: 1, max: 3 }
    textAreaWidth: { min: 10, max: 100 }
  }
}
```

### PlaybackStore Validation

```typescript
interface PlaybackStoreValidation {
  setCurrentTime: {
    min: 0
    error: 'Time cannot be negative'
  }
  setScrollSpeed: {
    min: 1
    max: 10
    error: 'Scroll speed must be between 1 and 10'
  }
}
```

---

## Synchronization Contract

### State Propagation Timing

```
[QuickSettingsPanel] --update--> [ConfigStore/ContentStore]
                                          |
                                          | Zustand pub/sub
                                          | (< 100ms target)
                                          v
                                    [Editor Components]
                                    [PreviewPanel]
                                    [TeleprompterText]
```

### Visual Consistency Guarantee

```typescript
// Contract: When a setting changes in QuickSettings, it MUST be visible
// in Editor's PreviewPanel within 100ms

// Test:
const startTime = Date.now()
QuickSettingsPanel.updateFontSize(60)
// Wait for re-render...
const endTime = Date.now()
assert(endTime - startTime < 100, 'Visual consistency timing violated')
```

---

## Testing Contracts

### Unit Test Contracts

Each store action MUST have tests for:

1. **Valid inputs**: State updates correctly
2. **Invalid inputs**: Throws appropriate error or clamps to valid range
3. **State transitions**: State changes as expected
4. **Persistence**: State survives localStorage round-trip (for persisted stores)

### Integration Test Contracts

Each component-store interaction MUST have tests for:

1. **State consumption**: Component renders correct state
2. **State updates**: Component actions update store correctly
3. **State synchronization**: Multiple components see same state
4. **Error handling**: Component handles store errors gracefully

### Visual Consistency Test Contracts

```
Scenario: User changes font size in Editor to 60px
Given: Editor is open with default font size 48px
When: User changes font size to 60px in ConfigPanel
Then: PreviewPanel text displays at 60px
And: User switches to Runner mode
And: Runner text displays at 60px
And: Visual appearance is 100% identical

Scenario: User changes font size in Runner Quick Settings
Given: Runner is active with default font size 48px
When: User changes font size to 60px in QuickSettingsPanel
Then: Runner text displays at 60px immediately
And: User switches to Editor mode
And: Editor shows font size 60px in ConfigPanel
And: Editor shows modification indicator on font size control
And: PreviewPanel text displays at 60px
```
