# Quickstart: Unified State Architecture

**Feature**: 007-unified-state-architecture  
**Date**: 2026-01-01  
**Status**: Complete

## Overview

This guide helps developers quickly set up and understand the unified state architecture implementation. It covers the new store structure, component migration, and testing approach.

## Prerequisites

- Node.js 18+ installed
- Project cloned and dependencies installed (`npm install`)
- TypeScript 5.3+ with strict mode enabled
- Familiarity with Zustand state management

---

## 1. New Store Structure

### Quick Reference

| Store | Purpose | localStorage Key | File Location |
|-------|---------|------------------|---------------|
| **useContentStore** | Content data (text, media) | `teleprompter-content` | `lib/stores/useContentStore.ts` (NEW) |
| **useConfigStore** | Visual styling | `teleprompter-config` | `lib/stores/useConfigStore.ts` (EXISTING) |
| **usePlaybackStore** | Runtime playback state | None (no persistence) | `lib/stores/usePlaybackStore.ts` (NEW) |
| **useUIStore** | UI navigation state | `teleprompter-ui-store` | `stores/useUIStore.ts` (EXISTING) |

### What Changed

**Before (Legacy):**
```typescript
// Old: Mixed concerns in one store
const store = useTeleprompterStore()
store.text        // Content
store.fontSize    // Styling
store.isPlaying   // Playback
store.mode        // UI
```

**After (New):**
```typescript
// New: Separated concerns across four stores
const contentStore = useContentStore()
const configStore = useConfigStore()
const playbackStore = usePlaybackStore()
const uiStore = useUIStore()

contentStore.text           // Content
configStore.typography.fontSize  // Styling
playbackStore.isPlaying     // Playback
uiStore.mode                // UI
```

---

## 2. Setting Up the Development Environment

### Step 1: Create New Store Files

```bash
# Create new store files
touch lib/stores/useContentStore.ts
touch lib/stores/usePlaybackStore.ts
```

### Step 2: Install Dependencies (if not already installed)

```bash
# All dependencies should already be installed
npm install zustand
npm install @radix-ui/react-dialog @radix-ui/react-slider
npm install sonner
```

### Step 3: Verify Existing Stores

```bash
# Verify existing stores are present
ls -la lib/stores/useConfigStore.ts
ls -la stores/useUIStore.ts
```

---

## 3. Creating the New Stores

### useContentStore Template

Create `lib/stores/useContentStore.ts`:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ContentStoreState {
  text: string
  bgUrl: string
  musicUrl: string
  isReadOnly: boolean
}

interface ContentStoreActions {
  setText: (text: string) => void
  setBgUrl: (url: string) => void
  setMusicUrl: (url: string) => void
  setIsReadOnly: (readOnly: boolean) => void
  setAll: (state: Partial<ContentStoreState>) => void
  reset: () => void
}

type ContentStore = ContentStoreState & ContentStoreActions

const DEFAULT_TEXT = 'Chào mừng! Hãy nhập nội dung của bạn vào đây...'
const DEFAULT_BG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'

