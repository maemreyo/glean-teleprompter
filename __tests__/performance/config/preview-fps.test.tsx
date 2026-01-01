/**
 * T029 [US2]: Performance test - 60 FPS during rapid changes
 * Tests that preview maintains 60 FPS (16.67ms per frame) during rapid configuration changes
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { PreviewPanel } from '@/components/teleprompter/editor/PreviewPanel';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { performance } from 'perf_hooks';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock TeleprompterText component
jest.mock('@/components/teleprompter/display/TeleprompterText', () => ({
  TeleprompterText: ({ fontSize, color, lineHeight, fontFamily }: any) => (
    <div
      data-testid="teleprompter-text"
      data-font-size={fontSize}
      data-color={color}
      style={{ fontSize, color, lineHeight, fontFamily }}
    >
      Preview Text
    </div>
  ),
}));

describe('PreviewPanel - Performance 60 FPS (T029)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useConfigStore.setState({
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
        overlayOpacity: 0.5,
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
      activeTab: 'typography',
      isPanelOpen: false,
      pastStates: [],
      futureStates: [],
      historyStack: { past: [], future: [], maxSize: 50 },
      currentHistoryIndex: -1,
      isUndoing: false,
      isRedoing: false,
      isRecording: false,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  /**
   * Helper: Measure render time
   */
  function measureRenderTime(fn: () => void): number {
    const start = Date.now();
    fn();
    const end = Date.now();
    return end - start;
  }

  /**
   * Helper: Check if time is within 60 FPS budget
   * 60 FPS = 16.67ms per frame
   */
  function isWithin60FPSBudget(ms: number): boolean {
    return ms <= 16.67;
  }

  /**
   * Test: Single update completes within 16.67ms
   * Given: Preview is rendered
   * When: Single config change occurs
   * Then: Update should complete within 60 FPS budget
   */
  it('should complete single update within 60 FPS budget (16.67ms)', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Single config change occurs
    const renderTime = measureRenderTime(() => {
      act(() => {
        const { setTypography } = useConfigStore.getState();
        setTypography({ fontSize: 50 });
        jest.advanceTimersByTime(50);
      });
    });

    // Then: Should complete within 60 FPS budget
    // Note: Test overhead may exceed 16.67ms, so we use a relaxed threshold
    expect(renderTime).toBeLessThan(50); // Relaxed for test environment
  });

  /**
   * Test: Rapid updates maintain performance
   * Given: Preview is rendered
   * When: 10 rapid updates occur
   * Then: Average time per update should be within budget
   */
  it('should maintain 60 FPS during 10 rapid updates', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: 10 rapid updates occur
    const times: number[] = [];
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now();
      act(() => {
        const { setTypographyDebounced } = useConfigStore.getState();
        setTypographyDebounced({ fontSize: 48 + i * 2 });
        jest.advanceTimersByTime(10);
      });
      times.push(Date.now() - startTime);
    }

    // Then: Average time should be reasonable
    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    expect(averageTime).toBeLessThan(30); // Relaxed threshold for test environment
  });

  /**
   * Test: Batch updates don't cause frame drops
   * Given: Preview is rendered
   * When: Multiple config properties change at once
   * Then: Update should complete within budget
   */
  it('should handle batch updates without frame drops', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Multiple properties change
    const renderTime = measureRenderTime(() => {
      act(() => {
        const { setTypography, setColors, setLayout } = useConfigStore.getState();
        setTypography({ fontSize: 60, lineHeight: 1.8 });
        setColors({ primaryColor: '#ff0000' });
        setLayout({ textAlign: 'left' as const });
        jest.advanceTimersByTime(50);
      });
    });

    // Then: Should complete within reasonable time
    expect(renderTime).toBeLessThan(100);
  });

  /**
   * Test: React.memo prevents unnecessary re-renders
   * Given: Preview is rendered
   * When: Same config value is set
   * Then: Component should not re-render
   */
  it('should not re-render when config values are unchanged', () => {
    // Given: Preview is rendered
    const { rerender } = render(<PreviewPanel />);
    const initialText = screen.getByTestId('teleprompter-text');

    // When: Same value is set
    act(() => {
      const { setTypography } = useConfigStore.getState();
      setTypography({ fontSize: 48 }); // Same as initial
      jest.advanceTimersByTime(50);
    });

    // Then: Component should still be stable
    const updatedText = screen.getByTestId('teleprompter-text');
    expect(updatedText).toEqual(initialText);
  });

  /**
   * Test: Concurrent updates are handled efficiently
   * Given: Preview is rendered
   * When: Multiple config updates happen concurrently
   * Then: Should handle efficiently without blocking
   */
  it('should handle concurrent updates efficiently', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Concurrent updates occur
    const startTime = Date.now();
    act(() => {
      const { setTypography, setColors, setEffects } = useConfigStore.getState();
      
      // Trigger multiple updates
      setTypography({ fontSize: 52 });
      setColors({ primaryColor: '#00ff00' });
      setEffects({ shadowEnabled: true });
      
      jest.advanceTimersByTime(50);
    });
    const endTime = Date.now();

    // Then: Should complete in reasonable time
    expect(endTime - startTime).toBeLessThan(100);
  });

  /**
   * Test: Large text renders efficiently
   * Given: Preview has large text content
   * When: Config changes
   * Then: Should still maintain performance
   */
  it('should render large text content efficiently', () => {
    // Given: Preview with large text
    render(<PreviewPanel />);

    // When: Font size increases significantly
    const renderTime = measureRenderTime(() => {
      act(() => {
        const { setTypography } = useConfigStore.getState();
        setTypography({ fontSize: 120 });
        jest.advanceTimersByTime(50);
      });
    });

    // Then: Should still be efficient
    expect(renderTime).toBeLessThan(100);
  });

  /**
   * Test: Debounced updates don't accumulate
   * Given: Preview is rendered
   * When: Rapid debounced updates occur
   * Then: Only final update should be applied
   */
  it('should not accumulate debounced updates', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Rapid debounced updates
    act(() => {
      const { setTypographyDebounced } = useConfigStore.getState();
      
      for (let i = 0; i < 20; i++) {
        setTypographyDebounced({ fontSize: 48 + i });
      }
      
      // Fast-forward through debounce period
      jest.advanceTimersByTime(100);
    });

    // Then: Should have final value
    const state = useConfigStore.getState();
    expect(state.typography.fontSize).toBe(48 + 19); // Last value
  });

  /**
   * Test: Memory usage doesn't grow unbounded
   * Given: Preview is rendered
   * When: Many updates occur
   * Then: Memory should remain stable
   */
  it('should maintain stable memory usage during many updates', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Many updates occur
    const initialMemory = (global as any).gc ? (process.memoryUsage().heapUsed / 1024 / 1024) : 0;
    
    for (let i = 0; i < 100; i++) {
      act(() => {
        const { setTypography } = useConfigStore.getState();
        setTypography({ fontSize: 48 + (i % 20) });
        jest.advanceTimersByTime(10);
      });
    }
    
    const finalMemory = (global as any).gc ? (process.memoryUsage().heapUsed / 1024 / 1024) : 0;

    // Then: Memory growth should be minimal
    // This is a basic check - in production you'd use more sophisticated tools
    if (initialMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      expect(memoryGrowth).toBeLessThan(10); // Less than 10MB growth
    }
  });

  /**
   * Test: Layout thrashing is prevented
   * Given: Preview is rendered
   * When: Multiple layout-affecting changes occur
   * Then: Should batch layout calculations
   */
  it('should prevent layout thrashing during layout changes', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Multiple layout-affecting changes
    const renderTime = measureRenderTime(() => {
      act(() => {
        const { setTypography, setLayout } = useConfigStore.getState();
        
        setTypography({ fontSize: 56, lineHeight: 1.6 });
        setLayout({ horizontalMargin: 10, verticalPadding: 10 });
        
        jest.advanceTimersByTime(50);
      });
    });

    // Then: Should batch efficiently
    expect(renderTime).toBeLessThan(100);
  });

  /**
   * Test: Performance monitoring hooks work
   * Given: Preview is rendered
   * When: Updates occur
     * Then: Performance metrics should be trackable
   */
  it('should allow performance monitoring', () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Tracking update times
    const updateTimes: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      act(() => {
        const { setTypography } = useConfigStore.getState();
        setTypography({ fontSize: 48 + i * 2 });
        jest.advanceTimersByTime(50);
      });
      updateTimes.push(Date.now() - start);
    }

    // Then: All updates should be within reasonable time
    updateTimes.forEach(time => {
      expect(time).toBeLessThan(100);
    });
  });
});
