# Quickstart: UI Configuration System

**Feature**: Professional UI Configuration System for Teleprompter Studio
**Branch**: `001-ui-config-system`
**Date**: 2025-12-30T17:42:39Z

## Overview

This guide provides step-by-step instructions for implementing the UI Configuration System. It covers setup, core implementation, testing, and deployment.

## Prerequisites

- Node.js 18+ installed
- Existing Next.js 14+ project with Supabase integration
- TypeScript strict mode enabled
- Tailwind CSS configured
- shadcn/ui components installed

## Installation

### 1. Install Dependencies

```bash
# Core dependencies
npm install zustand react-colorful

# Type definitions
npm install -D @types/node

# Supabase client (should already be installed)
npm install @supabase/supabase-js
```

### 2. Create Database Tables

Run the following SQL in Supabase SQL Editor:

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

-- Indexes
CREATE INDEX idx_presets_user_id ON presets(user_id);
CREATE INDEX idx_presets_collection_id ON presets(collection_id);
CREATE INDEX idx_presets_sync_status ON presets(sync_status);
CREATE INDEX idx_presets_tags ON presets USING GIN(tags);
CREATE INDEX idx_collections_user_id ON preset_collections(user_id);

-- RLS Policies
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own presets" ON presets
  FOR SELECT USING (auth.uid() = user_id OR is_shared = TRUE);
CREATE POLICY "Users can insert own presets" ON presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presets" ON presets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own presets" ON presets
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE preset_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collections" ON preset_collections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own collections" ON preset_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collections" ON preset_collections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own collections" ON preset_collections
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Create Type Definitions

Create `lib/config/types.ts`:

```typescript
export interface TypographyConfig {
  fontFamily: string
  fontWeight: number
  fontSize: number
  letterSpacing: number
  lineHeight: number
  textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none'
}

export interface ColorConfig {
  primaryColor: string
  gradientEnabled: boolean
  gradientType: 'linear' | 'radial'
  gradientColors: string[]
  gradientAngle: number
  outlineColor: string
  glowColor: string
}

export interface EffectConfig {
  shadowEnabled: boolean
  shadowOffsetX: number
  shadowOffsetY: number
  shadowBlur: number
  shadowColor: string
  shadowOpacity: number
  outlineEnabled: boolean
  outlineWidth: number
  outlineColor: string
  glowEnabled: boolean
  glowBlurRadius: number
  glowIntensity: number
  glowColor: string
}

export interface LayoutConfig {
  horizontalMargin: number
  verticalPadding: number
  textAlign: 'left' | 'center' | 'right' | 'justify'
  columnCount: number
  columnGap: number
  textAreaWidth: number
  textAreaPosition: 'left' | 'center' | 'right'
}

export interface AnimationConfig {
  smoothScrollEnabled: boolean
  scrollDamping: number
  entranceAnimation: 'fade-in' | 'slide-up' | 'scale-in' | 'none'
  entranceDuration: number
  wordHighlightEnabled: boolean
  highlightColor: string
  highlightSpeed: number
  autoScrollEnabled: boolean
  autoScrollSpeed: number
  autoScrollAcceleration: number
}

export interface ConfigSnapshot {
  version: string
  typography: TypographyConfig
  colors: ColorConfig
  effects: EffectConfig
  layout: LayoutConfig
  animations: AnimationConfig
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
  syncStatus: 'synced' | 'pending' | 'error'
  lastSyncedAt?: string
  createdAt: string
  updatedAt: string
}
```

## Implementation Steps

### Step 1: Create Zustand Store

Create `lib/stores/useConfigStore.ts`:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Import types from types.ts
import type {
  TypographyConfig, ColorConfig, EffectConfig,
  LayoutConfig, AnimationConfig, ConfigSnapshot
} from '@/lib/config/types'
import type { Preset } from '@/lib/config/types'

// Default configurations
const defaultTypography: TypographyConfig = {
  fontFamily: 'Inter',
  fontWeight: 400,
  fontSize: 48,
  letterSpacing: 0,
  lineHeight: 1.5,
  textTransform: 'none',
}

const defaultColors: ColorConfig = {
  primaryColor: '#ffffff',
  gradientEnabled: false,
  gradientType: 'linear',
  gradientColors: ['#ffffff', '#fbbf24'],
  gradientAngle: 90,
  outlineColor: '#000000',
  glowColor: '#ffffff',
}

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

