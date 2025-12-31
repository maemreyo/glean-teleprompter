/**
 * Mock localStorage
 * Provides a mock implementation of localStorage with error simulation capabilities
 */

import { MockLocalStorage } from '../types/test-mocks';

/**
 * Create a mock localStorage instance
 */
const createLocalStorageMock = (): MockLocalStorage => {
  const store = new Map<string, string>();
  
  return {
    getItem: jest.fn((key: string) => store.get(key) || null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
    }),
    clear: jest.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: jest.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    }),
    
    // Error simulation helpers
    simulateQuotaExceeded: () => {
      store.clear();
      store.set = () => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      };
    },
    
    simulateCorruptedData: (key: string, data: string) => {
      store.set(key, data);
    },
    
    simulateDisabled: () => {
      store.clear();
      store.get = () => {
        throw new Error('localStorage is disabled');
      };
      store.set = () => {
        throw new Error('localStorage is disabled');
      };
    },
    
    reset: () => {
      store.clear();
    }
  };
};

// Global mock instance
export const mockLocalStorage = createLocalStorageMock();

/**
 * Assert that a value was stored in localStorage
 */
export function expectStored(key: string, value: string) {
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
}

/**
 * Assert that a value was NOT stored in localStorage
 */
export function expectNotStored(key: string) {
  expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
    key,
    expect.any(String)
  );
}

/**
 * Assert that localStorage.getItem was called
 */
export function expectRetrieved(key: string, times = 1) {
  expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(times);
  expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
}

/**
 * Get a value from the mock localStorage
 */
export function getStoredValue(key: string): string | null {
  return mockLocalStorage.getItem(key);
}

/**
 * Reset the mock localStorage
 */
export function resetLocalStorage() {
  mockLocalStorage.reset();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.setItem.mockClear();
  mockLocalStorage.removeItem.mockClear();
  mockLocalStorage.clear.mockClear();
  mockLocalStorage.key.mockClear();
}

/**
 * Spy on localStorage methods
 * Returns the same instance since methods are already jest.Mock
 */
export const spyOnLocalStorage = () => ({
  getItem: mockLocalStorage.getItem,
  setItem: mockLocalStorage.setItem,
  removeItem: mockLocalStorage.removeItem,
  clear: mockLocalStorage.clear,
  key: mockLocalStorage.key
});
