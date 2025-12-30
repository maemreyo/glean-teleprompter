# Data Model: UI Configuration System

**Feature**: Professional UI Configuration System for Teleprompter Studio
**Date**: 2025-12-30T17:37:02Z
**Status**: Final

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the UI Configuration System. The model supports cloud-based preset storage with local caching, real-time configuration updates, and comprehensive typography, color, effects, layout, and animation controls.

## Entity Relationship Diagram

```
┌─────────────────┐
│  User (auth)    │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────▼──────────────────────────────────────┐
    │            Preset                          │
    ├───────────────────────────────────────────┤
    │ id: UUID (PK)                             │
    │ user_id: UUID (FK → User)                 │
    │ name: string                              │
    │ description: string?                       │
    │ config: ConfigSnapshot (JSONB)            │
    │ thumbnail_url: string?                    │
    │ collection_id: UUID (FK → Collection)?    │
    │ tags: string[]                            │
    │ is_shared: boolean                        │
    │ sync_status: SyncStatus                   │
    │ last_synced_at: timestamp?                │
    │ created_at: timestamp                     │
    │ updated_at: timestamp                     │
    └───────────────────────────────────────────┘
         │
         │ N:1
         │
    ┌────▼────────────────┐
    │  PresetCollection   │
    ├─────────────────────┤
    │ id: UUID (PK)       │
    │ user_id: UUID (FK)  │
    │ name: string        │
    │ description: string?│
    │ icon: string?       │
    │ color: string?      │
    │ is_system: boolean  │
    │ created_at: timestamp│
    └─────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    ConfigSnapshot (JSONB)              │
├─────────────────────────────────────────────────────────┤
│  {                                                       │
│    typography: TypographyConfig,                        │
│    colors: ColorConfig,                                 │
│    effects: EffectConfig,                               │
│    layout: LayoutConfig,                                │
│    animations: AnimationConfig                          │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

## Core Entities

### 1. TypographyConfig

Typography settings for the teleprompter text display.

```typescript
interface TypographyConfig {
  // Font selection
  fontFamily: string        // Font family name (e.g., "Inter", "Oswald")
  fontWeight: number        // Font weight: 100-900 in 100-unit increments
  fontSize: number          // Font size in pixels: 12-120
  
  // Spacing
  letterSpacing: number     // Letter spacing in pixels: -5 to +20
  lineHeight: number        // Line height ratio: 1.0 to 3.0
  
  // Text transform
  textTransform: TextTransform // "uppercase" | "lowercase" | "capitalize" | "none"
}

type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'none'
```

**Validation Rules:**
- `fontWeight`: Must be in [100, 200, 300, 400, 500, 600, 700, 800, 900]
- `fontSize`: Must be between 12 and 120 inclusive
- `letterSpacing`: Must be between -5 and +20 inclusive
- `lineHeight`: Must be between 1.0 and 3.0 inclusive
- `fontFamily`: Must be one of the 25+ available Google Fonts

**Default Value:**
```typescript
const defaultTypography: TypographyConfig = {
  fontFamily: 'Inter',
  fontWeight: 400,
  fontSize: 48,
  letterSpacing: 0,
  lineHeight: 1.5,
  textTransform: 'none',
}
```

---

### 2. ColorConfig

Color and gradient settings for text display.

```typescript
interface ColorConfig {
  // Primary text color
  primaryColor: string      // HEX color: #RRGGBB or #RRGGBBAA
  
  // Gradient configuration
  gradientEnabled: boolean
  gradientType: GradientType
  gradientColors: string[]  // 2-3 color stops (HEX)
  gradientAngle: number     // Angle in degrees: 0-360
  
  // Effect colors
  outlineColor: string      // HEX color for text outline
  glowColor: string         // HEX color for glow effect
}

