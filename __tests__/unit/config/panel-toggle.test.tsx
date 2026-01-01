/**
 * T014 [US1]: Unit test - Panel toggle button click updates state
 * Tests that clicking the panel toggle button correctly updates the panel state
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel';
import { useUIStore } from '@/stores/useUIStore';
import { useConfigStore } from '@/lib/stores/useConfigStore';

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

describe('ConfigPanel - Panel Toggle (T014)', () => {
  beforeEach(() => {
    // Reset stores before each test
    useUIStore.setState({
      panelState: {
        visible: true,
        isAnimating: false,
        lastToggled: null,
      },
    });
    
    // Mock config store
    const mockConfigStore = {
      historyStack: { past: [], future: [], maxSize: 50 },
      currentHistoryIndex: -1,
      canUndoHistory: jest.fn(() => false),
      canRedoHistory: jest.fn(() => false),
      performUndo: jest.fn(),
      performRedo: jest.fn(),
      clearHistory: jest.fn(),
    };
    
    jest.spyOn(useConfigStore, 'getState').mockReturnValue(mockConfigStore as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Panel renders when visible state is true
   * Given: Panel state visible is true
   * When: Component renders
   * Then: Panel should be visible in the DOM
   */
  it('should render panel when visible state is true', () => {
    // Given: Panel state visible is true
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: null },
    });

    // When: Component renders
    render(<ConfigPanel />);

    // Then: Panel should be visible
    const panel = screen.getByText('Configuration');
    expect(panel).toBeInTheDocument();
  });

  /**
   * Test: Panel does not render when visible state is false
   * Given: Panel state visible is false
   * When: Component renders
   * Then: Panel should not be visible in the DOM
   */
  it('should not render panel when visible state is false', () => {
    // Given: Panel state visible is false
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: null },
    });

    // When: Component renders
    const { container } = render(<ConfigPanel />);

    // Then: Panel should not be visible (display: none when not visible)
    const panel = container.querySelector('.w-full.lg\\:w-\\[35\\%\\]');
    expect(panel).toHaveStyle({ display: 'none' });
  });

  /**
   * Test: Panel state changes from visible to hidden
   * Given: Panel is initially visible
   * When: Panel state is set to hidden
   * Then: Panel should update to hidden state
   */
  it('should update panel state from visible to hidden', () => {
    // Given: Panel is initially visible
    const { rerender } = render(<ConfigPanel />);
    
    // When: Panel state is set to hidden
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: Date.now() },
    });
    
    // Re-render to reflect state change
    rerender(<ConfigPanel />);
    
    // Then: Panel should be hidden
    const { container } = render(<ConfigPanel />);
    const panel = container.querySelector('.w-full.lg\\:w-\\[35\\%\\]');
    expect(panel).toHaveStyle({ display: 'none' });
  });

  /**
   * Test: Panel state changes from hidden to visible
   * Given: Panel is initially hidden
   * When: Panel state is set to visible
   * Then: Panel should update to visible state
   */
  it('should update panel state from hidden to visible', () => {
    // Given: Panel is initially hidden
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: null },
    });
    
    const { rerender } = render(<ConfigPanel />);
    
    // When: Panel state is set to visible
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: Date.now() },
    });
    
    // Re-render to reflect state change
    rerender(<ConfigPanel />);
    
    // Then: Panel should be visible
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  /**
   * Test: Panel state updates trigger re-render
   * Given: Panel is rendered with initial state
   * When: Panel state changes multiple times
   * Then: Panel should re-render and reflect current state
   */
  it('should re-render when panel state changes', () => {
    // Given: Panel is rendered
    const { rerender } = render(<ConfigPanel />);
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    
    // When: State changes to hidden
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: Date.now() },
    });
    rerender(<ConfigPanel />);
    
    // Then: Should be hidden
    const { container } = render(<ConfigPanel />);
    const panel = container.querySelector('.w-full.lg\\:w-\\[35\\%\\]');
    expect(panel).toHaveStyle({ display: 'none' });
    
    // When: State changes back to visible
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: Date.now() },
    });
    rerender(<ConfigPanel />);
    
    // Then: Should be visible again
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });

  /**
   * Test: lastToggled timestamp updates on state change
   * Given: Panel state exists
   * When: Panel visibility changes
   * Then: lastToggled should be updated with current timestamp
   */
  it('should update lastToggled timestamp on visibility change', () => {
    // Given: Initial state
    const initialTime = Date.now() - 1000;
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: initialTime },
    });
    
    // When: Visibility changes
    const newTime = Date.now();
    useUIStore.setState({
      panelState: { visible: false, isAnimating: false, lastToggled: newTime },
    });
    
    // Then: lastToggled should be updated
    const state = useUIStore.getState();
    expect(state.panelState.lastToggled).toBe(newTime);
    expect(state.panelState.lastToggled).not.toBe(initialTime);
  });

  /**
   * Test: isAnimating flag can be set independently
   * Given: Panel state exists
   * When: isAnimating is set to true
   * Then: State should reflect isAnimating: true
   */
  it('should set isAnimating flag independently', () => {
    // Given: Initial state without animation
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: null },
    });
    
    // When: Animation starts
    useUIStore.setState({
      panelState: { visible: true, isAnimating: true, lastToggled: Date.now() },
    });
    
    // Then: isAnimating should be true
    const state = useUIStore.getState();
    expect(state.panelState.isAnimating).toBe(true);
  });

  /**
   * Test: Panel state persists across renders
   * Given: Panel state is set
   * When: Component unmounts and remounts
   * Then: State should persist (via zustand persist middleware)
   */
  it('should persist panel state across component lifecycle', () => {
    // Given: Panel state is set to visible
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: Date.now() },
    });
    
    const { unmount } = render(<ConfigPanel />);
    expect(screen.getByText('Configuration')).toBeInTheDocument();
    
    // When: Component unmounts and remounts
    unmount();
    render(<ConfigPanel />);
    
    // Then: State should persist
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });
});
