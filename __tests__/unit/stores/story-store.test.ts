/**
 * Unit Tests: Story Store
 * Feature: 012-standalone-story
 * Tests for Zustand story navigation state management
 */

import { renderHook, act } from '@testing-library/react';
import { useStoryStore } from '@/lib/stores/useStoryStore';

describe('useStoryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useStoryStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('initial state', () => {
    it('should have default values', () => {
      const { result } = renderHook(() => useStoryStore());

      expect(result.current.currentSlideIndex).toBe(0);
      expect(result.current.direction).toBe(0);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('nextSlide', () => {
    it('should increment slide index and set direction to 1', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.nextSlide();
      });

      expect(result.current.currentSlideIndex).toBe(1);
      expect(result.current.direction).toBe(1);
    });

    it('should increment multiple times', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.nextSlide();
        result.current.nextSlide();
        result.current.nextSlide();
      });

      expect(result.current.currentSlideIndex).toBe(3);
      expect(result.current.direction).toBe(1);
    });
  });

  describe('previousSlide', () => {
    it('should decrement slide index and set direction to -1', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.goToSlide(3);
        result.current.previousSlide();
      });

      expect(result.current.currentSlideIndex).toBe(2);
      expect(result.current.direction).toBe(-1);
    });

    it('should not go below 0', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.previousSlide();
      });

      expect(result.current.currentSlideIndex).toBe(0);
    });
  });

  describe('goToSlide', () => {
    it('should jump to specific slide index', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.goToSlide(5);
      });

      expect(result.current.currentSlideIndex).toBe(5);
    });

    it('should set direction to 1 when going forward', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.goToSlide(3);
      });

      expect(result.current.direction).toBe(1);
    });

    it('should set direction to -1 when going backward', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.goToSlide(3);
        result.current.goToSlide(1);
      });

      expect(result.current.direction).toBe(-1);
    });

    it('should handle going to same index', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.goToSlide(2);
        result.current.goToSlide(2);
      });

      expect(result.current.currentSlideIndex).toBe(2);
      expect(result.current.direction).toBe(0);
    });
  });

  describe('togglePause', () => {
    it('should toggle isPaused state', () => {
      const { result } = renderHook(() => useStoryStore());

      expect(result.current.isPaused).toBe(false);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.togglePause();
      });

      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.goToSlide(5);
        result.current.togglePause();
      });

      expect(result.current.currentSlideIndex).toBe(5);
      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.currentSlideIndex).toBe(0);
      expect(result.current.direction).toBe(0);
      expect(result.current.isPaused).toBe(false);
    });
  });

  describe('slideProgress', () => {
    it('should allow manual progress override', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.setSlideProgress(0.5);
      });

      expect(result.current.slideProgress).toBe(0.5);
    });

    it('should handle progress at boundaries', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.setSlideProgress(0);
      });
      expect(result.current.slideProgress).toBe(0);

      act(() => {
        result.current.setSlideProgress(1);
      });
      expect(result.current.slideProgress).toBe(1);
    });

    it('should reset progress when changing slides', () => {
      const { result } = renderHook(() => useStoryStore());

      act(() => {
        result.current.setSlideProgress(0.75);
        result.current.nextSlide();
      });

      expect(result.current.slideProgress).toBe(0);
    });
  });
});