type GradientType = 'linear' | 'radial'
```

**Validation Rules:**
- `primaryColor`: Must be valid HEX color (#RRGGBB or #RRGGBBAA)
- `gradientColors`: Must contain 2-3 valid HEX colors
- `gradientAngle`: Must be between 0 and 360 inclusive
- `outlineColor`, `glowColor`: Must be valid HEX colors

**WCAG Compliance:**
```typescript
interface ContrastValidation {
  ratio: number            // Contrast ratio: 1.0 - 21.0
  passesAA: boolean        // 4.5:1 for normal text, 3:1 for large text
  passesAAA: boolean       // 7.0:1 for normal text, 4.5:1 for large text
  level: 'FAIL' | 'AA' | 'AAA'
}
```

**Default Value:**
```typescript
const defaultColors: ColorConfig = {
  primaryColor: '#ffffff',
  gradientEnabled: false,
  gradientType: 'linear',
  gradientColors: ['#ffffff', '#fbbf24'],
  gradientAngle: 90,
  outlineColor: '#000000',
  glowColor: '#ffffff',
}
```

---

### 3. EffectConfig

Visual effects applied to text (shadows, outlines, glows).

```typescript
interface EffectConfig {
  // Text shadow
  shadowEnabled: boolean
  shadowOffsetX: number     // Shadow X offset in pixels: 0-20
  shadowOffsetY: number     // Shadow Y offset in pixels: 0-20
  shadowBlur: number        // Shadow blur radius in pixels: 0-30
  shadowColor: string       // HEX color
  shadowOpacity: number     // Opacity: 0.0-1.0
  
  // Text outline
  outlineEnabled: boolean
  outlineWidth: number      // Outline width in pixels: 1-10
  outlineColor: string      // HEX color
  
  // Text glow
  glowEnabled: boolean
  glowBlurRadius: number    // Glow blur radius in pixels: 5-50
  glowIntensity: number     // Glow intensity: 0.0-1.0
  glowColor: string         // HEX color
}
```

**Validation Rules:**
- `shadowOffsetX`, `shadowOffsetY`: Must be between 0 and 20 inclusive
- `shadowBlur`: Must be between 0 and 30 inclusive
- `shadowOpacity`: Must be between 0.0 and 1.0 inclusive
- `outlineWidth`: Must be between 1 and 10 inclusive
- `glowBlurRadius`: Must be between 5 and 50 inclusive
- `glowIntensity`: Must be between 0.0 and 1.0 inclusive

**Default Value:**
```typescript
const defaultEffects: EffectConfig = {
  shadowEnabled: false,
  shadowOffsetX: 2,
  shadowOffsetY: 2,
  shadowBlur: 4,
  shadowColor: '#000000',
  shadowOpacity: 0.5,
  outlineEnabled: false,
  outlineWidth: 2,
  outlineColor: '#000000',
  glowEnabled: false,
  glowBlurRadius: 10,
  glowIntensity: 0.5,
  glowColor: '#ffffff',
}
```

---

### 4. LayoutConfig

Layout and positioning settings for text display.

```typescript
interface LayoutConfig {
  // Margins and padding
  horizontalMargin: number  // Horizontal margin in pixels: 0-200
  verticalPadding: number   // Vertical padding in pixels: 0-100
  
  // Alignment
  textAlign: TextAlign      // Text alignment
  
  // Multi-column layout
  columnCount: number       // Number of columns: 1-4
  columnGap: number         // Gap between columns in pixels: 20-100
  
  // Text area
  textAreaWidth: number     // Text area width percentage: 50-100
  textAreaPosition: Position // Text area positioning
}

type TextAlign = 'left' | 'center' | 'right' | 'justify'
type Position = 'left' | 'center' | 'right'
```

**Validation Rules:**
- `horizontalMargin`: Must be between 0 and 200 inclusive
- `verticalPadding`: Must be between 0 and 100 inclusive
- `columnCount`: Must be 1, 2, 3, or 4
- `columnGap`: Must be between 20 and 100 inclusive
- `textAreaWidth`: Must be between 50 and 100 inclusive

**Default Value:**
```typescript
const defaultLayout: LayoutConfig = {
  horizontalMargin: 0,
  verticalPadding: 0,
  textAlign: 'center',
  columnCount: 1,
  columnGap: 20,
  textAreaWidth: 100,
  textAreaPosition: 'center',
}
```

---

### 5. AnimationConfig

Animation and transition settings.

```typescript
interface AnimationConfig {
  // Smooth scroll
  smoothScrollEnabled: boolean
  scrollDamping: number     // Scroll damping factor: 0.1-1.0
  
  // Entrance animation
  entranceAnimation: EntranceAnimation
  entranceDuration: number  // Duration in milliseconds: 200-2000
  
  // Word highlighting
  wordHighlightEnabled: boolean
  highlightColor: string    // HEX color
  highlightSpeed: number    // Highlight speed in ms: 100-500
  