export const useContentStore = create<ContentStore>()(
  persist(
    (set) => ({
      // Initial state
      text: DEFAULT_TEXT,
      bgUrl: DEFAULT_BG,
      musicUrl: '',
      isReadOnly: false,

      // Actions
      setText: (text) => set({ text }),
      setBgUrl: (bgUrl) => set({ bgUrl }),
      setMusicUrl: (musicUrl) => set({ musicUrl }),
      setIsReadOnly: (isReadOnly) => set({ isReadOnly }),

      setAll: (newState) => set((state) => ({
        ...state,
        ...newState
      })),

      reset: () => set({
        text: DEFAULT_TEXT,
        bgUrl: DEFAULT_BG,
        musicUrl: '',
        isReadOnly: false
      })
    }),
    {
      name: 'teleprompter-content',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
```

### usePlaybackStore Template

Create `lib/stores/usePlaybackStore.ts`:

```typescript
import { create } from 'zustand'

interface PlaybackStoreState {
  isPlaying: boolean
  currentTime: number
  scrollSpeed: number
}

interface PlaybackStoreActions {
  setIsPlaying: (playing: boolean) => void
  togglePlaying: () => void
  setCurrentTime: (time: number) => void
  setScrollSpeed: (speed: number) => void
  reset: () => void
}

type PlaybackStore = PlaybackStoreState & PlaybackStoreActions

export const usePlaybackStore = create<PlaybackStore>()((set, get) => ({
  // Initial state
  isPlaying: false,
  currentTime: 0,
  scrollSpeed: 1,

  // Actions
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  togglePlaying: () => set((state) => ({
    isPlaying: !state.isPlaying
  })),

  setCurrentTime: (currentTime) => set({ currentTime }),

  setScrollSpeed: (scrollSpeed) => set({ scrollSpeed }),

  reset: () => set({
    isPlaying: false,
    currentTime: 0,
    scrollSpeed: 1
  })
}))
```

### Extend useUIStore with Mode Property

Add to `stores/useUIStore.ts`:

```typescript
// Add to UIStore interface
interface UIStore {
  // ... existing properties
  mode: 'setup' | 'running'  // NEW
  setMode: (mode: 'setup' | 'running') => void  // NEW
}

// Add to initial state
mode: 'setup',

// Add to actions
setMode: (mode) => set({ mode }),
```

### Extend useConfigStore with overlayOpacity

Add to `lib/stores/useConfigStore.ts`:

```typescript
// Add to EffectConfig interface
interface EffectConfig {
  // ... existing properties
  overlayOpacity: number  // NEW
}

// Add to defaultEffects
export const defaultEffects: EffectConfig = {
  // ... existing properties
  overlayOpacity: 0.5  // NEW
}
```

---

## 4. Component Migration Guide

### Migrating Runner Component

**Before:**
```typescript
// components/teleprompter/Runner.tsx
import { useTeleprompterStore } from '@/stores/useTeleprompterStore'

export function Runner() {
  const store = useTeleprompterStore()
  
  // Uses mixed state
  const text = store.text
  const fontSize = store.fontSize  // Legacy property
  const isPlaying = store.isPlaying
  const mode = store.mode
}
```

**After:**
```typescript
// components/teleprompter/Runner.tsx
import { useContentStore } from '@/lib/stores/useContentStore'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { usePlaybackStore } from '@/lib/stores/usePlaybackStore'
import { useUIStore } from '@/stores/useUIStore'

export function Runner() {
  // Use appropriate stores
  const { text, bgUrl, musicUrl } = useContentStore()
  const { typography, layout, effects } = useConfigStore()
  const { isPlaying, currentTime } = usePlaybackStore()
  const { mode } = useUIStore()
  
  // fontSize is now in typography
  const fontSize = typography.fontSize
}
```

### Migrating Editor Components

**ContentPanel:**
```typescript
// Before
import { useTeleprompterStore } from '@/stores/useTeleprompterStore'
const { text, bgUrl, musicUrl, isReadOnly } = useTeleprompterStore()

// After
import { useContentStore } from '@/lib/stores/useContentStore'
const { text, bgUrl, musicUrl, isReadOnly } = useContentStore()
```

**PreviewPanel & TeleprompterText:**
```typescript
// Already using useConfigStore - no change needed
import { useConfigStore } from '@/lib/stores/useConfigStore'
const { typography, colors, effects, layout } = useConfigStore()
```

---

## 5. Creating the QuickSettingsPanel Component

### Location

Create `components/teleprompter/runner/QuickSettingsPanel.tsx`

### Template

```typescript
"use client"

import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import * as Slider from '@radix-ui/react-slider'
import { useContentStore } from '@/lib/stores/useContentStore'
import { useConfigStore } from '@/lib/stores/useConfigStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function QuickSettingsPanel() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Store subscriptions
  const { bgUrl, setBgUrl } = useContentStore()
  const { 
    typography, 
    layout, 
    animations,
    setTypography, 
    setLayout, 
    setAnimations 
  } = useConfigStore()

  // Quick Settings handlers with error handling
  const handleScrollSpeedChange = (value: number[]) => {
    try {
      const [speed] = value
      if (speed < 10 || speed > 200) {
        throw new Error('Scroll speed must be between 10 and 200')
      }
      setAnimations({ autoScrollSpeed: speed })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update scroll speed')
      // Revert UI by not updating local state
    }
  }

  const handleFontSizeChange = (value: number[]) => {
    try {
      const [size] = value
      if (size < 12 || size > 120) {
        throw new Error('Font size must be between 12 and 120')
      }
      setTypography({ fontSize: size })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update font size')
    }
  }

  const handleAlignmentChange = (align: 'left' | 'center' | 'right') => {
    try {
      setLayout({ textAlign: align })
    } catch (error) {
      toast.error('Failed to update alignment')
    }
  }

  const handleBackgroundChange = (url: string) => {
    try {
      if (url && !url.match(/^https?:\/\/.+/)) {
        throw new Error('Invalid URL')
      }
      setBgUrl(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update background')
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <Dialog.Trigger asChild>
        <button
          className={cn(
            "fixed top-6 right-6 z-50",
            "p-3 rounded-full",
            "bg-black/40 hover:bg-black/60 backdrop-blur",
            "text-white transition-all",
            "focus:outline-none focus:ring-2 focus:ring-white"
          )}
          aria-label="Quick Settings"
        >
          <Settings size={20} />
        </button>
      </Dialog.Trigger>

      {/* Floating Panel */}
      <Dialog.Portal>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed top-20 right-6 z-50",
              "w-80",
              "bg-black/90 backdrop-blur-xl",
              "border border-white/20 rounded-2xl",
              "p-6 shadow-2xl"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Quick Settings</h2>
              <Dialog.Close asChild>
                <button
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            {/* Scroll Speed */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <label className="text-white/70">Scroll Speed</label>
                <span className="text-white font-mono">{animations.autoScrollSpeed}</span>
              </div>
              <Slider.Root
                value={[animations.autoScrollSpeed]}
                onValueChange={handleScrollSpeedChange}
                min={10}
                max={200}
                step={5}
                className="relative flex items-center h-5"
              >
                <Slider.Track className="bg-white/20 rounded-full h-1 flex-1">
                  <Slider.Range className="bg-white rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50" />
              </Slider.Root>
            </div>

            {/* Font Size */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <label className="text-white/70">Font Size</label>
                <span className="text-white font-mono">{typography.fontSize}px</span>
              </div>
              <Slider.Root
                value={[typography.fontSize]}
                onValueChange={handleFontSizeChange}
                min={12}
                max={120}
                step={2}
                className="relative flex items-center h-5"
              >
                <Slider.Track className="bg-white/20 rounded-full h-1 flex-1">
                  <Slider.Range className="bg-white rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50" />
              </Slider.Root>
            </div>

            {/* Alignment */}
            <div className="space-y-2 mb-6">
              <label className="text-white/70 text-sm">Alignment</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'] as const}.map((align) => (
                  <button
                    key={align}
                    onClick={() => handleAlignmentChange(align)}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg",
                      "text-sm font-medium capitalize",
                      "transition-all",
                      layout.textAlign === align
                        ? "bg-white text-black"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    )}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Background URL */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm">Background URL</label>
              <input
                type="url"
                value={bgUrl}
                onChange={(e) => handleBackgroundChange(e.target.value)}
                placeholder="Enter image URL..."
                className={cn(
                  "w-full px-3 py-2 rounded-lg",
                  "bg-white/10 text-white",
                  "placeholder:text-white/40",
                  "border border-white/20 focus:border-white/40",
                  "focus:outline-none transition-all"
                )}
              />
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

---

## 6. Testing Setup

### Create Store Mocks

**useContentStore Mock** (`__tests__/mocks/stores/content-store.mock.ts`):

```typescript
import { renderHook } from '@testing-library/react'
import { useContentStore } from '@/lib/stores/useContentStore'

export const mockContentStoreState = {
  text: 'Test text content',
  bgUrl: 'https://example.com/bg.jpg',
  musicUrl: 'https://example.com/music.mp3',
  isReadOnly: false
}

export function mockUseContentStore() {
  return {
    ...mockContentStoreState,
    setText: jest.fn(),
    setBgUrl: jest.fn(),
    setMusicUrl: jest.fn(),
    setIsReadOnly: jest.fn(),
    setAll: jest.fn(),
    reset: jest.fn()
  }
}

// Mock the hook
jest.mock('@/lib/stores/useContentStore', () => ({
  useContentStore: jest.fn()
}))

export function useMockContentStore(state = mockContentStoreState) {
  ;(useContentStore as jest.Mock).mockReturnValue(state)
  return renderHook(() => useContentStore())
}
```

**usePlaybackStore Mock** (`__tests__/mocks/stores/playback-store.mock.ts`):

```typescript
import { renderHook } from '@testing-library/react'
import { usePlaybackStore } from '@/lib/stores/usePlaybackStore'

export const mockPlaybackStoreState = {
  isPlaying: false,
  currentTime: 0,
  scrollSpeed: 1
}

export function mockUsePlaybackStore() {
  return {
    ...mockPlaybackStoreState,
    setIsPlaying: jest.fn(),
    togglePlaying: jest.fn(),
    setCurrentTime: jest.fn(),
    setScrollSpeed: jest.fn(),
    reset: jest.fn()
  }
}

jest.mock('@/lib/stores/usePlaybackStore', () => ({
  usePlaybackStore: jest.fn()
}))

export function useMockPlaybackStore(state = mockPlaybackStoreState) {
  ;(usePlaybackStore as jest.Mock).mockReturnValue(state)
  return renderHook(() => usePlaybackStore())
}
```

### Update Existing Mocks

Update existing mocks to remove useTeleprompterStore references:

```typescript
// __tests__/mocks/stores/teleprompter-store.mock.ts
// DEPRECATED - This store is being removed
// Keep file temporarily for backward compatibility during migration
// Delete after all tests are migrated

export const mockTeleprompterStoreState = {
  // Legacy properties - DO NOT USE IN NEW TESTS
  text: 'Test text',
  fontSize: 48,
  // ... etc
}

// Log deprecation warning
console.warn('useTeleprompterStore is deprecated. Use useContentStore, useConfigStore, usePlaybackStore, or useUIStore instead.')
```

### Example Test

```typescript
// __tests__/integration/runner-quick-settings.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickSettingsPanel } from '@/components/teleprompter/runner/QuickSettingsPanel'
import { useMockContentStore } from '@/__tests__/mocks/stores/content-store.mock'
import { useMockConfigStore } from '@/__tests__/mocks/stores/config-store.mock'

describe('QuickSettingsPanel', () => {
  beforeEach(() => {
    useMockContentStore()
    useMockConfigStore()
  })

  it('updates scroll speed when slider changes', () => {
    const { setAnimations } = useConfigStore.getState()
    
    render(<QuickSettingsPanel />)
    
    const slider = screen.getByRole('slider', { name: /scroll speed/i })
    fireEvent.change(slider, { target: { value: '100' } })
    
    expect(setAnimations).toHaveBeenCalledWith({ autoScrollSpeed: 100 })
  })

  it('shows toast error on invalid font size', () => {
    const toastSpy = jest.spyOn(require('sonner'), 'toast')
    
    render(<QuickSettingsPanel />)
    
    // Simulate invalid value
    const fontSize = 150 // Exceeds max of 120
    // ... trigger change
    
    expect(toastSpy).toHaveBeenCalledWith(
      expect.stringContaining('Font size must be between 12 and 120'),
      expect.any(Object)
    )
  })
})
```

---

## 7. Running Tests

```bash
# Run all tests
npm test

# Run tests for specific store
npm test -- contentStore
npm test -- playbackStore

# Run tests for specific component
npm test -- QuickSettingsPanel

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

---

## 8. Common Development Tasks

### Adding a New Config Property

1. **Add to ConfigStore interface** (`lib/stores/useConfigStore.ts`)
2. **Add to default config** (e.g., `defaultEffects`)
3. **Add to persist partialize** (if persisting)
4. **Update TeleprompterText component** to use the new property

### Adding a New Quick Setting

1. **Add UI control to QuickSettingsPanel**
2. **Add handler with error handling and toast notifications**
3. **Add modification tracking** (for visual indication in Editor)
4. **Add tests** for the new setting

### Debugging State Issues

```typescript
// Enable Zustand devtools
import { devtools } from 'zustand/middleware'

export const useContentStore = create<ContentStore>()(
  devtools(
    persist(
      (set) => ({ /* ... */ }),
      { name: 'teleprompter-content' }
    ),
    { name: 'ContentStore' }
  )
)
```

```typescript
// Log state changes
useContentStore.subscribe(
  (state) => state.text,
  (text) => console.log('Text changed:', text)
)
```

---

## 9. Troubleshooting

### Issue: Components not re-rendering on state change

**Solution**: Make sure you're using the store hook correctly:

```typescript
// ❌ Wrong - Destructuring outside component
const { setText } = useContentStore

function Component() {
  setText('new') // Won't trigger re-render
}

// ✅ Correct - Call hook inside component
function Component() {
  const { setText } = useContentStore()
  setText('new') // Triggers re-render
}
```

### Issue: State not persisting to localStorage

**Solution**: Check that the store is using the persist middleware and the partialize function includes the state:

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'teleprompter-content',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      text: state.text,
      bgUrl: state.bgUrl,
      musicUrl: state.musicUrl,
      isReadOnly: state.isReadOnly
    })
  }
)
```

### Issue: Quick Settings changes not reflecting in Editor

**Solution**: Zustand's pub/sub should handle this automatically. If not working:

1. Check that both components are using the same store instance
2. Verify the store action is being called correctly
3. Check browser console for errors
4. Try unsubscribing and resubscribing

---

## 10. Next Steps

After completing the quickstart:

1. **Review the full spec**: `specs/007-unified-state-architecture/spec.md`
2. **Review the data model**: `specs/007-unified-state-architecture/data-model.md`
3. **Review the contracts**: `specs/007-unified-state-architecture/contracts/store-contracts.md`
4. **Run the test suite**: Ensure all tests pass
5. **Update documentation**: Add any project-specific notes

---

## Summary Checklist

- [ ] Create `lib/stores/useContentStore.ts`
- [ ] Create `lib/stores/usePlaybackStore.ts`
- [ ] Extend `stores/useUIStore.ts` with `mode` property
- [ ] Extend `lib/stores/useConfigStore.ts` with `overlayOpacity`
- [ ] Create `components/teleprompter/runner/QuickSettingsPanel.tsx`
- [ ] Create store mocks in `__tests__/mocks/stores/`
- [ ] Update `Runner.tsx` to use new stores
- [ ] Update `ContentPanel.tsx` to use useContentStore
- [ ] Update all test files to use new mocks
- [ ] Remove `stores/useTeleprompterStore.ts` after migration
- [ ] Run tests and ensure 100% pass rate
- [ ] Verify visual consistency between Editor and Runner
