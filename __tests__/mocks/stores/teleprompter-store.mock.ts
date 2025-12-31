/**
 * Mock Teleprompter Store
 * Provides a mock implementation of the useTeleprompterStore for testing
 */

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
