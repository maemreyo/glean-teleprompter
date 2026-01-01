/**
 * Mock Playback Store
 * Provides a mock implementation of the usePlaybackStore for testing
 * Created for 007-unified-state-architecture
 */

export interface MockPlaybackStore {
  // State
  isPlaying: boolean
  currentTime: number
  scrollSpeed: number

  // Actions
  setIsPlaying: jest.Mock
  togglePlaying: jest.Mock
  setCurrentTime: jest.Mock
  advanceTime: jest.Mock
  setScrollSpeed: jest.Mock
  reset: jest.Mock
}

/**
 * Create a mock Playback store with default values
 */
export const createMockPlaybackStore = (overrides: Partial<MockPlaybackStore> = {}): MockPlaybackStore => ({
  // State
  isPlaying: false,
  currentTime: 0,
  scrollSpeed: 1,

  // Actions
  setIsPlaying: jest.fn(),
  togglePlaying: jest.fn(),
  setCurrentTime: jest.fn(),
  advanceTime: jest.fn(),
  setScrollSpeed: jest.fn(),
  reset: jest.fn(),

  ...overrides
})

/**
 * Reset the Playback store mock state
 */
export const resetPlaybackStore = () => {
  const store = createMockPlaybackStore()
  store.setIsPlaying.mockClear()
  store.togglePlaying.mockClear()
  store.setCurrentTime.mockClear()
  store.advanceTime.mockClear()
  store.setScrollSpeed.mockClear()
  store.reset.mockClear()
  return store
}

// Global mock instance
let mockStoreInstance = createMockPlaybackStore()

/**
 * Get the current mock store instance
 */
export const getMockPlaybackStore = () => mockStoreInstance

/**
 * Set the mock store instance
 */
export const setMockPlaybackStore = (store: MockPlaybackStore) => {
  mockStoreInstance = store
}

/**
 * Reset the global mock store to defaults
 */
export const resetGlobalPlaybackStore = () => {
  mockStoreInstance = createMockPlaybackStore()
}

// Basic test to ensure the module exports work
describe('Playback Store Mock', () => {
  it('should export createMockPlaybackStore function', () => {
    expect(createMockPlaybackStore).toBeDefined()
    expect(typeof createMockPlaybackStore).toBe('function')
  })

  it('should create a mock playback store with default values', () => {
    const store = createMockPlaybackStore()
    expect(store).toHaveProperty('isPlaying')
    expect(store).toHaveProperty('currentTime')
    expect(store).toHaveProperty('scrollSpeed')
    expect(store).toHaveProperty('setIsPlaying')
    expect(store).toHaveProperty('togglePlaying')
    expect(store).toHaveProperty('setCurrentTime')
  })

  it('should allow overrides', () => {
    const store = createMockPlaybackStore({
      isPlaying: true,
      currentTime: 100
    })
    expect(store.isPlaying).toBe(true)
    expect(store.currentTime).toBe(100)
  })
})
