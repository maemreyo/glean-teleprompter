/**
 * Mock BroadcastChannel API
 * Provides a mock implementation of BroadcastChannel for testing cross-tab synchronization
 */

import type { BroadcastMessage } from '@/types/music';

/**
 * Mock BroadcastChannel instance
 */
class MockBroadcastChannelImpl {
  public static channels = new Map<string, MockBroadcastChannelImpl>();
  private messageHandlers: Array<(event: MessageEvent) => void> = [];
  private errorHandlers: Array<(event: ErrorEvent) => void> = [];
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onmessageerror: ((event: ErrorEvent) => void) | null = null;

  constructor(public name: string) {
    // Store channel instance for cross-communication
    MockBroadcastChannelImpl.channels.set(name, this);
  }

  /**
   * Send a message to all other channels with the same name
   */
  postMessage(message: BroadcastMessage): void {
    // Get all channels with this name except this one
    const channels = Array.from(MockBroadcastChannelImpl.channels.values())
      .filter((channel) => channel.name === this.name && channel !== this);

    // Create message event
    const event = new MessageEvent('message', { data: message });

    // Notify all other channels
    channels.forEach((channel) => {
      channel._triggerMessage(event);
    });
  }

  /**
   * Register a message listener
   */
  addEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.messageHandlers.push(listener as (event: MessageEvent) => void);
    } else if (type === 'messageerror') {
      this.errorHandlers.push(listener as (event: ErrorEvent) => void);
    }
  }

  /**
   * Remove a message listener
   */
  removeEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.messageHandlers = this.messageHandlers.filter((l) => l !== listener);
    } else if (type === 'messageerror') {
      this.errorHandlers = this.errorHandlers.filter((l) => l !== listener);
    }
  }

  /**
   * Close the channel
   */
  close(): void {
    MockBroadcastChannelImpl.channels.delete(this.name);
    this.messageHandlers = [];
    this.errorHandlers = [];
  }

  /**
   * Internal method to trigger message listeners (used by postMessage)
   */
  _triggerMessage(event: MessageEvent): void {
    // First trigger addEventListener listeners
    this.messageHandlers.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('[MockBroadcastChannel] Listener error:', error);
      }
    });

    // Then trigger onmessage property handler
    if (this.onmessage) {
      try {
        this.onmessage(event);
      } catch (error) {
        console.error('[MockBroadcastChannel] onmessage error:', error);
      }
    }
  }

  /**
   * Internal method to trigger error listeners
   */
  _triggerError(event: ErrorEvent): void {
    // First trigger addEventListener listeners
    this.errorHandlers.forEach((listener) => {
      listener(event);
    });

    // Then trigger onmessageerror property handler
    if (this.onmessageerror) {
      this.onmessageerror(event);
    }
  }

  /**
   * Simulate an error
   */
  simulateError(error: Error): void {
    const event = new ErrorEvent('messageerror', { error });
    this._triggerError(event);
  }

  /**
   * Get the number of listeners
   */
  get listenerCount(): number {
    return this.messageHandlers.length;
  }

  /**
   * Clear all channels (use in beforeEach)
   */
  static clearAll(): void {
    MockBroadcastChannelImpl.channels.clear();
  }

  /**
   * Get all channel names
   */
  static getChannelNames(): string[] {
    return Array.from(MockBroadcastChannelImpl.channels.keys());
  }
}

/**
 * Create a mock BroadcastChannel
 */
export function createMockBroadcastChannel(name: string): MockBroadcastChannelImpl {
  return new MockBroadcastChannelImpl(name);
}

/**
 * Set up global BroadcastChannel mock
 */
export function setupBroadcastChannelMock(): void {
  // Clear all existing channels
  MockBroadcastChannelImpl.clearAll();

  // Mock BroadcastChannel constructor
  (global as any).BroadcastChannel = class {
    name: string;
    impl: MockBroadcastChannelImpl;

    constructor(name: string) {
      this.name = name;
      this.impl = createMockBroadcastChannel(name);
    }

    postMessage(message: BroadcastMessage): void {
      this.impl.postMessage(message);
    }

    addEventListener(type: string, listener: EventListener): void {
      this.impl.addEventListener(type, listener);
    }

    removeEventListener(type: string, listener: EventListener): void {
      this.impl.removeEventListener(type, listener);
    }

    close(): void {
      this.impl.close();
    }

    get onmessage(): ((event: MessageEvent) => void) | null {
      return this.impl.onmessage;
    }

    set onmessage(handler: ((event: MessageEvent) => void) | null) {
      this.impl.onmessage = handler;
    }

    get onmessageerror(): ((event: ErrorEvent) => void) | null {
      return this.impl.onmessageerror;
    }

    set onmessageerror(handler: ((event: ErrorEvent) => void) | null) {
      this.impl.onmessageerror = handler;
    }
  };
}

/**
 * Clean up BroadcastChannel mock (use in afterEach)
 */
export function cleanupBroadcastChannelMock(): void {
  MockBroadcastChannelImpl.clearAll();
}

/**
 * Get a mock channel by name
 */
export function getMockChannel(name: string): MockBroadcastChannelImpl | undefined {
  return MockBroadcastChannelImpl.channels.get(name);
}

/**
 * Send a message to a specific channel (useful for testing)
 */
export function sendMessageToChannel(channelName: string, message: BroadcastMessage): void {
  const channel = getMockChannel(channelName);
  if (channel) {
    channel.postMessage(message);
  }
}

/**
 * Assert that a channel exists
 */
export function expectChannelExists(channelName: string): void {
  const channel = getMockChannel(channelName);
  expect(channel).toBeDefined();
}

/**
 * Assert that a channel does not exist
 */
export function expectChannelNotExists(channelName: string): void {
  const channel = getMockChannel(channelName);
  expect(channel).toBeUndefined();
}

/**
 * Get all channel names
 */
export function getAllChannelNames(): string[] {
  return MockBroadcastChannelImpl.getChannelNames();
}
