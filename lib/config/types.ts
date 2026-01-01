// TypeScript type definitions for UI Configuration System

/**
 * Typography configuration settings
 * Controls font family, size, weight, spacing, and text transformation
 */
export interface TypographyConfig {
  /** Font family name (e.g., 'Arial', 'Roboto') */
  fontFamily: string
  /** Font weight (100-900) */
  fontWeight: number
  /** Font size in pixels */
  fontSize: number
  
  /** Letter spacing in pixels (can be negative for tighter spacing) */
  letterSpacing: number
  /** Line height as a ratio (e.g., 1.5 for 1.5x line height) */
  lineHeight: number
  
  /** Text transformation style */
  textTransform: TextTransform
}

/** Text transformation options */
export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'none'

/**
 * Color configuration settings
 * Controls primary text color, gradients, and effect colors
 */
export interface ColorConfig {
  /** Primary text color (hex or CSS color value) */
  primaryColor: string
  
  /** Whether gradient is enabled */
  gradientEnabled: boolean
  /** Type of gradient to apply */
  gradientType: GradientType
  /** Array of gradient color stops (hex values) */
  gradientColors: string[]
  /** Gradient angle in degrees (0-360) */
  gradientAngle: number
  
  /** Color for text outline effect */
  outlineColor: string
  /** Color for text glow effect */
  glowColor: string
}

/** Gradient type options */
export type GradientType = 'linear' | 'radial'

/**
 * Effect configuration settings
 * Controls text shadow, outline, glow, and backdrop filters
 */
export interface EffectConfig {
  // Text shadow settings
  /** Whether text shadow is enabled */
  shadowEnabled: boolean
  /** Shadow horizontal offset in pixels */
  shadowOffsetX: number
  /** Shadow vertical offset in pixels */
  shadowOffsetY: number
  /** Shadow blur radius in pixels */
  shadowBlur: number
  /** Shadow color */
  shadowColor: string
  /** Shadow opacity (0-1) */
  shadowOpacity: number
  
  // Text outline settings
  /** Whether text outline is enabled */
  outlineEnabled: boolean
  /** Outline width in pixels */
  outlineWidth: number
  /** Outline color */
  outlineColor: string
  
  // Text glow settings
  /** Whether text glow is enabled */
  glowEnabled: boolean
  /** Glow blur radius in pixels */
  glowBlurRadius: number
  /** Glow intensity (0-1) */
  glowIntensity: number
  /** Glow color */
  glowColor: string
  
  // Backdrop filter settings
  /** Whether backdrop filter is enabled */
  backdropFilterEnabled: boolean
  /** Backdrop blur amount in pixels */
  backdropBlur: number
  /** Backdrop brightness adjustment (0-2, 1 is normal) */
  backdropBrightness: number
  /** Backdrop saturation adjustment (0-2, 1 is normal) */
  backdropSaturation: number
}

/** Backdrop filter type options (deprecated, use individual settings) */
export type BackdropFilterType = 'blur' | 'brightness' | 'saturation' | 'none'

/**
 * Layout configuration settings
 * Controls margins, alignment, and multi-column layout
 */
export interface LayoutConfig {
  /** Horizontal margin in pixels */
  horizontalMargin: number
  /** Vertical padding in pixels */
  verticalPadding: number
  
  /** Text alignment */
  textAlign: TextAlign
  
  /** Number of columns for multi-column layout (1-3) */
  columnCount: number
  /** Gap between columns in pixels */
  columnGap: number
  
  /** Width of text area as percentage (0-100) */
  textAreaWidth: number
  /** Position of text area */
  textAreaPosition: Position
}

/** Text alignment options */
export type TextAlign = 'left' | 'center' | 'right' | 'justify'
/** Text area position options */
export type Position = 'left' | 'center' | 'right'

/**
 * Animation configuration settings
 * Controls scrolling, entrance animations, highlighting, and auto-scroll
 */
export interface AnimationConfig {
  // Smooth scroll settings
  /** Whether smooth scrolling is enabled */
  smoothScrollEnabled: boolean
  /** Scroll damping factor (0-1, higher = smoother) */
  scrollDamping: number
  
  // Entrance animation settings
  /** Type of entrance animation */
  entranceAnimation: EntranceAnimation
  /** Duration of entrance animation in milliseconds */
  entranceDuration: number
  
  // Word highlighting settings
  /** Whether word highlighting is enabled */
  wordHighlightEnabled: boolean
  /** Color for highlighted words */
  highlightColor: string
  /** Speed of word highlight animation (words per second) */
  highlightSpeed: number
  
  // Auto-scroll settings
  /** Whether auto-scroll is enabled */
  autoScrollEnabled: boolean
  /** Auto-scroll speed (pixels per second) */
  autoScrollSpeed: number
  /** Auto-scroll acceleration (pixels per second squared) */
  autoScrollAcceleration: number
}

/** Entrance animation options */
export type EntranceAnimation = 'fade-in' | 'slide-up' | 'scale-in' | 'none'

/**
 * Complete configuration snapshot
 * Represents a complete teleprompter configuration state
 */
export interface ConfigSnapshot {
  /** Configuration version for migration support */
  version: string
  /** Typography settings */
  typography: TypographyConfig
  /** Color settings */
  colors: ColorConfig
  /** Effect settings */
  effects: EffectConfig
  /** Layout settings */
  layout: LayoutConfig
  /** Animation settings */
  animations: AnimationConfig
  /** Metadata about the configuration */
  metadata: {
    /** ISO timestamp of creation */
    createdAt: string
    /** ISO timestamp of last update */
    updatedAt: string
    /** Application version string */
    appVersion: string
  }
}

/**
 * Preset configuration
 * User-saved configuration preset
 */
