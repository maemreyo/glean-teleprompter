/**
 * Local Draft & Auto-Save Tests for Studio Page
 * Tests localStorage draft persistence, auto-save timing, and error handling
 * User Story 4: User works in editor → system auto-saves every 5 seconds → draft restores on return
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../../utils/studio-page-mocks';
import {
  mockUseTeleprompterStore,
  setMockTeleprompterStore as setHookMockStore,
  resetMockTeleprompterStore
} from '../../mocks/hooks/use-teleprompter-store.mock';
import { validDraft, minimalDraft, modernDraft } from '../../fixtures/drafts';
import StudioPage from '@/app/studio/page';
import { FontStyle, TextAlign, MockTeleprompterStore } from '../../types/test-mocks';
import '@testing-library/jest-dom';

/**
 * Helper to get the current hook mock store
 */
function getMockStore() {
  return mockUseTeleprompterStore();
}

// Set up global localStorage mock before all tests
const createLocalStorageMock = () => {
  const store = new Map<string, string>();
  
  return {
    getItem: jest.fn((key: string) => store.get(key) || null),
    setItem: jest.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: jest.fn((key: string) => {
      store.delete(key);
    }),
    clear: jest.fn(() => {
      store.clear();
    }),
    get length() {
      return store.size;
    },
    key: jest.fn((index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] || null;
    }),
    reset: () => {
      store.clear();
    }
  };
};

// Create and set global localStorage mock
const mockLocalStorage = createLocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Helper functions for localStorage assertions
function expectStored(key: string, value: string) {
  expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
}

function expectNotStored(key: string) {
  expect(mockLocalStorage.setItem).not.toHaveBeenCalledWith(
    key,
    expect.any(String)
  );
}

// Mock the AppProvider to avoid next-intl ESM issues
jest.mock('@/components/AppProvider', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-provider">{children}</div>
  )
}));

// Mock the Toaster
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    promise: jest.fn()
  },
  Toaster: () => <div data-testid="toaster" data-sonner-toaster>Toaster</div>
}));

// Mock the Editor component
jest.mock('@/components/teleprompter/Editor', () => ({
  Editor: () => <div data-testid="editor-component">Editor Component</div>
}));

// Mock the Runner component
jest.mock('@/components/teleprompter/Runner', () => ({
  Runner: () => <div data-testid="runner-component">Runner Component</div>
}));

// Mock AnimatePresence to avoid framer-motion complexity
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

/**
 * Helper: Set up the mock store with draft data
 * Note: This should be called BEFORE render to ensure the component
 * gets the updated values when it calls useTeleprompterStore()
 */
function setupMockStoreWithDraft(draft: typeof validDraft) {
  const mockStore = { ...getMockStore() };
  mockStore.text = draft.text;
  mockStore.bgUrl = draft.bgUrl;
  mockStore.musicUrl = draft.musicUrl;
  mockStore.font = draft.font as FontStyle;
  mockStore.colorIndex = draft.colorIndex;
  mockStore.speed = draft.speed;
  mockStore.fontSize = draft.fontSize;
  mockStore.align = draft.align as TextAlign;
  mockStore.lineHeight = draft.lineHeight;
  mockStore.margin = draft.margin;
  mockStore.overlayOpacity = draft.overlayOpacity;
  mockStore.mode = 'setup';
  mockStore.isReadOnly = false;
  // Set the new store instance to the hook mock
  setHookMockStore(mockStore);
}

/**
 * Helper: Pre-populate localStorage with draft data
 */
function populateLocalStorage(draft: typeof validDraft) {
  mockLocalStorage.getItem.mockReturnValue(JSON.stringify(draft));
}

