/**
 * Unit tests for story validation utilities
 * @feature 014-teleprompter-preview-sync
 */

import { clampFocalPoint, clampFontSize } from '@/lib/story/validation';

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