export interface Preset {
  /** Unique preset identifier */
  id: string
  /** User ID who owns this preset */
  userId: string
  /** Preset name */
  name: string
  /** Optional preset description */
  description?: string
  /** Configuration snapshot */
  config: ConfigSnapshot
  /** Optional thumbnail URL */
  thumbnailUrl?: string
  /** Optional collection ID */
  collectionId?: string
  /** Tags for categorization */
  tags: string[]
  /** Whether preset is shared with others */
  isShared: boolean
  /** Sync status with server */
  syncStatus: SyncStatus
  /** Optional ISO timestamp of last sync */
  lastSyncedAt?: string
  /** ISO timestamp of creation */
  createdAt: string
  /** ISO timestamp of last update */
  updatedAt: string
}

/** Sync status options */
export type SyncStatus = 'synced' | 'pending' | 'error'

/**
 * Preset collection
 * Organized group of presets
 */
export interface PresetCollection {
  /** Unique collection identifier */
  id: string
  /** User ID who owns this collection */
  userId: string
  /** Collection name */
  name: string
  /** Optional collection description */
  description?: string
  /** Optional icon name */
  icon?: string
  /** Optional color for UI */
  color?: string
  /** Whether this is a system collection */
  isSystem: boolean
  /** ISO timestamp of creation */
  createdAt: string
}

/**
 * Font library entry
 * Represents a font available in the font library
 */
export interface FontLibraryEntry {
  /** Font family name */
  family: string
  /** Font category */
  category: FontCategory
  /** Available font weights */
  weights: number[]
  /** Preview text for the font */
  previewText: string
  /** File size in bytes */
  fileSize: number
  /** Loading status */
  loadingStatus: LoadingStatus
  /** Whether this is a variable font */
  isVariable: boolean
  /** Google Fonts URL */
  googleFontsUrl: string
}

/** Font category options */
export type FontCategory = 'serif' | 'sans' | 'display' | 'mono' | 'handwriting'
/** Loading status options */
export type LoadingStatus = 'unloaded' | 'loading' | 'loaded' | 'error'

/**
 * Color palette
 * Predefined color palette for quick color selection
 */
export interface ColorPalette {
  /** Unique palette identifier */
  id: string
  /** Palette name */
  name: string
  /** Palette description */
  description: string
  /** Array of color values (hex) */
  colors: string[]
  /** Palette category */
  category: PaletteCategory
  /** Optional preview image URL */
  previewImage?: string
  /** Suggested use case */
  suggestedUse: string
}

/** Palette category options */
export type PaletteCategory = 'broadcast' | 'corporate' | 'creative' | 'high-contrast' | 'minimal'

/**
 * Contrast validation result
 * WCAG contrast ratio validation
 */
export interface ContrastValidation {
  /** Contrast ratio (1-21) */
  ratio: number
  /** Whether it passes WCAG AA standard */
  passesAA: boolean
  /** Whether it passes WCAG AAA standard */
  passesAAA: boolean
  /** WCAG level: 'FAIL', 'AA', or 'AAA' */
  level: 'FAIL' | 'AA' | 'AAA'
}

/**
 * Configuration tab identifier
 * Identifies different configuration tabs in the UI
 */
export type TabId = 'typography' | 'colors' | 'effects' | 'layout' | 'animations' | 'presets' | 'media'

// ============================================================================
// Configuration Panel UI/UX Improvements - Phase 1: Setup Types
// Specification: specs/005-config-panel-improvements/
// ============================================================================

/**
 * T001: PanelState interface
 * Manages the visibility and animation state of the configuration panel
 */
export interface PanelState {
  /** Whether the panel is currently visible */
  visible: boolean
  /** Whether the panel is currently being animated */
  isAnimating: boolean
  /** Timestamp of the last toggle action (null if never toggled) */
  lastToggled: number | null
}

/**
 * T002: HistoryEntry interface
 * T055: [US4] Updated to use config store types instead of TeleprompterConfig
 * Represents a single entry in the configuration undo/redo history
 */
export interface HistoryEntry {
  /** Timestamp when this configuration state was recorded */
  timestamp: number
  /** The partial configuration state stored in this history entry */
  config: Partial<{
    typography: TypographyConfig
    colors: ColorConfig
    effects: EffectConfig
    layout: LayoutConfig
    animations: AnimationConfig
  }>
  /** Description of the action that created this history entry */
  action: string
}

/**
 * T003: HistoryStack interface
 * Manages the undo/redo history stack for configuration changes
 */
export interface HistoryStack {
  /** Array of past configuration states (for undo) */
  past: HistoryEntry[]
  /** Array of future configuration states (for redo) */
  future: HistoryEntry[]
  /** Maximum number of history entries to retain */
  maxSize: number
}

/**
 * T004: TextareaScaleState interface
 * Manages the scale level and multiplier for the editor textarea
 */
export interface TextareaScaleState {
  /** Current size level of the textarea */
  size: 'compact' | 'medium' | 'large'
  /** Scale multiplier applied to the textarea base size */
  scale: number
}

/**
 * T005: FooterState interface
 * Manages the visibility and layout state of the configuration panel footer
 */
export interface FooterState {
  /** Whether the footer is currently visible */
  visible: boolean
  /** Whether the footer is in collapsed state */
  collapsed: boolean
  /** Current height of the footer in pixels */
  height: number
}

/**
 * T006: Scale multipliers constant
 * Maps textarea size levels to their corresponding scale multipliers
 */
export const TEXTAREA_SCALE_MULTIPLIERS: Record<'compact' | 'medium' | 'large', number> = {
  compact: 1,
  medium: 1.1,
  large: 1.2,
} as const