describe('Studio Page - Local Draft & Auto-Save (US4)', () => {
  /**
   * Describe block: Auto-save behavior
   * Tests auto-save timing and conditions
   */
  describe('Auto-save behavior', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      setupMockStoreWithDraft(validDraft);
    });

    afterEach(() => {
      teardownStudioPageMocks();
      // Reset localStorage mock between tests
      mockLocalStorage.getItem.mockClear();
      mockLocalStorage.setItem.mockClear();
    });

    /**
     * T045 [US4]: Auto-save to localStorage after 5 seconds in setup mode
     * Given: User is in setup mode with draft content
     * When: 5 seconds pass
     * Then: Content should be saved to localStorage
     */
    it('should auto-save to localStorage after 5 seconds in setup mode', async () => {
      // Given: Store is in setup mode with draft content
      // The setupMockStoreWithDraft was already called in beforeEach
      // Clear any previous localStorage calls
      mockLocalStorage.setItem.mockClear();

      // When: Page renders and 5 seconds pass
      render(<StudioPage />);
      
      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000);

      // Then: localStorage.setItem should be called with draft data
      // Note: The actual values come from the mock store, which is set in beforeEach
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'teleprompter_draft',
          expect.stringContaining('"text":"My saved draft content"')
        );
      });

      const storedValue = mockLocalStorage.setItem.mock.calls[0][1];
      const parsed = JSON.parse(storedValue);
      expect(parsed).toMatchObject({
        text: 'My saved draft content',
        bgUrl: 'https://example.com/background.jpg',
        musicUrl: 'https://example.com/music.mp3',
        font: 'Typewriter',
        colorIndex: 1,
        speed: 2,
        fontSize: 44,
        align: 'center',
        lineHeight: 1.4,
        margin: 5,
        overlayOpacity: 0.4
      });
    });

    /**
     * T047 [US4]: Should not auto-save when in run mode
     * Given: User is in run mode
     * When: 5 seconds pass
     * Then: localStorage.setItem should NOT be called
     */
    it('should not auto-save when in run mode', async () => {
      // Given: Store is in run mode
      const currentStore = getMockStore();
      const updatedStore = { ...currentStore, mode: 'run' as const, isReadOnly: false };
      setHookMockStore(updatedStore);

      // When: Page renders and 5 seconds pass
      render(<StudioPage />);
      jest.advanceTimersByTime(5000);

      // Then: localStorage.setItem should NOT be called with draft data
      await waitFor(() => {
        expectNotStored('teleprompter_draft');
      });
    });

    /**
     * T048 [US4]: Should not auto-save when in read-only mode
     * Given: User is in read-only mode
     * When: 5 seconds pass
     * Then: localStorage.setItem should NOT be called
     */
    it('should not auto-save when in read-only mode', async () => {
      // Given: Store is in read-only mode
      const currentStore = getMockStore();
      const updatedStore = { ...currentStore, mode: 'setup' as const, isReadOnly: true };
      setHookMockStore(updatedStore);

      // When: Page renders and 5 seconds pass
      render(<StudioPage />);
      jest.advanceTimersByTime(5000);

      // Then: localStorage.setItem should NOT be called with draft data
      await waitFor(() => {
        expectNotStored('teleprompter_draft');
      });
    });
  });

  /**
   * Describe block: Draft persistence properties
   * Tests that all required properties are saved to localStorage
   */
  describe('Draft persistence properties', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      setupMockStoreWithDraft(validDraft);
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * T046 [US4]: Should persist all required properties to localStorage
     * Given: User has content with all properties set
     * When: Auto-save triggers after 5 seconds
     * Then: All 11 required properties should be in localStorage
     */
    it('should persist all required properties to localStorage', async () => {
      // Given: Store has all draft properties set
      // (already set in beforeEach via setupMockStoreWithDraft)
      // Clear previous calls
      mockLocalStorage.setItem.mockClear();

      // When: Page renders and auto-save triggers
      render(<StudioPage />);
      jest.advanceTimersByTime(5000);

      // Then: All required properties should be saved
      await waitFor(() => {
        const storedValue = mockLocalStorage.setItem.mock.calls[0][1];
        const parsed = JSON.parse(storedValue);
        
        // All 11 required properties
        expect(parsed).toHaveProperty('text');
        expect(parsed).toHaveProperty('bgUrl');
        expect(parsed).toHaveProperty('musicUrl');
        expect(parsed).toHaveProperty('font');
        expect(parsed).toHaveProperty('colorIndex');
        expect(parsed).toHaveProperty('speed');
        expect(parsed).toHaveProperty('fontSize');
        expect(parsed).toHaveProperty('align');
        expect(parsed).toHaveProperty('lineHeight');
        expect(parsed).toHaveProperty('margin');
        expect(parsed).toHaveProperty('overlayOpacity');
        
        // Verify values match
        expect(parsed.text).toBe('My saved draft content');
        expect(parsed.bgUrl).toBe('https://example.com/background.jpg');
        expect(parsed.musicUrl).toBe('https://example.com/music.mp3');
        expect(parsed.font).toBe('Typewriter');
        expect(parsed.colorIndex).toBe(1);
        expect(parsed.speed).toBe(2);
        expect(parsed.fontSize).toBe(44);
        expect(parsed.align).toBe('center');
        expect(parsed.lineHeight).toBe(1.4);
        expect(parsed.margin).toBe(5);
        expect(parsed.overlayOpacity).toBe(0.4);
      });
    });
  });

  /**
   * Describe block: Draft restoration
   * Tests that drafts are restored from localStorage on page load
   */
  describe('Draft restoration', () => {
    beforeEach(() => {
      setupStudioPageMocks();
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * T049 [US4]: Should restore draft from localStorage on page load
     * Given: localStorage has a saved draft
     * When: Page loads without template/script parameters
     * Then: Draft should be restored to the store
     */
    it('should restore draft from localStorage on page load', async () => {
      // Given: localStorage has a valid draft
      populateLocalStorage(modernDraft);

      // When: Page loads without template/script parameters
      render(<StudioPage />);

      // Then: setAll should be called with draft data
      await waitFor(() => {
        const mockStore = getMockStore();
        expect(mockStore.setAll).toHaveBeenCalledWith(
          expect.objectContaining({
            text: 'Modern draft content',
            bgUrl: 'https://example.com/modern-bg.jpg',
            musicUrl: '',
            font: 'Modern',
            colorIndex: 2,
            speed: 4,
            fontSize: 52,
            align: 'left',
            lineHeight: 1.6,
            margin: 10,
            overlayOpacity: 0.6,
            mode: 'setup'
          })
        );
      });
    });

    /**
     * Additional test: Should restore minimal draft (all defaults)
     */
    it('should restore minimal draft with default values', async () => {
      // Given: localStorage has a minimal draft
      populateLocalStorage(minimalDraft);

      // When: Page loads
      render(<StudioPage />);

      // Then: setAll should be called with minimal draft data
      await waitFor(() => {
        const mockStore = getMockStore();
        expect(mockStore.setAll).toHaveBeenCalledWith(
          expect.objectContaining({
            text: '',
            bgUrl: '',
            musicUrl: '',
            font: 'Classic',
            colorIndex: 0,
            speed: 2,
            fontSize: 48,
            align: 'center',
            lineHeight: 1.5,
            margin: 0,
            overlayOpacity: 0.5,
            mode: 'setup'
          })
        );
      });
    });
  });

  /**
   * Describe block: Error handling
   * Tests graceful error handling for localStorage issues
   */
  describe('Error handling', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      setupMockStoreWithDraft(validDraft);
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * T050 [US4]: Should handle corrupted localStorage data gracefully
     * Given: localStorage has corrupted JSON data
     * When: Page loads and attempts to parse the data
     * Then: Error should be caught and logged without crashing
     */
    it('should handle corrupted localStorage data gracefully', async () => {
      // Given: localStorage has corrupted data (invalid JSON)
      const consoleErrorSpy = jest.spyOn(console, 'error');
      mockLocalStorage.getItem.mockReturnValue('{invalid json}');

      // When: Page loads
      render(<StudioPage />);

      // Then: Error should be logged, but page should still render
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading local draft',
          expect.any(SyntaxError)
        );
      });

      // Page should still render Editor component
      expect(screen.getByTestId('editor-component')).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
    });

    /**
     * T051 [US4]: Should handle localStorage quota exceeded error
     * Note: The current implementation doesn't wrap setItem in try-catch,
     * so the error will propagate. This test documents current behavior.
     * Given: localStorage quota is exceeded
     * When: Auto-save attempts to write to localStorage
     * Then: Error should be thrown when advancing timers
     */
    it('should handle localStorage quota exceeded error', async () => {
      // Given: localStorage quota is exceeded
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      const currentStore = getMockStore();
      const updatedStore = { ...currentStore, mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(updatedStore);

      // When: Page renders and auto-save triggers
      render(<StudioPage />);

      // Then: Advancing timers should throw the error
      expect(() => {
        jest.advanceTimersByTime(5000);
      }).toThrow('QuotaExceededError');

      // Page should still have been rendered before the error
      expect(screen.getByTestId('editor-component')).toBeInTheDocument();
    });

    /**
     * Additional test: Should handle localStorage being disabled
     * Note: Current implementation doesn't wrap getItem in try-catch during load,
     * so the error will propagate during render.
     */
    it('should handle localStorage being disabled', async () => {
      // Given: localStorage is disabled (throws on getItem)
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage is disabled');
      });

      // When/Then: Rendering should throw the error
      expect(() => {
        render(<StudioPage />);
      }).toThrow('localStorage is disabled');
    });
  });

  /**
   * Describe block: Edge cases
   * Tests additional edge cases and boundary conditions
   */
  describe('Edge cases', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      // Set up draft data for edge case tests
      setupMockStoreWithDraft(validDraft);
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * Edge case: Empty localStorage should not trigger restoration
     */
    it('should not restore when localStorage is empty', async () => {
      // Given: localStorage has no draft (null)
      mockLocalStorage.getItem.mockReturnValue(null);

      // When: Page loads
      render(<StudioPage />);

      // Then: localStorage.getItem should be called but restoration skipped
      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('teleprompter_draft');
      });

      // Verify setAll was NOT called for restoration
      // (it might be called for template/script loading, but not with localStorage draft data)
      const mockStore = getMockStore();
      const setAllCalls = mockStore.setAll.mock.calls || [];
      const draftRestorationCalls = setAllCalls.filter((call: any[]) =>
        call[0] && typeof call[0] === 'object' && 'text' in (call[0] as object)
      );
      expect(draftRestorationCalls).toHaveLength(0);
    });

    /**
     * Edge case: Multiple auto-saves should replace previous drafts
     * Note: This test requires the component to re-render with updated store data
     */
    it('should replace previous draft on subsequent auto-saves', async () => {
      // Given: Store in setup mode (already set in beforeEach)
      mockLocalStorage.setItem.mockClear();

      // When: Page renders and auto-save occurs
      render(<StudioPage />);
      
      // First auto-save
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
      });

      // Get the first saved value
      const firstCall = mockLocalStorage.setItem.mock.calls[0][1];
      const firstParsed = JSON.parse(firstCall);
      expect(firstParsed.text).toBe('My saved draft content');

      // Second auto-save (same content)
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
      });

      // Verify the second call also saved the content
      const secondCall = mockLocalStorage.setItem.mock.calls[1][1];
      const secondParsed = JSON.parse(secondCall);
      expect(secondParsed.text).toBe('My saved draft content');
    });
  });
});
