# Music Player Widget - Component Interface Contract

**Feature**: 011-music-player-widget  
**Contract Type**: React Component Interface  
**Status**: Draft  
**Created**: 2026-01-03  
**Implementation Location**: `components/teleprompter/music/MusicPlayerWidget.tsx`

---

## Overview

This contract defines the interface for the floating music player widget component. It follows the same pattern as the existing [`CameraWidget.tsx`](../../components/teleprompter/camera/CameraWidget.tsx) but with music-specific functionality and three visual styles.

---

## Component Props Interface

```typescript
import type { WidgetStyle, WidgetPosition, MusicError } from './music-player-store';

export interface MusicPlayerWidgetProps {
  /** Current widget visual style */
  widgetStyle: WidgetStyle;

  /** Current screen position */
  position: WidgetPosition;

  /** Whether music is currently playing */
  isPlaying: boolean;

  /** Whether there's an active error */
  error: MusicError | null;

  /** Whether widget is being dragged */
  isDragging: boolean;

  /** Whether to respect reduced motion preference */
  prefersReducedMotion: boolean;

  // Event Handlers
  /** Called when play/pause is toggled */
  onPlayPauseToggle: () => void;

  /** Called when widget position changes during drag */
  onPositionChange: (position: WidgetPosition) => void;

  /** Called when drag starts */
  onDragStart: () => void;

  /** Called when drag ends */
  onDragEnd: () => void;

  /** Called when error is dismissed */
  onErrorDismiss: () => void;

  /** Called when reconfigure button is clicked */
  onReconfigure: () => void;

  // Optional callbacks
  /** Called when widget mounts */
  onMount?: () => void;

  /** Called when widget unmounts */
  onUnmount?: () => void;

  // Additional CSS classes
  className?: string;
}
```

---

## Style-Specific Props

Each widget style may have additional props for its unique features:

```typescript
/**
 * Capsule style specific props
 */
export interface CapsuleStyleProps {
  /** Pulse animation intensity (0-1) */
  pulseIntensity: number;

  /** Glassmorphism blur amount */
  blurAmount?: number;
}

/**
 * Vinyl style specific props
 */
export interface VinylStyleProps {
  /** Current rotation angle in degrees */
  rotationAngle: number;

  /** Target rotation speed (radians per millisecond) */
  rotationSpeed: number;

  /** Whether record is currently decelerating (pause animation) */
  isDecelerating: boolean;
}

/**
 * Spectrum style specific props
 */
export interface SpectrumStyleProps {
  /** Array of frequency values (0-255) for each bar */
  frequencyData: number[];

  /** Number of bars to display */
  barCount?: number;
}

/**
 * Combined style props union
 */
export type StyleSpecificProps =
  | { style: 'capsule' } & CapsuleStyleProps
  | { style: 'vinyl' } & VinylStyleProps
  | { style: 'spectrum' } & SpectrumStyleProps;
```

---

## Widget Dimensions

```typescript
/**
 * Widget dimensions for each style
 */
export interface WidgetDimensions {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export const WIDGET_DIMENSIONS: Record<WidgetStyle, WidgetDimensions> = {
  capsule: {
    width: 280,
    height: 80,
    minWidth: 240,
    minHeight: 72,
    maxWidth: 400,
    maxHeight: 96,
  },
  vinyl: {
    width: 200,
    height: 200,
    minWidth: 160,
    minHeight: 160,
    maxWidth: 280,
    maxHeight: 280,
  },
  spectrum: {
    width: 320,
    height: 120,
    minWidth: 280,
    minHeight: 100,
    maxWidth: 480,
    maxHeight: 160,
  },
} as const;
```

---

## Drag Handling Interface

```typescript
/**
 * Drag state for widget positioning
 */
export interface DragState {
  /** Whether currently dragging */
  isDragging: boolean;

  /** Starting position when drag began */
  startPosition: WidgetPosition;

  /** Current cursor position */
  currentCursor: { x: number; y: number };

  /** Velocity for inertia calculation */
  velocity: { x: number; y: number };
}

/**
 * Drag event handlers
 */
export interface DragHandlers {
  onMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onMouseMove: (e: MouseEvent | TouchEvent) => void;
  onMouseUp: (e: MouseEvent | TouchEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
}
```

---

## Event Callback Signatures

```typescript
/**
 * Position change callback
 * Called during drag operations with new constrained position
 */
export type PositionChangeCallback = (position: WidgetPosition) => void;

/**
 * Play/pause toggle callback
 * Called when user clicks play/pause or presses M key
 */
export type PlayPauseCallback = () => void;

/**
 * Error dismiss callback
 * Called when user dismisses inline error
 */
export type ErrorDismissCallback = () => void;

/**
 * Reconfigure callback
 * Called when user clicks reconfigure button (navigates to settings)
 */
export type ReconfigureCallback = () => void;

/**
 * Lifecycle callbacks
 */
export type MountCallback = () => void;
export type UnmountCallback = () => void;
```

