// TypeScript type definitions for UI Configuration System

export interface TypographyConfig {
  // Font selection
  fontFamily: string
  fontWeight: number
  fontSize: number
  
  // Spacing
  letterSpacing: number
  lineHeight: number
  
  // Text transform
  textTransform: TextTransform
}

export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'none'

export interface ColorConfig {
  // Primary text color
  primaryColor: string
  
  // Gradient configuration
  gradientEnabled: boolean
  gradientType: GradientType
  gradientColors: string[]
  gradientAngle: number
  
  // Effect colors
  outlineColor: string
  glowColor: string
}

export type GradientType = 'linear' | 'radial'

export interface EffectConfig {
  // Text shadow
  shadowEnabled: boolean
  shadowOffsetX: number
  shadowOffsetY: number
  shadowBlur: number
  shadowColor: string
  shadowOpacity: number
  
  // Text outline
  outlineEnabled: boolean
  outlineWidth: number
  outlineColor: string
  
  // Text glow
  glowEnabled: boolean
  glowBlurRadius: number
  glowIntensity: number
  glowColor: string
}

export interface LayoutConfig {
  // Margins and padding
  horizontalMargin: number
  verticalPadding: number
  
  // Alignment
  textAlign: TextAlign
  
  // Multi-column layout
  columnCount: number
  columnGap: number
  
  // Text area
  textAreaWidth: number
  textAreaPosition: Position
}

export type TextAlign = 'left' | 'center' | 'right' | 'justify'
export type Position = 'left' | 'center' | 'right'

export interface AnimationConfig {
  // Smooth scroll
  smoothScrollEnabled: boolean
  scrollDamping: number
  
  // Entrance animation
  entranceAnimation: EntranceAnimation
  entranceDuration: number
  
  // Word highlighting
  wordHighlightEnabled: boolean
  highlightColor: string
  highlightSpeed: number
  
  // Auto-scroll
  autoScrollEnabled: boolean
  autoScrollSpeed: number
  autoScrollAcceleration: number
}

export type EntranceAnimation = 'fade-in' | 'slide-up' | 'scale-in' | 'none'

export interface ConfigSnapshot {
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

export interface Preset {
  id: string
  userId: string
  name: string
  description?: string
  config: ConfigSnapshot
  thumbnailUrl?: string
  collectionId?: string
  tags: string[]
  isShared: boolean
  syncStatus: SyncStatus
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}

export type SyncStatus = 'synced' | 'pending' | 'error'

export interface PresetCollection {
  id: string
  userId: string
  name: string
  description?: string
  icon?: string
  color?: string
  isSystem: boolean
  createdAt: string
}

export interface FontLibraryEntry {
  family: string
  category: FontCategory
  weights: number[]
  previewText: string
  fileSize: number
  loadingStatus: LoadingStatus
  isVariable: boolean
  googleFontsUrl: string
}

export type FontCategory = 'serif' | 'sans' | 'display' | 'mono' | 'handwriting'
export type LoadingStatus = 'unloaded' | 'loading' | 'loaded' | 'error'

export interface ColorPalette {
  id: string
  name: string
  description: string
  colors: string[]
  category: PaletteCategory
  previewImage?: string
  suggestedUse: string
}

export type PaletteCategory = 'broadcast' | 'corporate' | 'creative' | 'high-contrast' | 'minimal'

export interface ContrastValidation {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
  level: 'FAIL' | 'AA' | 'AAA'
}
