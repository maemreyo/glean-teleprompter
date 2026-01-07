/**
 * Unit tests for story validation utilities
 * @feature 014-teleprompter-preview-sync
 */

import {
  clampFocalPoint,
  clampFontSize,
  clampLineHeight,
  clampLetterSpacing,
  clampBackgroundOpacity,
  clampSafeAreaPadding,
  isValidHexColor,
} from '@/lib/story/validation';

describe('clampFocalPoint', () => {
  it('should return the same value when within valid range', () => {
    expect(clampFocalPoint(50)).toBe(50);
    expect(clampFocalPoint(0)).toBe(0);
    expect(clampFocalPoint(100)).toBe(100);
  });

  it('should clamp values below 0 to 0', () => {
    expect(clampFocalPoint(-1)).toBe(0);
    expect(clampFocalPoint(-50)).toBe(0);
    expect(clampFocalPoint(-100)).toBe(0);
  });

  it('should clamp values above 100 to 100', () => {
    expect(clampFocalPoint(101)).toBe(100);
    expect(clampFocalPoint(150)).toBe(100);
    expect(clampFocalPoint(200)).toBe(100);
  });

  it('should handle edge cases', () => {
    expect(clampFocalPoint(0.1)).toBe(0.1);
    expect(clampFocalPoint(99.9)).toBe(99.9);
    expect(clampFocalPoint(50.5)).toBe(50.5);
  });
});

describe('clampFontSize', () => {
  it('should return the same value when within valid range', () => {
    expect(clampFontSize(24)).toBe(24);
    expect(clampFontSize(16)).toBe(16);
    expect(clampFontSize(72)).toBe(72);
  });

  it('should clamp values below 16 to 16', () => {
    expect(clampFontSize(15)).toBe(16);
    expect(clampFontSize(0)).toBe(16);
    expect(clampFontSize(-10)).toBe(16);
  });

  it('should clamp values above 72 to 72', () => {
    expect(clampFontSize(73)).toBe(72);
    expect(clampFontSize(100)).toBe(72);
    expect(clampFontSize(200)).toBe(72);
  });

  it('should handle decimal values', () => {
    expect(clampFontSize(24.5)).toBe(24.5);
    expect(clampFontSize(16.1)).toBe(16.1);
    expect(clampFontSize(71.9)).toBe(71.9);
  });

  it('should handle common font sizes', () => {
    expect(clampFontSize(12)).toBe(16);
    expect(clampFontSize(14)).toBe(16);
    expect(clampFontSize(18)).toBe(18);
    expect(clampFontSize(20)).toBe(20);
    expect(clampFontSize(32)).toBe(32);
    expect(clampFontSize(48)).toBe(48);
    expect(clampFontSize(64)).toBe(64);
    expect(clampFontSize(96)).toBe(72);
  });
});

describe('clampLineHeight', () => {
  it('should return the same value when within valid range', () => {
    expect(clampLineHeight(1.4)).toBe(1.4);
    expect(clampLineHeight(1.0)).toBe(1.0);
    expect(clampLineHeight(3.0)).toBe(3.0);
  });

  it('should clamp values below 1.0 to 1.0', () => {
    expect(clampLineHeight(0.5)).toBe(1.0);
    expect(clampLineHeight(0)).toBe(1.0);
    expect(clampLineHeight(-1)).toBe(1.0);
  });

  it('should clamp values above 3.0 to 3.0', () => {
    expect(clampLineHeight(3.5)).toBe(3.0);
    expect(clampLineHeight(4.0)).toBe(3.0);
    expect(clampLineHeight(5.0)).toBe(3.0);
  });

  it('should handle decimal values', () => {
    expect(clampLineHeight(1.2)).toBe(1.2);
    expect(clampLineHeight(2.5)).toBe(2.5);
    expect(clampLineHeight(2.9)).toBe(2.9);
  });
});

describe('clampLetterSpacing', () => {
  it('should return the same value when within valid range', () => {
    expect(clampLetterSpacing(0)).toBe(0);
    expect(clampLetterSpacing(-5)).toBe(-5);
    expect(clampLetterSpacing(20)).toBe(20);
  });

  it('should clamp values below -5 to -5', () => {
    expect(clampLetterSpacing(-6)).toBe(-5);
    expect(clampLetterSpacing(-10)).toBe(-5);
    expect(clampLetterSpacing(-20)).toBe(-5);
  });

  it('should clamp values above 20 to 20', () => {
    expect(clampLetterSpacing(21)).toBe(20);
    expect(clampLetterSpacing(30)).toBe(20);
    expect(clampLetterSpacing(50)).toBe(20);
  });

  it('should handle common letter spacing values', () => {
    expect(clampLetterSpacing(-2)).toBe(-2);
    expect(clampLetterSpacing(2)).toBe(2);
    expect(clampLetterSpacing(5)).toBe(5);
    expect(clampLetterSpacing(10)).toBe(10);
  });
});

