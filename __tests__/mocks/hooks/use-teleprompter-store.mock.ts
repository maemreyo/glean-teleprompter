/**
 * Mock useTeleprompterStore Hook
 * Mocks the React hook that uses the Teleprompter store
 */

import { createMockTeleprompterStore, resetGlobalTeleprompterStore } from '../stores/teleprompter-store.mock';

// Global mock instance
let mockStore = createMockTeleprompterStore();

/**
 * Mock useTeleprompterStore hook
 * Returns the current mock store instance
 */
export const mockUseTeleprompterStore = () => mockStore;

/**
 * Set the mock store instance
 */
export const setMockTeleprompterStore = (store: ReturnType<typeof createMockTeleprompterStore>) => {
  mockStore = store;
};

/**
 * Reset the mock store to defaults
 */
export const resetMockTeleprompterStore = () => {
  mockStore = createMockTeleprompterStore();
  resetGlobalTeleprompterStore();
};

// Set up the Jest mock
jest.mock('@/stores/useTeleprompterStore', () => ({
  useTeleprompterStore: () => mockUseTeleprompterStore()
}));
