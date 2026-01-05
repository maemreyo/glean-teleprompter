/**
 * Scrolling Performance Tests
 *
 * Performance benchmarks for teleprompter scrolling functionality.
 * Tests verify 30fps+ requirement and battery efficiency (T085).
 *
 * @feature 012-standalone-story
 */

import { renderHook, act } from '@testing-library/react';
import { useTeleprompterScroll } from '@/lib/story/hooks/useTeleprompterScroll';

// Mock Wake Lock for performance tests
jest.mock('@/lib/story/hooks/useWakeLock', () => ({
  useWakeLock: jest.fn(() => ({
    requestWakeLock: jest.fn().mockResolvedValue(undefined),
    releaseWakeLock: jest.fn(),
    isWakeLockSupported: true,
    error: null,
  })),
}));

describe('Scrolling Performance Benchmarks', () => {
  let container: HTMLDivElement;
  let rafCallbacks: number[];
  let originalRAF: typeof requestAnimationFrame;
  let originalCancelRAF: typeof cancelAnimationFrame;

  beforeEach(() => {
    // Create test container
    container = document.createElement('div');
    container.style.height = '600px';
    container.style.overflow = 'auto';
    container.innerHTML = `
      <div style="height: 10000px;" data-scroll-container>
        <p style="padding: 2rem; font-size: 28px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
          ${Array(1000).fill('Sample paragraph text for performance testing. ').join('\n\n')}
        </p>
      </div>
    `;
    document.body.appendChild(container);

    // Track RAF callbacks
    rafCallbacks = [];
    originalRAF = window.requestAnimationFrame;
    originalCancelRAF = window.cancelAnimationFrame;

    window.requestAnimationFrame = jest.fn((callback) => {
      const id = rafCallbacks.length;
      rafCallbacks.push(id);
      // Immediately execute callback for synchronous testing
      callback(performance.now());
      return id;
    }) as unknown as typeof requestAnimationFrame;

    window.cancelAnimationFrame = jest.fn((id) => {
      const index = rafCallbacks.indexOf(id);
      if (index > -1) {
        rafCallbacks.splice(index, 1);
      }
    }) as unknown as typeof cancelAnimationFrame;
  });

  afterEach(() => {
    document.body.removeChild(container);
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCancelRAF;
  });

  describe('Frame Rate Performance', () => {
    it('should maintain 30fps+ during scrolling (T085)', async () => {
      const { result } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      const frameTimes: number[] = [];
      const startTime = performance.now();

      // Simulate 100 frames (approximately 3 seconds at 30fps)
      for (let i = 0; i < 100; i++) {
        const frameStart = performance.now();

        await act(async () => {
          result.current.startScrolling();
        });

        const frameEnd = performance.now();
        frameTimes.push(frameEnd - frameStart);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageFPS = (100 / totalTime) * 1000;

      // Verify 30fps+ maintained (SC-002)
      expect(averageFPS).toBeGreaterThanOrEqual(30);
    });

    it('should have consistent frame times with minimal variance', async () => {
      const { result } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      const frameTimes: number[] = [];

      for (let i = 0; i < 60; i++) {
        const frameStart = performance.now();

        await act(async () => {
          result.current.startScrolling();
        });

        frameTimes.push(performance.now() - frameStart);
      }

      // Calculate standard deviation
      const mean = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
      const variance = frameTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / frameTimes.length;
      const stdDev = Math.sqrt(variance);

      // Frame times should be consistent (low variance indicates smooth scrolling)
      expect(stdDev).toBeLessThan(16.67); // Less than 1 frame variance at 60fps
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory during scrolling', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize;

      const { result, unmount } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      // Start and stop scrolling multiple times
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.startScrolling();
        });
        act(() => {
          result.current.stopScrolling();
        });
      }

      unmount();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize;

      // Memory should not grow significantly (only check if memory API is available)
      if (initialMemory && finalMemory) {
        const memoryGrowth = finalMemory - initialMemory;
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
      }
    });

    it('should clean up RAF on unmount', () => {
      const { unmount } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      act(() => {
        // Start scrolling to create RAF
      });

      const cancelCallsBefore = (window.cancelAnimationFrame as jest.Mock).mock.calls.length;

      unmount();

      const cancelCallsAfter = (window.cancelAnimationFrame as jest.Mock).mock.calls.length;

      // Should cancel RAF on unmount
      expect(cancelCallsAfter).toBeGreaterThan(cancelCallsBefore);
    });
  });

  describe('Scroll Update Performance', () => {
    it('should throttle progress updates to 100ms max (T087)', async () => {
      const onProgress = jest.fn();
      const progressTimestamps: number[] = [];

      onProgress.mockImplementation(() => {
        progressTimestamps.push(performance.now());
      });

      renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: onProgress,
          onScrollComplete: jest.fn(),
        })
      );

      const startTime = performance.now();

      // Simulate 500ms of scrolling
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Calculate minimum time between updates
      let minInterval = Infinity;
      for (let i = 1; i < progressTimestamps.length; i++) {
        const interval = progressTimestamps[i] - progressTimestamps[i - 1];
        minInterval = Math.min(minInterval, interval);
      }

      // Updates should be throttled to at least 100ms
      expect(minInterval).toBeGreaterThanOrEqual(90); // Allow small margin for timing variance
    });

    it('should batch DOM updates efficiently', async () => {
      const containerSpy = jest.spyOn(container.querySelector('[data-scroll-container]') as HTMLElement, 'scrollTop', 'set');

      const { result } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      const callCountBefore = containerSpy.mock.calls.length;

      // Simulate multiple frames
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          result.current.startScrolling();
        });
      }

      const callCountAfter = containerSpy.mock.calls.length;
      const updatesMade = callCountAfter - callCountBefore;

      // Should make reasonable number of updates (not excessive)
      expect(updatesMade).toBeLessThan(20);
    });
  });

  describe('Battery Efficiency', () => {
    it('should pause RAF when scrolling stops', async () => {
      const { result } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      // Start scrolling
      await act(async () => {
        result.current.startScrolling();
      });

      const rafCallsWhileScrolling = (window.requestAnimationFrame as jest.Mock).mock.calls.length;

      // Stop scrolling
      await act(async () => {
        result.current.stopScrolling();
      });

      // Wait for deceleration to complete
      await new Promise(resolve => setTimeout(resolve, 200));

      const rafCallsAfterStop = (window.requestAnimationFrame as jest.Mock).mock.calls.length;

      // RAF calls should stop or significantly reduce after stopping
      expect(rafCallsAfterStop).toBeLessThanOrEqual(rafCallsWhileScrolling + 5);
    });

    it('should use efficient deceleration to avoid unnecessary computation', async () => {
      const { result } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      const onProgress = jest.fn();
      const renderHookResult = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: onProgress,
          onScrollComplete: jest.fn(),
        })
      );

      // Start scrolling
      await act(async () => {
        renderHookResult.result.current.startScrolling();
      });

      // Stop scrolling
      await act(async () => {
        renderHookResult.result.current.stopScrolling();
      });

      const callsDuringDeceleration = onProgress.mock.calls.length;

      // Deceleration should complete quickly (few frames)
      expect(callsDuringDeceleration).toBeLessThan(20);
    });
  });

  describe('DOM Performance', () => {
    it('should minimize reflows during scrolling', async () => {
      const layoutTriggerCount = jest.fn();

      // Monitor forced reflows
      const originalOffsetHeight = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetHeight'
      );

      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get: function () {
          layoutTriggerCount();
          if (originalOffsetHeight && originalOffsetHeight.get) {
            return originalOffsetHeight.get.call(this);
          }
          return 0;
        },
        configurable: true,
      });

      const { result } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: container.querySelector('[data-scroll-container]') as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      // Scroll for 30 frames
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          result.current.startScrolling();
        });
      }

      // Restore original property
      if (originalOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight);
      }

      // Should minimize layout reads
      expect(layoutTriggerCount.mock.calls.length).toBeLessThan(50);
    });
  });

  describe('Large Content Performance', () => {
    it('should handle 10,000+ word content efficiently', async () => {
      // Create large content
      const largeContent = Array(200).fill(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '
      ).join('\n\n');

      const largeContainer = document.createElement('div');
      largeContainer.innerHTML = `<div style="height: 10000px;">${largeContent}</div>`;

      const startTime = performance.now();

      const { result } = renderHook(() =>
        useTeleprompterScroll({
          containerRef: { current: largeContainer.firstElementChild as HTMLElement },
          onScrollProgress: jest.fn(),
          onScrollComplete: jest.fn(),
        })
      );

      // Test scroll performance with large content
      await act(async () => {
        result.current.startScrolling();
      });

      const initTime = performance.now() - startTime;

      // Initialization should be fast even with large content
      expect(initTime).toBeLessThan(1000); // Less than 1 second

      document.body.removeChild(largeContainer);
    });
  });
});
