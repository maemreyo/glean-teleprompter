/**
 * Mock for usePlaybackStore hook
 * Created for 007-unified-state-architecture
 */

import { createMockPlaybackStore } from '../stores/playback-store.mock'

// Create the mock hook
export const usePlaybackStoreMock = jest.fn(() => createMockPlaybackStore())

// Export as default for jest.mock
export default usePlaybackStoreMock
