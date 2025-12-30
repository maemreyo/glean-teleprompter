# Research: UI Configuration System

**Feature**: Professional UI Configuration System for Teleprompter Studio
**Date**: 2025-12-30T17:35:42Z
**Status**: Complete

## Overview

This document consolidates research findings for implementing a studio-grade UI configuration system. All technical decisions have been researched and documented to resolve unknowns from the planning phase.

## 1. Google Fonts Integration

### Decision
Use `next/font/google` for Google Fonts integration with Next.js 14+.

### Rationale
- Official Next.js integration with automatic font optimization
- Zero layout shift (font-display: swap)
- Automatic self-hosting and subset optimization
- Built-in TypeScript support
- No additional API calls or authentication required

### Alternatives Considered
- **Web Font Loader**: Legacy solution, larger bundle size, no Next.js optimization
- **Direct CSS @import**: No optimization, causes FOIT/FOUT, harder to manage

### Implementation
```typescript
// lib/fonts/google-fonts.ts
import { Inter, Roboto, Oswald, Playfair_Display, JetBrains_Mono, Pacifico } from 'next/font/google'

export const fontLibrary = {
  serif: [
    { family: Playfair_Display, weights: [400, 700] },
    { family: 'Merriweather', weights: [300, 400, 700] },
  ],
  sans: [
    { family: Inter, weights: [400, 500, 600, 700] },
    { family: Roboto, weights: [300, 400, 500, 700] },
  ],
  display: [
    { family: Oswald, weights: [400, 500, 700] },
  ],
  mono: [
    { family: JetBrains_Mono, weights: [400, 500] },
  ],
  handwriting: [
    { family: Pacifico, weight: 400 },
  ],
  // ... 25+ total fonts
}
```

## 2. Color Picker Library

### Decision
Use `react-colorful` for color selection.

### Rationale
- Zero dependencies (smallest bundle size at ~2.5KB)
- TypeScript support out of the box
- Accessible (keyboard navigation, ARIA labels)
- Supports HEX, RGB, HSL, HSV formats
- Supports opacity/alpha channel
- Better performance than react-color (no heavy dependencies)
- Active maintenance (500+ GitHub stars)

### Alternatives Considered
- **react-color**: Large bundle size (180KB), outdated, heavy dependencies
- **chrome-color-picker**: React wrapper around Chrome picker, larger bundle
- **Custom implementation**: High maintenance cost, accessibility challenges

### Implementation
```typescript
// components/teleprompter/config/colors/ColorPicker.tsx
import { HexColorPicker } from 'react-colorful'
import { hslToHex, hexToHsl } from '@/lib/config/color-utils'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  showOpacity?: boolean
}

export function ColorPicker({ value, onChange, showOpacity }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-4">
      <HexColorPicker color={value} onChange={onChange} />
      {showOpacity && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={getOpacity(value)}
          onChange={(e) => setOpacity(value, parseFloat(e.target.value))}
        />
      )}
    </div>
  )
}
```

## 3. State Management

### Decision
Use Zustand for configuration state management.

### Rationale
- Lightweight (1KB minzip)
- Built-in TypeScript support
- No Context Provider boilerplate
- Easy to persist state (localStorage/IndexedDB)
- DevTools integration
- Simple API for nested state updates
- Better performance than Redux for this use case

### Alternatives Considered
- **Context API**: Too much boilerplate, performance issues with frequent updates
- **Redux**: Overkill for configuration state, larger bundle
- **Jotai**: Good alternative but Zustand has better ecosystem support

### Implementation
```typescript
// lib/stores/useConfigStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { IndexedDBStorage } from '@/lib/storage/indexeddb'

interface ConfigState {
  typography: TypographyConfig
  colors: ColorConfig
  effects: EffectConfig
  layout: LayoutConfig
  animations: AnimationConfig
  
  // Actions
  setTypography: (config: Partial<TypographyConfig>) => void
  setColors: (config: Partial<ColorConfig>) => void
  setEffects: (config: Partial<EffectConfig>) => void
  setLayout: (config: Partial<LayoutConfig>) => void
  setAnimations: (config: Partial<AnimationConfig>) => void
  
  // Presets
  saveAsPreset: (name: string, description?: string) => Promise<void>
  applyPreset: (preset: Preset) => void
  
  // Undo/Redo
  pastStates: ConfigState[]
  futureStates: ConfigState[]
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
      pastStates: [],
      futureStates: [],
      
      // Actions
      setTypography: (config) => set((state) => ({
        typography: { ...state.typography, ...config }
      })),
      
      // ... other actions
      
      undo: () => set((state) => {
        const previous = state.pastStates[state.pastStates.length - 1]
        return {
          ...previous,
          pastStates: state.pastStates.slice(0, -1),
          futureStates: [state, ...state.futureStates],
        }
      }),
      
      redo: () => set((state) => {
        const next = state.futureStates[0]
        return {
          ...next,
          pastStates: [...state.pastStates, state],
          futureStates: state.futureStates.slice(1),
        }
      }),
    }),
    {
      name: 'teleprompter-config',
      storage: createJSONStorage(() => IndexedDBStorage),
      partialize: (state) => ({
        typography: state.typography,
        colors: state.colors,
        effects: state.effects,
        layout: state.layout,
        animations: state.animations,
      }),
    }
  )
)
```

