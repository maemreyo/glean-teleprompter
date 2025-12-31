/**
 * Mock Demo Store
 * Provides a mock implementation of the useDemoStore for testing
 */

import { MockDemoStore } from '../../types/test-mocks';

/**
 * Create a mock Demo store with default values
 */
export const createMockDemoStore = (overrides: Partial<MockDemoStore> = {}): MockDemoStore => ({
  // State
  isDemoMode: false,
  
  // Methods
  setDemoMode: jest.fn(),
  
  ...overrides
});

/**
 * Reset the Demo store mock state
 */
export const resetDemoStore = () => {
  const store = createMockDemoStore();
  store.setDemoMode.mockClear();
  return store;
};

// Global mock instance
let mockStoreInstance = createMockDemoStore();

/**
 * Get the current mock store instance
 */
export const getMockDemoStore = () => mockStoreInstance;

/**
 * Set the mock store instance
 */
export const setMockDemoStore = (store: MockDemoStore) => {
  mockStoreInstance = store;
};

/**
 * Reset the global mock store to defaults
 */
export const resetGlobalDemoStore = () => {
  mockStoreInstance = createMockDemoStore();
};
