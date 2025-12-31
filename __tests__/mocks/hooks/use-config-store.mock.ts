/**
 * Mock useConfigStore Hook
 * Mocks the React hook that uses the Config store
 */

import { createMockConfigStore, resetGlobalConfigStore } from '../stores/config-store.mock';

// Global mock instance
let mockStore = createMockConfigStore();

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
  resetGlobalConfigStore();
};

// Set up the Jest mock
jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: () => mockUseConfigStore()
}));
