/**
 * Scroll Utilities Tests
 * 
 * Tests for scroll calculation utility functions
 * @feature 012-standalone-story
 */

import {
  calculateScrollDepth,
  calculateScrollPosition,
  calculateWPM,
  calculateScrollDelta,
  isContentScrollable,
  clampScrollPosition,
} from '@/lib/story/utils/scrollUtils';

describe('scrollUtils', () => {
  describe('calculateScrollDepth', () => {
    it('should return 0 when content is not scrollable', () => {
      const depth = calculateScrollDepth(100, 500, 500);
      expect(depth).toBe(0);
    });

    it('should return 0 when at top of scrollable content', () => {
      const depth = calculateScrollDepth(0, 1000, 500);
      expect(depth).toBe(0);
    });

    it('should return 1 when at bottom of scrollable content', () => {
      const depth = calculateScrollDepth(500, 1000, 500);
      expect(depth).toBe(1);
    });

    it('should return 0.5 when halfway through scrollable content', () => {
      const depth = calculateScrollDepth(250, 1000, 500);
      expect(depth).toBe(0.5);
    });

    it('should clamp negative scroll position to 0', () => {
      const depth = calculateScrollDepth(-100, 1000, 500);
      expect(depth).toBe(0);
    });

    it('should clamp scroll position beyond max to 1', () => {
      const depth = calculateScrollDepth(1000, 1000, 500);
      expect(depth).toBe(1);
    });
  });

  describe('calculateScrollPosition', () => {
    it('should return 0 when content is not scrollable', () => {
      const position = calculateScrollPosition(0.5, 500, 500);
      expect(position).toBe(0);
    });

    it('should return 0 when depth is 0', () => {
      const position = calculateScrollPosition(0, 1000, 500);
      expect(position).toBe(0);
    });

    it('should return max scroll when depth is 1', () => {
      const position = calculateScrollPosition(1, 1000, 500);
      expect(position).toBe(500);
    });

    it('should return halfway position when depth is 0.5', () => {
      const position = calculateScrollPosition(0.5, 1000, 500);
      expect(position).toBe(250);
    });

    it('should clamp negative depth to 0', () => {
      const position = calculateScrollPosition(-0.5, 1000, 500);
      expect(position).toBe(0);
    });

    it('should clamp depth greater than 1 to max scroll', () => {
      const position = calculateScrollPosition(1.5, 1000, 500);
      expect(position).toBe(500);
    });
  });

  describe('calculateWPM', () => {
    it('should return 0 for speed 0', () => {
      const wpm = calculateWPM(0);
      expect(wpm).toBe(0);
    });

    it('should return 150 for speed 1', () => {
      const wpm = calculateWPM(1);
      expect(wpm).toBe(150);
    });

    it('should return 300 for speed 2', () => {
      const wpm = calculateWPM(2);
      expect(wpm).toBe(300);
    });

    it('should return 750 for speed 5', () => {
      const wpm = calculateWPM(5);
      expect(wpm).toBe(750);
    });

    it('should handle decimal speeds', () => {
      const wpm = calculateWPM(1.5);
      expect(wpm).toBe(225);
    });

    it('should round to nearest integer', () => {
      const wpm = calculateWPM(2.7);
      expect(wpm).toBe(405);
    });
  });

  describe('calculateScrollDelta', () => {
    it('should return 0 for speed 0', () => {
      const delta = calculateScrollDelta(0, 1000);
      expect(delta).toBe(0);
    });

    it('should calculate delta based on speed and time', () => {
      const delta = calculateScrollDelta(1, 1000, 60);
      expect(delta).toBe(60);
    });

    it('should scale with speed', () => {
      const delta1 = calculateScrollDelta(1, 1000, 60);
      const delta2 = calculateScrollDelta(2, 1000, 60);
      expect(delta2).toBe(delta1 * 2);
    });

    it('should scale with time', () => {
      const delta1 = calculateScrollDelta(1, 1000, 60);
      const delta2 = calculateScrollDelta(1, 2000, 60);
      expect(delta2).toBe(delta1 * 2);
    });

    it('should use default base speed of 60 px/s', () => {
      const delta = calculateScrollDelta(1, 1000);
      expect(delta).toBe(60);
    });

    it('should respect custom base speed', () => {
      const delta = calculateScrollDelta(1, 1000, 120);
      expect(delta).toBe(120);
    });
  });

  describe('isContentScrollable', () => {
    it('should return false when content fits in viewport', () => {
      const scrollable = isContentScrollable(500, 500);
      expect(scrollable).toBe(false);
    });

    it('should return false when content is smaller than viewport', () => {
      const scrollable = isContentScrollable(400, 500);
      expect(scrollable).toBe(false);
    });

    it('should return true when content is larger than viewport', () => {
      const scrollable = isContentScrollable(1000, 500);
      expect(scrollable).toBe(true);
    });

    it('should handle edge case of equal values', () => {
      const scrollable = isContentScrollable(500, 500);
      expect(scrollable).toBe(false);
    });
  });

  describe('clampScrollPosition', () => {
    it('should return 0 when position is negative', () => {
      const clamped = clampScrollPosition(-100, 500);
      expect(clamped).toBe(0);
    });

    it('should return maxScroll when position exceeds max', () => {
      const clamped = clampScrollPosition(1000, 500);
      expect(clamped).toBe(500);
    });

    it('should return position when within bounds', () => {
      const clamped = clampScrollPosition(250, 500);
      expect(clamped).toBe(250);
    });

    it('should return 0 when position is exactly 0', () => {
      const clamped = clampScrollPosition(0, 500);
      expect(clamped).toBe(0);
    });

    it('should return maxScroll when position is exactly maxScroll', () => {
      const clamped = clampScrollPosition(500, 500);
      expect(clamped).toBe(500);
    });
  });
});