const defaultLayout: LayoutConfig = {
  horizontalMargin: 0,
  verticalPadding: 0,
  textAlign: 'center',
  columnCount: 1,
  columnGap: 20,
  textAreaWidth: 100,
  textAreaPosition: 'center',
}

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

interface ConfigState {
  typography: TypographyConfig
  colors: ColorConfig
  effects: EffectConfig
  layout: LayoutConfig
  animations: AnimationConfig
  
  // UI state
  activeTab: string
  isPanelOpen: boolean
  
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
  
  undo: () => void
  redo: () => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Initial state
      typography: defaultTypography,
      colors: defaultColors,
      effects: defaultEffects,
      layout: defaultLayout,
      animations: defaultAnimations,
      activeTab: 'typography',
      isPanelOpen: false,
      pastStates: [],
      futureStates: [],
      
      // Actions
      setTypography: (config) => set((state) => ({
        typography: { ...state.typography, ...config }
      })),
      
      setColors: (config) => set((state) => ({
        colors: { ...state.colors, ...config }
      })),
      
      setEffects: (config) => set((state) => ({
        effects: { ...state.effects, ...config }
      })),
      
      setLayout: (config) => set((state) => ({
        layout: { ...state.layout, ...config }
      })),
      
      setAnimations: (config) => set((state) => ({
        animations: { ...state.animations, ...config }
      })),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      togglePanel: () => set((state) => ({
        isPanelOpen: !state.isPanelOpen
      })),
      
      undo: () => set((state) => {
        const previous = state.pastStates[state.pastStates.length - 1]
        if (!previous) return state
        return {
          typography: previous.typography,
          colors: previous.colors,
          effects: previous.effects,
          layout: previous.layout,
          animations: previous.animations,
          pastStates: state.pastStates.slice(0, -1),
          futureStates: [state, ...state.futureStates],
        }
      }),
      
