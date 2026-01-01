/**
 * Unit tests for useAutoSave hook
 * Tests unified auto-save functionality with debouncing and periodic saves
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { saveDraft, loadDraft, saveDraftWithConflictDetection } from '@/lib/storage/draftStorage';
import { TeleprompterDraft, SaveStatus } from '@/lib/storage/types';

// Mock dependencies
jest.mock('@/lib/storage/draftStorage');
jest.mock('@/lib/storage/storageQuota', () => ({
  getUsage: jest.fn(() => ({ used: 1000, total: 10000, percentage: 10, byKey: {} })),
}));

describe('useAutoSave', () => {
  let mockStore: any;
  let draft: TeleprompterDraft;

  beforeEach(() => {
    jest.useFakeTimers();
    
    // Mock Zustand store
    mockStore = {
      getState: jest.fn(() => ({
        text: 'Test script',
        backgroundUrl: '',
        musicUrl: '',
        fontStyle: 'Arial',
        colorIndex: 0,
        scrollSpeed: 50,
        fontSize: 24,
        textAlignment: 'center',
        lineHeight: 1.5,
        margin: 20,
        overlayOpacity: 0.5,
      })),
      setState: jest.fn(),
    };

    draft = {
      _id: 'test-id',
      _version: '2.0',
      _timestamp: Date.now(),
      text: 'Test script',
      backgroundUrl: '',
      musicUrl: '',
      fontStyle: 'Arial',
      colorIndex: 0,
      scrollSpeed: 50,
      fontSize: 24,
      textAlignment: 'center',
      lineHeight: 1.5,
      margin: 20,
      overlayOpacity: 0.5,
    };

    (saveDraft as jest.Mock).mockResolvedValue(undefined);
    (loadDraft as jest.Mock).mockReturnValue(null);
    (saveDraftWithConflictDetection as jest.Mock).mockReturnValue({ success: true });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with idle status', () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      expect(result.current.status).toBe('idle');
      expect(result.current.lastSavedAt).toBeNull();
    });

    it('should not save when mode is running', () => {
      const onStatusChange = jest.fn();
      
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'running',
          onStatusChange,
        })
      );

      // Trigger state change
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Changed' }));
      });

      // Advance debounce timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not save
      expect(saveDraft).not.toHaveBeenCalled();
      expect(onStatusChange).not.toHaveBeenCalledWith('saving');
    });

    it('should not save when mode is readonly', () => {
      const onStatusChange = jest.fn();
      
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'readonly',
          onStatusChange,
        })
      );

      // Trigger state change
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Changed' }));
      });

      // Advance debounce timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not save
      expect(saveDraft).not.toHaveBeenCalled();
    });
  });

  describe('debounced save', () => {
    it('should save after debounce period', async () => {
      const onStatusChange = jest.fn();
      
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
          onStatusChange,
        })
      );

      // Trigger state change
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Changed text' }));
      });

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('saving');
      });

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalled();
      });
    });

    it('should reset debounce timer on rapid changes', () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // First change
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Change 1' }));
      });

      // Advance 500ms (not enough to trigger save)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Second change
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Change 2' }));
      });

      // Advance another 500ms (still not enough from second change)
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should not have saved yet
      expect(saveDraft).not.toHaveBeenCalled();

      // Advance to 1000ms from second change
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Now should save
      expect(saveDraft).toHaveBeenCalledTimes(1);
    });

    it('should save all 11 teleprompter properties atomically', async () => {
      const onStatusChange = jest.fn();
      
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          onStatusChange,
        })
      );

      // Trigger state change
      act(() => {
        mockStore.getState = jest.fn(() => ({
          text: 'New text',
          backgroundUrl: 'https://example.com/bg.jpg',
          musicUrl: 'https://example.com/music.mp3',
          fontStyle: 'Roboto',
          colorIndex: 5,
          scrollSpeed: 75,
          fontSize: 36,
          textAlignment: 'left',
          lineHeight: 1.8,
          margin: 40,
          overlayOpacity: 0.7,
        }));
      });

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'New text',
            backgroundUrl: 'https://example.com/bg.jpg',
            musicUrl: 'https://example.com/music.mp3',
            fontStyle: 'Roboto',
            colorIndex: 5,
            scrollSpeed: 75,
            fontSize: 36,
            textAlignment: 'left',
            lineHeight: 1.8,
            margin: 40,
            overlayOpacity: 0.7,
          })
        );
      });
    });
  });

  describe('periodic save', () => {
    it('should save periodically regardless of changes', async () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Advance to first periodic save
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalled();
      });

      // Advance to second periodic save
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalledTimes(2);
      });
    });

    it('should not trigger periodic save in running mode', () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'running',
        })
      );

      // Advance past periodic save interval
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Should not have saved
      expect(saveDraft).not.toHaveBeenCalled();
    });
  });

  describe('saveNow function', () => {
    it('should trigger immediate save bypassing debounce', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 10000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Save immediately
      act(() => {
        result.current.saveNow();
      });

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalled();
      });

      // Should have saved immediately, not waiting for debounce
      expect(saveDraft).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelSave function', () => {
    it('should cancel pending debounced save', () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Trigger state change
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Changed' }));
      });

      // Cancel before debounce completes
      act(() => {
        result.current.cancelSave();
      });

      // Advance past debounce period
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not have saved
      expect(saveDraft).not.toHaveBeenCalled();
    });
  });

  describe('resetStatus function', () => {
    it('should reset status to idle', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Wait for save to complete
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('saved');
      });

      // Reset status
      act(() => {
        result.current.resetStatus();
      });

      expect(result.current.status).toBe('idle');
    });
  });

  describe('error handling', () => {
    it('should set status to error on save failure', async () => {
      const error = new Error('Storage quota exceeded');
      (saveDraft as jest.Mock).mockImplementation(() => {
        throw error;
      });

      const onStatusChange = jest.fn();
      
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          onStatusChange,
        })
      );

      // Trigger save
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith('error');
      });
    });
  });

  describe('cleanup', () => {
    it('should clear timers on unmount', () => {
      const { unmount } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Clear all timers
      jest.clearAllTimers();

      // Unmount
      unmount();

      // Advance timers - should not trigger any saves
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Should not have saved after unmount
      expect(saveDraft).not.toHaveBeenCalled();
    });
  });
});
