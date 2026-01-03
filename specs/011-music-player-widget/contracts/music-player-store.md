# Music Player Store - Zustand Interface Contract

**Feature**: 011-music-player-widget  
**Contract Type**: Zustand Store Interface  
**Status**: Draft  
**Created**: 2026-01-03  
**Implementation Location**: `lib/stores/useMusicPlayerStore.ts`

---

## Overview

This contract defines the interface for the Zustand store that manages music player state. It follows the same pattern as [`usePlaybackStore.ts`](../../lib/stores/usePlaybackStore.ts) but adds persistence middleware and BroadcastChannel integration.

---

## Type Definitions

```typescript
/**
 * Vinyl record rotation speed presets
 */
export type VinylSpeed = '33-1/3' | '45' | '78' | 'custom';

/**
 * Music source type
 */
export type MusicSourceType = 'youtube' | 'upload';

/**
 * Widget visual style options
 */
export type WidgetStyle = 'capsule' | 'vinyl' | 'spectrum';

/**
 * Playback state machine
 */
export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

/**
 * Widget screen position
 */
export interface WidgetPosition {
  /** X coordinate in pixels relative to viewport */
  x: number;
  /** Y coordinate in pixels relative to viewport */
  y: number;
}

/**
 * Music error types
 */
export type MusicError =
  | { type: 'youtube_unavailable'; url: string }
  | { type: 'youtube_invalid_url'; url: string }
  | { type: 'file_not_found'; fileId: string }
  | { type: 'file_unsupported'; format: string }
  | { type: 'file_too_large'; fileSize: number; maxSize: number }
  | { type: 'storage_quota_exceeded'; currentUsage: number; quota: number }
  | { type: 'network_error'; message: string }
  | { type: 'unknown_error'; message: string };

/**
 * Audio file metadata
 */
export interface AudioFileMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  format: string;
  uploadedAt: number;
  storagePath: string;
}

/**
 * Audio source for playback
 */
export interface AudioSource {
  type: MusicSourceType;
  url: string;
  metadata?: AudioFileMetadata;
}
```

---

## State Interface

```typescript
/**
 * Configuration state (persisted)
 */
export interface MusicPlayerConfig {
  sourceType: MusicSourceType;
  youtubeUrl?: string;
  uploadedFileId?: string;
  widgetStyle: WidgetStyle;
  vinylSpeed?: VinylSpeed;
  vinylCustomBPM?: number;
  lastModified: number;
  isConfigured: boolean;
}

/**
 * Runtime state (not persisted)
 */
export interface MusicPlayerRuntimeState {
  playbackState: PlaybackState;
  position: WidgetPosition;
  isVisible: boolean;
  activeSource: AudioSource | null;
  error: MusicError | null;
  isDragging: boolean;
  tabId: string;
}

/**
 * Complete store state interface
 */
export interface MusicPlayerStoreState extends MusicPlayerConfig, MusicPlayerRuntimeState {}
```

---

## Actions Interface

```typescript
export interface MusicPlayerStoreActions {
  // Configuration actions
  setSourceType: (type: MusicSourceType) => void;
  setYoutubeUrl: (url: string) => void;
  setUploadedFileId: (fileId: string) => void;
  setWidgetStyle: (style: WidgetStyle) => void;
  setVinylSpeed: (speed: VinylSpeed) => void;
  setVinylCustomBPM: (bpm: number) => void;

  // Playback actions
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setPlaybackState: (state: PlaybackState) => void;

  // Position actions
  setPosition: (position: WidgetPosition) => void;
  updatePosition: (deltaX: number, deltaY: number) => void;

  // Widget actions
  setVisible: (visible: boolean) => void;
  setDragging: (dragging: boolean) => void;

  // Error actions
  setError: (error: MusicError | null) => void;
  clearError: () => void;

  // Source actions
  setActiveSource: (source: AudioSource | null) => void;

  // Reset action
  reset: () => void;
}
```

---

## Selectors Interface

