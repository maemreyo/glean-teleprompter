/**
 * Music Player Store
 * 
 * Zustand store with persistence for music player widget state.
 * Manages configuration, playback state, and widget positioning.
 * Integrates with BroadcastChannel for cross-tab synchronization.
 * 
 * @feature 011-music-player-widget
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WidgetStyle,
  WidgetPosition,
  MusicSourceType,
  VinylSpeed,
  PlaybackState,
  MusicError,
  AudioSource,
  AudioFileMetadata,
  BroadcastMessage,
} from '../types/music';

// ============================================================================
// State Interfaces
// ============================================================================

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
 * Runtime state (not persisted, except position)
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

/**
 * Persisted data structure for localStorage
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

// ============================================================================
// Actions Interface
// ============================================================================

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

/**
 * Complete store interface (state + actions)
 */
export interface MusicPlayerStore extends MusicPlayerStoreState, MusicPlayerStoreActions {}

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: MusicPlayerConfig = {
  sourceType: 'youtube',
  widgetStyle: 'capsule',
  vinylSpeed: '45',
  lastModified: 0,
  isConfigured: false,
} as const;

/**
 * Default position
 */
export const DEFAULT_POSITION: WidgetPosition = {
  x: 0,
  y: 0,
} as const;

/**
 * Default runtime state
 */
export const DEFAULT_RUNTIME: MusicPlayerRuntimeState = {
  playbackState: 'idle',
  position: DEFAULT_POSITION,
  isVisible: false,
  activeSource: null,
  error: null,
  isDragging: false,
  tabId: '',
} as const;

// ============================================================================
// Store Implementation
// ============================================================================

/**
 * Music Player Store with BroadcastChannel integration
 */
export const useMusicPlayerStore = create<MusicPlayerStore>()(
  persist(
    (set, get) => {
      // Generate unique tab ID on mount
      const tabId = typeof crypto !== 'undefined' ? crypto.randomUUID() : '';

      // BroadcastChannel utilities (lazy import to avoid SSR issues)
      let syncChannel: any = null;
      let unsubscribe: (() => void) | null = null;

      // Set up BroadcastChannel on store creation
      if (typeof window !== 'undefined') {
        try {
          // Dynamic import for client-side only code
          import('../music/broadcastChannel').then((bc) => {
            syncChannel = bc.getMusicSyncChannel(tabId);
            
            // Register message handler
            unsubscribe = syncChannel.onMessage((message: BroadcastMessage) => {
              const state = get();
              
              switch (message.type) {
                case 'PLAYBACK_STARTED':
                  // Pause playback in this tab if playing
                  if (state.playbackState === 'playing') {
                    console.log('[MusicStore] Pausing due to playback in another tab');
                    set({ playbackState: 'paused' });
                  }
                  break;
                  
                case 'PLAYBACK_STOPPED':
                  // Optional: Could resume if this was the original tab
                  break;
                  
                case 'SOURCE_CHANGED':
                  // Update source reference
                  if (message.payload) {
                    set({
                      sourceType: message.payload.sourceType,
                    });
                  }
                  break;
              }
            });
          }).catch((error) => {
            console.warn('[MusicStore] Failed to load BroadcastChannel utilities:', error);
          });
        } catch (error) {
          console.warn('[MusicStore] BroadcastChannel not available:', error);
        }
      }

      return {
        // Initial state
        ...DEFAULT_CONFIG,
        ...DEFAULT_RUNTIME,
        tabId,

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
          if (syncChannel) {
            try {
              import('../music/broadcastChannel').then((bc) => {
                syncChannel.send(bc.createPlaybackStartedMessage(state.tabId));
              });
            } catch (error) {
              console.warn('[MusicStore] Failed to send playback started message:', error);
            }
          }
        },

        pause: () => {
          const state = get();
          set({ playbackState: 'paused' });
          
          // Notify other tabs via BroadcastChannel
          if (syncChannel) {
            try {
              import('../music/broadcastChannel').then((bc) => {
                syncChannel.send(bc.createPlaybackStoppedMessage(state.tabId));
              });
            } catch (error) {
              console.warn('[MusicStore] Failed to send playback stopped message:', error);
            }
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
      };
    },
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
    }
  )
);

// ============================================================================
// Cleanup on Page Unload
// ============================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    import('../music/broadcastChannel').then((bc) => {
      bc.cleanupMusicSyncChannel();
    }).catch((error) => {
      console.warn('[MusicStore] Failed to cleanup BroadcastChannel:', error);
    });
  });
}
