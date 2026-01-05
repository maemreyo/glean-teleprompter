/**
 * useWakeLock Hook Unit Tests
 *
 * Tests for screen wake lock management using Wake Lock API
 * with NoSleep.js fallback.
 *
 * @feature 012-standalone-story
 * @file __tests__/unit/story/hooks/useWakeLock.test.ts
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useWakeLock } from '@/lib/story/hooks/useWakeLock';

// Create a single mock instance that will be returned by the constructor
const createMockNoSleepInstance = () => ({
  enable: jest.fn(() => Promise.resolve()),
  disable: jest.fn(),
});

const mockNoSleepInstance = createMockNoSleepInstance();

// Mock NoSleep.js module to always return the same instance
jest.mock('nosleep.js', () => {
  return jest.fn(() => mockNoSleepInstance);
});

import NoSleep from 'nosleep.js';

// Wake Lock API mock
const mockWakeLockSentinel = {
  release: jest.fn(() => Promise.resolve()),
  addEventListener: jest.fn(),
};

const mockWakeLock = {
  request: jest.fn(() => Promise.resolve(mockWakeLockSentinel)),
};

describe('useWakeLock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Reset NoSleep instance methods
    mockNoSleepInstance.enable.mockClear();
    mockNoSleepInstance.disable.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Wake Lock API (native)', () => {
    beforeEach(() => {
      // Mock native Wake Lock API
      Object.defineProperty(navigator, 'wakeLock', {
        value: mockWakeLock,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      // Clean up
      delete (navigator as any).wakeLock;
    });

    it('should detect native Wake Lock API support', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });
    });

    it('should request wake lock successfully', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      await act(async () => {
        await result.current.requestWakeLock();
      });

      expect(mockWakeLock.request).toHaveBeenCalledWith('screen');
      expect(result.current.isWakeLockActive).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should release wake lock', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      // Request wake lock
      await act(async () => {
        await result.current.requestWakeLock();
      });

      expect(result.current.isWakeLockActive).toBe(true);

      // Release wake lock
      act(() => {
        result.current.releaseWakeLock();
      });

      expect(mockWakeLockSentinel.release).toHaveBeenCalled();
      expect(result.current.isWakeLockActive).toBe(false);
    });

    it('should handle wake lock request failure', async () => {
      const error = new Error('Wake lock request failed');
      mockWakeLock.request.mockRejectedValueOnce(error);

      const onError = jest.fn();
      const { result } = renderHook(() => useWakeLock({ onError }));

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      await act(async () => {
        try {
          await result.current.requestWakeLock();
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.isWakeLockActive).toBe(false);
      expect(result.current.error).toEqual(error);
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should call onRequest callback when wake lock is acquired', async () => {
      const onRequest = jest.fn();
      const { result } = renderHook(() => useWakeLock({ onRequest }));

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      await act(async () => {
        await result.current.requestWakeLock();
      });

      expect(onRequest).toHaveBeenCalled();
    });

    it('should call onRelease callback when wake lock is released', async () => {
      const onRelease = jest.fn();
      const { result } = renderHook(() => useWakeLock({ onRelease }));

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      await act(async () => {
        await result.current.requestWakeLock();
      });

      act(() => {
        result.current.releaseWakeLock();
      });

      expect(onRelease).toHaveBeenCalled();
    });

    it('should re-request wake lock when tab becomes visible', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      // Request initial wake lock
      await act(async () => {
        await result.current.requestWakeLock();
      });

      expect(result.current.isWakeLockActive).toBe(true);

      // Simulate tab visibility change
      act(() => {
        // Tab becomes hidden (wake lock auto-released)
        const releaseCallback = mockWakeLockSentinel.addEventListener.mock.calls.find(
          (call) => call[0] === 'release'
        )?.[1];

        if (releaseCallback) {
          releaseCallback();
        }
      });

      // Tab becomes visible again
      act(() => {
        const event = new Event('visibilitychange');
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true,
        });
        document.dispatchEvent(event);
      });

      await waitFor(() => {
        expect(mockWakeLock.request).toHaveBeenCalledTimes(2); // Initial + re-request
      });
    });

    it('should release wake lock on unmount', async () => {
      const { result, unmount } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      await act(async () => {
        await result.current.requestWakeLock();
      });

      expect(result.current.isWakeLockActive).toBe(true);

      act(() => {
        unmount();
      });

      expect(mockWakeLockSentinel.release).toHaveBeenCalled();
    });
  });

  describe('NoSleep.js fallback', () => {
    beforeEach(() => {
      // Remove native Wake Lock API
      delete (navigator as any).wakeLock;
    });

    it('should detect NoSleep.js support when native API unavailable', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });
    });

    it('should request wake lock using NoSleep.js', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      await act(async () => {
        await result.current.requestWakeLock();
      });

      expect(mockNoSleepInstance.enable).toHaveBeenCalled();
      expect(result.current.isWakeLockActive).toBe(true);
    });

    it('should release wake lock using NoSleep.js', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(true);
      });

      await act(async () => {
        await result.current.requestWakeLock();
      });

      expect(result.current.isWakeLockActive).toBe(true);

      act(() => {
        result.current.releaseWakeLock();
      });

      expect(mockNoSleepInstance.disable).toHaveBeenCalled();
      expect(result.current.isWakeLockActive).toBe(false);
    });
  });

  describe('No wake lock support', () => {
    beforeEach(() => {
      // Mock NoSleep constructor to throw error (simulating failure)
      (NoSleep as jest.Mock).mockImplementation(() => {
        throw new Error('NoSleep initialization failed');
      });
    });

    afterEach(() => {
      // Reset to default mock
      (NoSleep as jest.Mock).mockImplementation(() => mockNoSleepInstance);
    });

    it('should set isWakeLockSupported to false when NoSleep fails to initialize', async () => {
      const { result } = renderHook(() => useWakeLock());

      // Wait for initialization attempt
      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toContain('NoSleep initialization failed');
    });

    it('should throw error when requesting wake lock on unsupported device', async () => {
      const { result } = renderHook(() => useWakeLock());

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(false);
      });

      await act(async () => {
        await expect(result.current.requestWakeLock()).rejects.toThrow(
          'Wake lock is not supported on this device'
        );
      });

      expect(result.current.error).not.toBeNull();
    });
  });
});
