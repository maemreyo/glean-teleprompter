/**
 * Mock useDemoStore Hook
 * Mocks the React hook that uses the Demo store
 */

import { createMockDemoStore, resetGlobalDemoStore } from '../stores/demo-store.mock';

// Global mock instance
let mockStore = createMockDemoStore();

/**
 * Mock useDemoStore hook
 * Returns the current mock store instance
 */
export const mockUseDemoStore = () => mockStore;

/**
 * Set the mock store instance
 */
export const setMockDemoStore = (store: ReturnType<typeof createMockDemoStore>) => {
  mockStore = store;
};

/**
 * Reset the mock store to defaults
 */
export const resetMockDemoStore = () => {
  mockStore = createMockDemoStore();
  resetGlobalDemoStore();
};

// Set up the Jest mock
jest.mock('@/stores/useDemoStore', () => ({
  useDemoStore: () => mockUseDemoStore()
}));
