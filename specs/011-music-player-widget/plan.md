# Technical Implementation Plan: Floating Music Player Widget

**Feature Branch**: `011-music-player-widget`  
**Created**: 2026-01-03  
**Status**: Draft  
**Author**: Technical Plan from Spec Analysis

---

## Executive Summary

This plan details the implementation of a Floating Music Player Widget for the teleprompter's Runner mode. The widget will feature three distinct visual styles (Capsule, Vinyl, Spectrum), draggable positioning with persistence, and seamless integration with the existing audio infrastructure.

**Key Technical Decisions**:
- New Zustand store (`useMusicWidgetStore`) for widget-specific state
- Framer Motion for drag physics (reusing DraggableCamera patterns)
- Extend existing UniversalAudioPlayer for playback
- Three style components with shared base widget logic
- Web Audio API for real-time frequency visualization (Spectrum style)

---

## Architecture Overview

### Component Hierarchy

```
Runner
├── UniversalAudioPlayer (existing, hidden)
├── MusicPlayerWidget (NEW)
│   ├── DraggableMusicWidget (NEW)
│   │   ├── CapsuleStyle (NEW)
│   │   ├── VinylStyle (NEW)
│   │   └── SpectrumStyle (NEW)
│   └── MusicControls (NEW)
└── QuickSettingsPanel (existing)

MediaTab (MODIFIED)
├── Background Music Section (existing)
└── Music Widget Configuration (NEW)
    ├── Widget Style Selector (NEW)
    ├── Style Previews (NEW)
    └── Configuration Help (NEW)
```

### State Management

```typescript
// New Store
useMusicWidgetStore (NEW)
├── widgetStyle: 'capsule' | 'vinyl' | 'spectrum'
├── widgetPosition: { x: number; y: number }
├── isWidgetVisible: boolean
├── playbackState: 'playing' | 'paused' | 'error'
├── errorMessage?: string

// Existing Stores (No Changes)
useContentStore
├── musicUrl: string (already exists)

useConfigStore
├── (no changes needed)

usePlaybackStore
├── (no changes needed)
```

---

## File Structure

### New Files to Create

```
components/teleprompter/music/
├── MusicPlayerWidget.tsx           # Main widget container
├── DraggableMusicWidget.tsx        # Draggable wrapper
├── styles/
│   ├── CapsuleStyle.tsx            # Pill-shaped glassmorphic style
│   ├── VinylStyle.tsx              # Rotating vinyl record style
│   └── SpectrumStyle.tsx           # Audio frequency bars style
└── MusicControls.tsx               # Play/pause controls (shared)

components/teleprompter/config/music/
├── MusicWidgetConfig.tsx           # Widget configuration in settings
└── StylePreview.tsx                # Interactive style previews

lib/stores/
└── useMusicWidgetStore.ts          # Widget state management

hooks/
└── useAudioVisualization.ts        # Web Audio API hook for spectrum

types/
└── music-widget.ts                 # TypeScript types
```

### Files to Modify

```
components/teleprompter/Runner.tsx        # Add MusicPlayerWidget
components/teleprompter/config/media/MediaTab.tsx  # Add widget config
components/teleprompter/audio/AudioPlayer.tsx     # Potentially enhance error handling
lib/stores/useContentStore.ts            # Already has musicUrl, verify no changes needed
```

---

## Implementation Tasks by Priority

### Phase 1: Foundation (P1 - Week 1)

#### Task 1.1: Create Type Definitions
**File**: `types/music-widget.ts`

```typescript
export type WidgetStyle = 'capsule' | 'vinyl' | 'spectrum';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface MusicWidgetConfig {
  style: WidgetStyle;
  position: WidgetPosition;
  visible: boolean;
}

export interface MusicWidgetState {
  config: MusicWidgetConfig;
  playbackState: 'playing' | 'paused' | 'error';
  errorMessage?: string;
}
```

**Acceptance**:
- [ ] All types exported and usable
- [ ] TypeScript strict mode passes
- [ ] JSDoc comments for all exports

---

#### Task 1.2: Create Music Widget Store
**File**: `lib/stores/useMusicWidgetStore.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { WidgetStyle, WidgetPosition, MusicWidgetConfig } from '@/types/music-widget';

const DEFAULT_POSITION = { x: 20, y: 20 }; // Bottom-left default
const DEFAULT_STYLE: WidgetStyle = 'capsule';

interface MusicWidgetStore {
  // State
  style: WidgetStyle;
  position: WidgetPosition;
  isVisible: boolean;
  playbackState: 'playing' | 'paused' | 'error';
  errorMessage?: string;

  // Actions
  setStyle: (style: WidgetStyle) => void;
  setPosition: (position: WidgetPosition) => void;
  setIsVisible: (visible: boolean) => void;
  setPlaybackState: (state: 'playing' | 'paused' | 'error') => void;
  setError: (message?: string) => void;
  reset: () => void;
}

export const useMusicWidgetStore = create<MusicWidgetStore>()(
  persist(
    (set) => ({
      // Initial state
      style: DEFAULT_STYLE,
      position: DEFAULT_POSITION,
      isVisible: false, // Only show when music is configured
      playbackState: 'paused',
      errorMessage: undefined,

      // Actions
      setStyle: (style) => set({ style }),
      setPosition: (position) => set({ position }),
      setIsVisible: (isVisible) => set({ isVisible }),
      setPlaybackState: (playbackState) => set({ playbackState }),
      setError: (errorMessage) => set({ errorMessage }),
      reset: () => set({
        style: DEFAULT_STYLE,
        position: DEFAULT_POSITION,
        isVisible: false,
        playbackState: 'paused',
        errorMessage: undefined,
      }),
    }),
    {
      name: 'music-widget-config',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        style: state.style,
        position: state.position,
        isVisible: state.isVisible,
      }),
    }
  )
);
```