```typescript
export interface MusicPlayerStoreSelectors {
  // Config selectors
  isConfigured: () => boolean;
  isYouTube: () => boolean;
  isUpload: () => boolean;
  isVinylStyle: () => boolean;
  needsCustomBPM: () => boolean;

  // Playback selectors
  isPlaying: () => boolean;
  isPaused: () => boolean;
  isLoading: () => boolean;
  hasError: () => boolean;

  // Widget selectors
  shouldShowWidget: () => boolean;
  getWidgetStyle: () => WidgetStyle;

  // Source selectors
  getSourceUrl: () => string | undefined;
  getSourceType: () => MusicSourceType;
}
```

---

## Complete Store Interface

```typescript
/**
 * Complete store interface (state + actions)
 */
export interface MusicPlayerStore extends MusicPlayerStoreState, MusicPlayerStoreActions {}
```

---

## Persistence Configuration

```typescript
/**
 * Persisted data structure for localStorage
 * This is what gets stored via zustand persist middleware
 */
export interface PersistedMusicPlayerData {
  sourceType: MusicSourceType;
  youtubeUrl?: string;
  uploadedFileId?: string;
  widgetStyle: WidgetStyle;
  vinylSpeed?: VinylSpeed;
  vinylCustomBPM?: number;
  lastModified: number;
  position: WidgetPosition;
}

/**
 * Persist middleware configuration
 */
export interface PersistConfig {
  name: string;
  version?: number;
  partialize: (state: MusicPlayerStoreState) => PersistedMusicPlayerData;
  onRehydrateStorage?: (
    state?: MusicPlayerStoreState
  ) => ((state: MusicPlayerStoreState) => void) | void;
}
```

---

## BroadcastChannel Types

```typescript
/**
 * BroadcastChannel message types for cross-tab sync
 */
export interface BroadcastMessage {
  type: 'PLAYBACK_STARTED' | 'PLAYBACK_STOPPED' | 'SOURCE_CHANGED';
  senderTabId: string;
  timestamp: number;
  payload?: {
    sourceType?: MusicSourceType;
    sourceUrl?: string;
  };
}
```

---

## Default Values

```typescript
export const DEFAULT_CONFIG: MusicPlayerConfig = {
  sourceType: 'youtube',
  widgetStyle: 'capsule',
  vinylSpeed: '45',
  lastModified: 0,
  isConfigured: false,
} as const;

export const DEFAULT_POSITION: WidgetPosition = {
  x: 0,
  y: 0,
} as const;

export const DEFAULT_RUNTIME: MusicPlayerRuntimeState = {
  playbackState: 'idle',
  position: DEFAULT_POSITION,
  isVisible: false,
  activeSource: null,
  error: null,
  isDragging: false,
  tabId: '',
} as const;
```

---

## Implementation Template

