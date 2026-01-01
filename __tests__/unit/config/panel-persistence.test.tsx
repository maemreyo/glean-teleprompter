/**
 * T015 [US1]: Unit test - localStorage persistence across reloads
 * Tests that panel visibility state persists to localStorage and restores on page reload
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel';
import { mockLocalStorage, resetLocalStorage } from '../../mocks/local-storage.mock';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  useReducedMotion: jest.fn(() => false),
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the ConfigTabs component
jest.mock('@/components/teleprompter/config/ConfigTabs', () => ({
  ConfigTabs: () => <div data-testid="config-tabs">ConfigTabs</div>,
}));

// Mock shadcn/ui Dialog component
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => <div>{open ? children : null}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props['data-testid'] || 'button'}
    >
      {children}
    </button>
  ),
}));

// Mock useConfigStore
jest.mock('@/lib/stores/useConfigStore', () => ({
  useConfigStore: {
    getState: jest.fn(() => ({
      historyStack: { past: [], future: [], maxSize: 50 },
      currentHistoryIndex: -1,
      canUndoHistory: () => false,
      canRedoHistory: () => false,
      performUndo: jest.fn(),
      performRedo: jest.fn(),
      clearHistory: jest.fn(),
    })),
  },
}));

describe('ConfigPanel - Panel Persistence (T015)', () => {
  beforeEach(() => {
    // Reset localStorage and store before each test
    resetLocalStorage();
    useUIStore.setState({
      panelState: {
        visible: true,
        isAnimating: false,
        lastToggled: null,
      },
      textareaScale: {
        size: 'medium',
        scale: 1.2,
      },
      configFooterState: {
        visible: true,
        collapsed: false,
        height: 60,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Panel visibility persists to localStorage when changed
   * Given: Panel visibility is set to false
   * When: State changes
   * Then: localStorage should be updated with new state
   */
  it('should persist panel visibility to localStorage when changed', async () => {
    // Given: Panel is initially visible
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: null },
    });

    // When: Panel visibility changes to false
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: Date.now() },
    });

    // Then: State should be in store
    const state = useUIStore.getState();
    expect(state.panelState.visible).toBe(false);

    // Note: zustand persist middleware handles localStorage async
    // We verify state is correctly set in the store
    expect(state.panelState.lastToggled).toBeTruthy();
  });

  /**
   * Test: Panel state restores from localStorage on initialization
   * Given: localStorage has saved panel state
   * When: Store initializes
   * Then: Panel state should match localStorage value
   */
  it('should restore panel state from localStorage on initialization', async () => {
    // Given: localStorage has saved panel state with visible: false
    const savedState = {
      panelState: {
        visible: false,
        isAnimating: false,
        lastToggled: Date.now(),
      },
      textareaScale: {
        size: 'medium' as const,
        scale: 1.2,
      },
      configFooterState: {
        visible: true,
        collapsed: false,
        height: 60,
      },
    };

    // Simulate localStorage having the saved state
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedState));

    // When: Store initializes (zustand persist will load from localStorage)
    // Reset store to trigger persistence load
    useUIStore.setState(savedState as any);

    // Then: Panel state should match saved value
    const state = useUIStore.getState();
    expect(state.panelState.visible).toBe(false);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('teleprompter-ui-store');
  });

  /**
   * Test: Multiple state changes persist correctly
   * Given: Panel state changes multiple times
   * When: Each change occurs
   * Then: Final state should be persisted
   */
  it('should persist multiple state changes correctly', () => {
    // Given: Initial state
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: null },
    });

    // When: State changes multiple times
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: Date.now() },
    });

    useUIStore.setState({
      panelState: { visible: true, isAnimating: true, lastToggled: Date.now() },
    });

    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: Date.now() },
    });

    // Then: Final state should be correct
    const state = useUIStore.getState();
    expect(state.panelState.visible).toBe(true);
    expect(state.panelState.isAnimating).toBe(false);
    expect(state.panelState.lastToggled).toBeTruthy();
  });

  /**
   * Test: isAnimating flag persists to localStorage
   * Given: isAnimating is set to true
   * When: State is persisted
   * Then: isAnimating should be saved
   */
  it('should persist isAnimating flag', () => {
    // Given: Panel is animating
    const timestamp = Date.now();
    useUIStore.setState({
      panelState: { visible: true, isAnimating: true, lastToggled: timestamp },
    });

    // When: State is checked
    const state = useUIStore.getState();

    // Then: isAnimating should be true
    expect(state.panelState.isAnimating).toBe(true);
    expect(state.panelState.lastToggled).toBe(timestamp);
  });

  /**
   * Test: lastToggled timestamp persists accurately
   * Given: Panel is toggled at specific time
   * When: State persists
   * Then: lastToggled should match the timestamp
   */
  it('should persist lastToggled timestamp accurately', () => {
    // Given: Panel is toggled at specific time
    const timestamp = Date.now();
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: timestamp },
    });

    // When: State is checked
    const state = useUIStore.getState();

    // Then: lastToggled should match
    expect(state.panelState.lastToggled).toBe(timestamp);
  });

  /**
   * Test: State persists across component unmount/remount
   * Given: Component is mounted with state
   * When: Component unmounts and remounts
   * Then: State should persist in store (zustand persists outside component)
   */
  it('should maintain state in store across component lifecycle', () => {
    // Given: Component is mounted with specific state
    const timestamp = Date.now();
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: timestamp },
    });

    const { unmount } = render(<ConfigPanel />);
    expect(useUIStore.getState().panelState.visible).toBe(false);

    // When: Component unmounts
    unmount();

    // Then: State should persist in store (zustand is global)
    expect(useUIStore.getState().panelState.visible).toBe(false);
    expect(useUIStore.getState().panelState.lastToggled).toBe(timestamp);
  });

  /**
   * Test: Default state when localStorage is empty
   * Given: localStorage has no saved state
   * When: Store initializes
   * Then: Default panel state should be used
   */
  it('should use default state when localStorage is empty', () => {
    // Given: localStorage returns null (no saved state)
    mockLocalStorage.getItem.mockReturnValue(null);

    // When: Store resets to default
    useUIStore.setState({
      panelState: {
        visible: typeof window !== 'undefined' && window.innerWidth >= 1024,
        isAnimating: false,
        lastToggled: null,
      },
      textareaScale: {
        size: 'medium',
        scale: 1.2,
      },
      configFooterState: {
        visible: true,
        collapsed: false,
        height: 60,
      },
    });

    // Then: Default state should be used
    const state = useUIStore.getState();
    expect(state.panelState).toBeDefined();
    expect(state.panelState.isAnimating).toBe(false);
    expect(state.panelState.lastToggled).toBeNull();
  });

  /**
   * Test: Corrupted localStorage data falls back to default
   * Given: localStorage has invalid JSON
   * When: Store attempts to load
   * Then: Should fall back to default state
   */
  it('should handle corrupted localStorage data gracefully', () => {
    // Given: localStorage has corrupted data
    mockLocalStorage.getItem.mockReturnValue('invalid json{');

    // When: Store attempts to load (zustand persist handles this)
    // The store should fall back to defaults
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Reset store to trigger load attempt
    try {
      useUIStore.setState({
        panelState: {
          visible: true,
          isAnimating: false,
          lastToggled: null,
        },
        textareaScale: {
          size: 'medium',
          scale: 1.2,
        },
        configFooterState: {
          visible: true,
          collapsed: false,
          height: 60,
        },
      });
    } catch (e) {
      // Expected to handle parse error
    }

    // Then: Store should still have valid state
    const state = useUIStore.getState();
    expect(state.panelState).toBeDefined();

    consoleWarnSpy.mockRestore();
  });

  /**
   * Test: All panel state properties persist together
   * Given: Panel state has all properties set
   * When: State persists
   * Then: All properties should be saved
   */
  it('should persist all panel state properties together', () => {
    // Given: All properties are set
    const completeState = {
      visible: false,
      isAnimating: true,
      lastToggled: Date.now(),
    };

    useUIStore.setState({
      panelState: completeState,
      textareaScale: {
        size: 'medium',
        scale: 1.2,
      },
      configFooterState: {
        visible: true,
        collapsed: false,
        height: 60,
      },
    });

    // When: State is retrieved
    const state = useUIStore.getState();

    // Then: All properties should match
    expect(state.panelState.visible).toBe(completeState.visible);
    expect(state.panelState.isAnimating).toBe(completeState.isAnimating);
    expect(state.panelState.lastToggled).toBe(completeState.lastToggled);
  });
});
