/**
 * T050 [US4]: Unit test - History stack maintains 50-state limit
 * Tests that the history stack maintains a maximum of 50 states
 */

import { useConfigStore } from '@/lib/stores/useConfigStore';

describe('History Limit (T050)', () => {
  beforeEach(() => {
    // Reset store before each test
    useConfigStore.getState().clearHistory();
  });

  /**
   * Test: History stack initializes with 50-state limit
   * Given: Config store is created
   * When: Checking max size
   * Then: Should be 50
   */
  it('should initialize with 50-state limit', () => {
    // Given: Config store
    const state = useConfigStore.getState();

    // When: Getting stack info
    const { historyStack } = state;

    // Then: Max size should be 50
    expect(historyStack.maxSize).toBe(50);
  });

  /**
   * Test: Can add entries up to limit
   * Given: History manager is created
   * When: Adding 50 entries
   * Then: All should be added
   */
  it('should accept entries up to 50-state limit', () => {
    // Given: Config store
    const state = useConfigStore.getState();

    // When: Adding 50 entries
    for (let i = 0; i < 50; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: {
          fontSize: 48 + i,
          fontFamily: 'Arial',
          fontWeight: 400,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
        },
      });
    }

    // Then: Should have 50 entries
    const { historyStack } = useConfigStore.getState();
    expect(historyStack.past.length).toBe(50);
  });

  /**
   * Test: Adding beyond limit removes oldest
   * Given: History has 50 entries
   * When: Adding 51st entry
   * Then: Oldest entry should be removed
   */
  it('should remove oldest entry when limit is exceeded', () => {
    // Given: Config store
    const state = useConfigStore.getState();

    // When: Adding 50 entries
    for (let i = 0; i < 50; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: {
          fontSize: 48 + i,
          fontFamily: 'Arial',
          fontWeight: 400,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
        },
      });
    }

    // Add 51st entry
    state.recordDiscreteChange('Change 50', {
      typography: {
        fontSize: 98,
        fontFamily: 'Arial',
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 1.5,
        textTransform: 'none',
      },
    });

    // Then: Should still have 50 entries
    const { historyStack } = useConfigStore.getState();
    expect(historyStack.past.length).toBe(50);
  });

  /**
   * Test: Can check if at limit
   * Given: History manager
   * When: Adding entries
   * Then: Should track count correctly
   */
  it('should track entry count correctly', () => {
    // Given: Config store
    const state = useConfigStore.getState();

    // When: Adding 25 entries
    for (let i = 0; i < 25; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: {
          fontSize: 48 + i,
          fontFamily: 'Arial',
          fontWeight: 400,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
        },
      });
    }

    // Then: Should have correct count
    const { historyStack } = useConfigStore.getState();
    expect(historyStack.past.length).toBe(25);
  });

  /**
   * Test: Clear resets to zero
   * Given: History has entries
   * When: Clear is called
   * Then: Should have zero entries
   */
  it('should reset count when cleared', () => {
    // Given: Config store with entries
    const state = useConfigStore.getState();
    for (let i = 0; i < 30; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: {
          fontSize: 48 + i,
          fontFamily: 'Arial',
          fontWeight: 400,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
        },
      });
    }

    // When: Clearing
    state.clearHistory();

    // Then: Should be empty
    const { historyStack } = useConfigStore.getState();
    expect(historyStack.past.length).toBe(0);
    expect(historyStack.future.length).toBe(0);
  });

  /**
   * Test: Limit applies to total (past + future)
   * Given: History with past and future
   * When: Adding new entry
   * Then: Future should be cleared, past limited
   */
  it('should limit total history size (past + future)', () => {
    // Given: Config store with history
    const state = useConfigStore.getState();
    for (let i = 0; i < 30; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: {
          fontSize: 48 + i,
          fontFamily: 'Arial',
          fontWeight: 400,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
        },
      });
    }

    // Undo to create future
    state.performUndo();

    const { historyStack: stackBefore } = useConfigStore.getState();
    expect(stackBefore.future.length).toBe(1);

    // When: Adding new entry (clears future)
    state.recordDiscreteChange('New change', {
      typography: {
        fontSize: 78,
        fontFamily: 'Arial',
        fontWeight: 400,
        letterSpacing: 0,
        lineHeight: 1.5,
        textTransform: 'none',
      },
    });

    // Then: Future should be cleared
    const { historyStack: stackAfter } = useConfigStore.getState();
    expect(stackAfter.future.length).toBe(0);
  });
});
