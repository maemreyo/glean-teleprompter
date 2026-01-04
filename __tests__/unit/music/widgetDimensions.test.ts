/**
 * Unit tests for widget dimensions utilities
 * Tests widget positioning, constraints, and visibility calculations
 * 
 * @feature 011-music-player-widget
 */

import {
  WIDGET_DIMENSIONS,
  DEFAULT_POSITION,
  VIEWPORT_MARGIN,
  MIN_VISIBLE_PERCENTAGE,
  calculateDefaultPosition,
  constrainPosition,
  calculateDragDelta,
  isPositionValid,
  getVisiblePercentage,
  getViewportDimensions,
} from '@/lib/music/widgetDimensions';
import type { WidgetStyle } from '@/types/music';

describe('WIDGET_DIMENSIONS constants', () => {
  it('should have capsule dimensions', () => {
    expect(WIDGET_DIMENSIONS.capsule).toBeDefined();
    expect(WIDGET_DIMENSIONS.capsule.width).toBe(280);
    expect(WIDGET_DIMENSIONS.capsule.height).toBe(80);
  });

  it('should have vinyl dimensions', () => {
    expect(WIDGET_DIMENSIONS.vinyl).toBeDefined();
    expect(WIDGET_DIMENSIONS.vinyl.width).toBe(200);
    expect(WIDGET_DIMENSIONS.vinyl.height).toBe(200);
  });

  it('should have spectrum dimensions', () => {
    expect(WIDGET_DIMENSIONS.spectrum).toBeDefined();
    expect(WIDGET_DIMENSIONS.spectrum.width).toBe(320);
    expect(WIDGET_DIMENSIONS.spectrum.height).toBe(120);
  });

  it('should have min and max dimensions for capsule', () => {
    expect(WIDGET_DIMENSIONS.capsule.minWidth).toBe(240);
    expect(WIDGET_DIMENSIONS.capsule.minHeight).toBe(72);
    expect(WIDGET_DIMENSIONS.capsule.maxWidth).toBe(400);
    expect(WIDGET_DIMENSIONS.capsule.maxHeight).toBe(96);
  });

  it('should have min and max dimensions for vinyl', () => {
    expect(WIDGET_DIMENSIONS.vinyl.minWidth).toBe(160);
    expect(WIDGET_DIMENSIONS.vinyl.minHeight).toBe(160);
    expect(WIDGET_DIMENSIONS.vinyl.maxWidth).toBe(280);
    expect(WIDGET_DIMENSIONS.vinyl.maxHeight).toBe(280);
  });

  it('should have min and max dimensions for spectrum', () => {
    expect(WIDGET_DIMENSIONS.spectrum.minWidth).toBe(280);
    expect(WIDGET_DIMENSIONS.spectrum.minHeight).toBe(100);
    expect(WIDGET_DIMENSIONS.spectrum.maxWidth).toBe(480);
    expect(WIDGET_DIMENSIONS.spectrum.maxHeight).toBe(160);
  });
});

describe('DEFAULT_POSITION constant', () => {
  it('should have x and y at 0', () => {
    expect(DEFAULT_POSITION.x).toBe(0);
    expect(DEFAULT_POSITION.y).toBe(0);
  });
});

describe('VIEWPORT_MARGIN constant', () => {
  it('should be 16 pixels', () => {
    expect(VIEWPORT_MARGIN).toBe(16);
  });
});

describe('MIN_VISIBLE_PERCENTAGE constant', () => {
  it('should be 0.5 (50%)', () => {
    expect(MIN_VISIBLE_PERCENTAGE).toBe(0.5);
  });
});

describe('calculateDefaultPosition', () => {
  it('should calculate position for capsule widget', () => {
    const viewportWidth = 1920;
    const viewportHeight = 1080;
    const position = calculateDefaultPosition('capsule', viewportWidth, viewportHeight);

    expect(position.x).toBe(1920 - 280 - 16); // viewportWidth - widgetWidth - margin
    expect(position.y).toBe(1080 - 80 - 16); // viewportHeight - widgetHeight - margin
  });

  it('should calculate position for vinyl widget', () => {
    const viewportWidth = 1920;
    const viewportHeight = 1080;
    const position = calculateDefaultPosition('vinyl', viewportWidth, viewportHeight);

    expect(position.x).toBe(1920 - 200 - 16);
    expect(position.y).toBe(1080 - 200 - 16);
  });

  it('should calculate position for spectrum widget', () => {
    const viewportWidth = 1920;
    const viewportHeight = 1080;
    const position = calculateDefaultPosition('spectrum', viewportWidth, viewportHeight);

    expect(position.x).toBe(1920 - 320 - 16);
    expect(position.y).toBe(1080 - 120 - 16);
  });

  it('should handle small viewport', () => {
    const viewportWidth = 400;
    const viewportHeight = 300;
    const position = calculateDefaultPosition('capsule', viewportWidth, viewportHeight);

    expect(position.x).toBe(400 - 280 - 16);
    expect(position.y).toBe(300 - 80 - 16);
  });
});

