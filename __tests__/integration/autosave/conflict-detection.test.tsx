/**
 * Integration tests for multi-tab conflict detection
 * Tests timestamp comparison and user choice handling
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { TeleprompterDraft } from '@/lib/storage/types';

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

describe('Conflict Detection Integration', () => {
  let mockStore: any;
  let baseDraft: TeleprompterDraft;

  beforeEach(() => {
    jest.useFakeTimers();
    mockLocalStorage.clear();
    jest.clearAllMocks();
    
    baseDraft = {
      _id: 'test-id',
      _version: '2.0',
      _timestamp: Date.now(),
      text: 'Base content',
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

    mockStore = {
      getState: jest.fn(() => ({
        text: 'Base content',
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
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('timestamp comparison', () => {
    it('should detect when another tab has newer version', () => {
      // Simulate newer version in localStorage
      const newerDraft = {
        ...baseDraft,
        _timestamp: baseDraft._timestamp + 5000,
        text: 'Newer content from other tab',
      };

      mockLocalStorage.store['teleprompter_draft'] = JSON.stringify(newerDraft);

      const onConflict = jest.fn().mockReturnValue('cancel');

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: true,
          onConflict: (conflict) => {
            onConflict(conflict);
            return 'cancel';
          },
        })
      );

      // Trigger save
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Local changes' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should have called conflict handler
      expect(onConflict).toHaveBeenCalledWith(
        expect.objectContaining({
          localDraft: expect.objectContaining({
            text: 'Local changes',
          }),
          remoteDraft: expect.objectContaining({
            text: 'Newer content from other tab',
          }),
          timeDifference: 5000,
        })
      );
    });

    it('should allow save when local version is newer', () => {
      // Simulate older version in localStorage
      const olderDraft = {
        ...baseDraft,
        _timestamp: baseDraft._timestamp - 5000,
        text: 'Older content',
      };

      mockLocalStorage.store['teleprompter_draft'] = JSON.stringify(olderDraft);

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: true,
        })
      );

      // Trigger save
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Newer content' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should save without conflict
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'teleprompter_draft',
        expect.stringContaining('Newer content')
      );
    });

    it('should save when no existing draft', () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: true,
        })
      );

      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'New content' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should save normally
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('user choice handling', () => {
    it('should overwrite when user chooses overwrite', () => {
      const newerDraft = {
        ...baseDraft,
        _timestamp: baseDraft._timestamp + 5000,
        text: 'Remote content',
      };

      mockLocalStorage.store['teleprompter_draft'] = JSON.stringify(newerDraft);

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: true,
          onConflict: () => 'overwrite',
        })
      );

      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Local content' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should have saved with local content
      const saved = JSON.parse(mockLocalStorage.store['teleprompter_draft']);
      expect(saved.text).toBe('Local content');
    });

    it('should reload when user chooses reload', () => {
      const newerDraft = {
        ...baseDraft,
        _timestamp: baseDraft._timestamp + 5000,
        text: 'Remote content',
      };

      mockLocalStorage.store['teleprompter_draft'] = JSON.stringify(newerDraft);

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: true,
          onConflict: () => 'reload',
        })
      );

      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Local content' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should not have saved with local content
      const saved = JSON.parse(mockLocalStorage.store['teleprompter_draft']);
      expect(saved.text).toBe('Remote content');
    });

    it('should cancel when user chooses cancel', () => {
      const newerDraft = {
        ...baseDraft,
        _timestamp: baseDraft._timestamp + 5000,
        text: 'Remote content',
      };

      mockLocalStorage.store['teleprompter_draft'] = JSON.stringify(newerDraft);

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: true,
          onConflict: () => 'cancel',
        })
      );

      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Local content' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should preserve remote content
      const saved = JSON.parse(mockLocalStorage.store['teleprompter_draft']);
      expect(saved.text).toBe('Remote content');
    });
  });

  describe('conflict data accuracy', () => {
    it('should provide accurate time difference', () => {
      const newerDraft = {
        ...baseDraft,
        _timestamp: baseDraft._timestamp + 10000,
        text: 'Remote',
      };

      mockLocalStorage.store['teleprompter_draft'] = JSON.stringify(newerDraft);

      const onConflict = jest.fn().mockReturnValue('cancel');

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: true,
          onConflict: (conflict) => {
            onConflict(conflict);
            return 'cancel';
          },
        })
      );

      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Local' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      expect(onConflict).toHaveBeenCalledWith(
        expect.objectContaining({
          timeDifference: 10000,
        })
      );
    });
  });

  describe('disabled conflict detection', () => {
    it('should save without checking when disabled', () => {
      const newerDraft = {
        ...baseDraft,
        _timestamp: baseDraft._timestamp + 5000,
        text: 'Remote content',
      };

      mockLocalStorage.store['teleprompter_draft'] = JSON.stringify(newerDraft);

      const onConflict = jest.fn();

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 100,
          periodicMs: 5000,
          mode: 'setup',
          enableConflictDetection: false,
          onConflict,
        })
      );

      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Local content' }));
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Should not have called conflict handler
      expect(onConflict).not.toHaveBeenCalled();

      // Should have saved local content
      const saved = JSON.parse(mockLocalStorage.store['teleprompter_draft']);
      expect(saved.text).toBe('Local content');
    });
  });
});
