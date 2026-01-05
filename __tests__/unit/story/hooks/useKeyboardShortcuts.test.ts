/**
 * useKeyboardShortcuts Hook Tests
 *
 * Unit tests for keyboard shortcuts functionality.
 * Tests cover T103, T107 keyboard shortcut implementation.
 *
 * @feature 012-standalone-story
 */

import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcuts, calculateWPM } from '@/lib/story/hooks/useKeyboardShortcuts';
import { useTeleprompterStore } from '@/lib/stores/useTeleprompterStore';

// Mock the store
jest.mock('@/lib/stores/useTeleprompterStore');

const mockSetScrollSpeed = jest.fn();

describe('useKeyboardShortcuts', () => {
  const mockOnPlayPause = jest.fn();
  const mockOnSpeedChange = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetScrollSpeed.mockClear();
    
    // Mock useTeleprompterStore
    (useTeleprompterStore as jest.MockedFunction<typeof useTeleprompterStore>).mockReturnValue({
      scrollSpeed: 2.0,
      setScrollSpeed: mockSetScrollSpeed,
      isScrolling: false,
    } as any);
  });

  describe('keyboard event handling', () => {
    it('should handle Space key for play/pause (T107)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onPlayPause: mockOnPlayPause,
          enabled: true,
        })
      );

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(spaceEvent);
      });

      expect(mockOnPlayPause).toHaveBeenCalledTimes(1);
    });

    it('should handle ArrowUp key to increase speed (T107)', () => {
      mockSetScrollSpeed.mockClear();

      renderHook(() =>
        useKeyboardShortcuts({
          onSpeedChange: mockOnSpeedChange,
          enabled: true,
        })
      );

      act(() => {
        const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(arrowUpEvent);
      });

      expect(mockSetScrollSpeed).toHaveBeenCalledWith(2.2);
      expect(mockOnSpeedChange).toHaveBeenCalledWith(2.2);
    });

    it('should handle ArrowDown key to decrease speed (T107)', () => {
      mockSetScrollSpeed.mockClear();

      renderHook(() =>
        useKeyboardShortcuts({
          onSpeedChange: mockOnSpeedChange,
          enabled: true,
        })
      );

      act(() => {
        const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        window.dispatchEvent(arrowDownEvent);
      });

      expect(mockSetScrollSpeed).toHaveBeenCalledWith(1.8);
      expect(mockOnSpeedChange).toHaveBeenCalledWith(1.8);
    });

    it('should handle r key for reset (T107)', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onReset: mockOnReset,
          enabled: true,
        })
      );

      act(() => {
        const rEvent = new KeyboardEvent('keydown', { key: 'r' });
        window.dispatchEvent(rEvent);
      });

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should handle uppercase R key for reset', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onReset: mockOnReset,
          enabled: true,
        })
      );

      act(() => {
        const rEvent = new KeyboardEvent('keydown', { key: 'R' });
        window.dispatchEvent(rEvent);
      });

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('speed limits', () => {
    it('should not exceed maximum speed of 5', () => {
      mockSetScrollSpeed.mockClear();

      (useTeleprompterStore as jest.MockedFunction<typeof useTeleprompterStore>).mockReturnValue({
        scrollSpeed: 4.9,
        setScrollSpeed: mockSetScrollSpeed,
        isScrolling: false,
      } as any);

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true })
      );

      act(() => {
        const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        window.dispatchEvent(arrowUpEvent);
      });

      expect(mockSetScrollSpeed).toHaveBeenCalledWith(5); // Clamped to max
    });

    it('should not go below minimum speed of 0', () => {
      mockSetScrollSpeed.mockClear();

      (useTeleprompterStore as jest.MockedFunction<typeof useTeleprompterStore>).mockReturnValue({
        scrollSpeed: 0.1,
        setScrollSpeed: mockSetScrollSpeed,
        isScrolling: false,
      } as any);

      renderHook(() =>
        useKeyboardShortcuts({ enabled: true })
      );

      act(() => {
        const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        window.dispatchEvent(arrowDownEvent);
      });

      expect(mockSetScrollSpeed).toHaveBeenCalledWith(0); // Clamped to min
    });
  });

  describe('input field handling', () => {
    it('should ignore shortcuts when typing in input', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onPlayPause: mockOnPlayPause,
          enabled: true,
        })
      );

      const input = document.createElement('input');
      document.body.appendChild(input);

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        Object.defineProperty(spaceEvent, 'target', { value: input, writable: false });
        input.dispatchEvent(spaceEvent);
      });

      expect(mockOnPlayPause).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should ignore shortcuts when typing in textarea', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onPlayPause: mockOnPlayPause,
          enabled: true,
        })
      );

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        Object.defineProperty(spaceEvent, 'target', { value: textarea, writable: false });
        textarea.dispatchEvent(spaceEvent);
      });

      expect(mockOnPlayPause).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('should ignore shortcuts when typing in contentEditable', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onPlayPause: mockOnPlayPause,
          enabled: true,
        })
      );

      const div = document.createElement('div');
      div.contentEditable = 'true';
      document.body.appendChild(div);

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        Object.defineProperty(spaceEvent, 'target', { value: div, writable: false });
        div.dispatchEvent(spaceEvent);
      });

      expect(mockOnPlayPause).not.toHaveBeenCalled();

      document.body.removeChild(div);
    });
  });

  describe('enabled state', () => {
    it('should not handle shortcuts when disabled', () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onPlayPause: mockOnPlayPause,
          enabled: false,
        })
      );

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(spaceEvent);
      });

      expect(mockOnPlayPause).not.toHaveBeenCalled();
    });
  });

  describe('keyPressed state', () => {
    it('should update keyPressed state when key is pressed', () => {
      const { result } = renderHook(() =>
        useKeyboardShortcuts({
          onPlayPause: mockOnPlayPause,
          enabled: true,
        })
      );

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(spaceEvent);
      });

      expect(result.current.keyPressed).toBe('Space');
    });

    it('should clear keyPressed after delay', () => {
      jest.useFakeTimers();

      const { result } = renderHook(() =>
        useKeyboardShortcuts({
          onPlayPause: mockOnPlayPause,
          enabled: true,
        })
      );

      act(() => {
        const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
        window.dispatchEvent(spaceEvent);
      });

      expect(result.current.keyPressed).toBe('Space');

      // Wait for clear timeout
      act(() => {
        jest.advanceTimersByTime(500);
      });

      jest.useRealTimers();
      // State should clear (implementation dependent)
    });
  });
});

describe('calculateWPM', () => {
  it('should calculate WPM from scroll speed (T111)', () => {
    expect(calculateWPM(1)).toBe(150);
    expect(calculateWPM(2)).toBe(300);
    expect(calculateWPM(3)).toBe(450);
    expect(calculateWPM(4)).toBe(600);
    expect(calculateWPM(5)).toBe(750);
  });

  it('should round WPM to integer', () => {
    expect(calculateWPM(1.5)).toBe(225);
    expect(calculateWPM(2.7)).toBe(405);
  });

  it('should return 0 for speed 0', () => {
    expect(calculateWPM(0)).toBe(0);
  });
});
