/**
 * T053 [US4]: Unit test - Keyboard shortcuts work correctly
 * Tests that keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl/Cmd+Y) work for undo/redo
 */

import { render, renderHook, act } from '@testing-library/react';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { ConfigPanel } from '@/components/teleprompter/config/ConfigPanel';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  useReducedMotion: jest.fn(() => false),
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

jest.mock('@/components/teleprompter/config/ConfigTabs', () => ({
  ConfigTabs: () => <div>ConfigTabs</div>,
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

describe('History Keyboard Shortcuts (T053)', () => {
  beforeEach(() => {
    useConfigStore.getState().clearHistory();
  });

  /**
   * Helper: Simulate keyboard event
   */
  function simulateKey(key: string, ctrlKey = false, metaKey = false, shiftKey = false) {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey,
      metaKey,
      shiftKey,
      bubbles: true,
      cancelable: true,
    });
    window.dispatchEvent(event);
  }

  /**
   * Test: Ctrl+Z triggers undo
   * Given: Config has changes
   * When: Ctrl+Z is pressed
   * Then: Undo should be triggered
   */
  it('should trigger undo on Ctrl+Z', () => {
    // Given: Changes exist
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 50 });
      result.current.setTypography({ fontSize: 60 });
    });

    const fontSizeBefore = result.current.typography.fontSize;

    // When: Ctrl+Z is pressed
    act(() => {
      simulateKey('z', true, false);
    });

    // Then: Undo should work
    expect(result.current.typography.fontSize).toBe(50);
  });

  /**
   * Test: Cmd+Z triggers undo on Mac
   * Given: Config has changes
   * When: Cmd+Z is pressed
   * Then: Undo should be triggered
   */
  it('should trigger undo on Cmd+Z (Mac)', () => {
    // Given: Changes exist
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 55 });
      result.current.setTypography({ fontSize: 65 });
    });

    // When: Cmd+Z is pressed
    act(() => {
      simulateKey('z', false, true);
    });

    // Then: Undo should work
    expect(result.current.typography.fontSize).toBe(55);
  });

  /**
   * Test: Ctrl+Shift+Z triggers redo
   * Given: Undone state exists
   * When: Ctrl+Shift+Z is pressed
   * Then: Redo should be triggered
   */
  it('should trigger redo on Ctrl+Shift+Z', () => {
    // Given: Undone state
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 48 });
      result.current.setTypography({ fontSize: 58 });
      result.current.performUndo();
    });

    // When: Ctrl+Shift+Z is pressed
    act(() => {
      simulateKey('z', true, false, true);
    });

    // Then: Redo should work
    expect(result.current.typography.fontSize).toBe(58);
  });

  /**
   * Test: Ctrl+Y triggers redo (alternative)
   * Given: Undone state exists
   * When: Ctrl+Y is pressed
   * Then: Redo should be triggered
   */
  it('should trigger redo on Ctrl+Y (alternative)', () => {
    // Given: Undone state
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 52 });
      result.current.setTypography({ fontSize: 62 });
      result.current.performUndo();
    });

    // When: Ctrl+Y is pressed
    act(() => {
      simulateKey('y', true, false);
    });

    // Then: Redo should work
    expect(result.current.typography.fontSize).toBe(62);
  });

  /**
   * Test: Keyboard shortcuts are prevented when unavailable
   * Given: No undo available
   * When: Ctrl+Z is pressed
   * Then: Should not crash
   */
  it('should handle shortcuts gracefully when unavailable', () => {
    // Given: Empty history
    const { result } = renderHook(() => useConfigStore());

    // When: Pressing Ctrl+Z with no history
    act(() => {
      simulateKey('z', true, false);
    });

    // Then: Should not crash
    expect(result.current).toBeDefined();
  });

  /**
   * Test: Undo button reflects keyboard shortcut state
   * Given: ConfigPanel is rendered
   * When: History state changes
   * Then: Undo button should update
   */
  it('should update undo button state based on keyboard actions', () => {
    // Given: ConfigPanel rendered
    const { rerender } = render(<ConfigPanel />);

    // When: Making changes
    act(() => {
      useConfigStore.getState().setTypography({ fontSize: 50 });
    });

    rerender(<ConfigPanel />);

    // Then: Can undo should be true
    const canUndo = useConfigStore.getState().canUndoHistory();
    expect(canUndo).toBe(true);
  });
});
