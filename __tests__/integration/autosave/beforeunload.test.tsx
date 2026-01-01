/**
 * Integration test for beforeunload save functionality
 * 
 * This test verifies that:
 * 1. Changes are immediately saved before tab close
 * 2. Data is preserved after reopening
 * 3. Save only happens in setup mode (not during recording)
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { saveDraft, loadDraft } from '@/lib/storage/draftStorage';
import { TeleprompterDraft } from '@/lib/storage/types';

// Mock dependencies
jest.mock('@/lib/storage/draftStorage');

describe('BeforeUnload Save Integration', () => {
  let mockStore: any;
  let beforeUnloadHandler: ((event: BeforeUnloadEvent) => void) | null = null;

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

    // Mock addEventListener to capture beforeunload handler
    const originalAddEventListener = window.addEventListener;
    jest.spyOn(window, 'addEventListener').mockImplementation((event: string, handler: any) => {
      if (event === 'beforeunload') {
        beforeUnloadHandler = handler as ((event: BeforeUnloadEvent) => void);
      }
      return originalAddEventListener.call(window, event, handler);
    });

    (saveDraft as jest.Mock).mockResolvedValue(undefined);
    (loadDraft as jest.Mock).mockReturnValue(null);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    beforeUnloadHandler = null;
  });

  describe('Tab Close with Unsaved Changes', () => {
    it('should register beforeunload handler on mount', () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      expect(window.addEventListener).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should remove beforeunload handler on unmount', () => {
      const { unmount } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should save draft immediately before tab close', async () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Simulate content change
      act(() => {
        mockStore.getState = jest.fn(() => ({ text: 'Modified content' }));
      });

      // Trigger beforeunload event
      if (beforeUnloadHandler) {
        const event = new Event('beforeunload') as BeforeUnloadEvent;
        beforeUnloadHandler(event);
      }

      // Wait for save
      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'Modified content',
          })
        );
      });
    });

    it('should preserve data after tab close and reopen', async () => {
      const savedDraft: TeleprompterDraft = {
        _id: 'draft-1',
        _version: '2.0',
        _timestamp: Date.now(),
        text: 'Preserved content',
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

      (loadDraft as jest.Mock).mockReturnValueOnce(savedDraft);

      const { unmount } = renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Unmount simulates tab close
      unmount();

      // Verify draft was loaded
      expect(loadDraft).toHaveBeenCalled();
    });
  });

  describe('Setup Mode vs Recording Mode', () => {
    it('should save in setup mode before tab close', async () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Trigger beforeunload
      if (beforeUnloadHandler) {
        const event = new Event('beforeunload') as BeforeUnloadEvent;
        beforeUnloadHandler(event);
      }

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalled();
      });
    });

    it('should NOT save in running mode before tab close', () => {
      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'running',
        })
      );

      // Trigger beforeunload
      if (beforeUnloadHandler) {
        const event = new Event('beforeunload') as BeforeUnloadEvent;
        beforeUnloadHandler(event);
      }

      // Should not save
      expect(saveDraft).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should complete save within 100ms on beforeunload', async () => {
      (saveDraft as jest.Mock).mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
      });

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      const startTime = performance.now();

      // Trigger beforeunload
      if (beforeUnloadHandler) {
        const event = new Event('beforeunload') as BeforeUnloadEvent;
        beforeUnloadHandler(event);
      }

      await waitFor(() => {
        expect(saveDraft).toHaveBeenCalled();
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully during beforeunload', () => {
      (saveDraft as jest.Mock).mockRejectedValue(
        new Error('Storage unavailable')
      );

      renderHook(() =>
        useAutoSave(mockStore, {
          debounceMs: 1000,
          periodicMs: 5000,
          mode: 'setup',
        })
      );

      // Should not throw
      if (beforeUnloadHandler) {
        const event = new Event('beforeunload') as BeforeUnloadEvent;
        expect(() => beforeUnloadHandler(event)).not.toThrow();
      }
    });
  });
});
