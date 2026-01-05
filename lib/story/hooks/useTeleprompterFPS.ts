/**
 * useTeleprompterFPS Hook
 *
 * Monitors FPS (frames per second) for teleprompter scrolling.
 * Only active in development mode to help identify performance issues.
 *
 * @feature 012-standalone-story
 */

import { useEffect, useRef, useState } from 'react';

const isDevMode = process.env.NODE_ENV === 'development';

/**
 * Extension to Window interface for development debugging
 */
declare global {
  interface Window {
    __teleprompterFPS?: {
      getMetrics: () => FPSMetrics;
    };
  }
}

/**
 * FPS metrics for monitoring scroll performance
 */
export interface FPSMetrics {
  currentFPS: number;
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  frameCount: number;
}

/**
 * Return type for useTeleprompterFPS hook
 */
export interface UseTeleprompterFPSReturn {
  /**
   * Record a frame for FPS calculation (call during RAF)
   */
  recordFrame: () => void;
  /**
   * Get current FPS metrics
   */
  getMetrics: () => FPSMetrics;
  /**
   * Reset FPS monitoring
   */
  reset: () => void;
  /**
   * Current FPS metrics
   */
  metrics: FPSMetrics;
  /**
   * Whether the device is considered low-end (< 30 FPS)
   */
  isLowEndDevice: boolean;
}

/**
 * Log interval in frames (approx every 2 seconds at 30fps)
 */
const LOG_INTERVAL_FRAMES = 60;

/**
 * Threshold for low-end device detection (FPS)
 */
const LOW_END_FPS_THRESHOLD = 30;

/**
 * Create an FPS monitor instance
 * @returns FPS monitor methods
 */
function createFPSMonitor() {
  let frameCount = 0;
  let lastTime = performance.now();
  let fpsSum = 0;
  let fpsCount = 0;
  let minFPS = Infinity;
  let maxFPS = 0;

  const recordFrame = () => {
    if (!isDevMode) return;

    const now = performance.now();
    const delta = now - lastTime;
    lastTime = now;

    const fps = 1000 / delta;
    fpsSum += fps;
    fpsCount++;
    minFPS = Math.min(minFPS, fps);
    maxFPS = Math.max(maxFPS, fps);
    frameCount++;

    // Log every 60 frames (approx 2 seconds at 30fps)
    if (frameCount % LOG_INTERVAL_FRAMES === 0) {
      const avgFPS = fpsSum / fpsCount;
      console.debug(
        `[Teleprompter FPS] Current: ${fps.toFixed(1)}, Avg: ${avgFPS.toFixed(1)}, Min: ${minFPS.toFixed(1)}, Max: ${maxFPS.toFixed(1)}`
      );
    }
  };

  const getMetrics = (): FPSMetrics => ({
    currentFPS: fpsCount > 0 ? fpsSum / fpsCount : 0,
    averageFPS: fpsSum / fpsCount || 0,
    minFPS: minFPS === Infinity ? 0 : minFPS,
    maxFPS,
    frameCount,
  });

  const reset = () => {
    frameCount = 0;
    fpsSum = 0;
    fpsCount = 0;
    minFPS = Infinity;
    maxFPS = 0;
    lastTime = performance.now();
  };

  return { recordFrame, getMetrics, reset };
}

/**
 * Hook for monitoring teleprompter scroll FPS
 *
 * Provides FPS tracking for development mode to identify performance issues.
 * Automatically disabled in production builds.
 *
 * @returns FPS monitoring utilities and metrics
 *
 * @example
 * ```tsx
 * const { recordFrame, metrics, isLowEndDevice } = useTeleprompterFPS();
 *
 * // In your RAF loop
 * const scrollFrame = (timestamp: number) => {
 *   recordFrame();
 *   // ... scroll logic
 * };
 * ```
 */
export function useTeleprompterFPS(): UseTeleprompterFPSReturn {
  const fpsMonitor = useRef(createFPSMonitor());
  const [metrics, setMetrics] = useState<FPSMetrics>({
    currentFPS: 0,
    averageFPS: 0,
    minFPS: 0,
    maxFPS: 0,
    frameCount: 0,
  });

  // Update metrics periodically (every 60 frames)
  useEffect(() => {
    if (!isDevMode) return;

    const interval = setInterval(() => {
      setMetrics(fpsMonitor.current.getMetrics());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Make FPS metrics available via window for debugging (dev only)
  useEffect(() => {
    if (!isDevMode) return;

    if (typeof window !== 'undefined') {
      window.__teleprompterFPS = {
        getMetrics: () => fpsMonitor.current.getMetrics(),
      };
    }

    return () => {
      if (typeof window !== 'undefined' && window.__teleprompterFPS) {
        delete window.__teleprompterFPS;
      }
    };
  }, []);

  // Reset on unmount
  useEffect(() => {
    return () => {
      if (isDevMode) {
        fpsMonitor.current.reset();
      }
    };
  }, []);

  return {
    recordFrame: fpsMonitor.current.recordFrame,
    getMetrics: fpsMonitor.current.getMetrics,
    reset: fpsMonitor.current.reset,
    metrics,
    isLowEndDevice: metrics.averageFPS > 0 && metrics.averageFPS < LOW_END_FPS_THRESHOLD,
  };
}