---

## Style Variant Types

```typescript
/**
 * CSS class names for each widget style
 */
export const WIDGET_STYLE_CLASSES = {
  capsule: 'music-widget-capsule',
  vinyl: 'music-widget-vinyl',
  spectrum: 'music-widget-spectrum',
} as const;

/**
 * Style variant modifiers
 */
export interface StyleModifiers {
  /** Playback state modifier */
  playbackState: 'playing' | 'paused' | 'error';

  /** Reduced motion modifier */
  prefersReducedMotion: boolean;

  /** Dragging state modifier */
  isDragging: boolean;

  /** Error state modifier */
  hasError: boolean;
}

/**
 * Build complete class name for widget
 */
export function buildWidgetClassName(
  style: WidgetStyle,
  modifiers: StyleModifiers,
  additionalClasses?: string
): string {
  const baseClass = WIDGET_STYLE_CLASSES[style];
  const modifierClasses = [
    modifiers.playbackState && `is-${modifiers.playbackState}`,
    modifiers.prefersReducedMotion && 'reduced-motion',
    modifiers.isDragging && 'is-dragging',
    modifiers.hasError && 'has-error',
  ]
    .filter(Boolean)
    .join(' ');

  return [baseClass, modifierClasses, additionalClasses]
    .filter(Boolean)
    .join(' ')
    .trim();
}
```

---

## Accessibility Interface

```typescript
/**
 * ARIA labels and attributes for widget
 */
export interface WidgetA11yAttributes {
  /** Widget container */
  container: {
    role: 'region';
    'aria-label': string;
    'aria-live': 'polite';
  };

  /** Play/pause button */
  playPauseButton: {
    'aria-label': string;
    'aria-pressed': boolean;
  };

  /** Drag handle */
  dragHandle: {
    'aria-label': string;
    'aria-grabbed': boolean;
    role: 'button';
    tabIndex: 0;
  };

  /** Error region */
  errorRegion: {
    role: 'alert';
    'aria-live': 'assertive';
  };
}

/**
 * Get ARIA attributes based on current state
 */
export function getWidgetA11yAttributes(
  isPlaying: boolean,
  isDragging: boolean,
  error: MusicError | null,
  widgetStyle: WidgetStyle
): WidgetA11yAttributes {
  return {
    container: {
      role: 'region',
      'aria-label': `Music player widget - ${widgetStyle} style`,
      'aria-live': 'polite',
    },
    playPauseButton: {
      'aria-label': isPlaying ? 'Pause music' : 'Play music',
      'aria-pressed': isPlaying,
    },
    dragHandle: {
      'aria-label': 'Drag to move music player',
      'aria-grabbed': isDragging,
      role: 'button' as const,
      tabIndex: 0,
    },
    errorRegion: {
      role: 'alert',
      'aria-live': 'assertive',
    },
  };
}
```

---

## Implementation Template