describe('constrainPosition', () => {
  describe('capsule widget', () => {
    const style: WidgetStyle = 'capsule';
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    it('should keep widget fully visible', () => {
      const position = { x: 100, y: 100 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      expect(constrained).toEqual({ x: 100, y: 100 });
    });

    it('should constrain widget that goes off left edge', () => {
      const position = { x: -200, y: 100 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      // Widget can be partially off-screen but must keep 50% visible
      // Capsule width is 280, min visible is 140
      // So minX = -(280 - 140) = -140
      expect(constrained.x).toBeGreaterThanOrEqual(-140);
    });

    it('should constrain widget that goes off right edge', () => {
      const position = { x: 1900, y: 100 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      // Widget can be partially off-screen but must keep 50% visible
      // maxX = viewportWidth - minVisibleWidth = 1920 - 140 = 1780
      expect(constrained.x).toBeLessThanOrEqual(1780);
    });

    it('should constrain widget that goes off top edge', () => {
      const position = { x: 100, y: -100 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      // Capsule height is 80, min visible is 40
      // minY = -(80 - 40) = -40
      expect(constrained.y).toBeGreaterThanOrEqual(-40);
    });

    it('should constrain widget that goes off bottom edge', () => {
      const position = { x: 100, y: 1100 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      // maxY = viewportHeight - minVisibleHeight = 1080 - 40 = 1040
      expect(constrained.y).toBeLessThanOrEqual(1040);
    });
  });

  describe('vinyl widget', () => {
    const style: WidgetStyle = 'vinyl';
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    it('should keep widget fully visible', () => {
      const position = { x: 100, y: 100 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      expect(constrained).toEqual({ x: 100, y: 100 });
    });

    it('should constrain widget that goes off edges', () => {
      const position = { x: -150, y: -150 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      // Vinyl width/height is 200, min visible is 100
      // minY = -(200 - 100) = -100
      expect(constrained.x).toBeGreaterThanOrEqual(-100);
      expect(constrained.y).toBeGreaterThanOrEqual(-100);
    });
  });

  describe('spectrum widget', () => {
    const style: WidgetStyle = 'spectrum';
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    it('should keep widget fully visible', () => {
      const position = { x: 100, y: 100 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      expect(constrained).toEqual({ x: 100, y: 100 });
    });

    it('should constrain widget that goes off edges', () => {
      const position = { x: 2500, y: 1200 };
      const constrained = constrainPosition(position, style, viewportWidth, viewportHeight);

      // Spectrum width is 320, height is 120
      // min visible width is 160, height is 60
      // maxX = 1920 - 160 = 1760
      // maxY = 1080 - 60 = 1020
      expect(constrained.x).toBeLessThanOrEqual(1760);
      expect(constrained.y).toBeLessThanOrEqual(1020);
    });
  });
});

describe('calculateDragDelta', () => {
  const style: WidgetStyle = 'capsule';
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  it('should add delta to current position', () => {
    const currentPosition = { x: 100, y: 100 };
    const result = calculateDragDelta(currentPosition, 50, 75, style, viewportWidth, viewportHeight);

    expect(result.x).toBe(150);
    expect(result.y).toBe(175);
  });

  it('should handle negative delta', () => {
    const currentPosition = { x: 100, y: 100 };
    const result = calculateDragDelta(currentPosition, -25, -50, style, viewportWidth, viewportHeight);

    expect(result.x).toBe(75);
    expect(result.y).toBe(50);
  });

  it('should constrain position after delta', () => {
    const currentPosition = { x: 1800, y: 100 };
    const result = calculateDragDelta(currentPosition, 200, 0, style, viewportWidth, viewportHeight);

    // Position should be constrained to keep widget partially visible
    expect(result.x).toBeLessThanOrEqual(1780); // maxX for capsule
  });

  it('should handle zero delta', () => {
    const currentPosition = { x: 100, y: 100 };
    const result = calculateDragDelta(currentPosition, 0, 0, style, viewportWidth, viewportHeight);

    expect(result).toEqual({ x: 100, y: 100 });
  });
});

describe('isPositionValid', () => {
  const style: WidgetStyle = 'capsule';
  const viewportWidth = 1920;
  const viewportHeight = 1080;

  it('should return true for visible position', () => {
    const position = { x: 100, y: 100 };
    const isValid = isPositionValid(position, style, viewportWidth, viewportHeight);

    expect(isValid).toBe(true);
  });

  it('should return true for partially visible position', () => {
    const position = { x: -100, y: 100 };
    const isValid = isPositionValid(position, style, viewportWidth, viewportHeight);

    // Widget is partially visible
    expect(isValid).toBe(true);
  });

  it('should return false when widget is completely off-screen to the left', () => {
    const position = { x: -300, y: 100 };
    const isValid = isPositionValid(position, style, viewportWidth, viewportHeight);

    // Capsule width is 280, so at x=-300 it's completely off-screen
    expect(isValid).toBe(false);
  });

  it('should return false when widget is completely off-screen to the right', () => {
    const position = { x: 2000, y: 100 };
    const isValid = isPositionValid(position, style, viewportWidth, viewportHeight);

    expect(isValid).toBe(false);
  });

  it('should return false when widget is completely off-screen to the top', () => {
    const position = { x: 100, y: -100 };
    const isValid = isPositionValid(position, style, viewportWidth, viewportHeight);

    // Capsule height is 80, so at y=-100 it's completely off-screen
    expect(isValid).toBe(false);
  });

  it('should return false when widget is completely off-screen to the bottom', () => {
    const position = { x: 100, y: 1200 };
    const isValid = isPositionValid(position, style, viewportWidth, viewportHeight);

    expect(isValid).toBe(false);
  });

  it('should handle edge case where widget is exactly at viewport edge', () => {
    const position = { x: 0, y: 0 };
    const isValid = isPositionValid(position, style, viewportWidth, viewportHeight);

    // Widget is at origin, partially visible
    expect(isValid).toBe(true);
  });
});

describe('getVisiblePercentage', () => {
  const style: WidgetStyle = 'capsule';

  it('should return 1.0 for fully visible widget', () => {
    const position = { x: 100, y: 100 };
    const percentage = getVisiblePercentage(position, style, 1920, 1080);

    expect(percentage).toBe(1.0);
  });

  it('should return 0.5 for widget with 50% visible', () => {
    const position = { x: -140, y: 100 };
    const percentage = getVisiblePercentage(position, style, 1920, 1080);

    // Capsule width is 280, at x=-140 exactly 50% is visible
    expect(percentage).toBeCloseTo(0.5, 1);
  });

  it('should return 0 for completely hidden widget', () => {
    const position = { x: -300, y: 100 };
    const percentage = getVisiblePercentage(position, style, 1920, 1080);

    expect(percentage).toBe(0);
  });

  it('should calculate percentage for widget partially off-screen', () => {
    const position = { x: -70, y: 100 };
    const percentage = getVisiblePercentage(position, style, 1920, 1080);

    // Capsule width is 280, at x=-70, 210 pixels are visible
    // 210 / 280 = 0.75
    expect(percentage).toBeCloseTo(0.75, 1);
  });

  it('should handle widget partially off-screen on multiple edges', () => {
    const position = { x: -70, y: -20 };
    const percentage = getVisiblePercentage(position, style, 1920, 1080);

    // Width: 210/280 = 0.75
    // Height: 60/80 = 0.75
    // Area: 0.75 * 0.75 = 0.5625
    expect(percentage).toBeCloseTo(0.56, 1);
  });

  it('should return 0 for zero-area widget', () => {
    // This is an edge case that shouldn't happen in practice
    const position = { x: 0, y: 0 };
    const percentage = getVisiblePercentage(position, 'capsule', 0, 0);

    expect(percentage).toBe(0);
  });
});

describe('getViewportDimensions', () => {
  it('should return window dimensions when available', () => {
    // Mock window object
    const mockInnerWidth = 1920;
    const mockInnerHeight = 1080;
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: mockInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: mockInnerHeight,
    });

    const dimensions = getViewportDimensions();

    expect(dimensions.width).toBe(mockInnerWidth);
    expect(dimensions.height).toBe(mockInnerHeight);
  });

  it('should return default dimensions on server-side', () => {
    // Mock server-side environment
    const originalWindow = global.window;
    // @ts-expect-error - Testing server-side fallback behavior
    delete global.window;

    const dimensions = getViewportDimensions();

    expect(dimensions.width).toBe(1920);
    expect(dimensions.height).toBe(1080);

    // Restore window
    global.window = originalWindow;
  });
});

describe('Edge cases and error handling', () => {
  it('should handle very small viewport', () => {
    const position = { x: 0, y: 0 };
    const constrained = constrainPosition(position, 'capsule', 100, 100);

    // Widget should still be partially visible even in very small viewport
    expect(isPositionValid(constrained, 'capsule', 100, 100)).toBe(true);
  });

  it('should handle very large viewport', () => {
    const position = { x: 5000, y: 5000 };
    const constrained = constrainPosition(position, 'capsule', 10000, 10000);

    // Widget should be constrained to keep it partially visible
    expect(constrained.x).toBeLessThan(10000);
    expect(constrained.y).toBeLessThan(10000);
  });

  it('should handle negative viewport dimensions gracefully', () => {
    const position = { x: 100, y: 100 };
    const constrained = constrainPosition(position, 'capsule', -100, -100);

    // Should not crash, but behavior is undefined for negative viewport
    expect(constrained).toBeDefined();
  });
});