  // Auto-scroll
  autoScrollEnabled: boolean
  autoScrollSpeed: number   // Speed in pixels/second: 10-100
  autoScrollAcceleration: number // Acceleration: 0-10
}

type EntranceAnimation = 'fade-in' | 'slide-up' | 'scale-in' | 'none'
```

**Validation Rules:**
- `scrollDamping`: Must be between 0.1 and 1.0 inclusive
- `entranceDuration`: Must be between 200 and 2000 inclusive
- `highlightSpeed`: Must be between 100 and 500 inclusive
- `autoScrollSpeed`: Must be between 10 and 100 inclusive
- `autoScrollAcceleration`: Must be between 0 and 10 inclusive

**Default Value:**
```typescript
const defaultAnimations: AnimationConfig = {
  smoothScrollEnabled: true,
  scrollDamping: 0.5,
  entranceAnimation: 'fade-in',
  entranceDuration: 500,
  wordHighlightEnabled: false,
  highlightColor: '#fbbf24',
  highlightSpeed: 200,
  autoScrollEnabled: false,
  autoScrollSpeed: 50,
  autoScrollAcceleration: 0,
}
```

---

### 6. ConfigSnapshot

Complete configuration snapshot stored in presets.

```typescript
interface ConfigSnapshot {
  version: string           // Schema version for migration
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
```

---

### 7. Preset

Saved configuration preset stored in cloud.

```typescript
interface Preset {
  id: string                // UUID
  userId: string            // User ID (Supabase auth.uid())
  name: string              // Preset name
  description?: string      // Optional description
  config: ConfigSnapshot    // Full configuration
  thumbnailUrl?: string     // Preset thumbnail URL
  collectionId?: string     // Parent collection ID
  tags: string[]            // User-defined tags
  isShared: boolean         // Whether preset is shared
  syncStatus: SyncStatus    // Cloud sync status
  lastSyncedAt?: string     // ISO timestamp of last sync
  createdAt: string         // ISO timestamp
  updatedAt: string         // ISO timestamp
}

type SyncStatus = 'synced' | 'pending' | 'error'
```

**State Transitions:**
```
┌─────────┐  save/sync  ┌──────────┐  success  ┌─────────┐
│ pending │ ──────────> │ syncing  │ ────────> │ synced  │
└─────────┘             └──────────┘            └─────────┘
    ▲                       │                       │
    │                       │ error                │
    │                       ▼                       │
    │                   ┌──────────┐                │
    └───────────────────│  error   │────────────────┘
                        └──────────┘
```

**Validation Rules:**
- `name`: Must be 1-100 characters, unique per user
- `description`: Max 500 characters
- `tags`: Max 10 tags, each 1-50 characters
- `config`: Must pass all config validation rules

---

### 8. PresetCollection

Collection/folder for organizing presets.

```typescript
interface PresetCollection {
  id: string                // UUID
  userId: string            // User ID
  name: string              // Collection name
  description?: string      // Optional description
  icon?: string             // Lucide icon name
  color?: string            // HEX color for icon
  isSystem: boolean         // Whether this is a built-in collection
  createdAt: string         // ISO timestamp
}
```

**Validation Rules:**
- `name`: Must be 1-50 characters, unique per user
- `description`: Max 200 characters
- `icon`: Must be valid Lucide icon name (optional)
- `color`: Must be valid HEX color (optional)

**Built-in Collections:**
```typescript
const systemCollections: Omit<PresetCollection, 'id' | 'userId' | 'createdAt'>[] = [
  { name: 'Favorites', description: 'Favorite presets', icon: 'Star', color: '#fbbf24', isSystem: true },
  { name: 'Broadcast', description: 'Professional broadcast presets', icon: 'Radio', color: '#60a5fa', isSystem: true },
  { name: 'Creative', description: 'Creative and artistic presets', icon: 'Palette', color: '#f472b6', isSystem: true },
]
```

---

### 9. FontLibraryEntry

Metadata for fonts available in the system.

```typescript
interface FontLibraryEntry {
  family: string            // Font family name
  category: FontCategory    // Font category
  weights: number[]         // Available weights: [100, 200, ...]
  previewText: string       // Sample text for preview
  fileSize: number          // Total file size in bytes
  loadingStatus: LoadingStatus
  isVariable: boolean       // Whether it's a variable font
  googleFontsUrl: string    // Google Fonts URL
}

type FontCategory = 'serif' | 'sans' | 'display' | 'mono' | 'handwriting'
type LoadingStatus = 'unloaded' | 'loading' | 'loaded' | 'error'
```

**Example:**
```typescript
const interEntry: FontLibraryEntry = {
  family: 'Inter',
  category: 'sans',
  weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
  previewText: 'The quick brown fox jumps over the lazy dog',
  fileSize: 256000, // 256KB total for all weights
  loadingStatus: 'loaded',
  isVariable: true,
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
}
```

---

### 10. ColorPalette

Curated color palette for quick selection.

```typescript
interface ColorPalette {
  id: string                // Unique palette ID
  name: string              // Palette name
  description: string       // Description
  colors: string[]          // 5-8 HEX colors
  category: PaletteCategory // Palette category
  previewImage?: string     // Preview image URL
  suggestedUse: string      // Use case description
}

type PaletteCategory = 'broadcast' | 'corporate' | 'creative' | 'high-contrast' | 'minimal'
```

**Example:**
```typescript
const broadcastPalette: ColorPalette = {
  id: 'broadcast-standard',
  name: 'Broadcast Standard',
  description: 'High-contrast colors optimized for broadcast and video',
  colors: ['#ffffff', '#fbbf24', '#4ade80', '#60a5fa', '#f472b6', '#f87171'],
  category: 'broadcast',
  suggestedUse: 'Professional broadcast productions, news, sports',
}
```

## Database Schema

### PostgreSQL Tables

```sql
-- Presets table
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 500),
  config JSONB NOT NULL,
  thumbnail_url TEXT,
  collection_id UUID REFERENCES preset_collections(id) ON DELETE SET NULL,
  tags TEXT[] CHECK (array_length(tags, 1) <= 10),
  is_shared BOOLEAN DEFAULT FALSE,
  sync_status TEXT NOT NULL DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'error')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Preset collections table
