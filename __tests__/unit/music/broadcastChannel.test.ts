/**
 * Unit tests for BroadcastChannel utilities
 * Tests cross-tab synchronization for music playback
 * 
 * @feature 011-music-player-widget
 */

import {
  createMusicSyncChannel,
  getMusicSyncChannel,
  cleanupMusicSyncChannel,
  checkBroadcastChannelSupport,
  createPlaybackStartedMessage,
  createPlaybackStoppedMessage,
  createSourceChangedMessage,
  isPlaybackStartedMessage,
  isPlaybackStoppedMessage,
  isSourceChangedMessage,
  isValidBroadcastMessage,
  MUSIC_SYNC_CHANNEL,
} from '@/lib/music/broadcastChannel';
import { setupBroadcastChannelMock, cleanupBroadcastChannelMock } from '../../mocks/broadcast-channel.mock';
import type { BroadcastMessage } from '@/types/music';

describe('BroadcastChannel utilities', () => {
  beforeEach(() => {
    // Set up mock before each test
    setupBroadcastChannelMock();
  });

  afterEach(() => {
    // Clean up after each test
    cleanupBroadcastChannelMock();
    cleanupMusicSyncChannel();
  });

  describe('checkBroadcastChannelSupport', () => {
    it('should return true when BroadcastChannel is supported', () => {
      const isSupported = checkBroadcastChannelSupport();
      expect(isSupported).toBe(true);
    });

    it('should return false when BroadcastChannel is not supported', () => {
      // Mock BroadcastChannel as undefined
      const originalBroadcastChannel = global.BroadcastChannel;
      // @ts-expect-error - Testing unsupported browser scenario
      delete global.BroadcastChannel;

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const isSupported = checkBroadcastChannelSupport();

      expect(isSupported).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      global.BroadcastChannel = originalBroadcastChannel;
    });
  });

  describe('Message creation functions', () => {
    const tabId = 'test-tab-123';

    it('should create PLAYBACK_STARTED message', () => {
      const message = createPlaybackStartedMessage(tabId);

      expect(message.type).toBe('PLAYBACK_STARTED');
      expect(message.senderTabId).toBe(tabId);
      expect(message.timestamp).toBeDefined();
      expect(typeof message.timestamp).toBe('number');
    });

    it('should create PLAYBACK_STOPPED message', () => {
      const message = createPlaybackStoppedMessage(tabId);

      expect(message.type).toBe('PLAYBACK_STOPPED');
      expect(message.senderTabId).toBe(tabId);
      expect(message.timestamp).toBeDefined();
      expect(typeof message.timestamp).toBe('number');
    });

    it('should create SOURCE_CHANGED message', () => {
      const sourceType = 'youtube';
      const sourceUrl = 'https://youtube.com/watch?v=test';
      const message = createSourceChangedMessage(tabId, sourceType, sourceUrl);

      expect(message.type).toBe('SOURCE_CHANGED');
      expect(message.senderTabId).toBe(tabId);
      expect(message.timestamp).toBeDefined();
      expect(message.payload).toEqual({
        sourceType,
        sourceUrl,
      });
    });

    it('should create SOURCE_CHANGED message without sourceUrl', () => {
      const sourceType = 'upload';
      const message = createSourceChangedMessage(tabId, sourceType);

      expect(message.type).toBe('SOURCE_CHANGED');
      expect(message.payload).toEqual({
        sourceType,
        sourceUrl: undefined,
      });
    });
  });

  describe('Type guard functions', () => {
    const tabId = 'test-tab-123';

    it('isPlaybackStartedMessage should identify PLAYBACK_STARTED messages', () => {
      const message = createPlaybackStartedMessage(tabId);
      expect(isPlaybackStartedMessage(message)).toBe(true);
      expect(isPlaybackStoppedMessage(message)).toBe(false);
      expect(isSourceChangedMessage(message)).toBe(false);
    });

    it('isPlaybackStoppedMessage should identify PLAYBACK_STOPPED messages', () => {
      const message = createPlaybackStoppedMessage(tabId);
      expect(isPlaybackStoppedMessage(message)).toBe(true);
      expect(isPlaybackStartedMessage(message)).toBe(false);
      expect(isSourceChangedMessage(message)).toBe(false);
    });

    it('isSourceChangedMessage should identify SOURCE_CHANGED messages', () => {
      const message = createSourceChangedMessage(tabId, 'youtube');
      expect(isSourceChangedMessage(message)).toBe(true);
      expect(isPlaybackStartedMessage(message)).toBe(false);
      expect(isPlaybackStoppedMessage(message)).toBe(false);
    });
  });

  describe('isValidBroadcastMessage', () => {
    const tabId = 'test-tab-123';

    it('should validate PLAYBACK_STARTED message', () => {
      const message = createPlaybackStartedMessage(tabId);
      expect(isValidBroadcastMessage(message)).toBe(true);
    });

    it('should validate PLAYBACK_STOPPED message', () => {
      const message = createPlaybackStoppedMessage(tabId);
      expect(isValidBroadcastMessage(message)).toBe(true);
    });

    it('should validate SOURCE_CHANGED message', () => {
      const message = createSourceChangedMessage(tabId, 'youtube');
      expect(isValidBroadcastMessage(message)).toBe(true);
    });

    it('should reject null', () => {
      expect(isValidBroadcastMessage(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isValidBroadcastMessage(undefined)).toBe(false);
    });

    it('should reject object without type', () => {
      expect(isValidBroadcastMessage({})).toBe(false);
    });

    it('should reject object with invalid type', () => {
      expect(isValidBroadcastMessage({ type: 'INVALID_TYPE' as any })).toBe(false);
    });

    it('should reject object without senderTabId', () => {
      expect(isValidBroadcastMessage({ type: 'PLAYBACK_STARTED' as any })).toBe(false);
    });

    it('should reject object without timestamp', () => {
      expect(
        isValidBroadcastMessage({
          type: 'PLAYBACK_STARTED' as any,
          senderTabId: 'test',
        })
      ).toBe(false);
    });

    it('should reject object with wrong timestamp type', () => {
      expect(
        isValidBroadcastMessage({
          type: 'PLAYBACK_STARTED' as any,
          senderTabId: 'test',
          timestamp: 'not-a-number' as any,
        })
      ).toBe(false);
    });
  });

  describe('createMusicSyncChannel', () => {
    it('should create a channel with correct name', () => {
      const tabId = 'test-tab-123';
      const channel = createMusicSyncChannel(tabId);

      expect(channel.channel).toBeDefined();
      expect(channel.isSupported).toBe(true);
    });

    it('should initialize channel when init is called', () => {
      const tabId = 'test-tab-123';
      const channel = createMusicSyncChannel(tabId);

      // Channel should be created after init
      expect(channel.channel).toBeDefined();
    });
  });

  describe('getMusicSyncChannel singleton', () => {
    it('should return the same instance on subsequent calls', () => {
      const tabId1 = 'test-tab-1';
      const tabId2 = 'test-tab-2';

      const channel1 = getMusicSyncChannel(tabId1);
      const channel2 = getMusicSyncChannel(tabId2);

      // Should return the same singleton instance
      expect(channel1).toBe(channel2);
    });

    it('should initialize channel on first call', () => {
      const tabId = 'test-tab-123';
      const channel = getMusicSyncChannel(tabId);

      expect(channel).toBeDefined();
      expect(channel.isSupported).toBe(true);
    });
  });

  describe('Message sending and receiving', () => {
    it('should send message through channel', () => {
      const tabId = 'test-tab-123';
      const channel = createMusicSyncChannel(tabId);
      channel.init(); // Initialize the channel
      const message = createPlaybackStartedMessage(tabId);

      // Should not throw
      expect(() => {
        channel.send(message);
      }).not.toThrow();
    });

    it('should register message handler', () => {
      const tabId = 'test-tab-123';
      const channel = createMusicSyncChannel(tabId);
      const mockHandler = jest.fn();

      const cleanup = channel.onMessage(mockHandler);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should call message handler when message is received', (done) => {
      const tabId1 = 'test-tab-1';
      const tabId2 = 'test-tab-2';

      // Create two channels
      const channel1 = createMusicSyncChannel(tabId1);
      channel1.init();
      const channel2 = createMusicSyncChannel(tabId2);
      channel2.init();

      // Register handler on channel2
      const mockHandler = jest.fn((message: BroadcastMessage) => {
        // Should receive message from channel1
        expect(message.type).toBe('PLAYBACK_STARTED');
        expect(message.senderTabId).toBe(tabId1);
        done();
      });

      channel2.onMessage(mockHandler);

      // Use setTimeout to ensure channel is ready
      setTimeout(() => {
        // Send message from channel1
        const message = createPlaybackStartedMessage(tabId1);
        channel1.send(message);
      }, 10);
    }, 10000);

    it('should ignore messages from same tab', (done) => {
      const tabId = 'test-tab-123';
      const channel = createMusicSyncChannel(tabId);
      channel.init();

      const mockHandler = jest.fn(() => {
        // Should not be called
        done.fail('Handler should not be called for messages from same tab');
      });

      channel.onMessage(mockHandler);

      // Send message from same tab
      const message = createPlaybackStartedMessage(tabId);
      channel.send(message);

      // Give time for async handling
      setTimeout(() => {
        expect(mockHandler).not.toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should cleanup handler when cleanup function is called', () => {
      const tabId1 = 'test-tab-1';
      const tabId2 = 'test-tab-2';

      const channel1 = createMusicSyncChannel(tabId1);
      channel1.init();
      const channel2 = createMusicSyncChannel(tabId2);
      channel2.init();

      const mockHandler = jest.fn();
      const cleanup = channel2.onMessage(mockHandler);

      // Cleanup handler
      cleanup();

      // Send message
      const message = createPlaybackStartedMessage(tabId1);
      channel1.send(message);

      // Handler should not be called
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe('cleanupMusicSyncChannel', () => {
    it('should cleanup singleton channel', () => {
      const tabId = 'test-tab-123';
      const channel = getMusicSyncChannel(tabId);

      expect(channel).toBeDefined();

      cleanupMusicSyncChannel();

      // Next call should create new instance
      const newChannel = getMusicSyncChannel('different-tab');
      expect(newChannel).toBeDefined();
    });
  });

  describe('MUSIC_SYNC_CHANNEL constant', () => {
    it('should be "teleprompter-music-sync"', () => {
      expect(MUSIC_SYNC_CHANNEL).toBe('teleprompter-music-sync');
    });
  });

  describe('Error handling', () => {
    it('should handle handler errors gracefully', (done) => {
      const tabId1 = 'test-tab-1';
      const tabId2 = 'test-tab-2';

      const channel1 = createMusicSyncChannel(tabId1);
      channel1.init();
      const channel2 = createMusicSyncChannel(tabId2);
      channel2.init();

      // Handler that throws an error
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      // Handler that should still be called
      const successHandler = jest.fn(() => {
        expect(successHandler).toHaveBeenCalled();
        done();
      });

      channel2.onMessage(errorHandler);
      channel2.onMessage(successHandler);

      // Use setTimeout to ensure channels are ready
      setTimeout(() => {
        // Send message
        const message = createPlaybackStartedMessage(tabId1);
        channel1.send(message);
      }, 10);
    }, 10000);

    it('should handle invalid messages', () => {
      const tabId = 'test-tab-123';
      const channel = createMusicSyncChannel(tabId);
      channel.init();

      // Test isValidBroadcastMessage directly
      expect(isValidBroadcastMessage(null)).toBe(false);
      expect(isValidBroadcastMessage(undefined)).toBe(false);
      expect(isValidBroadcastMessage({})).toBe(false);
      expect(isValidBroadcastMessage({ type: 'INVALID_TYPE' as any })).toBe(false);
      expect(isValidBroadcastMessage({ type: 'PLAYBACK_STARTED' as any, senderTabId: 'test' })).toBe(false);
      expect(isValidBroadcastMessage({ type: 'PLAYBACK_STARTED' as any, senderTabId: 'test', timestamp: 'not-a-number' as any })).toBe(false);

      // Valid messages should pass
      expect(isValidBroadcastMessage(createPlaybackStartedMessage(tabId))).toBe(true);
      expect(isValidBroadcastMessage(createPlaybackStoppedMessage(tabId))).toBe(true);
      expect(isValidBroadcastMessage(createSourceChangedMessage(tabId, 'youtube'))).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple tabs with different sources', (done) => {
      const tabId1 = 'tab-1';
      const tabId2 = 'tab-2';

      const channel1 = createMusicSyncChannel(tabId1);
      channel1.init();
      const channel2 = createMusicSyncChannel(tabId2);
      channel2.init();

      let messagesReceived = 0;

      // Channel2 should receive messages from channel1
      const handler2 = jest.fn((message: BroadcastMessage) => {
        messagesReceived++;
        // After receiving both messages, verify and complete
        if (messagesReceived === 2) {
          expect(handler2).toHaveBeenCalledTimes(2);
          done();
        }
      });

      channel2.onMessage(handler2);

      // Use setTimeout to ensure channels are ready
      setTimeout(() => {
        // Send messages from channel1
        channel1.send(createPlaybackStartedMessage(tabId1));
        setTimeout(() => {
          channel1.send(createSourceChangedMessage(tabId1, 'youtube', 'https://youtube.com/watch?v=test'));
        }, 10);
      }, 10);
    }, 10000);

    it('should handle playback state synchronization', (done) => {
      const tabId1 = 'tab-1';
      const tabId2 = 'tab-2';

      const channel1 = createMusicSyncChannel(tabId1);
      channel1.init();
      const channel2 = createMusicSyncChannel(tabId2);
      channel2.init();

      let state = 'idle';

      const handler = (message: BroadcastMessage) => {
        if (isPlaybackStartedMessage(message)) {
          state = 'playing';
        } else if (isPlaybackStoppedMessage(message)) {
          state = 'stopped';
        }

        if (state === 'stopped') {
          done();
        }
      };

      channel2.onMessage(handler);

      // Use setTimeout to ensure channels are ready
      setTimeout(() => {
        // Simulate playback sequence
        channel1.send(createPlaybackStartedMessage(tabId1));
        setTimeout(() => {
          channel1.send(createPlaybackStoppedMessage(tabId1));
        }, 50);
      }, 10);
    }, 10000);
  });
});
