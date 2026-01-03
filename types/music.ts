/**
 * Music Player Widget Types
 * 
 * Centralized type definitions for the music player widget feature.
 * Re-exported by various modules for consistency.
 * 
 * @feature 011-music-player-widget
 */

// ============================================================================
// Basic Types
// ============================================================================

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

// ============================================================================
// Complex Types
// ============================================================================

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

// ============================================================================
// BroadcastChannel Types (re-exported for convenience)
// ============================================================================

/**
 * Message types that can be sent over the channel
 */
export type MessageType = 'PLAYBACK_STARTED' | 'PLAYBACK_STOPPED' | 'SOURCE_CHANGED';

/**
 * Base broadcast message structure
 */
export interface BaseBroadcastMessage {
  type: MessageType;
  senderTabId: string;
  timestamp: number;
}

/**
 * Message sent when playback starts in a tab
 */
export interface PlaybackStartedMessage extends BaseBroadcastMessage {
  type: 'PLAYBACK_STARTED';
}

/**
 * Message sent when playback stops in a tab
 */
export interface PlaybackStoppedMessage extends BaseBroadcastMessage {
  type: 'PLAYBACK_STOPPED';
}

/**
 * Message sent when music source changes
 */
export interface SourceChangedMessage extends BaseBroadcastMessage {
  type: 'SOURCE_CHANGED';
  payload: {
    sourceType: MusicSourceType;
    sourceUrl?: string;
  };
}

/**
 * Union type of all possible broadcast messages
 */
export type BroadcastMessage = 
  | PlaybackStartedMessage 
  | PlaybackStoppedMessage 
  | SourceChangedMessage;