```typescript
/**
 * Music Player Widget Component Template
 * 
 * This template shows the expected structure when implementing
 * the actual component in components/teleprompter/music/MusicPlayerWidget.tsx
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Play, Pause, AlertCircle, GripHorizontal } from 'lucide-react';
import type { MusicPlayerWidgetProps, DragState } from '@/specs/011-music-player-widget/contracts/music-player-widget';
import { cn } from '@/lib/utils';

export function MusicPlayerWidget({
  widgetStyle,
  position,
  isPlaying,
  error,
  isDragging,
  prefersReducedMotion,
  onPlayPauseToggle,
  onPositionChange,
  onDragStart,
  onDragEnd,
  onErrorDismiss,
  onReconfigure,
  onMount,
  onUnmount,
  className,
}: MusicPlayerWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startPosition: position,
    currentCursor: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
  });

  // Motion values for drag inertia
  const dragX = useMotionValue(position.x);
  const dragY = useMotionValue(position.y);

  // Lifecycle callbacks
  useEffect(() => {
    onMount?.();
    return () => onUnmount?.();
  }, [onMount, onUnmount]);

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setDragState({
      isDragging: true,
      startPosition: position,
      currentCursor: { x: clientX, y: clientY },
      velocity: { x: 0, y: 0 },
    });

    onDragStart();

    // Add global event listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragState.isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragState.currentCursor.x;
    const deltaY = clientY - dragState.currentCursor.y;

    const newPosition = {
      x: position.x + deltaX,
      y: position.y + deltaY,
    };

    onPositionChange(newPosition);

    setDragState({
      ...dragState,
      currentCursor: { x: clientX, y: clientY },
      velocity: { x: deltaX, y: deltaY },
    });
  };

  const handleDragEnd = () => {
    setDragState({ ...dragState, isDragging: false });
    onDragEnd();

    // Remove global event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);
  };

  // Style-specific rendering
  const renderStyleContent = () => {
    switch (widgetStyle) {
      case 'capsule':
        return (
          <>
            {/* Glassmorphic pill container */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-full border border-white/20" />
            
            {/* Pulsing glow effect when playing */}
            {isPlaying && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Play/pause button */}
            <button
              onClick={onPlayPauseToggle}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              aria-pressed={isPlaying}
              className="relative z-10 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
          </>
        );

      case 'vinyl':
        return (
          <>
            {/* Vinyl record */}
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 border-gray-700"
              animate={isPlaying && !prefersReducedMotion ? {
                rotate: 360,
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundImage: 'repeating-radial-gradient(circle at center, transparent 0, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
              }}
            >
              {/* Center label */}
              <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-gray-900" />
              </div>
            </motion.div>

            {/* Play/pause overlay */}
            <button
              onClick={onPlayPauseToggle}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors rounded-full"
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white" />}
            </button>
          </>
        );

      case 'spectrum':
        return (
          <>
            {/* Frequency bars */}
            <div className="flex items-end justify-center gap-1 h-full px-4">
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full"
                  animate={isPlaying && !prefersReducedMotion ? {
                    height: [20, 40 + Math.random() * 40, 20],
                  } : { height: 20 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            {/* Play/pause button */}
            <button
              onClick={onPlayPauseToggle}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </>
        );
    }
  };

  // ARIA attributes
  const a11yProps = {
    role: 'region' as const,
    'aria-label': `Music player widget - ${widgetStyle} style`,
    'aria-live': 'polite' as const,
  };

  return (
    <motion.div
      ref={widgetRef}
      {...a11yProps}
      className={cn(
        'music-widget',
        `music-widget-${widgetStyle}`,
        isDragging && 'is-dragging',
        error && 'has-error',
        prefersReducedMotion && 'reduced-motion',
        className
      )}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: WIDGET_DIMENSIONS[widgetStyle].width,
        height: WIDGET_DIMENSIONS[widgetStyle].height,
        zIndex: 1000,
      }}
      drag={isDragging}
      dragMomentum={false}
      onDragStart={handleDragStart}
      animate={
        prefersReducedMotion
          ? {}
          : {
              scale: isDragging ? 1.05 : 1,
            }
      }
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      {/* Drag handle */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing p-2"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        aria-label="Drag to move music player"
        role="button"
        tabIndex={0}
      >
        <GripHorizontal size={16} className="text-white/50" />
      </div>

      {/* Style-specific content */}
      {renderStyleContent()}

      {/* Error indicator */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
        >
          <AlertCircle size={16} />
        </div>
      )}

      {/* Inline error message */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="absolute top-full mt-2 left-0 right-0 bg-red-500/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl z-50"
        >
          <p className="font-medium">{error.type.replace(/_/g, ' ')}</p>
          <button
            onClick={onReconfigure}
            className="underline mt-1 hover:text-white/80"
          >
            Reconfigure Music
          </button>
          <button
            onClick={onErrorDismiss}
            className="ml-2 text-white/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
    </motion.div>
  );
}
```

---

## Usage Example

```typescript
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';
import { MusicPlayerWidget } from '@/components/teleprompter/music/MusicPlayerWidget';

function RunnerPage() {
  const widgetStyle = useMusicPlayerStore((s) => s.widgetStyle);
  const position = useMusicPlayerStore((s) => s.position);
  const playbackState = useMusicPlayerStore((s) => s.playbackState);
  const error = useMusicPlayerStore((s) => s.error);
  const isDragging = useMusicPlayerStore((s) => s.isDragging);
  
  const togglePlayback = useMusicPlayerStore((s) => s.togglePlayback);
  const setPosition = useMusicPlayerStore((s) => s.setPosition);
  const setDragging = useMusicPlayerStore((s) => s.setDragging);
  const clearError = useMusicPlayerStore((s) => s.clearError);

  const isPlaying = playbackState === 'playing';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleReconfigure = () => {
    window.location.href = '/settings?tab=music';
  };

  return (
    <>
      {/* Teleprompter content */}
      <TeleprompterText />

      {/* Music player widget */}
      {useMusicPlayerStore.getState().isConfigured && (
        <MusicPlayerWidget
          widgetStyle={widgetStyle}
          position={position}
          isPlaying={isPlaying}
          error={error}
          isDragging={isDragging}
          prefersReducedMotion={prefersReducedMotion}
          onPlayPauseToggle={togglePlayback}
          onPositionChange={setPosition}
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          onErrorDismiss={clearError}
          onReconfigure={handleReconfigure}
        />
      )}
    </>
  );
}
```

---

## Related Documents

- **Data Model**: [`specs/011-music-player-widget/data-model.md`](../data-model.md)
- **Store Contract**: [`specs/011-music-player-widget/contracts/music-player-store.md`](./music-player-store.md)
- **BroadcastChannel Contract**: [`specs/011-music-player-widget/contracts/broadcast-channel.md`](./broadcast-channel.md)

---

**Document Status**: ✅ Complete  
**Next Step**: Implement component in `components/teleprompter/music/MusicPlayerWidget.tsx`
