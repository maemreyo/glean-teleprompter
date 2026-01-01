/**
 * Mock useTeleprompterStore Hook
 * Mocks the React hook that uses the Teleprompter store
 *
 * @DEPRECATED - 007-unified-state-architecture
 * This hook is being replaced by:
 * - useContentStore (text, bgUrl, musicUrl, isReadOnly)
 * - useConfigStore (all styling properties)
 * - usePlaybackStore (isPlaying, currentTime, scrollSpeed)
 * - useUIStore (mode)
 *
 * DO NOT USE IN NEW TESTS - Use the new hooks instead
 * This file will be removed after all tests are migrated
 */

// Log deprecation warning on import
if (typeof console !== 'undefined' && console.warn) {
  console.warn(
    'useTeleprompterStore hook is deprecated. ' +
    'Use useContentStore, useConfigStore, usePlaybackStore, or useUIStore instead. ' +
    'See specs/007-unified-state-architecture/ for migration guide.'
  )
}

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
