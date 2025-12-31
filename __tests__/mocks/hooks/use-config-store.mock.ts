/**
 * Mock useConfigStore Hook
 * Mocks the React hook that uses the Config store
 * Supports Zustand pattern: useConfigStore() and useConfigStore.getState()
 */

import { createMockConfigStore, resetGlobalConfigStore } from '../stores/config-store.mock';

// Global mock instance
let mockStore = createMockConfigStore();

/**
 * Create the mock hook with Zustand support
 */
const createUseConfigStoreMock = () => {
  const mockHook = jest.fn(() => mockStore);
  // Add getState for direct store access: useConfigStore.getState()
  (mockHook as any).getState = jest.fn(() => mockStore);
  return mockHook as typeof mockHook & { getState: jest.Mock };
};

// Create the mock instance
export const mockUseConfigStoreInstance = createUseConfigStoreMock();

/**
 * Mock useConfigStore hook
 * Returns the current mock store instance
 */
export const mockUseConfigStore = () => mockStore;

/**
 * Set the mock store instance
 */
export const setMockConfigStore = (store: ReturnType<typeof createMockConfigStore>) => {
  mockStore = store;
};

/**
 * Reset the mock store to defaults
 */
export const resetMockConfigStore = () => {
  mockStore = createMockConfigStore();
  mockUseConfigStoreInstance.mockClear();
  (mockUseConfigStoreInstance as any).getState.mockClear();
  resetGlobalConfigStore();
};

// Set up the Jest mock
jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: mockUseConfigStoreInstance
}));
