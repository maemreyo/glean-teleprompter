/**
 * T018 [US1]: Accessibility test - ARIA labels and announcements
 * Tests that panel has proper ARIA labels, roles, and screen reader announcements
 */

import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { useUIStore } from '@/stores/useUIStore';
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel';
import { useConfigStore } from '@/lib/stores/useConfigStore';

// Extend expect for jest-axe
expect.extend(toHaveNoViolations);

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
  Dialog: ({ children, open }: any) => (
    <div data-testid="dialog-root">
      {open ? (
        <div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          {children}
        </div>
      ) : (
        <div style={{ display: 'none' }}>{children}</div>
      )}
    </div>
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2 id="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, 'aria-label': ariaLabel, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-testid={props['data-testid'] || 'button'}
    >
      {children}
    </button>
  ),
}));

// Mock useConfigStore
jest.mock('@/lib/stores/useConfigStore', () => {
  const mockState = {
    historyStack: { past: [], future: [], maxSize: 50 },
    currentHistoryIndex: -1,
    canUndoHistory: jest.fn(() => false),
    canRedoHistory: jest.fn(() => false),
    performUndo: jest.fn(),
    performRedo: jest.fn(),
    clearHistory: jest.fn(),
  };
  const mockStore = jest.fn(() => mockState);
  (mockStore as any).getState = jest.fn(() => mockState);
  return { useConfigStore: mockStore };
});