**Acceptance**:
- [ ] Store persists to localStorage key 'music-widget-config'
- [ ] Default style is 'capsule'
- [ ] Position defaults to bottom-left
- [ ] Widget visibility defaults to false
- [ ] All actions work correctly
- [ ] State survives page refresh

---

#### Task 1.3: Create Base Draggable Widget
**File**: `components/teleprompter/music/DraggableMusicWidget.tsx`

Reference: [`DraggableCamera.tsx`](components/teleprompter/camera/DraggableCamera.tsx:1-188)

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useDragControls, PanInfo } from 'framer-motion';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';
import { cn } from '@/lib/utils';

const WIDGET_WIDTH = 200;
const WIDGET_HEIGHT = 80;

interface DraggableMusicWidgetProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function DraggableMusicWidget({ children, style }: DraggableMusicWidgetProps) {
  const { position, setPosition } = useMusicWidgetStore();
  const [isDragging, setIsDragging] = useState(false);
  const dragControls = useDragControls();
  const hasLoadedPosition = useRef(false);

  // Bound position to keep widget on screen (50% visibility rule)
  const boundPosition = useCallback((x: number, y: number) => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }

    // Keep at least 50% of widget visible
    const maxX = window.innerWidth - WIDGET_WIDTH / 2;
    const maxY = window.innerHeight - WIDGET_HEIGHT / 2;
    const minX = -WIDGET_WIDTH / 2;
    const minY = -WIDGET_HEIGHT / 2;

