/**
 * Unit tests for enhanced teleprompter settings
 * @feature 014-teleprompter-preview-sync
 */

import type { TeleprompterSlide } from '@/lib/story/types';

describe('Enhanced Teleprompter Settings - Type Definitions', () => {
  describe('textAlign property', () => {
    it('should accept valid textAlign values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        textAlign: 'left',
      };

      expect(slide.textAlign).toBe('left');
    });

    it('should accept all textAlign options', () => {
      const values: Array<TeleprompterSlide['textAlign']> = ['left', 'center', 'right'];

      values.forEach((textAlign) => {
        const slide: TeleprompterSlide = {
          id: 'test',
          type: 'teleprompter',
          content: 'Test content',
          duration: 'manual',
          textAlign,
        };
        expect(slide.textAlign).toBe(textAlign);
      });
    });

    it('should allow textAlign to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.textAlign).toBeUndefined();
    });
  });

  describe('lineHeight property', () => {
    it('should accept valid lineHeight values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        lineHeight: 1.6,
      };

      expect(slide.lineHeight).toBe(1.6);
    });

    it('should accept boundary values', () => {
      const slide1: TeleprompterSlide = {
        id: 'test1',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        lineHeight: 1.0,
      };

      const slide2: TeleprompterSlide = {
        id: 'test2',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        lineHeight: 3.0,
      };

      expect(slide1.lineHeight).toBe(1.0);
      expect(slide2.lineHeight).toBe(3.0);
    });

    it('should allow lineHeight to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.lineHeight).toBeUndefined();
    });
  });

  describe('letterSpacing property', () => {
    it('should accept valid letterSpacing values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        letterSpacing: 2,
      };

      expect(slide.letterSpacing).toBe(2);
    });

    it('should accept negative values for condensed text', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        letterSpacing: -3,
      };

      expect(slide.letterSpacing).toBe(-3);
    });

    it('should allow letterSpacing to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.letterSpacing).toBeUndefined();
    });
  });

  describe('scrollSpeed property', () => {
    it('should accept valid scrollSpeed values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        scrollSpeed: 'slow',
      };

      expect(slide.scrollSpeed).toBe('slow');
    });

    it('should accept all scrollSpeed options', () => {
      const values: Array<TeleprompterSlide['scrollSpeed']> = ['slow', 'medium', 'fast'];

      values.forEach((scrollSpeed) => {
        const slide: TeleprompterSlide = {
          id: 'test',
          type: 'teleprompter',
          content: 'Test content',
          duration: 'manual',
          scrollSpeed,
        };
        expect(slide.scrollSpeed).toBe(scrollSpeed);
      });
    });

    it('should allow scrollSpeed to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.scrollSpeed).toBeUndefined();
    });
  });

  describe('mirror properties', () => {
    it('should accept mirrorHorizontal boolean values', () => {
      const slide1: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        mirrorHorizontal: true,
      };

      const slide2: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        mirrorHorizontal: false,
      };

      expect(slide1.mirrorHorizontal).toBe(true);
      expect(slide2.mirrorHorizontal).toBe(false);
    });

    it('should accept mirrorVertical boolean values', () => {
      const slide1: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        mirrorVertical: true,
      };

      const slide2: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        mirrorVertical: false,
      };

      expect(slide1.mirrorVertical).toBe(true);
      expect(slide2.mirrorVertical).toBe(false);
    });

    it('should allow mirror properties to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.mirrorHorizontal).toBeUndefined();
      expect(slide.mirrorVertical).toBeUndefined();
    });
  });

  describe('background properties', () => {
    it('should accept valid backgroundColor hex color', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        backgroundColor: '#FF0000',
      };

      expect(slide.backgroundColor).toBe('#FF0000');
    });

    it('should accept valid backgroundOpacity values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        backgroundOpacity: 50,
      };

      expect(slide.backgroundOpacity).toBe(50);
    });

    it('should allow background properties to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.backgroundColor).toBeUndefined();
      expect(slide.backgroundOpacity).toBeUndefined();
    });
  });

  describe('safeAreaPadding property', () => {
    it('should accept valid safeAreaPadding object', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        safeAreaPadding: {
          top: 10,
          right: 20,
          bottom: 30,
          left: 40,
        },
      };

      expect(slide.safeAreaPadding).toEqual({
        top: 10,
        right: 20,
        bottom: 30,
        left: 40,
      });
    });

    it('should accept partial safeAreaPadding values', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        safeAreaPadding: {
          top: 15,
          left: 25,
        },
      };

      expect(slide.safeAreaPadding).toEqual({
        top: 15,
        left: 25,
      });
    });

    it('should allow safeAreaPadding to be undefined', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.safeAreaPadding).toBeUndefined();
    });
  });

  describe('all enhanced properties together', () => {
    it('should accept all 11 enhanced properties', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
        // 2 original properties
        focalPoint: 60,
        fontSize: 32,
        // 9 enhanced properties
        textAlign: 'center',
        lineHeight: 1.8,
        letterSpacing: 5,
        scrollSpeed: 'fast',
        mirrorHorizontal: true,
        mirrorVertical: false,
        backgroundColor: '#123456',
        backgroundOpacity: 80,
        safeAreaPadding: { top: 10, right: 20, bottom: 30, left: 40 },
      };

      expect(slide.focalPoint).toBe(60);
      expect(slide.fontSize).toBe(32);
      expect(slide.textAlign).toBe('center');
      expect(slide.lineHeight).toBe(1.8);
      expect(slide.letterSpacing).toBe(5);
      expect(slide.scrollSpeed).toBe('fast');
      expect(slide.mirrorHorizontal).toBe(true);
      expect(slide.mirrorVertical).toBe(false);
      expect(slide.backgroundColor).toBe('#123456');
      expect(slide.backgroundOpacity).toBe(80);
      expect(slide.safeAreaPadding).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });

    it('should allow all properties to be undefined for backward compatibility', () => {
      const slide: TeleprompterSlide = {
        id: 'test',
        type: 'teleprompter',
        content: 'Test content',
        duration: 'manual',
      };

      expect(slide.focalPoint).toBeUndefined();
      expect(slide.fontSize).toBeUndefined();
      expect(slide.textAlign).toBeUndefined();
      expect(slide.lineHeight).toBeUndefined();
      expect(slide.letterSpacing).toBeUndefined();
      expect(slide.scrollSpeed).toBeUndefined();
      expect(slide.mirrorHorizontal).toBeUndefined();
      expect(slide.mirrorVertical).toBeUndefined();
      expect(slide.backgroundColor).toBeUndefined();
      expect(slide.backgroundOpacity).toBeUndefined();
      expect(slide.safeAreaPadding).toBeUndefined();
    });
  });
});
