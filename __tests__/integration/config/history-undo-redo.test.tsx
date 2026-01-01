/**
 * T052 [US4]: Integration test - Undo/redo restores correct states
 * Tests that undo and redo correctly restore previous configuration states
 */

import { useConfigStore } from '@/lib/stores/useConfigStore';
import { renderHook, act } from '@testing-library/react';

describe('History Undo/Redo (T052)', () => {
  beforeEach(() => {
    useConfigStore.getState().clearHistory();
  });

  /**
   * Test: Undo restores previous state
   * Given: Multiple configuration changes
   * When: Undo is performed
   * Then: Should restore previous state
   */
  it('should restore previous state on undo', () => {
    // Given: Multiple changes
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 50 });
      result.current.setTypography({ fontSize: 60 });
      result.current.setTypography({ fontSize: 70 });
    });

    const fontSizeBeforeUndo = result.current.typography.fontSize;

    // When: Undoing
    act(() => {
      result.current.performUndo();
    });

    // Then: Should restore to previous state
    expect(result.current.typography.fontSize).toBe(60);
  });

  /**
   * Test: Redo restores undone state
   * Given: State was undone
   * When: Redo is performed
   * Then: Should restore the undone state
   */
  it('should restore undone state on redo', () => {
    // Given: Change then undo
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 55 });
      result.current.setTypography({ fontSize: 65 });
    });

    act(() => {
      result.current.performUndo();
    });

    // When: Redoing
    act(() => {
      result.current.performRedo();
    });

    // Then: Should restore
    expect(result.current.typography.fontSize).toBe(65);
  });

  /**
   * Test: Multiple undo operations work correctly
   * Given: Multiple changes
   * When: Undoing multiple times
   * Then: Should restore each previous state
   */
  it('should handle multiple undo operations', () => {
    // Given: 5 changes
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 48 });
      result.current.setTypography({ fontSize: 52 });
      result.current.setTypography({ fontSize: 56 });
      result.current.setTypography({ fontSize: 60 });
      result.current.setTypography({ fontSize: 64 });
    });

    // When: Undoing 3 times
    act(() => {
      result.current.performUndo();
      result.current.performUndo();
      result.current.performUndo();
    });

    // Then: Should be at second change
    expect(result.current.typography.fontSize).toBe(56);
  });

  /**
   * Test: Multiple redo operations work correctly
   * Given: Multiple undos performed
   * When: Redoing multiple times
   * Then: Should restore each undone state
   */
  it('should handle multiple redo operations', () => {
    // Given: 5 changes, then 3 undos
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 48 });
      result.current.setTypography({ fontSize: 52 });
      result.current.setTypography({ fontSize: 56 });
      result.current.setTypography({ fontSize: 60 });
      result.current.setTypography({ fontSize: 64 });
    });

    act(() => {
      result.current.performUndo();
      result.current.performUndo();
      result.current.performUndo();
    });

    // When: Redoing twice
    act(() => {
      result.current.performRedo();
      result.current.performRedo();
    });

    // Then: Should be at fourth change
    expect(result.current.typography.fontSize).toBe(60);
  });

  /**
   * Test: New change clears redo stack
   * Given: Undone state exists
   * When: New change is made
   * Then: Redo stack should be cleared
   */
  it('should clear redo stack on new change', () => {
    // Given: Change, undo, then new change
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 48 });
      result.current.setTypography({ fontSize: 52 });
      result.current.performUndo();
    });

    const canRedoBefore = result.current.canRedoHistory();

    act(() => {
      result.current.setTypography({ fontSize: 56 });
    });

    const canRedoAfter = result.current.canRedoHistory();

    // Then: Redo should be unavailable
    expect(canRedoBefore).toBe(true);
    expect(canRedoAfter).toBe(false);
  });

  /**
   * Test: Can undo returns correct status
   * Given: Various history states
   * When: Checking canUndo
   * Then: Should return correct boolean
   */
  it('should return correct undo availability', () => {
    const { result } = renderHook(() => useConfigStore());

    // Empty history
    expect(result.current.canUndoHistory()).toBe(false);

    // One change
    act(() => {
      result.current.setTypography({ fontSize: 50 });
    });
    expect(result.current.canUndoHistory()).toBe(true);

    // After undo
    act(() => {
      result.current.performUndo();
    });
    expect(result.current.canUndoHistory()).toBe(false);
  });

  /**
   * Test: Can redo returns correct status
   * Given: Various history states
   * When: Checking canRedo
   * Then: Should return correct boolean
   */
  it('should return correct redo availability', () => {
    const { result } = renderHook(() => useConfigStore());

    // No redo initially
    expect(result.current.canRedoHistory()).toBe(false);

    // After undo
    act(() => {
      result.current.setTypography({ fontSize: 50 });
      result.current.setTypography({ fontSize: 60 });
      result.current.performUndo();
    });
    expect(result.current.canRedoHistory()).toBe(true);

    // After redo
    act(() => {
      result.current.performRedo();
    });
    expect(result.current.canRedoHistory()).toBe(false);
  });
});