    return {
      x: Math.max(minX, Math.min(x, maxX)),
      y: Math.max(minY, Math.min(y, maxY)),
    };
  }, []);

  // Load saved position on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasLoadedPosition.current) {
      try {
        const saved = useMusicWidgetStore.getState().position;
        const bounded = boundPosition(saved.x, saved.y);
        if (bounded.x !== saved.x || bounded.y !== saved.y) {
          setPosition(bounded);
        }
      } catch {
        // Fallback to default
        setPosition({ x: 20, y: window.innerHeight - 100 });
      }
      hasLoadedPosition.current = true;
    }
  }, [boundPosition, setPosition]);

  // Handle drag end with position bounds and persistence
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      
      const newX = position.x + info.offset.x;
      const newY = position.y + info.offset.y;

      const boundedPos = boundPosition(newX, newY);
      setPosition(boundedPos);
    },
    [position, boundPosition, setPosition]
  );

  // Handle drag start for visual feedback
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Handle window resize to keep widget in bounds
  useEffect(() => {
    const handleResize = () => {
      const bounded = boundPosition(position.x, position.y);
      if (bounded.x !== position.x || bounded.y !== position.y) {
        setPosition(bounded);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, boundPosition, setPosition]);

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragMomentum={false} // No inertia for music widget (unlike camera)
      dragElastic={0}
      dragConstraints={{
        left: -WIDGET_WIDTH / 2,
        right: typeof window !== 'undefined' ? window.innerWidth - WIDGET_WIDTH / 2 : 0,
        top: -WIDGET_HEIGHT / 2,
        bottom: typeof window !== 'undefined' ? window.innerHeight - WIDGET_HEIGHT / 2 : 0,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={{
        x: position.x,
        y: position.y,
      }}
      className="fixed z-[100] top-0 left-0"
      style={{
        touchAction: 'none',
        ...style,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 1.05 }}
    >
      <motion.div
        className={cn(
          'rounded-2xl overflow-hidden transition-shadow',
          isDragging ? 'shadow-2xl ring-4 ring-pink-500/30' : 'shadow-lg'
        )}
        animate={{
          boxShadow: isDragging
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Drag Handle Indicator */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/10 to-transparent z-30 cursor-move flex items-center justify-center group">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 bg-white/70 rounded-full" />
            <div className="w-1 h-1 bg-white/70 rounded-full" />
            <div className="w-1 h-1 bg-white/70 rounded-full" />
          </div>
        </div>

        {children}
      </motion.div>
    </motion.div>
  );
}
```

**Acceptance**:
- [ ] Widget is draggable via mouse and touch
- [ ] Position persists to localStorage
- [ ] 50% visibility rule enforced
- [ ] Resize handling keeps widget on screen
- [ ] Visual feedback during drag
- [ ] No inertia (instant stop on release)
- [ ] z-index of 100 (above teleprompter text)

---

#### Task 1.4: Create Music Controls Component
**File**: `components/teleprompter/music/MusicControls.tsx`

```typescript
'use client';

import { Play, Pause, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';
import { useContentStore } from '@/lib/stores/useContentStore';
import { usePlaybackStore } from '@/lib/stores/usePlaybackStore';

interface MusicControlsProps {
  onTogglePlayPause: () => void;
  compact?: boolean;
}

export function MusicControls({ onTogglePlayPause, compact = false }: MusicControlsProps) {
  const { playbackState, errorMessage } = useMusicWidgetStore();
  const { musicUrl } = useContentStore();
  const { isPlaying: isTeleprompterPlaying } = usePlaybackStore();

  const isPlaying = playbackState === 'playing';

  if (errorMessage) {
    return (
      <button
        onClick={onTogglePlayPause}
        className={cn(
          "flex items-center justify-center gap-2",
          compact ? "p-2" : "p-3"
        )}
        aria-label="Music error, click to retry"
      >
        <AlertCircle size={compact ? 16 : 20} className="text-red-400" />
      </button>
    );
  }

  return (
    <button
      onClick={onTogglePlayPause}
      disabled={!musicUrl}
      className={cn(
        "flex items-center justify-center transition-all",
        compact
          ? "p-2 hover:bg-white/10 rounded-lg"
          : "p-3 hover:bg-white/10 rounded-xl",
        !musicUrl && "opacity-50 cursor-not-allowed"
      )}
      aria-label={isPlaying ? "Pause music" : "Play music"}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <Pause size={compact ? 16 : 20} fill="currentColor" />
      ) : (
        <Play size={compact ? 16 : 20} fill="currentColor" className="ml-0.5" />
      )}
    </button>
  );
}
```

**Acceptance**:
- [ ] Play/pause button toggles playback
- [ ] Disabled when no music configured
- [ ] Error state shows alert icon
- [ ] Compact and full-size variants
- [ ] Accessible ARIA labels

---

### Phase 2: Visual Styles (P2 - Week 2)

#### Task 2.1: Create Capsule Style Component
**File**: `components/teleprompter/music/styles/CapsuleStyle.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { MusicControls } from '../MusicControls';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export function CapsuleStyle() {
  const { playbackState } = useMusicWidgetStore();
  const isPlaying = playbackState === 'playing';
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleTogglePlayPause = () => {
    const state = useMusicWidgetStore.getState();
    // This will be connected to actual audio player
    const newState = state.playbackState === 'playing' ? 'paused' : 'playing';
    state.setPlaybackState(newState);
  };

  return (
    <motion.div
      className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 flex items-center gap-4"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
      animate={
        prefersReducedMotion
          ? {}
          : {
              boxShadow: isPlaying
                ? [
                    '0 8px 32px rgba(236, 72, 153, 0.3)',
                    '0 8px 40px rgba(236, 72, 153, 0.5)',
                    '0 8px 32px rgba(236, 72, 153, 0.3)',
                  ]
                : '0 8px 32px rgba(0, 0, 0, 0.3)',
              opacity: isPlaying ? 1 : 0.7,
            }
      }
      transition={{
        duration: isPlaying ? 2 : 0.3,
        repeat: isPlaying ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      {/* Music icon with animation */}
      <motion.div
        animate={
          prefersReducedMotion
            ? {}
            : {
                scale: isPlaying ? [1, 1.2, 1] : 1,
              }
        }
        transition={{
          duration: 1,
          repeat: isPlaying ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        <MusicControls onTogglePlayPause={handleTogglePlayPause} />
      </motion.div>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full transition-all",
            isPlaying ? "bg-green-400" : "bg-white/50"
          )}
        />
        <span className="text-xs text-white/80 font-medium">
          {isPlaying ? "Playing" : "Paused"}
        </span>
      </div>
    </motion.div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}
```

**Acceptance**:
- [ ] Glassmorphic pill shape with backdrop blur
- [ ] Pulsing glow effect when playing (syncs to simulated rhythm)
- [ ] Reduced opacity when paused
- [ ] Respects prefers-reduced-motion
- [ ] Smooth transitions between states

---

#### Task 2.2: Create Vinyl Style Component
**File**: `components/teleprompter/music/styles/VinylStyle.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { MusicControls } from '../MusicControls';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

export function VinylStyle() {
  const { playbackState } = useMusicWidgetStore();
  const isPlaying = playbackState === 'playing';
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const handleTogglePlayPause = () => {
    const state = useMusicWidgetStore.getState();
    const newState = state.playbackState === 'playing' ? 'paused' : 'playing';
    state.setPlaybackState(newState);
  };

  return (
    <motion.div
      className="relative rounded-full"
      style={{
        width: 120,
        height: 120,
        background: `
          radial-gradient(circle at center, #1a1a1a 15%, transparent 16%),
          radial-gradient(circle at center, #333 16%, #1a1a1a 17%),
          repeating-radial-gradient(
            circle at center,
            transparent 0,
            transparent 2px,
            rgba(255,255,255,0.03) 2px,
            rgba(255,255,255,0.03) 4px
          ),
          linear-gradient(135deg, #2d2d2d, #1a1a1a)
        `,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Rotating vinyl record */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={
          prefersReducedMotion
            ? {}
            : {
                rotate: isPlaying ? 360 : 0,
              }
        }
        transition={{
          duration: isPlaying ? 3 : 0.5,
          ease: isPlaying ? 'linear' : 'easeOut',
          repeat: isPlaying ? Infinity : 0,
        }}
        style={{
          background: `
            repeating-radial-gradient(
              circle at center,
              transparent 0,
              transparent 1px,
              rgba(255,255,255,0.05) 1px,
              rgba(255,255,255,0.05) 2px
            )
          `,
        }}
      />

      {/* Center label */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={
          prefersReducedMotion
            ? {}
            : {
                rotate: isPlaying ? -360 : 0,
              }
        }
        transition={{
          duration: isPlaying ? 3 : 0.5,
          ease: isPlaying ? 'linear' : 'easeOut',
          repeat: isPlaying ? Infinity : 0,
        }}
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-pink-500 to-violet-600"
          )}
          style={{
            width: 48,
            height: 48,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <MusicControls
            onTogglePlayPause={handleTogglePlayPause}
            compact
          />
        </div>
      </motion.div>

      {/* Groove overlay */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `
            repeating-radial-gradient(
              circle at center,
              transparent 0,
              transparent 8px,
              rgba(0,0,0,0.1) 8px,
              rgba(0,0,0,0.1) 9px
            )
          `,
        }}
      />
    </motion.div>
  );
}
```

**Acceptance**:
- [ ] Circular vinyl record appearance with grooves
- [ ] Continuous rotation when playing (3-second duration)
- [ ] Gradual deceleration animation when paused
- [ ] Center label with counter-rotation
- [ ] Respects prefers-reduced-motion

---

#### Task 2.3: Create Spectrum Style Component
**File**: `components/teleprompter/music/styles/SpectrumStyle.tsx`

```typescript
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MusicControls } from '../MusicControls';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAudioVisualization } from '@/hooks/useAudioVisualization';
import { cn } from '@/lib/utils';

const BAR_COUNT = 12;
const BAR_WIDTH = 8;
const BAR_GAP = 4;
const MAX_BAR_HEIGHT = 60;

export function SpectrumStyle() {
  const { playbackState } = useMusicWidgetStore();
  const isPlaying = playbackState === 'playing';
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // Get frequency data from audio visualization hook
  const { frequencies, isConnected } = useAudioVisualization(isPlaying);
  
  const handleTogglePlayPause = () => {
    const state = useMusicWidgetStore.getState();
    const newState = state.playbackState === 'playing' ? 'paused' : 'playing';
    state.setPlaybackState(newState);
  };

  // Calculate bar heights based on frequency data
  const getBarHeight = (index: number) => {
    if (!isPlaying || prefersReducedMotion || !frequencies) {
      return 8; // Baseline height
    }
    
    const freqIndex = Math.floor((index / BAR_COUNT) * frequencies.length);
    const value = frequencies[freqIndex] || 0;
    return Math.max(8, (value / 255) * MAX_BAR_HEIGHT);
  };

  return (
    <motion.div
      className="relative bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Spectrum bars */}
      <div className="flex items-end gap-1" style={{ height: MAX_BAR_HEIGHT }}>
        {Array.from({ length: BAR_COUNT }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "rounded-t-sm",
              isPlaying
                ? "bg-gradient-to-t from-pink-500 to-violet-500"
                : "bg-white/30"
            )}
            style={{
              width: BAR_WIDTH,
            }}
            animate={
              prefersReducedMotion
                ? { height: 8 }
                : {
                    height: getBarHeight(index),
                  }
            }
            transition={{
              duration: 0.1,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 pl-2 border-l border-white/10">
        <MusicControls
          onTogglePlayPause={handleTogglePlayPause}
          compact
        />
        
        {/* Connection status indicator */}
        <motion.div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            isConnected && isPlaying ? "bg-green-400" : "bg-white/30"
          )}
          animate={
            prefersReducedMotion || !isPlaying
              ? {}
              : {
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </motion.div>
  );
}
```

**Acceptance**:
- [ ] 12 vertical frequency bars
- [ ] Real-time height animation based on audio frequencies
- [ ] Baseline flat line when paused
- [ ] Gradient colors when playing
- [ ] Connection status indicator
- [ ] Respects prefers-reduced-motion

---

#### Task 2.4: Create Audio Visualization Hook
**File**: `hooks/useAudioVisualization.ts`

```typescript
import { useEffect, useRef, useState } from 'react';

interface UseAudioVisualizationReturn {
  frequencies: Uint8Array | null;
  isConnected: boolean;
}

export function useAudioVisualization(
  enabled: boolean
): UseAudioVisualizationReturn {
  const [frequencies, setFrequencies] = useState<Uint8Array | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Cleanup when disabled
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setFrequencies(null);
      setIsConnected(false);
      return;
    }

    // Find the audio element
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    if (!audioElement) {
      return;
    }

    // Initialize Audio Context
    const initAudioContext = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        
        analyser.fftSize = 256; // Balance between detail and performance
        const bufferLength = analyser.frequencyBinCount;
        
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setIsConnected(true);

        // Start animation loop
        const dataArray = new Uint8Array(bufferLength);
        
        const updateFrequencies = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            setFrequencies(new Uint8Array(dataArray));
          }
          animationFrameRef.current = requestAnimationFrame(updateFrequencies);
        };
        
        updateFrequencies();
      } catch (error) {
        console.error('Failed to initialize audio visualization:', error);
        setIsConnected(false);
      }
    };

    // Wait for audio to be ready
    if (audioElement.readyState >= 2) {
      initAudioContext();
    } else {
      audioElement.addEventListener('canplay', initAudioContext, { once: true });
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [enabled]);

  return { frequencies, isConnected };
}
```

**Acceptance**:
- [ ] Connects to existing audio element
- [ ] Returns frequency data array
- [ ] Updates on requestAnimationFrame
- [ ] Properly cleans up resources
- [ ] Handles errors gracefully
- [ ] Works with both YouTube and native audio

---

### Phase 3: Integration (P2 - Week 2)

#### Task 3.1: Create Main Music Player Widget Component
**File**: `components/teleprompter/music/MusicPlayerWidget.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { DraggableMusicWidget } from './DraggableMusicWidget';
import { CapsuleStyle } from './styles/CapsuleStyle';
import { VinylStyle } from './styles/VinylStyle';
import { SpectrumStyle } from './styles/SpectrumStyle';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';
import { useContentStore } from '@/lib/stores/useContentStore';

export function MusicPlayerWidget() {
  const { style, isVisible, setIsVisible, setPlaybackState } = useMusicWidgetStore();
  const { musicUrl } = useContentStore();

  // Auto-show widget when music is configured
  useEffect(() => {
    if (musicUrl && !isVisible) {
      setIsVisible(true);
    } else if (!musicUrl && isVisible) {
      setIsVisible(false);
    }
  }, [musicUrl, isVisible, setIsVisible]);

  // Sync playback state with actual audio element
  useEffect(() => {
    const audioElement = document.querySelector('audio') as HTMLAudioElement;
    if (!audioElement) return;

    const handlePlay = () => setPlaybackState('playing');
    const handlePause = () => setPlaybackState('paused');
    const handleError = () => setPlaybackState('error');

    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('error', handleError);
    };
  }, [setPlaybackState]);

  if (!isVisible || !musicUrl) {
    return null;
  }

  const renderStyle = () => {
    switch (style) {
      case 'capsule':
        return <CapsuleStyle />;
      case 'vinyl':
        return <VinylStyle />;
      case 'spectrum':
        return <SpectrumStyle />;
      default:
        return <CapsuleStyle />;
    }
  };

  return <DraggableMusicWidget>{renderStyle()}</DraggableMusicWidget>;
}
```

**Acceptance**:
- [ ] Only shows when musicUrl is configured
- [ ] Renders correct style based on store
- [ ] Syncs playback state with actual audio
- [ ] Properly cleans up event listeners

---

#### Task 3.2: Integrate Widget into Runner
**File**: `components/teleprompter/Runner.tsx`

**Changes needed**:

1. Import the widget:
```typescript
import { MusicPlayerWidget } from '@/components/teleprompter/music/MusicPlayerWidget';
```

2. Add keyboard shortcut handler (around line 76):
```typescript
// Existing keyboard shortcut handler
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl+K or Cmd+K to toggle Quick Settings
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setQuickSettingsOpen(prev => !prev)
    }
    
    // M key to toggle music playback (NEW)
    if (e.key === 'm' || e.key === 'M') {
      if (musicUrl) {
        e.preventDefault()
        setIsMusicPlaying(!isMusicPlaying)
      }
    }
  }

  document.addEventListener('keydown', handleKeyPress)
  return () => {
    document.removeEventListener('keydown', handleKeyPress)
  }
}, [isMusicPlaying, musicUrl])
```

3. Add widget to JSX (before QuickSettingsPanel):
```typescript
{/* Music Player Widget */}
<MusicPlayerWidget />