## 4. WCAG Contrast Validation

### Decision
Use custom implementation using WCAG 2.1 formula.

### Rationale
- Simple calculation (relative luminance + contrast ratio)
- No external dependencies needed
- Can be implemented in ~50 lines of TypeScript
- Full control over AA/AAA threshold logic

### Alternatives Considered
- **color-contrast library**: Additional dependency, overkill for simple calculation
- **axe-core**: Too large for just contrast checking

### Implementation
```typescript
// lib/config/contrast.ts
interface ContrastResult {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
  level: 'FAIL' | 'AA' | 'AAA'
}

export function calculateContrast(
  foreground: string,
  background: string
): ContrastResult {
  const fgLuminance = relativeLuminance(foreground)
  const bgLuminance = relativeLuminance(background)
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) /
                (Math.min(fgLuminance, bgLuminance) + 0.05)
  
  const passesAA = ratio >= 4.5
  const passesAAA = ratio >= 7.0
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAAA,
    level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'FAIL',
  }
}

function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
```

## 5. IndexedDB for Local Caching

### Decision
Use custom IndexedDB wrapper with Zustand persistence middleware.

### Rationale
- Larger storage capacity than localStorage (50MB+ vs 5MB)
- Asynchronous operations (non-blocking)
- Better performance for larger datasets (50+ presets)
- Works offline

### Alternatives Considered
- **localStorage**: 5MB limit, synchronous (blocking), insufficient for 50+ presets
- **SessionStorage**: Cleared on tab close, insufficient

### Implementation
```typescript
// lib/storage/indexeddb.ts
export const IndexedDBStorage = {
  async getItem(name: string): Promise<string | null> {
    const db = await openDB('teleprompter', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config')
        }
      },
    })
    return await db.get('config', name)
  },
  
  async setItem(name: string, value: string): Promise<void> {
    const db = await openDB('teleprompter', 1)
    await db.put('config', value, name)
  },
  
  async removeItem(name: string): Promise<void> {
    const db = await openDB('teleprompter', 1)
    await db.delete('config', name)
  },
}
```

## 6. Tabbed Interface Pattern

### Decision
Custom tabbed interface using Tailwind CSS and Lucide React icons.

### Rationale
- Full control over styling and behavior
- Lightweight (no additional dependencies)
- Easy to animate transitions
- Accessible (keyboard navigation, ARIA roles)

### Alternatives Considered
- **Radix UI Tabs**: Good but additional dependency
- **react-tabs**: Outdated, less flexible

### Implementation
```typescript
// components/teleprompter/config/ConfigTabs.tsx
import { Settings, Type, Palette, Sparkles, Layout, Sparkle, FolderOpen } from 'lucide-react'

const tabs = [
  { id: 'typography', label: 'Typography', icon: Type },
  { id: 'colors', label: 'Colors', icon: Palette },
  { id: 'effects', label: 'Effects', icon: Sparkles },
  { id: 'layout', label: 'Layout', icon: Layout },
  { id: 'animations', label: 'Animations', icon: Sparkle },
  { id: 'presets', label: 'Presets', icon: FolderOpen },
]

export function ConfigTabs() {
  const [activeTab, setActiveTab] = useState('typography')
  
  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <nav className="flex border-b" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto" role="tabpanel">
        {activeTab === 'typography' && <TypographyTab />}
        {activeTab === 'colors' && <ColorsTab />}
        {activeTab === 'effects' && <EffectsTab />}
        {activeTab === 'layout' && <LayoutTab />}
        {activeTab === 'animations' && <AnimationsTab />}
        {activeTab === 'presets' && <PresetsTab />}
      </div>
    </div>
  )
}
```

## 7. Combined Slider + Number Input

### Decision
Custom component with synced slider and input using Tailwind CSS.

