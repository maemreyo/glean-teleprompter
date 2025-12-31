/**
 * Mock Config Store
 * Provides a mock implementation of the useConfigStore for testing
 */

import { MockConfigStore } from '../../types/test-mocks';

/**
 * Create a mock Config store with default values
 */
export const createMockConfigStore = (overrides: Partial<MockConfigStore> = {}): MockConfigStore => ({
  // State
  typography: {
    fontFamily: 'Classic',
    fontSize: 48,
    lineHeight: 1.5,
    align: 'center'
  },
  colors: {
    colorIndex: 0
  },
  effects: {
    shadow: { enabled: false },
    glow: { enabled: false, color: '#00ffff' }
  },
  
  // Methods
  setAll: jest.fn(),
  getState: jest.fn(() => ({})),
  
  ...overrides
});

/**
 * Reset the Config store mock state
 */
export const resetConfigStore = () => {
  const store = createMockConfigStore();
  store.setAll.mockClear();
  store.getState.mockClear();
  return store;
};

// Global mock instance
let mockStoreInstance = createMockConfigStore();

/**
 * Get the current mock store instance
 */
export const getMockConfigStore = () => mockStoreInstance;

/**
 * Set the mock store instance
 */
export const setMockConfigStore = (store: MockConfigStore) => {
  mockStoreInstance = store;
};

/**
 * Reset the global mock store to defaults
 */
export const resetGlobalConfigStore = () => {
  mockStoreInstance = createMockConfigStore();
};
