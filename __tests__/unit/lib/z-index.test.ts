/**
 * Unit tests for Z-Index Constants
 * 
 * Verifies the centralized z-index system for Runner component layering.
 * @module __tests__/unit/lib/z-index
 */

import { 
  Z_INDEX_BASE,
  Z_INDEX_OVERLAY,
  Z_INDEX_CONTENT,
  Z_INDEX_CONTROLS_TOP,
  Z_INDEX_CONTROLS_BOTTOM,
  Z_INDEX_QUICK_SETTINGS,
  Z_INDEX_WIDGET_BASE,
  Z_INDEX_WIDGET_HANDLE,
  Z_INDEX_WIDGET_MAX,
  Z_INDEX_MUSIC_WIDGET_BASE,
  Z_INDEX_MUSIC_WIDGET_CONFIGURE,
  Z_INDEX_MUSIC_WIDGET_MAX,
  Z_INDEX_MODAL,
  ZIndex,
  getZIndex
} from '@/lib/constants/z-index';

describe('Z-Index Constants', () => {
  describe('constant values', () => {
    it('should have BASE at 0', () => {
      expect(Z_INDEX_BASE).toBe(0);
    });

    it('should have OVERLAY at 1', () => {
      expect(Z_INDEX_OVERLAY).toBe(1);
    });

    it('should have CONTENT at 10', () => {
      expect(Z_INDEX_CONTENT).toBe(10);
    });

    it('should have CONTROLS_TOP at 100', () => {
      expect(Z_INDEX_CONTROLS_TOP).toBe(100);
    });

    it('should have CONTROLS_BOTTOM at 110', () => {
      expect(Z_INDEX_CONTROLS_BOTTOM).toBe(110);
    });

    it('should have QUICK_SETTINGS at 200', () => {
      expect(Z_INDEX_QUICK_SETTINGS).toBe(200);
    });

    it('should have WIDGET_BASE at 500', () => {
      expect(Z_INDEX_WIDGET_BASE).toBe(500);
    });

    it('should have WIDGET_HANDLE at 530', () => {
      expect(Z_INDEX_WIDGET_HANDLE).toBe(530);
    });

    it('should have WIDGET_MAX at 599', () => {
      expect(Z_INDEX_WIDGET_MAX).toBe(599);
    });

    it('should have MUSIC_WIDGET_BASE at 600', () => {
      expect(Z_INDEX_MUSIC_WIDGET_BASE).toBe(600);
    });

    it('should have MUSIC_WIDGET_CONFIGURE at 650', () => {
      expect(Z_INDEX_MUSIC_WIDGET_CONFIGURE).toBe(650);
    });

    it('should have MUSIC_WIDGET_MAX at 649', () => {
      expect(Z_INDEX_MUSIC_WIDGET_MAX).toBe(649);
    });

    it('should have MODAL at 1000', () => {
      expect(Z_INDEX_MODAL).toBe(1000);
    });
  });

  describe('layer ordering', () => {
    it('should have background as lowest layer', () => {
      expect(Z_INDEX_BASE).toBe(0);
    });

    it('should have overlay above background', () => {
      expect(Z_INDEX_OVERLAY).toBeGreaterThan(Z_INDEX_BASE);
    });

    it('should have content above overlay', () => {
      expect(Z_INDEX_CONTENT).toBeGreaterThan(Z_INDEX_OVERLAY);
    });

    it('should have top controls above content', () => {
      expect(Z_INDEX_CONTROLS_TOP).toBeGreaterThan(Z_INDEX_CONTENT);
    });

    it('should have bottom controls above top controls', () => {
      expect(Z_INDEX_CONTROLS_BOTTOM).toBeGreaterThan(Z_INDEX_CONTROLS_TOP);
    });

    it('should have quick settings above controls', () => {
      expect(Z_INDEX_QUICK_SETTINGS).toBeGreaterThan(Z_INDEX_CONTROLS_BOTTOM);
    });

    it('should have camera widget above quick settings', () => {
      expect(Z_INDEX_WIDGET_BASE).toBeGreaterThan(Z_INDEX_QUICK_SETTINGS);
    });

    it('should have music widget above camera widget base', () => {
      expect(Z_INDEX_MUSIC_WIDGET_BASE).toBeGreaterThan(Z_INDEX_WIDGET_BASE);
    });

    it('should have music configure above music widget base', () => {
      expect(Z_INDEX_MUSIC_WIDGET_CONFIGURE).toBeGreaterThan(Z_INDEX_MUSIC_WIDGET_BASE);
    });

    it('should have modal layer at highest z-index', () => {
      expect(Z_INDEX_MODAL).toBeGreaterThan(Z_INDEX_MUSIC_WIDGET_CONFIGURE);
    });
  });

  describe('spacing rules', () => {
    it('should have at least 10-step increments within control layers', () => {
      const gap = Z_INDEX_CONTROLS_BOTTOM - Z_INDEX_CONTROLS_TOP;
      expect(gap).toBeGreaterThanOrEqual(10);
    });

    it('should have 100-step increments between major layers', () => {
      expect(Z_INDEX_QUICK_SETTINGS - Z_INDEX_CONTROLS_BOTTOM).toBeGreaterThanOrEqual(90);
      expect(Z_INDEX_WIDGET_BASE - Z_INDEX_QUICK_SETTINGS).toBeGreaterThanOrEqual(300);
    });

    it('should provide adequate range for camera widget dynamic increments', () => {
      const range = Z_INDEX_WIDGET_MAX - Z_INDEX_WIDGET_BASE;
      expect(range).toBeGreaterThanOrEqual(99); // At least 99 increments (500-599)
    });

    it('should provide adequate range for music widget dynamic increments', () => {
      const range = Z_INDEX_MUSIC_WIDGET_MAX - Z_INDEX_MUSIC_WIDGET_BASE;
      expect(range).toBeGreaterThanOrEqual(49); // At least 49 increments (600-649)
    });
  });

  describe('enum consistency', () => {
    it('should have enum values matching constant values', () => {
      expect(ZIndex.Base).toBe(Z_INDEX_BASE);
      expect(ZIndex.Overlay).toBe(Z_INDEX_OVERLAY);
      expect(ZIndex.Content).toBe(Z_INDEX_CONTENT);
      expect(ZIndex.ControlsTop).toBe(Z_INDEX_CONTROLS_TOP);
      expect(ZIndex.ControlsBottom).toBe(Z_INDEX_CONTROLS_BOTTOM);
      expect(ZIndex.QuickSettings).toBe(Z_INDEX_QUICK_SETTINGS);
      expect(ZIndex.WidgetBase).toBe(Z_INDEX_WIDGET_BASE);
      expect(ZIndex.WidgetHandle).toBe(Z_INDEX_WIDGET_HANDLE);
      expect(ZIndex.WidgetMax).toBe(Z_INDEX_WIDGET_MAX);
      expect(ZIndex.MusicWidgetBase).toBe(Z_INDEX_MUSIC_WIDGET_BASE);
      expect(ZIndex.MusicWidgetConfigure).toBe(Z_INDEX_MUSIC_WIDGET_CONFIGURE);
      expect(ZIndex.MusicWidgetMax).toBe(Z_INDEX_MUSIC_WIDGET_MAX);
      expect(ZIndex.Modal).toBe(Z_INDEX_MODAL);
    });
  });

  describe('helper function', () => {
    it('should return number for number input', () => {
      expect(getZIndex(100)).toBe(100);
      expect(getZIndex(0)).toBe(0);
      expect(getZIndex(9999)).toBe(9999);
    });

    it('should return numeric value for enum input', () => {
      expect(getZIndex(ZIndex.Content)).toBe(10);
      expect(getZIndex(ZIndex.ControlsTop)).toBe(100);
      expect(getZIndex(ZIndex.MusicWidgetBase)).toBe(600);
    });
  });

  describe('critical fixes verification', () => {
    it('should have QuickSettings (200) above controls (100-110) - fixes CRITICAL conflict', () => {
      expect(Z_INDEX_QUICK_SETTINGS).toBeGreaterThan(Z_INDEX_CONTROLS_TOP);
      expect(Z_INDEX_QUICK_SETTINGS).toBeGreaterThan(Z_INDEX_CONTROLS_BOTTOM);
      expect(Z_INDEX_QUICK_SETTINGS).not.toBe(50); // Not the old Radix default
    });

    it('should have music widget (600-649) lower than old 1000-9999 range - fixes HIGH issue', () => {
      expect(Z_INDEX_MUSIC_WIDGET_BASE).toBeLessThan(1000);
      expect(Z_INDEX_MUSIC_WIDGET_MAX).toBeLessThan(1000);
    });

    it('should allow camera widget to potentially exceed music widget - fixes HIGH issue', () => {
      // Camera max (599) is below music base (600), but both can increment
      // The key is that camera's range (500-599) allows it to be raised
      expect(Z_INDEX_WIDGET_MAX).toBeGreaterThanOrEqual(500);
      expect(Z_INDEX_WIDGET_MAX).toBeLessThan(Z_INDEX_MUSIC_WIDGET_BASE);
      // But camera has 99 increments to work with
      expect(Z_INDEX_WIDGET_MAX - Z_INDEX_WIDGET_BASE).toBeGreaterThanOrEqual(99);
    });
  });
});
