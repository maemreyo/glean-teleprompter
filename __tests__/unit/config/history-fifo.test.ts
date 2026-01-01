/**
 * T051 [US4]: Unit test - FIFO removal when limit exceeded
 * Tests that oldest entries are removed first when history limit is exceeded (First-In-First-Out)
 */

import { useConfigStore } from '@/lib/stores/useConfigStore';

describe('History FIFO Removal (T051)', () => {
  beforeEach(() => {
    useConfigStore.getState().clearHistory();
  });

  /**
   * Test: First entry is removed when limit exceeded
   * Given: History has 50 entries
   * When: Adding 51st entry
   * Then: First entry should be removed
   */
  it('should remove first entry when limit is exceeded', () => {
    // Given: 50 entries
    const state = useConfigStore.getState();
    for (let i = 0; i < 50; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: { fontSize: 48 + i } as any,
      });
    }

    const firstEntry = useConfigStore.getState().historyStack.past[0];

    // When: Adding 51st entry
    state.recordDiscreteChange('Change 50', {
      typography: { fontSize: 98 } as any,
    });

    // Then: First entry should be removed
    const { historyStack } = useConfigStore.getState();
    expect(historyStack.past.length).toBe(50);
    expect(historyStack.past[0]).not.toBe(firstEntry);
  });

  /**
   * Test: Multiple excess entries remove oldest first
   * Given: History has 50 entries
   * When: Adding 5 more entries
   * Then: First 5 entries should be removed
   */
  it('should remove multiple oldest entries when exceeded by multiple', () => {
    // Given: 50 entries
    const state = useConfigStore.getState();
    for (let i = 0; i < 50; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: { fontSize: 48 + i } as any,
      });
    }

    const thirdEntry = useConfigStore.getState().historyStack.past[2];

    // When: Adding 5 more entries
    for (let i = 50; i < 55; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: { fontSize: 48 + i } as any,
      });
    }

    // Then: First 5 entries should be removed
    const { historyStack } = useConfigStore.getState();
    expect(historyStack.past.length).toBe(50);
    expect(historyStack.past[0]).not.toBe(thirdEntry);
  });

  /**
   * Test: Order is maintained after FIFO removal
   * Given: History with entries
   * When: Oldest entries are removed
   * Then: Remaining entries should maintain order
   */
  it('should maintain entry order after FIFO removal', () => {
    // Given: 50 entries with known timestamps
    const state = useConfigStore.getState();
    const timestamps: number[] = [];
    
    for (let i = 0; i < 50; i++) {
      const ts = Date.now() + i;
      timestamps.push(ts);
      state.recordDiscreteChange(`Change ${i}`, {
        typography: { fontSize: 48 + i } as any,
      });
    }

    // When: Adding more entries
    state.recordDiscreteChange('Change 50', {
      typography: { fontSize: 98 } as any,
    });

    // Then: Remaining entries should be in order
    const { historyStack } = useConfigStore.getState();
    for (let i = 1; i < historyStack.past.length; i++) {
      expect(historyStack.past[i].timestamp).toBeGreaterThan(
        historyStack.past[i - 1].timestamp
      );
    }
  });

  /**
   * Test: Current index updates after FIFO removal
   * Given: History is at limit
   * When: New entry is added
   * Then: Current index should adjust correctly
   */
  it('should update current index correctly after FIFO', () => {
    // Given: 50 entries
    const state = useConfigStore.getState();
    for (let i = 0; i < 50; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: { fontSize: 48 + i } as any,
      });
    }

    const indexBefore = useConfigStore.getState().currentHistoryIndex;

    // When: Adding new entry
    state.recordDiscreteChange('Change 50', {
      typography: { fontSize: 98 } as any,
    });

    // Then: Index should be at max (49)
    const indexAfter = useConfigStore.getState().currentHistoryIndex;
    expect(indexAfter).toBe(49);
  });

  /**
   * Test: Undo works correctly after FIFO removal
   * Given: History with entries removed
   * When: Undoing
   * Then: Should navigate correctly
   */
  it('should allow undo after FIFO removal', () => {
    // Given: 50 entries, then add 1 more
    const state = useConfigStore.getState();
    for (let i = 0; i < 51; i++) {
      state.recordDiscreteChange(`Change ${i}`, {
        typography: { fontSize: 48 + i } as any,
      });
    }

    const canUndo = useConfigStore.getState().canUndoHistory();

    // When: Checking undo availability
    // Then: Should be able to undo
    expect(canUndo).toBe(true);

    // When: Undoing
    state.performUndo();

    // Then: Should work
    const { historyStack, currentHistoryIndex } = useConfigStore.getState();
    expect(currentHistoryIndex).toBe(48);
    expect(historyStack.past.length).toBe(50);
  });
});
