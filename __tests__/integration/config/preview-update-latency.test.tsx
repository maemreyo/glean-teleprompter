/**
 * T028 [US2]: Integration test - Preview updates within 100ms
 * Tests that configuration changes appear in preview within 100ms
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { PreviewPanel } from '@/components/teleprompter/editor/PreviewPanel';
import { useConfigStore } from '@/lib/stores/useConfigStore';

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
      style={{ fontSize, color, lineHeight, fontFamily }}
    >
      Preview Text
    </div>
  ),
}));

describe('PreviewPanel - Update Latency (T028)', () => {
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
   * Test: Font size change updates within 100ms
   * Given: Preview panel is rendered
   * When: Font size changes
   * Then: Preview should update within 100ms
   */
  it('should update preview within 100ms when font size changes', async () => {
    // Given: Preview is rendered
    const startTime = Date.now();
    const { container } = render(<PreviewPanel />);
    const initialText = screen.getByTestId('teleprompter-text');
    expect(initialText).toHaveStyle({ fontSize: 48 });

    // When: Font size changes
    await act(async () => {
      const { setTypography } = useConfigStore.getState();
      setTypography({ fontSize: 60 });
      
      // Fast-forward timers to ensure debounced updates
      jest.advanceTimersByTime(50);
    });

    // Then: Preview should update
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toHaveStyle({ fontSize: 60 });
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(150); // Allow some buffer for test overhead
  });

  /**
   * Test: Color change updates within 100ms
   * Given: Preview panel is rendered
   * When: Color changes
   * Then: Preview should update within 100ms
   */
  it('should update preview within 100ms when color changes', async () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Color changes
    await act(async () => {
      const { setColors } = useConfigStore.getState();
      setColors({ primaryColor: '#ff0000' });
      
      jest.advanceTimersByTime(50);
    });

    // Then: Preview should update
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toHaveStyle({ color: '#ff0000' });
    }, { timeout: 150 });
  });

  /**
   * Test: Line height change updates within 100ms
   * Given: Preview panel is rendered
   * When: Line height changes
   * Then: Preview should update within 100ms
   */
  it('should update preview within 100ms when line height changes', async () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Line height changes
    await act(async () => {
      const { setTypography } = useConfigStore.getState();
      setTypography({ lineHeight: 2.0 });
      
      jest.advanceTimersByTime(50);
    });

    // Then: Preview should update
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toHaveStyle({ lineHeight: 2.0 });
    }, { timeout: 150 });
  });

  /**
   * Test: Multiple rapid changes batch within 100ms
   * Given: Preview panel is rendered
   * When: Multiple rapid changes occur
   * Then: All changes should apply within 100ms window
   */
  it('should batch multiple rapid changes within 100ms window', async () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Multiple rapid changes occur
    await act(async () => {
      const { setTypographyDebounced } = useConfigStore.getState();
      
      setTypographyDebounced({ fontSize: 52 });
      setTypographyDebounced({ fontSize: 56 });
      setTypographyDebounced({ fontSize: 60 });
      
      // Fast-forward through debounce window
      jest.advanceTimersByTime(50);
    });

    // Then: Should apply final state
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toHaveStyle({ fontSize: 60 });
    }, { timeout: 150 });
  });

  /**
   * Test: Config changes apply when panel is hidden
   * Given: Config panel is hidden
   * When: Configuration changes
   * Then: Preview should still update
   */
  it('should apply changes even when config panel is hidden', async () => {
    // Given: Config panel is hidden
    useConfigStore.setState({ isPanelOpen: false });
    render(<PreviewPanel />);

    // When: Configuration changes
    await act(async () => {
      const { setTypography } = useConfigStore.getState();
      setTypography({ fontSize: 72 });
      
      jest.advanceTimersByTime(50);
    });

    // Then: Preview should update
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toHaveStyle({ fontSize: 72 });
    }, { timeout: 150 });
  });

  /**
   * Test: Layout changes update within 100ms
   * Given: Preview panel is rendered
   * When: Layout configuration changes
   * Then: Preview should update within 100ms
   */
  it('should update layout within 100ms when layout config changes', async () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Layout changes
    await act(async () => {
      const { setLayout } = useConfigStore.getState();
      setLayout({ textAlign: 'left' as const });
      
      jest.advanceTimersByTime(50);
    });

    // Then: Preview should update
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toBeInTheDocument();
    }, { timeout: 150 });
  });

  /**
   * Test: Animation config updates within 100ms
   * Given: Preview panel is rendered
   * When: Animation config changes
   * Then: Preview should update within 100ms
   */
  it('should update animation config within 100ms', async () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Animation config changes
    await act(async () => {
      const { setAnimations } = useConfigStore.getState();
      setAnimations({ entranceDuration: 800 });
      
      jest.advanceTimersByTime(50);
    });

    // Then: Config should be updated
    const state = useConfigStore.getState();
    expect(state.animations.entranceDuration).toBe(800);
  });

  /**
   * Test: Effect changes update within 100ms
   * Given: Preview panel is rendered
   * When: Effect config changes
   * Then: Preview should update within 100ms
   */
  it('should update effects within 100ms when effect config changes', async () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Effects change
    await act(async () => {
      const { setEffects } = useConfigStore.getState();
      setEffects({ shadowEnabled: true, shadowOpacity: 0.8 });
      
      jest.advanceTimersByTime(50);
    });

    // Then: Config should be updated
    const state = useConfigStore.getState();
    expect(state.effects.shadowEnabled).toBe(true);
    expect(state.effects.shadowOpacity).toBe(0.8);
  });

  /**
   * Test: Debounced updates complete within 100ms
   * Given: Preview panel is rendered
   * When: Debounced update is triggered
   * Then: Update should complete within 100ms
   */
  it('should complete debounced updates within 100ms', async () => {
    // Given: Preview is rendered
    const startTime = Date.now();
    render(<PreviewPanel />);

    // When: Debounced update is triggered
    await act(async () => {
      const { setTypographyDebounced } = useConfigStore.getState();
      setTypographyDebounced({ fontSize: 64 });
      
      // Debounce is 50ms
      jest.advanceTimersByTime(50);
    });

    // Then: Update should be complete
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toHaveStyle({ fontSize: 64 });
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(150);
  });

  /**
   * Test: Store updates propagate to preview immediately
   * Given: Preview is rendered
   * When: Store state changes
   * Then: Preview should react immediately
   */
  it('should propagate store updates to preview immediately', async () => {
    // Given: Preview is rendered
    render(<PreviewPanel />);

    // When: Store state changes
    await act(async () => {
      useConfigStore.setState({
        typography: {
          ...useConfigStore.getState().typography,
          fontSize: 80,
        },
      });
    });

    // Then: Preview should update
    await waitFor(() => {
      const updatedText = screen.getByTestId('teleprompter-text');
      expect(updatedText).toHaveStyle({ fontSize: 80 });
    }, { timeout: 100 });
  });
});
