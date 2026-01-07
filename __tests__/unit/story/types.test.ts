/**
 * Unit tests for story type definitions
 * @feature 014-teleprompter-preview-sync
 */

import type { TeleprompterSlide } from '@/lib/story/types';

describe('TeleprompterSlide Types', () => {
  describe('focalPoint property', () => {
    it('should accept valid focalPoint values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        focalPoint: 50,
      };

      expect(slide.focalPoint).toBe(50);
    });

    it('should accept focalPoint at minimum boundary (0)', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        focalPoint: 0,
      };

      expect(slide.focalPoint).toBe(0);
    });

    it('should accept focalPoint at maximum boundary (100)', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        focalPoint: 100,
      };

      expect(slide.focalPoint).toBe(100);
    });

    it('should allow focalPoint to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        // focalPoint is optional
      };

      expect(slide.focalPoint).toBeUndefined();
    });
  });

  describe('fontSize property', () => {
    it('should accept valid fontSize values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        fontSize: 24,
      };

      expect(slide.fontSize).toBe(24);
    });

    it('should accept fontSize at minimum boundary (16)', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        fontSize: 16,
      };

      expect(slide.fontSize).toBe(16);
    });

    it('should accept fontSize at maximum boundary (72)', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        fontSize: 72,
      };

      expect(slide.fontSize).toBe(72);
    });

    it('should allow fontSize to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        // fontSize is optional
      };

      expect(slide.fontSize).toBeUndefined();
    });
  });

  describe('combined properties', () => {
    it('should accept both focalPoint and fontSize together', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        focalPoint: 75,
        fontSize: 36,
      };

      expect(slide.focalPoint).toBe(75);
      expect(slide.fontSize).toBe(36);
    });

    it('should allow teleprompter slide with only required properties', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.focalPoint).toBeUndefined();
      expect(slide.fontSize).toBeUndefined();
    });
  });
});
