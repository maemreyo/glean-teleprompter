/**
 * BroadcastChannel Manager
 *
 * Manages cross-tab synchronization for music playback using the BroadcastChannel API.
 * Prevents multiple tabs from playing audio simultaneously.
 *
 * @feature 011-music-player-widget
 */

import type {
  MessageType,
  MusicSourceType,
  BaseBroadcastMessage,
  PlaybackStartedMessage,
  PlaybackStoppedMessage,
  SourceChangedMessage,
  BroadcastMessage,
} from '../../types/music';

// Re-export types for convenience
export type {
  MessageType,
  MusicSourceType,
  BaseBroadcastMessage,
  PlaybackStartedMessage,
  PlaybackStoppedMessage,
  SourceChangedMessage,
  BroadcastMessage,
};

/**
 * Message handler callback type
 */
export type MessageHandler = (message: BroadcastMessage) => void;

/**
 * BroadcastChannel manager for music sync
 */
export interface MusicSyncChannel {
  /** The underlying BroadcastChannel instance */
  channel: BroadcastChannel | null;

  /** Whether the channel is supported in current browser */
  isSupported: boolean;

  /** Initialize the channel (creates if not exists) */
  init: () => void;

  /** Send a message over the channel */
  send: (message: BroadcastMessage) => void;

  /** Register a message handler, returns cleanup function */
  onMessage: (handler: MessageHandler) => () => void;

  /** Close the channel and cleanup */
  close: () => void;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Broadcast channel name for music sync
 */
export const MUSIC_SYNC_CHANNEL = 'teleprompter-music-sync';

// ============================================================================
// Message Creation Functions
// ============================================================================

/**
 * Create a PLAYBACK_STARTED message
 */
export function createPlaybackStartedMessage(tabId: string): PlaybackStartedMessage {
  return {
    type: 'PLAYBACK_STARTED',
    senderTabId: tabId,
    timestamp: Date.now(),
  };
}

/**
 * Create a PLAYBACK_STOPPED message
 */
export function createPlaybackStoppedMessage(tabId: string): PlaybackStoppedMessage {
  return {
    type: 'PLAYBACK_STOPPED',
    senderTabId: tabId,
    timestamp: Date.now(),
  };
}

/**
 * Create a SOURCE_CHANGED message
 */
export function createSourceChangedMessage(
  tabId: string,
  sourceType: MusicSourceType,
  sourceUrl?: string
): SourceChangedMessage {
  return {
    type: 'SOURCE_CHANGED',
    senderTabId: tabId,
    timestamp: Date.now(),
    payload: {
      sourceType,
      sourceUrl,
    },
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for PLAYBACK_STARTED
 */
export function isPlaybackStartedMessage(msg: BroadcastMessage): msg is PlaybackStartedMessage {
  return msg.type === 'PLAYBACK_STARTED';
}

/**
 * Type guard for PLAYBACK_STOPPED
 */
export function isPlaybackStoppedMessage(msg: BroadcastMessage): msg is PlaybackStoppedMessage {
  return msg.type === 'PLAYBACK_STOPPED';
}

/**
 * Type guard for SOURCE_CHANGED
 */
export function isSourceChangedMessage(msg: BroadcastMessage): msg is SourceChangedMessage {
  return msg.type === 'SOURCE_CHANGED';
}

/**
 * Validate incoming message structure
 */
export function isValidBroadcastMessage(data: unknown): data is BroadcastMessage {
  if (typeof data !== 'object' || data === null) return false;

  const msg = data as Record<string, unknown>;

  return (
    typeof msg.type === 'string' &&
    ['PLAYBACK_STARTED', 'PLAYBACK_STOPPED', 'SOURCE_CHANGED'].includes(msg.type) &&
    typeof msg.senderTabId === 'string' &&
    typeof msg.timestamp === 'number'
  );
}

// ============================================================================
// Channel Manager Implementation
// ============================================================================

/**
 * Create a music sync channel manager
 */
export function createMusicSyncChannel(tabId: string): MusicSyncChannel {
  let channel: BroadcastChannel | null = null;
  let messageHandlers: MessageHandler[] = [];
  const isSupported = typeof BroadcastChannel !== 'undefined';

  const init = () => {
    if (!isSupported) {
      console.warn('[MusicSyncChannel] BroadcastChannel not supported in this browser');
      return;
    }

    if (channel) return; // Already initialized

    channel = new BroadcastChannel(MUSIC_SYNC_CHANNEL);

    channel.onmessage = (event: MessageEvent) => {
      const message = event.data;

      // Validate message structure
      if (!isValidBroadcastMessage(message)) {
        console.warn('[MusicSyncChannel] Received invalid message:', message);
        return;
      }

      // Ignore messages from this tab
      if (message.senderTabId === tabId) {
        return;
      }

      // Log message for debugging
      console.log('[MusicSyncChannel] Received message:', message);

      // Notify all registered handlers
      messageHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('[MusicSyncChannel] Handler error:', error);
        }
      });
    };

    channel.onmessageerror = (error) => {
      console.error('[MusicSyncChannel] Message error:', error);
    };

    console.log('[MusicSyncChannel] Initialized for tab:', tabId);
  };

  const send = (message: BroadcastMessage) => {
    if (!channel) {
      console.warn('[MusicSyncChannel] Cannot send message: channel not initialized');
      return;
    }

    try {
      channel.postMessage(message);
      console.log('[MusicSyncChannel] Sent message:', message);
    } catch (error) {
      console.error('[MusicSyncChannel] Send error:', error);
    }
  };

  const onMessage = (handler: MessageHandler) => {
    messageHandlers.push(handler);

    // Return cleanup function
    return () => {
      messageHandlers = messageHandlers.filter((h) => h !== handler);
    };
  };

  const close = () => {
    if (channel) {
      channel.close();
      channel = null;
      console.log('[MusicSyncChannel] Closed for tab:', tabId);
    }

    // Clear all handlers
    messageHandlers = [];
  };

  return {
    channel,
    isSupported,
    init,
    send,
    onMessage,
    close,
  };
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Singleton instance for the application
 */
let syncChannel: MusicSyncChannel | null = null;

/**
 * Get or create the music sync channel singleton
 */
export function getMusicSyncChannel(tabId: string): MusicSyncChannel {
  if (!syncChannel) {
    syncChannel = createMusicSyncChannel(tabId);
    syncChannel.init();
  }

  return syncChannel;
}

/**
 * Cleanup the music sync channel (call on page unmount)
 */
export function cleanupMusicSyncChannel(): void {
  if (syncChannel) {
    syncChannel.close();
    syncChannel = null;
  }
}

// ============================================================================
// Browser Compatibility
// ============================================================================

/**
 * Feature detection and fallback
 */
export function checkBroadcastChannelSupport(): boolean {
  if (typeof BroadcastChannel === 'undefined') {
    console.warn('[MusicSyncChannel] BroadcastChannel not supported. Cross-tab sync disabled.');
    console.warn('[MusicSyncChannel] Music playback will still work, but multiple tabs may play simultaneously.');
    return false;
  }
  return true;
}

// ============================================================================
// Cleanup on Page Unload
// ============================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupMusicSyncChannel();
  });
}