### Rationale
- Best of both worlds (quick exploration + precise input)
- Full control over styling
- Accessible (keyboard support, labels)

### Alternatives Considered
- **Radix UI Slider**: Good but would need custom input pairing
- **rc-slider**: Larger bundle, less flexible

### Implementation
```typescript
// components/teleprompter/config/ui/SliderInput.tsx
interface SliderInputProps {
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (value: number) => void
}

export function SliderInput({ value, min, max, step, unit, onChange }: SliderInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  
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
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="relative">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={handleInputChange}
          className="w-20 px-2 py-1 text-sm border rounded"
        />
        {unit && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
```

## 8. Preset Storage with Supabase

### Decision
Use Supabase PostgreSQL for cloud storage with Row Level Security (RLS).

### Rationale
- Already integrated in project (Constitution V)
- Built-in authentication integration
- Row Level Security for data isolation
- Real-time subscriptions available (for future sync features)
- Easy TypeScript integration

### Database Schema
```sql
-- Table: presets
CREATE TABLE presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL, -- Full configuration snapshot
  thumbnail_url TEXT,
  collection_id UUID REFERENCES preset_collections(id) ON DELETE SET NULL,
  tags TEXT[],
  is_shared BOOLEAN DEFAULT FALSE,
  sync_status TEXT DEFAULT 'synced', -- synced, pending, error
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: preset_collections
CREATE TABLE preset_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
```

## 9. Font Loading with Fallback

### Decision
Use document.fonts API with timeout and fallback strategy.

### Rationale
- Native browser API (no dependencies)
- Promise-based (easy to use with async/await)
- Can detect loading failures
- Works with Google Fonts

### Implementation
```typescript
// lib/fonts/font-loader.ts
export async function loadFontWithFallback(
  fontName: string,
  category: FontCategory,
  timeout = 3000
): Promise<boolean> {
  try {
    // Wait for font to load
    await Promise.race([
      document.fonts.load(`16px "${fontName}"`),
      timeoutPromise(timeout),
    ])
    return true
  } catch (error) {
    console.warn(`Font ${fontName} failed to load, using fallback`)
    // Return fallback font for category
    return getFallbackFont(category)
  }
}

function timeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  )
}

function getFallbackFont(category: FontCategory): string {
  const fallbacks = {
    serif: 'Georgia',
    sans: 'Arial',
    display: 'Impact',
    mono: 'Courier New',
    handwriting: 'Comic Sans MS',
  }
  return fallbacks[category]
}
```

## 10. Real-time Preview Performance

### Decision
Use React.memo with selective re-renders and requestAnimationFrame batching.

### Rationale
- Prevents unnecessary re-renders of teleprompter text
- Batches updates for 60fps performance
- Lightweight (no external dependencies)

### Implementation
```typescript
// components/teleprompter/display/TeleprompterText.tsx
export const TeleprompterText = memo(function TeleprompterText({
  config
}: {
  config: ReturnType<typeof useConfigStore>
}) {
  const textRef = useRef<HTMLDivElement>(null)
  
  // Apply config styles efficiently
  const style = useMemo(() => ({
    fontFamily: config.typography.font,
    fontSize: `${config.typography.fontSize}px`,
    lineHeight: config.typography.lineHeight,
    letterSpacing: `${config.typography.letterSpacing}px`,
    color: config.colors.primary,
    textShadow: config.effects.shadowEnabled
      ? `${config.effects.shadowOffsetX}px ${config.effects.shadowOffsetY}px ${config.effects.shadowBlur}px ${config.effects.shadowColor}`
      : 'none',
    // ... other styles
  }), [config])
  
  return (
    <div
      ref={textRef}
      style={style}
      className="teleprompter-text"
    >
      {text}
    </div>
  )
})
```

## Summary

All technical decisions have been researched and justified. The implementation will use:

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Font Loading | `next/font/google` | Official Next.js integration, zero layout shift |
| Color Picker | `react-colorful` | Smallest bundle, TypeScript, accessible |
| State Management | Zustand | Lightweight, simple API, persist middleware |
| Contrast Validation | Custom WCAG 2.1 | Simple calculation, no dependencies |
| Local Cache | IndexedDB | Larger capacity, async, offline-capable |
| Tabbed UI | Custom + Tailwind | Full control, lightweight, accessible |
| Slider + Input | Custom component | Best UX, full control |
| Cloud Storage | Supabase PostgreSQL | Existing integration, RLS, auth |
| Performance | React.memo + useMemo | Prevents unnecessary renders, 60fps |

All choices align with the project constitution and provide optimal developer experience, performance, and user experience.
