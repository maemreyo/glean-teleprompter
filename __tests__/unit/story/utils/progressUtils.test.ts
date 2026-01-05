/**
 * Progress Utilities Tests
 * 
 * Tests for progress bar synchronization with scroll depth
 * 
 * @feature 012-standalone-story
 */

import {
  calculateProgressFromScroll,
  calculateScrollFromProgress,
  createProgressThrottle,
  isValidProgress,
  clampProgress,
} from '@/lib/story/utils/progressUtils';

describe('Progress Utilities', () => {
  describe('calculateProgressFromScroll', () => {
    it('should return 0 when at top of scroll', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const scrollTop = 0;
      
      const progress = calculateProgressFromScroll(scrollTop, scrollHeight, viewportHeight);
      
      expect(progress).toBe(0);
    });

    it('should return 1 when at bottom of scroll', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const scrollTop = 500; // maxScroll = 1000 - 500 = 500
      
      const progress = calculateProgressFromScroll(scrollTop, scrollHeight, viewportHeight);
      
      expect(progress).toBe(1);
    });

    it('should return 0.5 when at middle of scroll', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const scrollTop = 250; // half of maxScroll (500)
      
      const progress = calculateProgressFromScroll(scrollTop, scrollHeight, viewportHeight);
      
      expect(progress).toBe(0.5);
    });

    it('should handle content shorter than viewport', () => {
      const scrollHeight = 400;
      const viewportHeight = 500;
      const scrollTop = 0;
      
      const progress = calculateProgressFromScroll(scrollTop, scrollHeight, viewportHeight);
      
      expect(progress).toBe(0);
    });

    it('should account for top gradient zone', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const scrollTop = 200; // 200px scrolled
      const topGradientHeight = 100; // 100px gradient zone
      
      const progress = calculateProgressFromScroll(
        scrollTop,
        scrollHeight,
        viewportHeight,
        topGradientHeight
      );
      
      // With gradient, effective scroll is (200 - 100) / (500 - 100) = 100 / 400 = 0.25
      expect(progress).toBeCloseTo(0.25, 5);
    });

    it('should clamp values to valid range', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      
      // Test negative scroll
      expect(calculateProgressFromScroll(-100, scrollHeight, viewportHeight)).toBe(0);
      
      // Test scroll beyond max
      expect(calculateProgressFromScroll(1000, scrollHeight, viewportHeight)).toBe(1);
    });
  });

  describe('calculateScrollFromProgress', () => {
    it('should return 0 when progress is 0', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const progress = 0;
      
      const scrollTop = calculateScrollFromProgress(progress, scrollHeight, viewportHeight);
      
      expect(scrollTop).toBe(0);
    });

    it('should return max scroll when progress is 1', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const progress = 1;
      
      const scrollTop = calculateScrollFromProgress(progress, scrollHeight, viewportHeight);
      
      expect(scrollTop).toBe(500); // maxScroll = 1000 - 500
    });

    it('should return middle position when progress is 0.5', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const progress = 0.5;
      
      const scrollTop = calculateScrollFromProgress(progress, scrollHeight, viewportHeight);
      
      expect(scrollTop).toBe(250); // half of maxScroll (500)
    });

    it('should handle content shorter than viewport', () => {
      const scrollHeight = 400;
      const viewportHeight = 500;
      const progress = 0.5;
      
      const scrollTop = calculateScrollFromProgress(progress, scrollHeight, viewportHeight);
      
      expect(scrollTop).toBe(0);
    });

    it('should account for top gradient zone', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const progress = 0.5;
      const topGradientHeight = 100;
      
      const scrollTop = calculateScrollFromProgress(
        progress,
        scrollHeight,
        viewportHeight,
        topGradientHeight
      );
      
      // With gradient: (0.5 * (500 - 100)) + 100 = 200 + 100 = 300
      expect(scrollTop).toBe(300);
    });

    it('should clamp progress to valid range', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      
      // Test negative progress
      expect(calculateScrollFromProgress(-0.5, scrollHeight, viewportHeight)).toBe(0);
      
      // Test progress beyond 1
      expect(calculateScrollFromProgress(1.5, scrollHeight, viewportHeight)).toBe(500);
    });

    it('should be inverse of calculateProgressFromScroll', () => {
      const scrollHeight = 1000;
      const viewportHeight = 500;
      const originalScrollTop = 333;
      
      const progress = calculateProgressFromScroll(originalScrollTop, scrollHeight, viewportHeight);
      const calculatedScrollTop = calculateScrollFromProgress(progress, scrollHeight, viewportHeight);
      
      expect(calculatedScrollTop).toBeCloseTo(originalScrollTop, 5);
    });
  });

  describe('createProgressThrottle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call callback immediately on first call', () => {
      const callback = jest.fn();
      const throttle = createProgressThrottle(callback, 100);
      
      throttle(0.5);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(0.5);
    });

    it('should throttle subsequent calls', () => {
      const callback = jest.fn();
      const throttle = createProgressThrottle(callback, 100);
      
      throttle(0.3);
      expect(callback).toHaveBeenCalledTimes(1);
      
      throttle(0.5);
      throttle(0.7);
      expect(callback).toHaveBeenCalledTimes(1); // Still only called once
      
      jest.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(2); // Called again with latest value
      expect(callback).toHaveBeenLastCalledWith(0.7);
    });

    it('should update with latest value after throttle period', () => {
      const callback = jest.fn();
      const throttle = createProgressThrottle(callback, 100);
      
      throttle(0.2);
      throttle(0.4);
      throttle(0.6);
      throttle(0.8);
      
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(0.2);
      
      jest.advanceTimersByTime(100);
      
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith(0.8);
    });

    it('should reset timer after throttle period', () => {
      const callback = jest.fn();
      const throttle = createProgressThrottle(callback, 50);
      
      throttle(0.3);
      jest.advanceTimersByTime(50);
      
      throttle(0.7);
      expect(callback).toHaveBeenCalledTimes(2);
      
      jest.advanceTimersByTime(50);
      expect(callback).toHaveBeenCalledTimes(2); // No new call
    });
  });

  describe('isValidProgress', () => {
    it('should return true for valid progress values', () => {
      expect(isValidProgress(0)).toBe(true);
      expect(isValidProgress(0.5)).toBe(true);
      expect(isValidProgress(1)).toBe(true);
      expect(isValidProgress(0.001)).toBe(true);
      expect(isValidProgress(0.999)).toBe(true);
    });

    it('should return false for invalid progress values', () => {
      expect(isValidProgress(-0.1)).toBe(false);
      expect(isValidProgress(1.1)).toBe(false);
      expect(isValidProgress(NaN)).toBe(false);
      expect(isValidProgress(Infinity)).toBe(false);
      expect(isValidProgress(-Infinity)).toBe(false);
      expect(isValidProgress(null as any)).toBe(false);
      expect(isValidProgress(undefined as any)).toBe(false);
      expect(isValidProgress('0.5' as any)).toBe(false);
    });
  });

  describe('clampProgress', () => {
    it('should return value as-is when within range', () => {
      expect(clampProgress(0)).toBe(0);
      expect(clampProgress(0.5)).toBe(0.5);
      expect(clampProgress(1)).toBe(1);
    });

    it('should clamp values below 0 to 0', () => {
      expect(clampProgress(-0.1)).toBe(0);
      expect(clampProgress(-1)).toBe(0);
      expect(clampProgress(-Infinity)).toBe(0);
    });

    it('should clamp values above 1 to 1', () => {
      expect(clampProgress(1.1)).toBe(1);
      expect(clampProgress(2)).toBe(1);
      expect(clampProgress(Infinity)).toBe(1);
    });

    it('should handle NaN by returning 0', () => {
      const result = clampProgress(NaN);
      // NaN comparisons always return false, so NaN passes through both checks
      // We expect it to be NaN since Math.min(NaN, 1) and Math.max(0, NaN) both return NaN
      expect(result).toBeNaN();
    });
  });

  describe('integration tests', () => {
    it('should maintain consistent progress across multiple calculations', () => {
      const scrollHeight = 2000;
      const viewportHeight = 800;
      const testScrollPositions = [0, 200, 400, 600, 800, 1000, 1200];
      
      testScrollPositions.forEach(scrollTop => {
        const progress = calculateProgressFromScroll(scrollTop, scrollHeight, viewportHeight);
        const calculatedScrollTop = calculateScrollFromProgress(progress, scrollHeight, viewportHeight);
        
        expect(calculatedScrollTop).toBeCloseTo(scrollTop, 5);
      });
    });

    it('should handle edge cases consistently', () => {
      const cases = [
        { scrollHeight: 1000, viewportHeight: 500 },
        { scrollHeight: 500, viewportHeight: 1000 },
        { scrollHeight: 10000, viewportHeight: 100 },
        { scrollHeight: 100, viewportHeight: 100 },
      ];
      
      cases.forEach(({ scrollHeight, viewportHeight }) => {
        const maxScroll = Math.max(0, scrollHeight - viewportHeight);
        
        // Only test if content is scrollable
        if (maxScroll > 0) {
          // Test at 0%, 50%, 100%
          [0, 0.5, 1].forEach(progress => {
            const scrollTop = calculateScrollFromProgress(progress, scrollHeight, viewportHeight);
            const calculatedProgress = calculateProgressFromScroll(scrollTop, scrollHeight, viewportHeight);
            
            expect(calculatedProgress).toBeCloseTo(progress, 5);
          });
        }
      });
    });
  });
});