describe('clampBackgroundOpacity', () => {
  it('should return the same value when within valid range', () => {
    expect(clampBackgroundOpacity(0)).toBe(0);
    expect(clampBackgroundOpacity(50)).toBe(50);
    expect(clampBackgroundOpacity(100)).toBe(100);
  });

  it('should clamp values below 0 to 0', () => {
    expect(clampBackgroundOpacity(-1)).toBe(0);
    expect(clampBackgroundOpacity(-50)).toBe(0);
    expect(clampBackgroundOpacity(-100)).toBe(0);
  });

  it('should clamp values above 100 to 100', () => {
    expect(clampBackgroundOpacity(101)).toBe(100);
    expect(clampBackgroundOpacity(150)).toBe(100);
    expect(clampBackgroundOpacity(200)).toBe(100);
  });

  it('should handle common opacity values', () => {
    expect(clampBackgroundOpacity(10)).toBe(10);
    expect(clampBackgroundOpacity(25)).toBe(25);
    expect(clampBackgroundOpacity(75)).toBe(75);
    expect(clampBackgroundOpacity(90)).toBe(90);
  });
});

describe('clampSafeAreaPadding', () => {
  it('should return the same values when within valid range', () => {
    const padding = { top: 10, right: 20, bottom: 30, left: 40 };
    const result = clampSafeAreaPadding(padding);
    expect(result).toEqual(padding);
  });

  it('should clamp values below 0 to 0', () => {
    const padding = { top: -10, right: -5, bottom: -20, left: -1 };
    const result = clampSafeAreaPadding(padding);
    expect(result).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('should clamp values above 200 to 200', () => {
    const padding = { top: 250, right: 300, bottom: 400, left: 500 };
    const result = clampSafeAreaPadding(padding);
    expect(result).toEqual({ top: 200, right: 200, bottom: 200, left: 200 });
  });

  it('should handle undefined values', () => {
    const padding = { top: undefined, right: undefined, bottom: undefined, left: undefined };
    const result = clampSafeAreaPadding(padding);
    expect(result).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it('should handle mixed valid and invalid values', () => {
    const padding = { top: 50, right: 250, bottom: -10, left: 100 };
    const result = clampSafeAreaPadding(padding);
    expect(result).toEqual({ top: 50, right: 200, bottom: 0, left: 100 });
  });

  it('should handle partial padding objects', () => {
    const padding = { top: 10, left: 20 };
    const result = clampSafeAreaPadding(padding);
    expect(result).toEqual({ top: 10, right: 0, bottom: 0, left: 20 });
  });
});

describe('isValidHexColor', () => {
  it('should return true for valid 6-digit hex colors', () => {
    expect(isValidHexColor('#000000')).toBe(true);
    expect(isValidHexColor('#FFFFFF')).toBe(true);
    expect(isValidHexColor('#ff0000')).toBe(true);
    expect(isValidHexColor('#FF00FF')).toBe(true);
    expect(isValidHexColor('#123ABC')).toBe(true);
  });

  it('should return true for valid 3-digit hex colors', () => {
    expect(isValidHexColor('#000')).toBe(true);
    expect(isValidHexColor('#FFF')).toBe(true);
    expect(isValidHexColor('#f00')).toBe(true);
    expect(isValidHexColor('#F0F')).toBe(true);
    expect(isValidHexColor('#1aB')).toBe(true);
  });

  it('should return false for invalid hex colors', () => {
    expect(isValidHexColor('red')).toBe(false);
    expect(isValidHexColor('rgb(0,0,0)')).toBe(false);
    expect(isValidHexColor('#00000')).toBe(false); // 5 digits
    expect(isValidHexColor('#0000000')).toBe(false); // 7 digits
    expect(isValidHexColor('#GGGGGG')).toBe(false); // invalid hex
    expect(isValidHexColor('000000')).toBe(false); // missing #
    expect(isValidHexColor('')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidHexColor('#')).toBe(false);
    expect(isValidHexColor(null as any)).toBe(false);
    expect(isValidHexColor(undefined as any)).toBe(false);
  });
});