```typescript
/**
 * Store implementation template
 * 
 * This template shows the expected structure when implementing
 * the actual store in lib/stores/useMusicPlayerStore.ts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useMusicPlayerStore = create<MusicPlayerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...DEFAULT_CONFIG,
      ...DEFAULT_RUNTIME,

      // Generate unique tab ID on mount
      tabId: typeof crypto !== 'undefined' ? crypto.randomUUID() : '',

      // Configuration actions
      setSourceType: (type) => set({ 
        sourceType: type, 
        lastModified: Date.now(),
        isConfigured: true,
      }),

      setYoutubeUrl: (url) => set({ 
        youtubeUrl: url, 
        lastModified: Date.now(),
        isConfigured: true,
      }),

      setUploadedFileId: (fileId) => set({ 
        uploadedFileId: fileId, 
        lastModified: Date.now(),
        isConfigured: true,
      }),

      setWidgetStyle: (style) => set({ 
        widgetStyle: style, 
        lastModified: Date.now() 
      }),

      setVinylSpeed: (speed) => set({ 
        vinylSpeed: speed, 
        lastModified: Date.now() 
      }),

      setVinylCustomBPM: (bpm) => set({ 
        vinylCustomBPM: bpm, 
        lastModified: Date.now() 
      }),

      // Playback actions
      play: () => {
        const state = get();
        set({ playbackState: 'playing' });
        
        // Notify other tabs via BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('teleprompter-music-sync');
          channel.postMessage({
            type: 'PLAYBACK_STARTED',
            senderTabId: state.tabId,
            timestamp: Date.now(),
          });
        }
      },

      pause: () => {
        const state = get();
        set({ playbackState: 'paused' });
        
        // Notify other tabs via BroadcastChannel
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel('teleprompter-music-sync');
          channel.postMessage({
            type: 'PLAYBACK_STOPPED',
            senderTabId: state.tabId,
            timestamp: Date.now(),
          });
        }
      },

      togglePlayback: () => {
        const state = get();
        if (state.playbackState === 'playing') {
          get().pause();
        } else {
          get().play();
        }
      },

      setPlaybackState: (playbackState) => set({ playbackState }),

      // Position actions
      setPosition: (position) => set({ position }),

      updatePosition: (deltaX, deltaY) => set((state) => ({
        position: {
          x: state.position.x + deltaX,
          y: state.position.y + deltaY,
        },
      })),

      // Widget actions
      setVisible: (visible) => set({ isVisible: visible }),

      setDragging: (dragging) => set({ isDragging: dragging }),

      // Error actions
      setError: (error) => set({ error, playbackState: error ? 'error' : 'idle' }),

      clearError: () => set({ error: null, playbackState: 'idle' }),

      // Source actions
      setActiveSource: (activeSource) => set({ activeSource }),

      // Reset action
      reset: () => set({
        ...DEFAULT_CONFIG,
        ...DEFAULT_RUNTIME,
        tabId: get().tabId, // Preserve tab ID
      }),
    }),
    {
      name: 'teleprompter-music',
      version: 1,
      partialize: (state): PersistedMusicPlayerData => ({
        sourceType: state.sourceType,
        youtubeUrl: state.youtubeUrl,
        uploadedFileId: state.uploadedFileId,
        widgetStyle: state.widgetStyle,
        vinylSpeed: state.vinylSpeed,
        vinylCustomBPM: state.vinylCustomBPM,
        lastModified: state.lastModified,
        position: state.position,
      }),
    } satisfies PersistConfig
  )
);

// Set up BroadcastChannel listener for cross-tab sync
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  const channel = new BroadcastChannel('teleprompter-music-sync');
  
  channel.onmessage = (event) => {
    const { type, senderTabId } = event.data;
    const state = useMusicPlayerStore.getState();
    
    // Ignore messages from this tab
    if (senderTabId === state.tabId) return;
    
    switch (type) {
      case 'PLAYBACK_STARTED':
        // Pause playback in this tab
        if (state.playbackState === 'playing') {
          useMusicPlayerStore.setState({ playbackState: 'paused' });
        }
        break;
        
      case 'SOURCE_CHANGED':
        // Update source reference
        useMusicPlayerStore.setState({
          sourceType: event.data.payload?.sourceType || 'youtube',
        });
        break;
    }
  };
}
```

---

## Usage Example

```typescript
import { useMusicPlayerStore } from '@/lib/stores/useMusicPlayerStore';

function MusicPlayerWidget() {
  // State selectors
  const playbackState = useMusicPlayerStore((state) => state.playbackState);
  const widgetStyle = useMusicPlayerStore((state) => state.widgetStyle);
  const position = useMusicPlayerStore((state) => state.position);
  const error = useMusicPlayerStore((state) => state.error);
  
  // Actions
  const play = useMusicPlayerStore((state) => state.play);
  const pause = useMusicPlayerStore((state) => state.pause);
  const setPosition = useMusicPlayerStore((state) => state.setPosition);
  const clearError = useMusicPlayerStore((state) => state.clearError);
  
  const isPlaying = playbackState === 'playing';
  
  return (
    <div 
      className={`music-widget music-widget-${widgetStyle}`}
      style={{ left: position.x, top: position.y }}
    >
      {error && (
        <div className="error-message">
          {error.type}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      <button onClick={isPlaying ? pause : play}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

---

## Related Documents

- **Data Model**: [`specs/011-music-player-widget/data-model.md`](../data-model.md)
- **BroadcastChannel Contract**: [`specs/011-music-player-widget/contracts/broadcast-channel.md`](./broadcast-channel.md)
- **Widget Component Contract**: [`specs/011-music-player-widget/contracts/music-player-widget.md`](./music-player-widget.md)

---

**Document Status**: ✅ Complete  
**Next Step**: Implement store in `lib/stores/useMusicPlayerStore.ts`
