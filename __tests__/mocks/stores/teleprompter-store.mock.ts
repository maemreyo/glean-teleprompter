/**
 * Mock Teleprompter Store
 * Provides a mock implementation of the useTeleprompterStore for testing
 *
 * @DEPRECATED - 007-unified-state-architecture
 * This store is being replaced by:
 * - useContentStore (text, bgUrl, musicUrl, isReadOnly)
 * - useConfigStore (all styling properties)
 * - usePlaybackStore (isPlaying, currentTime, scrollSpeed)
 * - useUIStore (mode)
 *
 * DO NOT USE IN NEW TESTS - Use the new stores instead
 * This file will be removed after all tests are migrated
 */

// Log deprecation warning on import
if (typeof console !== 'undefined' && console.warn) {
  console.warn(
    'useTeleprompterStore is deprecated. ' +
    'Use useContentStore, useConfigStore, usePlaybackStore, or useUIStore instead. ' +
    'See specs/007-unified-state-architecture/ for migration guide.'
  )
}

import { MockTeleprompterStore, FontStyle, TextAlign, StudioMode } from '../../types/test-mocks';

/**
 * Create a mock Teleprompter store with default values
 */
export const createMockTeleprompterStore = (overrides: Partial<MockTeleprompterStore> = {}): MockTeleprompterStore => ({
  // State
  text: '',
  bgUrl: '',
  musicUrl: '',
  font: 'Classic' as FontStyle,
  colorIndex: 0,
  speed: 2,
  fontSize: 48,
  align: 'center' as TextAlign,
  lineHeight: 1.5,
  margin: 0,
  overlayOpacity: 0.5,
  mode: 'setup' as StudioMode,
  isReadOnly: false,
  
  // Methods
  setText: jest.fn(),
  setBgUrl: jest.fn(),
  setMusicUrl: jest.fn(),
  setAll: jest.fn(),
  
  ...overrides
});

/**
 * Reset the Teleprompter store mock state
 */
export const resetTeleprompterStore = () => {
  const store = createMockTeleprompterStore();
  store.setText.mockClear();
  store.setBgUrl.mockClear();
  store.setMusicUrl.mockClear();
  store.setAll.mockClear();
  return store;
};

// Global mock instance
let mockStoreInstance = createMockTeleprompterStore();

/**
 * Get the current mock store instance
 */
export const getMockTeleprompterStore = () => mockStoreInstance;

/**
 * Set the mock store instance
 */
export const setMockTeleprompterStore = (store: MockTeleprompterStore) => {
  mockStoreInstance = store;
};

/**
 * Reset the global mock store to defaults
 */
export const resetGlobalTeleprompterStore = () => {
  mockStoreInstance = createMockTeleprompterStore();
};
