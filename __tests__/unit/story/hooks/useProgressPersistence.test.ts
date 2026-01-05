/**
 * useProgressPersistence Hook Tests
 *
 * Unit tests for progress persistence functionality.
 * Tests cover T093-T102 auto-save and recovery implementation.
 *
 * @feature 012-standalone-story
 */

import { renderHook, act } from '@testing-library/react';
import { useProgressPersistence, clearAllSavedProgress, getSavedProgressList } from '@/lib/story/hooks/useProgressPersistence';

describe('useProgressPersistence', () => {
  const mockSlideId = 'test-slide-123';
  const storageKey = `teleprompter-progress-${mockSlideId}`;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveProgress', () => {
    it('should save progress to localStorage (T096, T097, T098)', () => {
      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      act(() => {
        result.current.saveProgress(0.5);
      });

      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeTruthy();

      const progress = JSON.parse(stored!);
      expect(progress.slideId).toBe(mockSlideId);
      expect(progress.scrollRatio).toBe(0.5);
      expect(progress.timestamp).toBeDefined(); // T099
    });

    it('should throttle saves to 2 second intervals (T097)', () => {
      const onSave = jest.fn();
      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId, onSave })
      );

      act(() => {
        result.current.saveProgress(0.3);
      });

      expect(onSave).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.saveProgress(0.4);
      });

      // Should be throttled - only one save within 2 seconds
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should handle localStorage quota exceeded gracefully (T101, T102)', () => {
      // Mock localStorage to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        const error = new Error('QuotaExceededError');
        (error as any).name = 'QuotaExceededError';
        throw error;
      });

      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      // Should not throw
      expect(() => {
        act(() => {
          result.current.saveProgress(0.5);
        });
      }).not.toThrow();

      expect(result.current.saveError).toBeTruthy();
      expect(result.current.saveError?.name).toBe('QuotaExceededError');

      localStorage.setItem = originalSetItem;
    });

    it('should continue functioning after save error (T102)', () => {
      let shouldFail = true;
      const originalSetItem = localStorage.setItem;

      localStorage.setItem = jest.fn(() => {
        if (shouldFail) {
          const error = new Error('QuotaExceededError');
          (error as any).name = 'QuotaExceededError';
          throw error;
        }
        return originalSetItem.call(localStorage, 'key', 'value');
      });

      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      // First save fails
      act(() => {
        result.current.saveProgress(0.5);
      });

      expect(result.current.saveError).toBeTruthy();

      // Allow subsequent saves
      shouldFail = false;

      // Hook continues to work
      act(() => {
        result.current.saveProgress(0.6);
      });

      // Should not have thrown
      expect(result.current.saveError).toBeTruthy();

      localStorage.setItem = originalSetItem;
    });
  });

  describe('loadProgress', () => {
    it('should load saved progress from localStorage', () => {
      const savedProgress = {
        slideId: mockSlideId,
        scrollRatio: 0.75,
        timestamp: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(savedProgress));

      const onLoad = jest.fn();
      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId, onLoad })
      );

      act(() => {
        const loaded = result.current.loadProgress();
        expect(loaded).toEqual(savedProgress);
      });

      expect(onLoad).toHaveBeenCalledWith(savedProgress);
    });

    it('should return null for non-existent progress', () => {
      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      act(() => {
        const loaded = result.current.loadProgress();
        expect(loaded).toBeNull();
      });
    });

    it('should return null for mismatched slide IDs (T098)', () => {
      const savedProgress = {
        slideId: 'different-slide',
        scrollRatio: 0.5,
        timestamp: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(savedProgress));

      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      act(() => {
        const loaded = result.current.loadProgress();
        expect(loaded).toBeNull();
      });
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(storageKey, 'invalid-json');

      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      act(() => {
        const loaded = result.current.loadProgress();
        expect(loaded).toBeNull();
      });
    });
  });

  describe('clearProgress', () => {
    it('should clear saved progress', () => {
      const savedProgress = {
        slideId: mockSlideId,
        scrollRatio: 0.5,
        timestamp: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(savedProgress));

      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      act(() => {
        result.current.clearProgress();
      });

      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeNull();
    });
  });

  describe('hasSavedProgress', () => {
    it('should return true when progress exists', () => {
      const savedProgress = {
        slideId: mockSlideId,
        scrollRatio: 0.5,
        timestamp: Date.now(),
      };

      localStorage.setItem(storageKey, JSON.stringify(savedProgress));

      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      expect(result.current.hasSavedProgress).toBe(true);
    });

    it('should return false when no progress exists', () => {
      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      expect(result.current.hasSavedProgress).toBe(false);
    });
  });

  describe('clearAllSavedProgress', () => {
    it('should clear all teleprompter progress', () => {
      localStorage.setItem('teleprompter-progress-slide1', JSON.stringify({ slideId: 'slide1', scrollRatio: 0.5, timestamp: Date.now() }));
      localStorage.setItem('teleprompter-progress-slide2', JSON.stringify({ slideId: 'slide2', scrollRatio: 0.7, timestamp: Date.now() }));
      localStorage.setItem('other-key', 'should-remain');

      clearAllSavedProgress();

      expect(localStorage.getItem('teleprompter-progress-slide1')).toBeNull();
      expect(localStorage.getItem('teleprompter-progress-slide2')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('should-remain');
    });
  });

  describe('getSavedProgressList', () => {
    it('should return list of all saved progress', () => {
      const progress1 = { slideId: 'slide1', scrollRatio: 0.5, timestamp: Date.now() };
      const progress2 = { slideId: 'slide2', scrollRatio: 0.7, timestamp: Date.now() };

      localStorage.setItem('teleprompter-progress-slide1', JSON.stringify(progress1));
      localStorage.setItem('teleprompter-progress-slide2', JSON.stringify(progress2));
      localStorage.setItem('other-key', 'should-be-ignored');

      const list = getSavedProgressList();

      expect(list).toHaveLength(2);
      expect(list).toContainEqual(progress1);
      expect(list).toContainEqual(progress2);
    });

    it('should handle corrupted entries gracefully', () => {
      localStorage.setItem('teleprompter-progress-slide1', JSON.stringify({ slideId: 'slide1', scrollRatio: 0.5, timestamp: Date.now() }));
      localStorage.setItem('teleprompter-progress-slide2', 'invalid-json');

      const list = getSavedProgressList();

      expect(list).toHaveLength(1);
      expect(list[0].slideId).toBe('slide1');
    });
  });

  describe('timestamp tracking (T099)', () => {
    it('should include timestamp in saved progress', () => {
      const beforeSave = Date.now();

      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      act(() => {
        result.current.saveProgress(0.5);
      });

      const afterSave = Date.now();

      const stored = localStorage.getItem(storageKey);
      const progress = JSON.parse(stored!);

      expect(progress.timestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(progress.timestamp).toBeLessThanOrEqual(afterSave);
    });
  });

  describe('slide ID tracking (T098)', () => {
    it('should store slide ID with progress', () => {
      const { result } = renderHook(() =>
        useProgressPersistence({ slideId: mockSlideId })
      );

      act(() => {
        result.current.saveProgress(0.5);
      });

      const stored = localStorage.getItem(storageKey);
      const progress = JSON.parse(stored!);

      expect(progress.slideId).toBe(mockSlideId);
    });
  });
});