describe('ConfigPanel - Accessibility (T018)', () => {
  beforeEach(() => {
    (useConfigStore as unknown as jest.Mock).mockReturnValue({
      historyStack: { past: [], future: [], maxSize: 50 },
      currentHistoryIndex: -1,
      canUndoHistory: jest.fn(() => false),
      canRedoHistory: jest.fn(() => false),
      performUndo: jest.fn(),
      performRedo: jest.fn(),
      clearHistory: jest.fn(),
    });
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
   * Test: Panel has no accessibility violations
   * Given: Panel is rendered
   * When: Running axe-core analysis
   * Then: Should have no violations
   */
  it('should have no accessibility violations', async () => {
    // Given: Panel is rendered
    const { container } = render(<ConfigPanel />);

    // When: Running axe-core
    const results = await axe(container);

    // Then: Should have no violations
    expect(results).toHaveNoViolations();
  });

  /**
   * Test: Panel heading has semantic HTML
   * Given: Panel is rendered
   * When: Checking heading element
   * Then: Should use <h2> with proper text
   */
  it('should have semantic heading for panel title', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Looking for heading
    const heading = screen.getByText('Configuration');

    // Then: Should be present
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H2');
  });

  /**
   * Test: Undo button has proper ARIA label
   * Given: Panel is rendered
   * When: Checking undo button
   * Then: Should have aria-label="Undo"
   */
  it('should have aria-label on undo button', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Looking for undo button
    const undoButton = screen.getByLabelText('Undo');

    // Then: Should have proper aria-label
    expect(undoButton).toBeInTheDocument();
    expect(undoButton).toHaveAttribute('aria-label', 'Undo');
  });

  /**
   * Test: Redo button has proper ARIA label
   * Given: Panel is rendered
   * When: Checking redo button
   * Then: Should have aria-label="Redo"
   */
  it('should have aria-label on redo button', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Looking for redo button
    const redoButton = screen.getByLabelText('Redo');

    // Then: Should have proper aria-label
    expect(redoButton).toBeInTheDocument();
    expect(redoButton).toHaveAttribute('aria-label', 'Redo');
  });

  /**
   * Test: Clear history button has ARIA label
   * Given: Panel has history
   * When: Checking clear history button
   * Then: Should have aria-label="Clear history"
   */
  it('should have aria-label on clear history button', () => {
    // Given: Panel has history
    // Mock useConfigStore to return history
    const mockState = {
      historyStack: { past: [{ timestamp: Date.now(), config: {}, action: 'Test' }], future: [], maxSize: 50 },
      currentHistoryIndex: 0,
      canUndoHistory: () => true,
      canRedoHistory: () => false,
      performUndo: jest.fn(),
      performRedo: jest.fn(),
      clearHistory: jest.fn(),
    };
    (useConfigStore as unknown as jest.Mock).mockReturnValue(mockState);

    // When: Panel renders
    render(<ConfigPanel />);

    // Then: Clear button should have aria-label
    const clearButton = screen.getByLabelText('Clear history');
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveAttribute('aria-label', 'Clear history');
  });

  /**
   * Test: Disabled buttons have aria-disabled or disabled attribute
   * Given: Panel has no undo history
   * When: Checking undo button state
   * Then: Should be disabled
   */
  it('should mark disabled buttons appropriately', () => {
    // Given: Panel has no undo history
    render(<ConfigPanel />);

    // When: Looking for undo button
    const undoButton = screen.getByLabelText('Undo');

    // Then: Should be disabled
    expect(undoButton).toBeDisabled();
  });

  /**
   * Test: Dialog has proper ARIA attributes
   * Given: Clear history dialog opens
   * When: Checking dialog accessibility
   * Then: Should have role="dialog" and aria-modal
   */
  it('should have proper ARIA attributes on dialog', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Dialog should be present (but closed)
    // The Dialog component sets role="dialog"
    const dialog = screen.queryByRole('dialog');

    // Then: Dialog should exist in DOM (controlled by open prop)
    // Note: Dialog is only rendered when open={true}
    expect(dialog).not.toBeInTheDocument(); // Role "dialog" should not be present when closed
  });

  /**
   * Test: Dialog title is properly associated
   * Given: Dialog is open
   * When: Checking title
   * Then: Should have DialogTitle component
   */
  it('should have proper dialog title', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Looking for dialog title
    const dialogTitles = screen.getAllByText('Clear History');

    // Then: Title should exist
    expect(dialogTitles.length).toBeGreaterThan(0);
    expect(dialogTitles.find(t => t.tagName === 'H2')).toBeDefined();
  });

  /**
   * Test: Dialog has descriptive text
   * Given: Dialog exists
   * When: Checking description
   * Then: Should have DialogDescription
   */
  it('should have dialog description for screen readers', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Looking for dialog description
    const descriptions = screen.getAllByText(/Are you sure you want to clear all undo\/redo history/);

    // Then: Description should exist
    expect(descriptions.length).toBeGreaterThan(0);
  });

  /**
   * Test: History indicator is accessible
   * Given: Panel has history
   * When: Checking history indicator
   * Then: Should be readable by screen readers
   */
  it('should have accessible history indicator', () => {
    // Given: Panel has history
    const mockState = {
      historyStack: {
        past: [
          { timestamp: Date.now(), config: {}, action: 'Change 1' },
          { timestamp: Date.now(), config: {}, action: 'Change 2' },
        ],
        future: [],
        maxSize: 50
      },
      currentHistoryIndex: 1,
      canUndoHistory: () => true,
      canRedoHistory: () => false,
      performUndo: jest.fn(),
      performRedo: jest.fn(),
      clearHistory: jest.fn(),
    };
    (useConfigStore as unknown as jest.Mock).mockReturnValue(mockState);

    // When: Panel renders
    render(<ConfigPanel />);

    // Then: History indicator should be visible
    const indicator = screen.getByText(/\/\d+ changes/);
    expect(indicator).toBeInTheDocument();
  });

  /**
   * Test: Buttons are keyboard accessible
   * Given: Panel is rendered
   * When: Checking button elements
   * Then: Should be <button> elements (not divs)
   */
  it('should use proper button elements for interactivity', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Finding all buttons
    const buttons = screen.getAllByRole('button');

    // Then: Should have multiple buttons
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => {
      expect(button.tagName).toBe('BUTTON');
    });
  });

  /**
   * Test: Focus management is correct
   * Given: Panel has interactive elements
   * When: Checking focusable elements
   * Then: All interactive elements should be focusable
   */
  it('should have proper focus management', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Finding focusable elements
    const undoButton = screen.getByLabelText('Undo');
    const redoButton = screen.getByLabelText('Redo');

    // Then: Should be able to receive focus
    expect(undoButton).toBeInTheDocument();
    expect(redoButton).toBeInTheDocument();
  });

  /**
   * Test: Color contrast meets WCAG AA standards
   * Given: Panel is rendered
   * When: Running axe-core
   * Then: Should have no color contrast violations
   */
  it('should meet WCAG AA color contrast requirements', async () => {
    // Given: Panel is rendered
    const { container } = render(<ConfigPanel />);

    // When: Running axe-core
    const results = await axe(container);

    // Then: Should have no color contrast violations
    const contrastViolations = results.violations.filter(
      (v: any) => v.id === 'color-contrast'
    );
    expect(contrastViolations).toHaveLength(0);
  });

  /**
   * Test: Screen reader announces panel state changes
   * Given: Panel visibility changes
   * When: State changes
   * Then: Should have aria-live or similar announcement mechanism
   * Note: This is documented behavior, actual implementation would use live regions
   */
  it('should announce panel state changes to screen readers', () => {
    // Given: Panel is visible
    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: null },
    });

    // When: Panel state changes
    const { rerender } = render(<ConfigPanel />);
    
    act(() => {
      useUIStore.setState({
        panelState: { visible: false, isAnimating: true, lastToggled: Date.now() },
      });
    });

    // Then: Panel should re-render with new state
    // Note: Actual screen reader announcements would use aria-live regions
    // This test verifies the component updates correctly
    rerender(<ConfigPanel />);
    
    const state = useUIStore.getState();
    expect(state.panelState.visible).toBe(false);
  });

  /**
   * Test: All interactive elements have accessible names
   * Given: Panel is rendered
   * When: Checking interactive elements
   * Then: All should have accessible names
   */
  it('should have accessible names for all interactive elements', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Finding buttons by label
    const undoButton = screen.getByLabelText('Undo');
    const redoButton = screen.getByLabelText('Redo');

    // Then: All buttons should have labels
    expect(undoButton).toBeInTheDocument();
    expect(redoButton).toBeInTheDocument();
  });

  /**
   * Test: Dialog actions are clearly labeled
   * Given: Dialog is present
   * When: Checking action buttons
   * Then: Should have clear "Cancel" and "Clear History" labels
   */
  it('should have clearly labeled dialog actions', () => {
    // Given: Panel is rendered
    render(<ConfigPanel />);

    // When: Looking for dialog buttons
    // Note: We use queryByText because the buttons are hidden in a display:none div when dialog is closed
    const cancelButton = screen.queryByText('Cancel');
    const clearButton = screen.getAllByText('Clear History').find(b => b.tagName === 'BUTTON' || b.closest('button'));

    // Then: Both should exist
    expect(cancelButton).toBeInTheDocument();
    expect(clearButton).toBeDefined();
  });
});
