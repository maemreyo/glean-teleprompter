/**
 * Unit Tests: Teleprompter Store
 * Feature: 012-standalone-story
 * Tests for Zustand teleprompter scroll state management
 */

import { renderHook, act } from '@testing-library/react';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';

describe('useTeleprompterStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useTeleprompterStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      expect(result.current.scrollSpeed).toBe(1.5);
      expect(result.current.fontSize).toBe(28);
      expect(result.current.isScrolling).toBe(false);
      expect(result.current.isMirrored).toBe(false);
      expect(result.current.scrollPosition).toBe(0);
      expect(result.current.scrollDepth).toBe(0);
    });
  });

  describe('setScrollSpeed', () => {
    it('should update scroll speed', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.setScrollSpeed(2.5);
      });

      expect(result.current.scrollSpeed).toBe(2.5);
    });

    it('should allow speed from 0 to 5', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.setScrollSpeed(0);
      });
      expect(result.current.scrollSpeed).toBe(0);

      act(() => {
        result.current.setScrollSpeed(5);
      });
      expect(result.current.scrollSpeed).toBe(5);
    });
  });

  describe('setFontSize', () => {
    it('should update font size', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.setFontSize(36);
      });

      expect(result.current.fontSize).toBe(36);
    });

    it('should allow font size from 16 to 48', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.setFontSize(16);
      });
      expect(result.current.fontSize).toBe(16);

      act(() => {
        result.current.setFontSize(48);
      });
      expect(result.current.fontSize).toBe(48);
    });
  });

  describe('startScrolling/stopScrolling', () => {
    it('should start scrolling', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.startScrolling();
      });

      expect(result.current.isScrolling).toBe(true);
    });

    it('should stop scrolling', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.startScrolling();
        result.current.stopScrolling();
      });

      expect(result.current.isScrolling).toBe(false);
    });

    it('should toggle scrolling state', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      expect(result.current.isScrolling).toBe(false);

      act(() => {
        result.current.startScrolling();
      });
      expect(result.current.isScrolling).toBe(true);

      act(() => {
        result.current.stopScrolling();
      });
      expect(result.current.isScrolling).toBe(false);
    });
  });

  describe('toggleMirror', () => {
    it('should toggle mirror mode', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      expect(result.current.isMirrored).toBe(false);

      act(() => {
        result.current.toggleMirror();
      });

      expect(result.current.isMirrored).toBe(true);

      act(() => {
        result.current.toggleMirror();
      });

      expect(result.current.isMirrored).toBe(false);
    });
  });

  describe('updateScrollPosition', () => {
    it('should update scroll position and depth', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.updateScrollPosition(500, 0.5);
      });

      expect(result.current.scrollPosition).toBe(500);
      expect(result.current.scrollDepth).toBe(0.5);
    });

    it('should handle depth at boundaries', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.updateScrollPosition(0, 0);
      });
      expect(result.current.scrollDepth).toBe(0);

      act(() => {
        result.current.updateScrollPosition(1000, 1);
      });
      expect(result.current.scrollDepth).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      act(() => {
        result.current.setScrollSpeed(3.0);
        result.current.setFontSize(40);
        result.current.startScrolling();
        result.current.toggleMirror();
        result.current.updateScrollPosition(500, 0.5);
      });

      expect(result.current.scrollSpeed).toBe(3.0);
      expect(result.current.fontSize).toBe(40);
      expect(result.current.isScrolling).toBe(true);
      expect(result.current.isMirrored).toBe(true);
      expect(result.current.scrollPosition).toBe(500);
      expect(result.current.scrollDepth).toBe(0.5);

      act(() => {
        result.current.reset();
      });

      expect(result.current.scrollSpeed).toBe(1.5);
      expect(result.current.fontSize).toBe(28);
      expect(result.current.isScrolling).toBe(false);
      expect(result.current.isMirrored).toBe(false);
      expect(result.current.scrollPosition).toBe(0);
      expect(result.current.scrollDepth).toBe(0);
    });
  });

  describe('WPM calculation', () => {
    it('should calculate WPM based on scroll speed', () => {
      const { result } = renderHook(() => useTeleprompterStore());

      // WPM = scrollSpeed × 150
      act(() => {
        result.current.setScrollSpeed(1.0);
      });
      expect(result.current.scrollSpeed * 150).toBe(150);

      act(() => {
        result.current.setScrollSpeed(2.0);
      });
      expect(result.current.scrollSpeed * 150).toBe(300);

      act(() => {
        result.current.setScrollSpeed(3.0);
      });
      expect(result.current.scrollSpeed * 150).toBe(450);
    });
  });
});