{/* T032 [US2]: Quick Settings Panel */}
<QuickSettingsPanel
  open={quickSettingsOpen}
  onOpenChange={setQuickSettingsOpen}
/>
```

**Acceptance**:
- [ ] Widget appears when music is configured
- [ ] M key toggles music playback
- [ ] Widget doesn't interfere with existing controls
- [ ] Widget is visible above teleprompter text

---

#### Task 3.3: Add Widget Configuration to MediaTab
**File**: `components/teleprompter/config/media/MediaTab.tsx`

**Add new section after music URL/upload**:

```typescript
{/* Widget Style Configuration */}
{musicUrl && (
  <div className="space-y-3 pt-4 border-t border-border">
    <div className="flex items-center justify-between">
      <label className="text-xs font-semibold text-muted-foreground uppercase">
        {t('widgetStyle') || 'Widget Style'}
      </label>
      <span className="text-xs text-primary font-medium">
        {t('previewMode') || 'Preview'}
      </span>
    </div>
    
    <div className="grid grid-cols-3 gap-3">
      {/* Capsule Style Option */}
      <button
        onClick={() => useMusicWidgetStore.getState().setStyle('capsule')}
        className={cn(
          "relative p-3 rounded-lg border-2 transition-all",
          widgetStyle === 'capsule'
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="aspect-[3/1] bg-white/10 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-pink-500/50" />
        </div>
        <span className="block mt-2 text-xs font-medium">
          {t('capsule') || 'Capsule'}
        </span>
      </button>

      {/* Vinyl Style Option */}
      <button
        onClick={() => useMusicWidgetStore.getState().setStyle('vinyl')}
        className={cn(
          "relative p-3 rounded-lg border-2 transition-all",
          widgetStyle === 'vinyl'
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-pink-500" />
        </div>
        <span className="block mt-2 text-xs font-medium">
          {t('vinyl') || 'Vinyl'}
        </span>
      </button>

      {/* Spectrum Style Option */}
      <button
        onClick={() => useMusicWidgetStore.getState().setStyle('spectrum')}
        className={cn(
          "relative p-3 rounded-lg border-2 transition-all",
          widgetStyle === 'spectrum'
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="flex items-end justify-center gap-0.5 h-12">
          {[1, 2, 3, 4, 5].map((h) => (
            <div
              key={h}
              className="w-1 bg-gradient-to-t from-pink-500 to-violet-500 rounded-t"
              style={{ height: `${h * 4 + 4}px` }}
            />
          ))}
        </div>
        <span className="block mt-2 text-xs font-medium">
          {t('spectrum') || 'Spectrum'}
        </span>
      </button>
    </div>

    <p className="text-xs text-muted-foreground">
      {t('widgetStyleDescription') || 'Choose how your music player appears during recording.'}
    </p>
  </div>
)}
```

**Also add import at top**:
```typescript
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';
```

**And inside component**:
```typescript
const { style: widgetStyle } = useMusicWidgetStore();
```

**Acceptance**:
- [ ] Section only shows when musicUrl is configured
- [ ] Three style options with visual previews
- [ ] Selected style is highlighted
- [ ] Clicking a style updates the store
- [ ] Changes persist to localStorage

---

### Phase 4: Error Handling & Edge Cases (P3 - Week 3)

#### Task 4.1: Enhanced Error Handling in UniversalAudioPlayer
**File**: `components/teleprompter/audio/AudioPlayer.tsx`

Add error callback handling:

```typescript
// In NativeAudioStrategy
<audio
  ref={audioRef}
  src={url}
  loop={loop}
  onError={(e) => {
    console.error('Audio playback error:', e);
    // Notify music widget of error state
    useMusicWidgetStore.getState().setError('Playback failed');
  }}
/>

// In YouTubeStrategy
<Player
  onError={(e: Error | unknown) => {
    console.error("[AudioPlayer] Player Error", e);
    useMusicWidgetStore.getState().setError('YouTube playback failed');
  }}
  // ... other props
/>
```

**Acceptance**:
- [ ] Native audio errors propagate to widget
- [ ] YouTube errors propagate to widget
- [ ] Error messages are user-friendly
- [ ] Errors can be cleared on retry

---

#### Task 4.2: Storage Quota Handling
**File**: `hooks/useFileUpload.ts` (already exists, verify it handles quota)

Verify the existing hook already handles storage quota errors. If not, add:

```typescript
} catch (error: unknown) {
  console.error(error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  // Check for quota errors
  if (errorMessage.includes('Quota') || errorMessage.includes('storage')) {
    toast.error("Storage quota exceeded. Please upgrade or delete existing files.", { id: toastId });
  } else {
    toast.error("Upload failed: " + errorMessage, { id: toastId });
  }
  return null;
}
```

**Acceptance**:
- [ ] Quota errors are caught and displayed
- [ ] User gets clear recovery options
- [ ] Pro users see upgrade prompt

---

#### Task 4.3: Tab Collision Detection
**File**: `components/teleprompter/music/MusicPlayerWidget.tsx`

Add broadcast channel for tab synchronization:

```typescript
useEffect(() => {
  const channel = new BroadcastChannel('music-player-sync');
  
  // Pause music in other tabs when playing here
  if (isPlaying) {
    channel.postMessage({ action: 'pause' });
  }
  
  // Listen for messages from other tabs
  channel.onmessage = (event) => {
    if (event.data.action === 'pause') {
      setIsMusicPlaying(false);
    }
  };
  
  return () => {
    channel.close();
  };
}, [isPlaying, setIsMusicPlaying]);
```

**Acceptance**:
- [ ] Playing in one tab pauses others
- [ ] Works across multiple tabs
- [ ] Channel properly closes on unmount

---

#### Task 4.4: Window Resize Handling
Already implemented in `DraggableMusicWidget.tsx` (Task 1.3).

**Acceptance**:
- [ ] Widget stays on screen after resize
- [ ] Relative position maintained when possible
- [ ] No flickering during resize

---

### Phase 5: Testing (P3 - Week 3)

#### Task 5.1: Unit Tests

**File**: `__tests__/unit/music/music-widget-store.test.ts`

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { act } from 'react';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';

describe('useMusicWidgetStore', () => {
  beforeEach(() => {
    useMusicWidgetStore.getState().reset();
  });

  it('should have default style as capsule', () => {
    const state = useMusicWidgetStore.getState();
    expect(state.style).toBe('capsule');
  });

  it('should update style', () => {
    act(() => {
      useMusicWidgetStore.getState().setStyle('vinyl');
    });
    expect(useMusicWidgetStore.getState().style).toBe('vinyl');
  });

  it('should update position', () => {
    act(() => {
      useMusicWidgetStore.getState().setPosition({ x: 100, y: 200 });
    });
    expect(useMusicWidgetStore.getState().position).toEqual({ x: 100, y: 200 });
  });

  it('should persist to localStorage', () => {
    act(() => {
      useMusicWidgetStore.getState().setStyle('spectrum');
    });
    
    const saved = localStorage.getItem('music-widget-config');
    expect(saved).toContain('spectrum');
  });
});
```

**File**: `__tests__/unit/music/music-controls.test.tsx`

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MusicControls } from '@/components/teleprompter/music/MusicControls';

describe('MusicControls', () => {
  it('should render play button when paused', () => {
    render(<MusicControls onTogglePlayPause={() => {}} />);
    expect(screen.getByLabelText('Play music')).toBeInTheDocument();
  });

  it('should render pause button when playing', () => {
    // Mock store to playing state
    render(<MusicControls onTogglePlayPause={() => {}} />);
    // Add assertion for pause button
  });

  it('should be disabled when no music configured', () => {
    // Mock store with no musicUrl
    render(<MusicControls onTogglePlayPause={() => {}} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
```

---

#### Task 5.2: Integration Tests

**File**: `__tests__/integration/music/music-widget-runner-integration.test.tsx`

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { Runner } from '@/components/teleprompter/Runner';
import { useContentStore } from '@/lib/stores/useContentStore';
import { useMusicWidgetStore } from '@/lib/stores/useMusicWidgetStore';

describe('Music Widget Runner Integration', () => {
  beforeEach(() => {
    useContentStore.getState().setMusicUrl('https://example.com/music.mp3');
  });

  it('should show widget when music is configured', () => {
    render(<Runner />);
    expect(screen.getByTestId('music-player-widget')).toBeInTheDocument();
  });

  it('should not show widget when no music configured', () => {
    useContentStore.getState().setMusicUrl('');
    render(<Runner />);
    expect(screen.queryByTestId('music-player-widget')).not.toBeInTheDocument();
  });

  it('should toggle playback on M key press', () => {
    render(<Runner />);
    fireEvent.keyDown(document, { key: 'm' });
    // Assert playback state changed
  });
});
```

---

#### Task 5.3: Accessibility Tests

**File**: `__tests__/a11y/music/music-widget-a11y.test.tsx`

```typescript
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MusicPlayerWidget } from '@/components/teleprompter/music/MusicPlayerWidget';

describe('Music Widget Accessibility', () => {
  it('should have proper ARIA labels', () => {
    render(<MusicPlayerWidget />);
    expect(screen.getByLabelText('Music player')).toBeInTheDocument();
  });

  it('should be keyboard navigable', () => {
    render(<MusicPlayerWidget />);
    const widget = screen.getByTestId('music-player-widget');
    expect(widget).toHaveAttribute('tabindex');
  });

  it('should respect prefers-reduced-motion', () => {
    // Mock matchMedia
    render(<MusicPlayerWidget />);
    // Assert animations are disabled
  });
});
```

---

#### Task 5.4: Performance Tests

**File**: `__tests__/performance/music/drag-performance.test.tsx`

```typescript
import { describe, it, expect } from '@jest/globals';
import { render } from '@testing-library/react';
import { DraggableMusicWidget } from '@/components/teleprompter/music/DraggableMusicWidget';

describe('Music Widget Drag Performance', () => {
  it('should maintain 60fps during drag', async () => {
    const { container } = render(
      <DraggableMusicWidget>
        <div>Test</div>
      </DraggableMusicWidget>
    );
    
    // Simulate drag operations
    const frameTimes: number[] = [];
    
    for (let i = 0; i < 60; i++) {
      const start = performance.now();
      // Simulate drag event
      const end = performance.now();
      frameTimes.push(end - start);
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
    expect(avgFrameTime).toBeLessThan(16.67); // 60fps = 16.67ms per frame
  });
});
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Task 1.1: Create type definitions
- [ ] Task 1.2: Create music widget store
- [ ] Task 1.3: Create base draggable widget
- [ ] Task 1.4: Create music controls component

### Phase 2: Visual Styles
- [ ] Task 2.1: Create Capsule style component
- [ ] Task 2.2: Create Vinyl style component
- [ ] Task 2.3: Create Spectrum style component
- [ ] Task 2.4: Create audio visualization hook

### Phase 3: Integration
- [ ] Task 3.1: Create main MusicPlayerWidget component
- [ ] Task 3.2: Integrate widget into Runner
- [ ] Task 3.3: Add widget configuration to MediaTab

### Phase 4: Error Handling & Edge Cases
- [ ] Task 4.1: Enhanced error handling in UniversalAudioPlayer
- [ ] Task 4.2: Storage quota handling
- [ ] Task 4.3: Tab collision detection
- [ ] Task 4.4: Window resize handling (verified in Task 1.3)

### Phase 5: Testing
- [ ] Task 5.1: Unit tests
- [ ] Task 5.2: Integration tests
- [ ] Task 5.3: Accessibility tests
- [ ] Task 5.4: Performance tests

---

## Success Metrics

Based on the specification's success criteria:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Configuration time | < 60 seconds | Manual testing |
| Position persistence | 100% | Automated tests |
| Cloud sync latency | < 5 seconds | Performance tests |
| Drag response time | < 16ms (60fps) | Performance tests |
| Keyboard shortcut latency | < 100ms | Performance tests |
| First-try success rate | 95% | User testing |
| Scroll performance impact | No impact | FPS monitoring during teleprompter use |
| Browser compatibility | 98% | Browser testing matrix |
| Style switch time | < 10 seconds | Manual testing |
| Error handling rate | 100% | Error injection tests |

---

## Risk Mitigation

### High Priority Risks

1. **Web Audio API Cross-Origin Issues**
   - **Risk**: YouTube audio may not be accessible for visualization due to CORS
   - **Mitigation**: Use fallback animation for Spectrum style with YouTube; native audio works fully

2. **Performance Impact on Teleprompter Scrolling**
   - **Risk**: Canvas/WebGL animations may cause jank
   - **Mitigation**: Use CSS transforms and Framer Motion (GPU accelerated); limit spectrum bars to 12; use requestAnimationFrame

3. **Mobile Touch Conflicts**
   - **Risk**: Dragging widget may interfere with teleprompter scrolling
   - **Mitigation**: Use `touch-action: none` on widget; ensure grab area is distinct

### Medium Priority Risks

4. **Browser Autoplay Policies**
   - **Risk**: Audio may not start automatically
   - **Mitigation**: Widget starts paused; requires user interaction (already handled)

5. **Storage Quota Exceeded**
   - **Risk**: Audio uploads may fail
   - **Mitigation**: Existing `useFileUpload` hook handles Pro user quotas; error messages guide users

6. **State Sync Across Tabs**
   - **Risk**: Multiple tabs playing music simultaneously
   - **Mitigation**: BroadcastChannel API to pause other tabs

---

## Dependencies

### Internal Dependencies
- [`useContentStore`](lib/stores/useContentStore.ts:1-123) - For `musicUrl` state
- [`DraggableCamera`](components/teleprompter/camera/DraggableCamera.tsx:1-188) - Reference for drag patterns
- [`UniversalAudioPlayer`](components/teleprompter/audio/AudioPlayer.tsx:1-86) - For audio playback
- [`MediaTab`](components/teleprompter/config/media/MediaTab.tsx:1-209) - For configuration UI
- [`useFileUpload`](hooks/useFileUpload.ts:1-48) - For audio file uploads

### External Dependencies
- `zustand` ^4.4.0 - State management
- `framer-motion` ^10.0.0 - Animations and drag
- `react-player` - YouTube playback (already installed)
- `lucide-react` - Icons (already installed)

---

## Glossary

| Term | Definition |
|------|------------|
| **Glassmorphic** | Frosted glass visual effect with backdrop blur |
| **Spectrum** | Audio frequency visualization showing bars that animate with music |
| **Inertia Physics** | Smooth deceleration after drag release (not used for music widget) |
| **Web Audio API** | Browser API for audio processing and visualization |
| **BroadcastChannel** | Browser API for cross-tab communication |
| **LocalStorage Persistence** | Saving state to browser localStorage for retrieval across sessions |

---

## References

- [Specification](spec.md) - Complete feature requirements
- [Requirements Checklist](checklists/requirements.md) - Verification criteria
- [DraggableCamera Component](../../components/teleprompter/camera/DraggableCamera.tsx) - Drag implementation reference
- [UniversalAudioPlayer](../../components/teleprompter/audio/AudioPlayer.tsx) - Audio playback reference
- [useContentStore](../../lib/stores/useContentStore.ts) - Content state management