CREATE TABLE preset_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  description TEXT CHECK (char_length(description) <= 200),
  icon TEXT,
  color TEXT CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Indexes for performance
CREATE INDEX idx_presets_user_id ON presets(user_id);
CREATE INDEX idx_presets_collection_id ON presets(collection_id);
CREATE INDEX idx_presets_sync_status ON presets(sync_status);
CREATE INDEX idx_presets_tags ON presets USING GIN(tags);
CREATE INDEX idx_collections_user_id ON preset_collections(user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## State Management (Zustand Store)

```typescript
interface ConfigStore {
  // Configuration state
  typography: TypographyConfig
  colors: ColorConfig
  effects: EffectConfig
  layout: LayoutConfig
  animations: AnimationConfig
  
  // UI state
  activeTab: string
  isPanelOpen: boolean
  
  // Sync state
  syncStatus: SyncStatus
  lastSyncError?: string
  
  // Undo/Redo
  pastStates: ConfigSnapshot[]
  futureStates: ConfigSnapshot[]
  
  // Actions
  setTypography: (config: Partial<TypographyConfig>) => void
  setColors: (config: Partial<ColorConfig>) => void
  setEffects: (config: Partial<EffectConfig>) => void
  setLayout: (config: Partial<LayoutConfig>) => void
  setAnimations: (config: Partial<AnimationConfig>) => void
  
  setActiveTab: (tab: string) => void
  togglePanel: () => void
  
  // Preset actions
  savePreset: (name: string, description?: string) => Promise<Preset>
  loadPreset: (presetId: string) => Promise<void>
  deletePreset: (presetId: string) => Promise<void>
  exportPreset: (presetId: string) => Promise<Blob>
  importPreset: (file: File) => Promise<Preset>
  
  // Sync actions
  syncToCloud: () => Promise<void>
  downloadFromCloud: () => Promise<void>
  
  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // Validation
  validateContrast: () => ContrastValidation
  validateAll: () => { valid: boolean; errors: string[] }
}
```

## Summary

The data model provides:

1. **Modular Configuration**: 5 separate config entities (typography, colors, effects, layout, animations) for clear separation of concerns
2. **Cloud Storage**: Presets stored in Supabase PostgreSQL with user isolation via RLS
3. **Local Caching**: IndexedDB storage for offline access and fast loading
4. **Version Control**: Schema versioning in ConfigSnapshot for future migrations
5. **Validation**: Comprehensive validation rules for all numeric and string inputs
6. **State Management**: Zustand store with undo/redo, sync controls, and validation
7. **Extensibility**: Easy to add new config options without breaking existing presets
