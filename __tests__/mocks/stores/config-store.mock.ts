/**
 * Mock Config Store
 * Provides a mock implementation of the useConfigStore for testing
 */

import { MockConfigStore } from '../../types/test-mocks';

/**
 * Create a mock Config store with default values
 */
export const createMockConfigStore = (overrides: Partial<MockConfigStore> = {}): MockConfigStore => ({
  // State
  typography: {
    fontFamily: 'Classic',
    fontSize: 48,
    lineHeight: 1.5,
    align: 'center'
  },
  colors: {
    colorIndex: 0
  },
  effects: {
    shadow: { enabled: false },
    glow: { enabled: false, color: '#00ffff' }
  },
  
  // Methods
  setAll: jest.fn(),
  getState: jest.fn(() => ({})),
  
  ...overrides
});

/**
 * Reset the Config store mock state
 */
export const resetConfigStore = () => {
  const store = createMockConfigStore();
  store.setAll.mockClear();
  store.getState.mockClear();
  return store;
};

// Global mock instance
let mockStoreInstance = createMockConfigStore();

/**
 * Get the current mock store instance
 */
export const getMockConfigStore = () => mockStoreInstance;

/**
 * Set the mock store instance
 */
export const setMockConfigStore = (store: MockConfigStore) => {
  mockStoreInstance = store;
};

/**
 * Reset the global mock store to defaults
 */
export const resetGlobalConfigStore = () => {
  mockStoreInstance = createMockConfigStore();
};

// Basic test to ensure the module exports work
describe('Config Store Mock', () => {
  it('should export createMockConfigStore function', () => {
    expect(createMockConfigStore).toBeDefined();
    expect(typeof createMockConfigStore).toBe('function');
  });

  it('should create a mock config store with default values', () => {
    const store = createMockConfigStore();
    expect(store).toHaveProperty('typography');
    expect(store).toHaveProperty('colors');
    expect(store).toHaveProperty('effects');
    expect(store).toHaveProperty('setAll');
    expect(store).toHaveProperty('getState');
  });

  it('should allow overrides', () => {
    const store = createMockConfigStore({
      typography: { fontFamily: 'Custom', fontSize: 24, lineHeight: 1.2, align: 'left' as const }
    });
    expect(store.typography?.fontFamily).toBe('Custom');
    expect(store.typography?.fontSize).toBe(24);
  });
});
