/**
 * T054 [US4]: Integration test - History resets on preset/template load
 * Tests that history is reset when loading presets, templates, or scripts
 */

import { renderHook, act } from '@testing-library/react';
import { useConfigStore } from '@/lib/stores/useConfigStore';

describe('History Reset on Load (T054)', () => {
  beforeEach(() => {
    useConfigStore.getState().clearHistory();
  });

  /**
   * Test: History resets when setAll is called
   * Given: History has entries
   * When: setAll is called (loading preset)
   * Then: History should be cleared
   */
  it('should reset history when loading preset', () => {
    // Given: History with entries
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 50 });
      result.current.setTypography({ fontSize: 60 });
      result.current.setTypography({ fontSize: 70 });
    });

    const { historyStack } = result.current;
    expect(historyStack.past.length).toBeGreaterThan(0);

    // When: Loading preset via setAll
    act(() => {
      result.current.setAll({
        version: '1.0.0',
        typography: {
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 48,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
        },
        colors: {
          primaryColor: '#ffffff',
          gradientEnabled: false,
          gradientType: 'linear',
          gradientColors: ['#ffffff', '#fbbf24'],
          gradientAngle: 90,
          outlineColor: '#000000',
          glowColor: '#ffffff',
        },
        effects: {
          shadowEnabled: false,
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowBlur: 4,
          shadowColor: '#000000',
          shadowOpacity: 0.5,
          outlineEnabled: false,
          outlineWidth: 2,
          outlineColor: '#000000',
          glowEnabled: false,
          glowBlurRadius: 10,
          glowIntensity: 0.5,
          glowColor: '#ffffff',
          backdropFilterEnabled: false,
          backdropBlur: 0,
          backdropBrightness: 100,
          backdropSaturation: 100,
        },
        layout: {
          horizontalMargin: 0,
          verticalPadding: 0,
          textAlign: 'center',
          columnCount: 1,
          columnGap: 20,
          textAreaWidth: 100,
          textAreaPosition: 'center',
        },
        animations: {
          smoothScrollEnabled: true,
          scrollDamping: 0.5,
          entranceAnimation: 'fade-in',
          entranceDuration: 500,
          wordHighlightEnabled: false,
          highlightColor: '#fbbf24',
          highlightSpeed: 200,
          autoScrollEnabled: false,
          autoScrollSpeed: 50,
          autoScrollAcceleration: 0,
        },
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          appVersion: '1.0.0',
        },
      });
    });

    // Then: History should be cleared
    const { historyStack: stackAfter } = result.current;
    expect(stackAfter.past.length).toBe(0);
    expect(stackAfter.future.length).toBe(0);
  });

  /**
   * Test: Undo is unavailable after reset
   * Given: History was reset
   * When: Checking undo availability
   * Then: Should be false
   */
  it('should make undo unavailable after history reset', () => {
    // Given: History with entries
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 55 });
      result.current.setTypography({ fontSize: 65 });
    });

    expect(result.current.canUndoHistory()).toBe(true);

    // When: Reset via setAll
    act(() => {
      result.current.setAll({
        version: '1.0.0',
        typography: result.current.typography,
        colors: result.current.colors,
        effects: result.current.effects,
        layout: result.current.layout,
        animations: result.current.animations,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          appVersion: '1.0.0',
        },
      });
    });

    // Then: Undo should be unavailable
    expect(result.current.canUndoHistory()).toBe(false);
  });

  /**
   * Test: Reset history method works directly
   * Given: History has entries
   * When: resetHistory is called
   * Then: History should be cleared
   */
  it('should clear history when resetHistory is called', () => {
    // Given: History with entries
    const { result } = renderHook(() => useConfigStore());
    
    act(() => {
      result.current.setTypography({ fontSize: 52 });
      result.current.setTypography({ fontSize: 62 });
    });

    expect(result.current.historyStack.past.length).toBeGreaterThan(0);

    // When: Resetting history
    act(() => {
      result.current.resetHistory();
    });

    // Then: Should be cleared
    expect(result.current.historyStack.past.length).toBe(0);
    expect(result.current.historyStack.future.length).toBe(0);
  });
});
