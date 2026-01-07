/**
 * Unit tests for story types
 * @feature 014-teleprompter-preview-sync
 */

import type { TeleprompterSlide } from '@/lib/story/types';

describe('TeleprompterSlide Types', () => {
  describe('focalPoint property', () => {
    it('should compile with optional focalPoint', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        focalPoint: 50,
      };
      expect(slide.focalPoint).toBe(50);
    });

    it('should compile without focalPoint', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
      };
      expect(slide.focalPoint).toBeUndefined();
    });

    it('should accept values in valid range (0-100)', () => {
      const slide1: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        focalPoint: 0,
      };
      const slide2: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        focalPoint: 100,
      };
      expect(slide1.focalPoint).toBe(0);
      expect(slide2.focalPoint).toBe(100);
    });
  });

  describe('fontSize property', () => {
    it('should compile with optional fontSize', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        fontSize: 24,
      };
      expect(slide.fontSize).toBe(24);
    });

    it('should compile without fontSize', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
      };
      expect(slide.fontSize).toBeUndefined();
    });

    it('should accept values in valid range (16-72)', () => {
      const slide1: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        fontSize: 16,
      };
      const slide2: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        fontSize: 72,
      };
      expect(slide1.fontSize).toBe(16);
      expect(slide2.fontSize).toBe(72);
    });
  });

  describe('Enhanced settings properties', () => {
    it('should compile with textAlign', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        textAlign: 'center',
      };
      expect(slide.textAlign).toBe('center');
    });

    it('should compile with lineHeight', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        lineHeight: 1.6,
      };
      expect(slide.lineHeight).toBe(1.6);
    });

    it('should compile with letterSpacing', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        letterSpacing: 2,
      };
      expect(slide.letterSpacing).toBe(2);
    });

    it('should compile with scrollSpeed', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        scrollSpeed: 'fast',
      };
      expect(slide.scrollSpeed).toBe('fast');
    });

    it('should compile with mirrorHorizontal', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        mirrorHorizontal: true,
      };
      expect(slide.mirrorHorizontal).toBe(true);
    });

    it('should compile with mirrorVertical', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        mirrorVertical: true,
      };
      expect(slide.mirrorVertical).toBe(true);
    });

    it('should compile with backgroundColor', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        backgroundColor: '#FFFFFF',
      };
      expect(slide.backgroundColor).toBe('#FFFFFF');
    });

    it('should compile with backgroundOpacity', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        backgroundOpacity: 80,
      };
      expect(slide.backgroundOpacity).toBe(80);
    });

    it('should compile with safeAreaPadding', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        safeAreaPadding: {
          top: 10,
          right: 20,
          bottom: 10,
          left: 20,
        },
      };
      expect(slide.safeAreaPadding).toEqual({
        top: 10,
        right: 20,
        bottom: 10,
        left: 20,
      });
    });
  });

  describe('All properties together', () => {
    it('should compile with all 11 teleprompter properties', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        duration: 'manual',
        content: 'Test content',
        focalPoint: 60,
        fontSize: 32,
        textAlign: 'right',
        lineHeight: 1.8,
        letterSpacing: 1,
        scrollSpeed: 'slow',
        mirrorHorizontal: true,
        mirrorVertical: false,
        backgroundColor: '#1a1a1a',
        backgroundOpacity: 95,
        safeAreaPadding: {
          top: 15,
          right: 25,
          bottom: 15,
          left: 25,
        },
      };

      expect(slide.focalPoint).toBe(60);
      expect(slide.fontSize).toBe(32);
      expect(slide.textAlign).toBe('right');
      expect(slide.lineHeight).toBe(1.8);
      expect(slide.letterSpacing).toBe(1);
      expect(slide.scrollSpeed).toBe('slow');
      expect(slide.mirrorHorizontal).toBe(true);
      expect(slide.mirrorVertical).toBe(false);
      expect(slide.backgroundColor).toBe('#1a1a1a');
      expect(slide.backgroundOpacity).toBe(95);
      expect(slide.safeAreaPadding).toEqual({
        top: 15,
        right: 25,
        bottom: 15,
        left: 25,
      });
    });
  });
});