      redo: () => set((state) => {
        const next = state.futureStates[0]
        if (!next) return state
        return {
          typography: next.typography,
          colors: next.colors,
          effects: next.effects,
          layout: next.layout,
          animations: next.animations,
          pastStates: [...state.pastStates, state],
          futureStates: state.futureStates.slice(1),
        }
      }),
    }),
    {
      name: 'teleprompter-config',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

### Step 2: Create Google Fonts Configuration

Create `lib/fonts/google-fonts.ts`:

```typescript
import { Inter, Roboto, Oswald, Playfair_Display, JetBrains_Mono, Pacifico } from 'next/font/google'

export const fontLibrary = {
  serif: [
    { name: 'Playfair Display', font: Playfair_Display, weights: [400, 700] },
    { name: 'Merriweather', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap' },
    { name: 'Lora', url: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap' },
    { name: 'Crimson Text', url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap' },
    { name: 'Source Serif Pro', url: 'https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@400;600;700&display=swap' },
  ],
  sans: [
    { name: 'Inter', font: Inter, weights: [100, 200, 300, 400, 500, 600, 700, 800, 900] },
    { name: 'Roboto', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&display=swap' },
    { name: 'Open Sans', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap' },
    { name: 'Montserrat', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&display=swap' },
    { name: 'Poppins', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;300;400;500;600;700;800;900&display=swap' },
    { name: 'Raleway', url: 'https://fonts.googleapis.com/css2?family=Raleway:wght@100;200;300;400;500;600;700;800;900&display=swap' },
  ],
  display: [
    { name: 'Oswald', font: Oswald, weights: [200, 300, 400, 500, 600, 700] },
    { name: 'Bebas Neue', url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap' },
    { name: 'Anton', url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap' },
    { name: 'Lobster', url: 'https://fonts.googleapis.com/css2?family=Lobster&display=swap' },
    { name: 'Righteous', url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap' },
    { name: 'Satisfy', url: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap' },
  ],
  mono: [
    { name: 'JetBrains Mono', font: JetBrains_Mono, weights: [100, 200, 300, 400, 500, 600, 700, 800] },
    { name: 'Fira Code', url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap' },
    { name: 'Source Code Pro', url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400;500;600;700;900&display=swap' },
    { name: 'IBM Plex Mono', url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&display=swap' },
  ],
  handwriting: [
    { name: 'Pacifico', font: Pacifico, weight: 400 },
    { name: 'Caveat', url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap' },
    { name: 'Dancing Script', url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap' },
    { name: 'Shadows Into Light', url: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap' },
  ],
}

export type FontCategory = keyof typeof fontLibrary
```

### Step 3: Create Config Panel Component

Create `components/teleprompter/config/ConfigPanel.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { ConfigTabs } from './ConfigTabs'

export function ConfigPanel() {
  const { isPanelOpen, togglePanel } = useConfigStore()
  
  return (
    <>
      {/* Backdrop */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={togglePanel}
        />
      )}
      
      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out',
          isPanelOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Configuration</h2>
          <button
            onClick={togglePanel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <ConfigTabs />
      </aside>
    </>
  )
}
```

### Step 4: Create Color Picker Component

Create `components/teleprompter/config/colors/ColorPicker.tsx`:

```typescript
'use client'

import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value)
  
  const handleChange = (newColor: string) => {
    onChange(newColor)
    setInputValue(newColor)
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex)
    }
    setInputValue(hex)
  }
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <HexColorPicker color={value} onChange={handleChange} />
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="#ffffff"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  )
}
```

### Step 5: Create Combined Slider Input Component

Create `components/teleprompter/config/ui/SliderInput.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SliderInputProps {
  value: number
  min: number
  max: number
  step: number
  unit?: string
  label?: string
  onChange: (value: number) => void
}

export function SliderInput({ value, min, max, step, unit, label, onChange }: SliderInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  
  useEffect(() => {
    setInputValue(value.toString())
  }, [value])
  
  const handleSliderChange = (newValue: number) => {
    onChange(newValue)
    setInputValue(newValue.toString())
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
      setInputValue(newValue.toString())
    }
  }
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="relative w-24">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={inputValue}
            onChange={handleInputChange}
            className={cn(
              "w-full px-2 py-1 text-sm border rounded-lg",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            )}
          />
          {unit && (
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Step 6: Create API Routes

Create `app/api/presets/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data: presets, error } = await supabase
    .from('presets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json({ presets, total: presets?.length || 0 })
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  const { name, description, config, collectionId, tags, isShared } = body
  
  const { data: preset, error } = await supabase
    .from('presets')
    .insert({
      user_id: user.id,
      name,
      description,
      config,
      collection_id: collectionId,
      tags: tags || [],
      is_shared: isShared || false,
      sync_status: 'synced',
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(preset, { status: 201 })
}
```

## Testing

### Unit Tests

Create `tests/unit/config/validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { validateConfig } from '@/lib/config/validation'

describe('Config Validation', () => {
  it('should validate valid typography config', () => {
    const config = {
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: 48,
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: 'none' as const,
    }
    const result = validateConfig('typography', config)
    expect(result.valid).toBe(true)
  })
  
  it('should reject invalid font size', () => {
    const config = {
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: 150, // Too large
      letterSpacing: 0,
      lineHeight: 1.5,
      textTransform: 'none' as const,
    }
    const result = validateConfig('typography', config)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('fontSize must be between 12 and 120')
  })
})
```

### Integration Tests

Create `tests/integration/presets/sync.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

describe('Preset Sync', () => {
  let supabase: ReturnType<typeof createClient>
  
  beforeEach(() => {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  })
  
  it('should sync preset to cloud', async () => {
    const preset = {
      name: 'Test Preset',
      config: { /* ... */ },
    }
    
    const { data, error } = await supabase
      .from('presets')
      .insert(preset)
      .select()
      .single()
    
    expect(error).toBeNull()
    expect(data).toHaveProperty('id')
    expect(data.sync_status).toBe('synced')
  })
})
```

## Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
vercel --prod
```

### 3. Verify Database

Ensure Supabase migrations are applied in production:

```bash
# Run migrations in Supabase SQL Editor
# Or use Supabase CLI
supabase db push
```

## Troubleshooting

### Fonts Not Loading

- Check Google Fonts URLs are correct
- Verify fonts are added to `next.config.ts` font configuration
- Check browser console for CORS errors

### Preset Sync Failing

- Verify Supabase RLS policies are correctly configured
- Check user is authenticated
- Review browser network tab for API errors

### Color Picker Not Working

- Ensure `react-colorful` is installed
- Check for conflicting CSS styles
- Verify onChange handler is correctly bound

## Next Steps

- Add more color palettes
- Implement preset thumbnails
- Add keyboard shortcuts for common actions
- Create preset sharing functionality
- Add preset version history

## Resources

- [Google Fonts](https://fonts.google.com/)
- [react-colorful Documentation](https://github.com/onsion/react-colorful)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Supabase Documentation](https://supabase.com/docs)
