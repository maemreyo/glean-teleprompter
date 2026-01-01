/**
 * Mock Content Store
 * Provides a mock implementation of the useContentStore for testing
 * Created for 007-unified-state-architecture
 */

export interface MockContentStore {
  // State
  text: string
  bgUrl: string
  musicUrl: string
  isReadOnly: boolean

  // Actions
  setText: jest.Mock
  setBgUrl: jest.Mock
  setMusicUrl: jest.Mock
  setIsReadOnly: jest.Mock
  setAll: jest.Mock
  reset: jest.Mock
  resetContent: jest.Mock
  resetMedia: jest.Mock
}

/**
 * Create a mock Content store with default values
 */
export const createMockContentStore = (overrides: Partial<MockContentStore> = {}): MockContentStore => ({
  // State
  text: 'Chào mừng! Hãy nhập nội dung của bạn vào đây...',
  bgUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  musicUrl: '',
  isReadOnly: false,

  // Actions
  setText: jest.fn(),
  setBgUrl: jest.fn(),
  setMusicUrl: jest.fn(),
  setIsReadOnly: jest.fn(),
  setAll: jest.fn(),
  reset: jest.fn(),
  resetContent: jest.fn(),
  resetMedia: jest.fn(),

  ...overrides
})

/**
 * Reset the Content store mock state
 */
export const resetContentStore = () => {
  const store = createMockContentStore()
  store.setText.mockClear()
  store.setBgUrl.mockClear()
  store.setMusicUrl.mockClear()
  store.setIsReadOnly.mockClear()
  store.setAll.mockClear()
  store.reset.mockClear()
  store.resetContent.mockClear()
  store.resetMedia.mockClear()
  return store
}

// Global mock instance
let mockStoreInstance = createMockContentStore()

/**
 * Get the current mock store instance
 */
export const getMockContentStore = () => mockStoreInstance

/**
 * Set the mock store instance
 */
export const setMockContentStore = (store: MockContentStore) => {
  mockStoreInstance = store
}

/**
 * Reset the global mock store to defaults
 */
export const resetGlobalContentStore = () => {
  mockStoreInstance = createMockContentStore()
}

// Basic test to ensure the module exports work
describe('Content Store Mock', () => {
  it('should export createMockContentStore function', () => {
    expect(createMockContentStore).toBeDefined()
    expect(typeof createMockContentStore).toBe('function')
  })

  it('should create a mock content store with default values', () => {
    const store = createMockContentStore()
    expect(store).toHaveProperty('text')
    expect(store).toHaveProperty('bgUrl')
    expect(store).toHaveProperty('musicUrl')
    expect(store).toHaveProperty('isReadOnly')
    expect(store).toHaveProperty('setText')
    expect(store).toHaveProperty('setBgUrl')
    expect(store).toHaveProperty('setMusicUrl')
  })

  it('should allow overrides', () => {
    const store = createMockContentStore({
      text: 'Custom text',
      isReadOnly: true
    })
    expect(store.text).toBe('Custom text')
    expect(store.isReadOnly).toBe(true)
  })
})
