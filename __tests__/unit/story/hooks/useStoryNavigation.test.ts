/**
 * useStoryNavigation Hook Tests
 *
 * Tests for story navigation logic including:
 * - Tap zone detection (left 30%, right 30%, center 40%)
 * - Auto-advance behavior
 * - Pause/resume functionality
 * - Navigation boundaries (first/last slide)
 * - Teleprompter slide navigation disabled
 *
 * @feature 012-standalone-story
 * @task T014
 */

import { renderHook, act } from '@testing-library/react';
import { useStoryNavigation } from '@/lib/story/hooks/useStoryNavigation';
import { useStoryStore } from '@/lib/stores/useStoryStore';
import type { AnySlide, AnimationEffect } from '@/lib/story/types';

// Mock the story store
jest.mock('@/lib/stores/useStoryStore');

describe('useStoryNavigation', () => {
  const mockCurrentSlideIndex = 0;
  const mockTotalSlides = 5;
  const mockIsPaused = false;

  const mockAnimation: AnimationEffect = {
    type: 'fade',
    duration: 300,
  };

  const mockSlide: AnySlide = {
    id: 'slide-1',
    type: 'text-highlight',
    content: 'Test content',
    duration: 5000,
    animation: mockAnimation,
    highlights: [
      { startIndex: 0, endIndex: 4, color: '#FFD700', fontWeight: 'bold' },
    ],
  };

  const mockTeleprompterSlide: AnySlide = {
    id: 'slide-2',
    type: 'teleprompter',
    content: 'Long teleprompter text...',
    duration: 'manual',
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default mock implementations
    (useStoryStore as unknown as jest.Mock).mockReturnValue({
      currentSlideIndex: mockCurrentSlideIndex,
      nextSlide: jest.fn(),
      previousSlide: jest.fn(),
      togglePause: jest.fn(),
      isPaused: mockIsPaused,
    });
  });

  describe('Tap Zone Logic', () => {
    it('should detect right side tap (next slide)', () => {
      const onSlideChange = jest.fn();
      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      const mockEvent = {
        currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) },
        clientX: 85, // Right 30%
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleTap(mockEvent);
      });

      const store = useStoryStore();
      expect(store.nextSlide).toHaveBeenCalled();
      expect(onSlideChange).toHaveBeenCalledWith(1);
    });

    it('should detect left side tap (previous slide)', () => {
      const onSlideChange = jest.fn();
      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 2,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      const mockEvent = {
        currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) },
        clientX: 15, // Left 30%
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleTap(mockEvent);
      });

      const store = useStoryStore();
      expect(store.previousSlide).toHaveBeenCalled();
      expect(onSlideChange).toHaveBeenCalledWith(1);
    });

    it('should detect center tap (toggle pause)', () => {
      const onPauseChange = jest.fn();
      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onPauseChange,
        })
      );

      const mockEvent = {
        currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) },
        clientX: 50, // Center 40%
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleTap(mockEvent);
      });

      const store = useStoryStore();
      expect(store.togglePause).toHaveBeenCalled();
      expect(onPauseChange).toHaveBeenCalledWith(true);
    });

    it('should handle touch events correctly', () => {
      const onSlideChange = jest.fn();
      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      const mockEvent = {
        currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) },
        touches: [{ clientX: 85 }],
      } as unknown as React.TouchEvent;

      act(() => {
        result.current.handleTap(mockEvent);
      });

      const store = useStoryStore();
      expect(store.nextSlide).toHaveBeenCalled();
    });
  });

  describe('Navigation Boundaries', () => {
    it('should not navigate beyond last slide', () => {
      const onSlideChange = jest.fn();
      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 4, // Last slide (0-4)
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      act(() => {
        result.current.goToNextSlide();
      });

      const store = useStoryStore();
      expect(store.nextSlide).not.toHaveBeenCalled();
      expect(onSlideChange).not.toHaveBeenCalled();
    });

    it('should not navigate before first slide', () => {
      const onSlideChange = jest.fn();
      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 0, // First slide
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      act(() => {
        result.current.goToPreviousSlide();
      });

      const store = useStoryStore();
      expect(store.previousSlide).not.toHaveBeenCalled();
      expect(onSlideChange).not.toHaveBeenCalled();
    });

    it('should navigate to next slide when not at boundary', () => {
      const onSlideChange = jest.fn();
      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 2,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      act(() => {
        result.current.goToNextSlide();
      });

      const store = useStoryStore();
      expect(store.nextSlide).toHaveBeenCalled();
      expect(onSlideChange).toHaveBeenCalledWith(3);
    });
  });

  describe('Teleprompter Slide Navigation', () => {
    it('should disable tap navigation for teleprompter slides', () => {
      const onSlideChange = jest.fn();
      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockTeleprompterSlide,
          onSlideChange,
        })
      );

      const mockEvent = {
        currentTarget: { getBoundingClientRect: () => ({ left: 0, width: 100 }) },
        clientX: 85, // Right side - normally next slide
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.handleTap(mockEvent);
      });

      const store = useStoryStore();
      expect(store.nextSlide).not.toHaveBeenCalled();
      expect(onSlideChange).not.toHaveBeenCalled();
    });

    it('should not disable goToNextSlide for teleprompter slides (explicit navigation)', () => {
      const onSlideChange = jest.fn();
      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 1,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockTeleprompterSlide,
          onSlideChange,
        })
      );

      act(() => {
        result.current.goToNextSlide();
      });

      const store = useStoryStore();
      expect(store.nextSlide).toHaveBeenCalled();
      expect(onSlideChange).toHaveBeenCalledWith(2);
    });
  });

  describe('Pause/Resume Functionality', () => {
    it('should toggle pause state', () => {
      const onPauseChange = jest.fn();
      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onPauseChange,
        })
      );

      act(() => {
        result.current.togglePause();
      });

      const store = useStoryStore();
      expect(store.togglePause).toHaveBeenCalled();
      expect(onPauseChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Auto-Advance Behavior', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should auto-advance after slide duration', () => {
      const onSlideChange = jest.fn();
      const slideWithDuration: AnySlide = {
        ...mockSlide,
        duration: 5000,
      };

      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 0,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: slideWithDuration,
          onSlideChange,
        })
      );

      // Fast forward 5 seconds
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      const store = useStoryStore();
      expect(store.nextSlide).toHaveBeenCalled();
    });

    it('should not auto-advance when paused', () => {
      const onSlideChange = jest.fn();
      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 0,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: true, // Paused
      });

      renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      const store = useStoryStore();
      expect(store.nextSlide).not.toHaveBeenCalled();
    });

    it('should not auto-advance teleprompter slides', () => {
      const onSlideChange = jest.fn();
      // Teleprompter slides must have manual duration
      const teleprompterSlide: AnySlide = {
        ...mockTeleprompterSlide,
        duration: 'manual',
      };

      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 0,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: teleprompterSlide,
          onSlideChange,
        })
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      const store = useStoryStore();
      expect(store.nextSlide).not.toHaveBeenCalled();
    });

    it('should not auto-advance manual duration slides', () => {
      const onSlideChange = jest.fn();
      const manualSlide: AnySlide = {
        ...mockSlide,
        duration: 'manual',
      };

      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 0,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: manualSlide,
          onSlideChange,
        })
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      const store = useStoryStore();
      expect(store.nextSlide).not.toHaveBeenCalled();
    });

    it('should clear timer on unmount', () => {
      const onSlideChange = jest.fn();
      (useStoryStore as unknown as jest.Mock).mockReturnValue({
        currentSlideIndex: 0,
        nextSlide: jest.fn(),
        previousSlide: jest.fn(),
        togglePause: jest.fn(),
        isPaused: mockIsPaused,
      });

      const { unmount } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
          onSlideChange,
        })
      );

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      const store = useStoryStore();
      expect(store.nextSlide).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Handlers', () => {
    it('should provide all navigation handlers', () => {
      const { result } = renderHook(() =>
        useStoryNavigation({
          totalSlides: mockTotalSlides,
          currentSlide: mockSlide,
        })
      );

      expect(result.current.handleTap).toBeInstanceOf(Function);
      expect(result.current.goToNextSlide).toBeInstanceOf(Function);
      expect(result.current.goToPreviousSlide).toBeInstanceOf(Function);
      expect(result.current.togglePause).toBeInstanceOf(Function);
    });
  });
});
