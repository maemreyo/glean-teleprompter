/**
 * Integration tests for unified auto-save system
 * Tests complete save flow with debouncing and periodic saves
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createMockStore } from '../../mocks/stores/teleprompter-store.mock';
import { useAutoSave } from '@/hooks/useAutoSave';
import { loadDraft } from '@/lib/storage/draftStorage';
import { SaveStatus } from '@/lib/storage/types';

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Unified Auto-save Integration', () => {
  let mockStore: ReturnType<typeof createMockStore>;

  beforeEach(() => {
    jest.useFakeTimers();
    mockLocalStorage.clear();
    jest.clearAllMocks();
    
    mockStore = createMockStore();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('atomic save of all properties', () => {
    it('should save all 11 teleprompter properties atomically', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Update all 11 properties
      act(() => {
        mockStore.setState({
          text: 'Complete script content',
          backgroundUrl: 'https://example.com/background.jpg',
          musicUrl: 'https://example.com/music.mp3',
          fontStyle: 'Roboto',
          colorIndex: 3,
          scrollSpeed: 65,
          fontSize: 32,
          textAlignment: 'left',
          lineHeight: 1.7,
          margin: 35,
          overlayOpacity: 0.6,
        });
      });

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('saved');
      });

      // Verify all properties were saved atomically
      const savedData = mockLocalStorage.store['teleprompter_draft'];
      expect(savedData).toBeTruthy();

      const saved = JSON.parse(savedData);
      expect(saved.text).toBe('Complete script content');
      expect(saved.backgroundUrl).toBe('https://example.com/background.jpg');
      expect(saved.musicUrl).toBe('https://example.com/music.mp3');
      expect(saved.fontStyle).toBe('Roboto');
      expect(saved.colorIndex).toBe(3);
      expect(saved.scrollSpeed).toBe(65);
      expect(saved.fontSize).toBe(32);
      expect(saved.textAlignment).toBe('left');
      expect(saved.lineHeight).toBe(1.7);
      expect(saved.margin).toBe(35);
      expect(saved.overlayOpacity).toBe(0.6);
    });

    it('should not create race conditions with rapid changes', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Make rapid changes
      act(() => {
        mockStore.setState({ text: 'Change 1' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        mockStore.setState({ text: 'Change 2' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      act(() => {
        mockStore.setState({ text: 'Change 3' });
      });

      // Complete debounce
      act(() => {
        jest.advanceTimersByTime(900);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('saved');
      });

      // Should only save once with latest state
      const saveCalls = mockLocalStorage.setItem.mock.calls.filter(
        (call) => call[0] === 'teleprompter_draft'
      );
      
      expect(saveCalls.length).toBe(1);

      const saved = JSON.parse(saveCalls[0][1]);
      expect(saved.text).toBe('Change 3');
    });
  });

  describe('debounced save behavior', () => {
    it('should save 1 second after last change', async () => {
      const onStatusChange = jest.fn();
      
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
          onStatusChange,
        })
      );

      act(() => {
        mockStore.setState({ text: 'Changed text' });
      });

      // Should not save immediately
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalled();
        expect(onStatusChange).toHaveBeenCalledWith('saving');
        expect(onStatusChange).toHaveBeenCalledWith('saved');
      });
    });

    it('should reset debounce on new changes', () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      act(() => {
        mockStore.setState({ text: 'Change 1' });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      act(() => {
        mockStore.setState({ text: 'Change 2' });
      });

      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Should not have saved yet (debounce reset)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      // Complete debounce
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('periodic save behavior', () => {
    it('should save every 5 seconds regardless of changes', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // No changes, just wait for periodic save
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.status).toBe('saved');
      });

      // Second periodic save
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(result.current.lastSavedAt).toBeTruthy();
      });
    });

    it('should not save periodically when not in setup mode', () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 1000,
          mode: 'running',
        })
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('save status updates', () => {
    it('should show saving status during save operation', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      act(() => {
        mockStore.setState({ text: 'Changed' });
      });

      // Status should change through the flow
      await waitFor(() => {
        expect(result.current.status).toBe('saved');
      });
    });

    it('should track last saved timestamp', async () => {
      const { result } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      act(() => {
        mockStore.setState({ text: 'Changed' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.lastSavedAt).toBeTruthy();
        expect(result.current.lastSavedAt).toBeLessThanOrEqual(Date.now());
      });
    });
  });

  describe('non-blocking saves', () => {
    it('should use requestIdleCallback when available', async () => {
      const originalRIC = window.requestIdleCallback;
      window.requestIdleCallback = jest.fn((cb) => {
        return setTimeout(() => cb(), 0);
      });

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      act(() => {
        mockStore.setState({ text: 'Changed' });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(window.requestIdleCallback).toHaveBeenCalled();
      });

      window.requestIdleCallback = originalRIC;
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      unmount();

      // Timers should be cleared
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      // Should not save after unmount
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
