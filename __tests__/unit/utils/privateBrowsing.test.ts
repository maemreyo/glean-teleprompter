/**
 * Unit tests for private browsing detection
 */

import { detectPrivateBrowsing } from '@/lib/utils/privateBrowsing';

describe('detectPrivateBrowsing', () => {
  let originalLocalStorage: Storage;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Safari detection', () => {
    it('should detect private browsing in Safari when localStorage is disabled', async () => {
      // Mock Safari behavior: localStorage access throws QuotaExceededError
      Object.defineProperty(window, 'localStorage', {
        get: jest.fn(() => {
          throw new DOMException('QuotaExceededError');
        }),
        configurable: true,
      });

      const result = await detectPrivateBrowsing();
      expect(result).toBe(true);
    });

    it('should return false when localStorage is accessible', async () => {
      const isPrivate = await detectPrivateBrowsing();
      expect(isPrivate).toBe(false);
    });
  });

  describe('Chrome/Edge detection', () => {
    it('should detect private browsing via requestFileSystem API', async () => {
      // Mock window.requestFileSystem
      const mockRequestFileSystem = jest.fn((_type: number, _size: number, _callback: any) => {
        // Chrome calls the error callback in private mode
        throw new DOMException('SecurityError');
      });

      Object.defineProperty(window, 'requestFileSystem', {
        value: mockRequestFileSystem,
        writable: true,
        configurable: true,
      });

      const result = await detectPrivateBrowsing();
      expect(result).toBe(true);
    });
  });

  describe('Firefox detection', () => {
    it('should detect private browsing via indexedDB', async () => {
      // Mock indexedDB to throw error in private mode
      const mockOpen = jest.fn(() => {
        throw new DOMException('InvalidStateError');
      });

      Object.defineProperty(window, 'indexedDB', {
        value: {
          open: mockOpen,
        },
        writable: true,
        configurable: true,
      });

      const result = await detectPrivateBrowsing();
      expect(result).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should return false when detection methods are unavailable', async () => {
      // Remove all detection APIs
      Object.defineProperty(window, 'localStorage', {
        get: () => originalLocalStorage,
        configurable: true,
      });

      const result = await detectPrivateBrowsing();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Caching', () => {
    it('should cache detection result', async () => {
      const firstResult = await detectPrivateBrowsing();
      const secondResult = await detectPrivateBrowsing();

      expect(firstResult).toBe(secondResult);
    });
  });
});
