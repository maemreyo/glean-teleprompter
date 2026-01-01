/**
 * Mock for useContentStore hook
 * Created for 007-unified-state-architecture
 */

import { createMockContentStore } from '../stores/content-store.mock'

// Create the mock hook
export const useContentStoreMock = jest.fn(() => createMockContentStore())

// Export as default for jest.mock
export default useContentStoreMock
