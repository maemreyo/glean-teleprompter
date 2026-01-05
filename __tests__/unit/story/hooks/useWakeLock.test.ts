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

// Mock NoSleep.js
const mockNoSleepInstance = {
  enable: jest.fn(() => Promise.resolve()),
  disable: jest.fn(),
};

const mockNoSleepClass = jest.fn(() => mockNoSleepInstance);

// Mock document methods for script loading
const mockCreateElement = jest.spyOn(document, 'createElement');
const mockAppendChild = jest.spyOn(document.head, 'appendChild');

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

    // Reset NoSleep mock
    (window as any).NoSleep = undefined;

    // Reset document methods
    mockCreateElement.mockReset();
    mockAppendChild.mockReset();
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

      // Mock NoSleep.js
      (window as any).NoSleep = mockNoSleepClass;
    });

    afterEach(() => {
      delete (window as any).NoSleep;
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

  describe('NoSleep.js CDN loading', () => {
    beforeEach(() => {
      // Remove native Wake Lock API and NoSleep
      delete (navigator as any).wakeLock;
      delete (window as any).NoSleep;

      // Mock createElement to return a script element
      const mockScript = document.createElement('script');
      mockCreateElement.mockReturnValue(mockScript);
    });

    it('should load NoSleep.js from CDN when not available', async () => {
      renderHook(() => useWakeLock());

      // Wait for initialization
      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith('script');
      });

      expect(mockCreateElement).toHaveBeenCalledWith('script');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should handle NoSleep.js loading failure', async () => {
      const onError = jest.fn();
      const mockScript = document.createElement('script');
      mockCreateElement.mockReturnValue(mockScript);

      // Simulate loading error
      mockScript.onerror = () => {
        (window as any).NoSleep = undefined;
      };

      const { result } = renderHook(() => useWakeLock({ onError }));

      // Trigger the error
      act(() => {
        const errorEvent = new Event('error');
        mockScript.dispatchEvent(errorEvent);
      });

      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('No wake lock support', () => {
    beforeEach(() => {
      // Remove all wake lock support
      delete (navigator as any).wakeLock;
      delete (window as any).NoSleep;

      // Mock createElement to fail loading NoSleep
      const mockScript = document.createElement('script');
      mockCreateElement.mockReturnValue(mockScript);
    });

    it('should set isWakeLockSupported to false when no support', async () => {
      const { result } = renderHook(() => useWakeLock());

      // Wait for initialization attempt
      await waitFor(() => {
        expect(result.current.isWakeLockSupported).toBe(false);
      });
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
