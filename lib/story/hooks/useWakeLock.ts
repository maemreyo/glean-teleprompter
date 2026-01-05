/**
 * useWakeLock Hook
 *
 * Custom hook for managing screen wake lock using Wake Lock API
 * with NoSleep.js fallback for Safari/iOS.
 *
 * @feature 012-standalone-story
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API
 */

import { useRef, useCallback, useEffect, useState } from 'react';

interface WakeLockOptions {
  onRequest?: () => void;
  onRelease?: () => void;
  onError?: (error: Error) => void;
}

interface UseWakeLockReturn {
  isWakeLockActive: boolean;
  isWakeLockSupported: boolean;
  requestWakeLock: () => Promise<void>;
  releaseWakeLock: () => void;
  error: Error | null;
}

interface WakeLockSentinel extends EventTarget {
  release: () => Promise<void>;
}

interface WakeLockType {
  request: (type: 'screen') => Promise<WakeLockSentinel>;
}

// NoSleep.js interface
interface NoSleepInstance {
  enable: () => Promise<void>;
  disable: () => void;
}

// Extend Window interface with NoSleep
declare global {
  interface Window {
    NoSleep?: new () => NoSleepInstance;
  }
}

/**
 * Hook for managing screen wake lock
 *
 * Uses the native Wake Lock API when available (Chrome/Edge),
 * falls back to NoSleep.js for Safari/iOS.
 *
 * @param options - Callbacks for wake lock events
 * @returns Wake lock state and controls
 */
export function useWakeLock({
  onRequest,
  onRelease,
  onError,
}: WakeLockOptions = {}): UseWakeLockReturn {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const noSleepRef = useRef<NoSleepInstance | null>(null);
  const releaseListenerRef = useRef<(() => void) | null>(null);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [isWakeLockSupported, setIsWakeLockSupported] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isUsingFallbackRef = useRef(false);

  /**
   * Check if Wake Lock API is supported
   */
  const checkSupport = useCallback((): boolean => {
    return 'wakeLock' in navigator && 'request' in (navigator.wakeLock as WakeLockType);
  }, []);

  /**
   * Load NoSleep.js from CDN (T062)
   */
  const loadNoSleep = useCallback(async (): Promise<boolean> => {
    // Check if NoSleep is already loaded
    if (window.NoSleep) {
      return true;
    }

    try {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/nosleep.js@0.12.0/dist/NoSleep.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.integrity = 'sha384-lp0XiAMtqqqjyVLBYjAcDQzxc2XyGj3sGESoiWbccHdpXjNUPUjWrq5GMqaGHGp9';

      const loadPromise = new Promise<boolean>((resolve, reject) => {
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load NoSleep.js from CDN'));
      });

      document.head.appendChild(script);
      return await loadPromise;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading NoSleep.js');
      setError(error);
      onError?.(error);
      return false;
    }
  }, [onError]);

  /**
   * Initialize wake lock support detection and load fallback if needed
   */
  useEffect(() => {
    const nativeSupported = checkSupport();

    if (nativeSupported) {
      setIsWakeLockSupported(true);
      isUsingFallbackRef.current = false;
    } else {
      // Try to load NoSleep.js as fallback
      loadNoSleep().then((loaded) => {
        if (loaded && window.NoSleep) {
          setIsWakeLockSupported(true);
          isUsingFallbackRef.current = true;
          noSleepRef.current = new window.NoSleep();
        } else {
          setIsWakeLockSupported(false);
          setError(
            new Error(
              'Screen wake lock not available. Please try a different browser or check your network connection.'
            )
          );
        }
      });
    }
  }, [checkSupport, loadNoSleep]);

  /**
   * Request wake lock (T061, T063)
   */
  const requestWakeLock = useCallback(async (): Promise<void> => {
    setError(null);

    // Check if wake lock is supported
    if (!isWakeLockSupported) {
      const err = new Error('Wake lock is not supported on this device');
      setError(err);
      onError?.(err);
      throw err;
    }

    try {
      if (isUsingFallbackRef.current) {
        // Use NoSleep.js fallback
        if (!noSleepRef.current && window.NoSleep) {
          noSleepRef.current = new window.NoSleep();
        }

        if (noSleepRef.current) {
          await noSleepRef.current.enable();
          setIsWakeLockActive(true);
          onRequest?.();
        }
      } else {
        // Use native Wake Lock API
        
        // Clean up old event listener from previous wake lock if it exists
        if (sentinelRef.current && releaseListenerRef.current) {
          try {
            sentinelRef.current.removeEventListener('release', releaseListenerRef.current);
          } catch {
            // Ignore errors when removing listener from already released sentinel
          }
        }
        
        const wakeLock = await navigator.wakeLock.request('screen');
        sentinelRef.current = wakeLock;
        
        // Create and store the release listener function
        releaseListenerRef.current = () => {
          setIsWakeLockActive(false);
          sentinelRef.current = null;
          releaseListenerRef.current = null;
          onRelease?.();
        };
        
        setIsWakeLockActive(true);
        onRequest?.();

        // Listen for wake lock release (system-initiated)
        wakeLock.addEventListener('release', releaseListenerRef.current);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to request wake lock');
      setError(error);
      setIsWakeLockActive(false);
      onError?.(error);
      throw error;
    }
  }, [isWakeLockSupported, onRequest, onRelease, onError]);

  /**
   * Release wake lock (T064)
   */
  const releaseWakeLock = useCallback(() => {
    try {
      if (isUsingFallbackRef.current && noSleepRef.current) {
        noSleepRef.current.disable();
        setIsWakeLockActive(false);
        onRelease?.();
      } else if (sentinelRef.current) {
        // Remove event listener before releasing
        if (releaseListenerRef.current) {
          try {
            sentinelRef.current.removeEventListener('release', releaseListenerRef.current);
          } catch {
            // Ignore errors when removing listener
          }
        }
        
        sentinelRef.current.release();
        sentinelRef.current = null;
        releaseListenerRef.current = null;
        setIsWakeLockActive(false);
        onRelease?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to release wake lock');
      setError(error);
      onError?.(error);
    }
  }, [onRelease, onError]);

  /**
   * Handle tab visibility changes (T065)
   *
   * When user returns to the tab, re-request wake lock if it was previously active.
   * When user leaves the tab, wake lock is automatically released by the browser.
   */
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Re-request wake lock when returning to tab
        if (isWakeLockActive && isWakeLockSupported) {
          try {
            await requestWakeLock();
          } catch (err) {
            // Fail silently - user can manually restart scrolling
            console.warn('Failed to re-request wake lock:', err);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isWakeLockActive, isWakeLockSupported, requestWakeLock]);

  /**
   * Handle low battery mode (T068)
   *
   * Some devices may impose restrictions on wake locks in low battery mode.
   * This is handled gracefully by catching errors when requesting wake lock.
   */

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clean up event listener if it exists
      if (sentinelRef.current && releaseListenerRef.current) {
        try {
          sentinelRef.current.removeEventListener('release', releaseListenerRef.current);
        } catch {
          // Ignore errors during cleanup
        }
      }
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    isWakeLockActive,
    isWakeLockSupported,
    requestWakeLock,
    releaseWakeLock,
    error,
  };
}
