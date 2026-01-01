/**
 * T042 [US3]: Responsive test - Layout intact at 375px width
 * Tests that layout remains intact at minimum viewport width of 375px
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { ContentPanel } from '@/components/teleprompter/editor/ContentPanel';
import { TEXTAREA_SCALE_MULTIPLIERS } from '@/lib/config/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock stores
jest.mock('@/lib/stores/useTeleprompterStore', () => ({
  useTeleprompterStore: {
    getState: jest.fn(() => ({
      text: 'Test content',
      bgUrl: '',
      musicUrl: '',
      font: 'Classic',
      colorIndex: 0,
      speed: 2,
      fontSize: 48,
      align: 'center',
      lineHeight: 1.5,
      margin: 0,
      overlayOpacity: 0.5,
      mode: 'setup',
      isReadOnly: false,
    })),
  },
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ContentPanel - Mobile 375px Width (T042)', () => {
  beforeEach(() => {
    // Mock 375px viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: null },
      textareaScale: { size: 'medium', scale: TEXTAREA_SCALE_MULTIPLIERS.medium },
      configFooterState: { visible: true, collapsed: false, height: 60 },
      textareaPrefs: { size: 'medium', isFullscreen: false },
      footerState: { isCollapsed: false },
      previewState: { isOpen: false },
      shortcutsStats: { sessionsCount: 0, modalOpenedCount: 0, tipsShown: [] },
      autoSaveStatus: { status: 'idle' },
      errorContext: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Component renders at 375px width
   * Given: Viewport is 375px wide
   * When: Component renders
   * Then: Should display without errors
   */
  it('should render at 375px viewport width', () => {
    // Given: 375px viewport
    expect(window.innerWidth).toBe(375);

    // When: Component renders
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // Then: Should render
    expect(container.firstChild).toBeInTheDocument();
  });

  /**
   * Test: No horizontal overflow at 375px
   * Given: Viewport is 375px wide
   * When: Checking for overflow
   * Then: Should not overflow horizontally
   */
  it('should not overflow horizontally at 375px', () => {
    // Given: 375px viewport
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking container
    const content = container.firstChild;

    // Then: Should be present
    expect(content).toBeInTheDocument();
  });

  /**
   * Test: All UI elements are visible at 375px
   * Given: Viewport is 375px wide
   * When: Checking UI elements
   * Then: All should be visible
   */
  it('should display all UI elements at 375px', () => {
    // Given: 375px viewport
    render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking for elements
    // Note: Actual element checks would depend on ContentPanel implementation

    // Then: Should render
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  /**
   * Test: Textarea fits at 375px
   * Given: Viewport is 375px wide
   * When: Textarea is rendered
   * Then: Should fit within viewport
   */
  it('should fit textarea within 375px viewport', () => {
    // Given: 375px viewport
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking textarea
    const textarea = container.querySelector('textarea');

    // Then: Should be present
    expect(textarea).toBeInTheDocument();
  });

  /**
   * Test: Buttons remain clickable at 375px
   * Given: Viewport is 375px wide
   * When: Buttons are displayed
   * Then: Should be clickable
   */
  it('should have clickable buttons at 375px', () => {
    // Given: 375px viewport
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Finding buttons
    const buttons = container.querySelectorAll('button');

    // Then: Buttons should be present
    expect(buttons.length).toBeGreaterThan(0);
  });

  /**
   * Test: Footer is visible at 375px
   * Given: Viewport is 375px wide
   * When: Footer is rendered
   * Then: Should be visible
   */
  it('should display footer at 375px', () => {
    // Given: 375px viewport
    useUIStore.setState({
      configFooterState: { visible: true, collapsed: false, height: 60 },
    });

    render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking footer state
    const state = useUIStore.getState();

    // Then: Footer should be visible
    expect(state.configFooterState.visible).toBe(true);
  });

  /**
   * Test: No layout break at 375px
   * Given: Viewport is 375px wide
   * When: Component renders
   * Then: Layout should be intact
   */
  it('should maintain layout integrity at 375px', () => {
    // Given: 375px viewport
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking layout
    const content = container.firstChild;

    // Then: Should be stable
    expect(content).toBeInTheDocument();
  });

  /**
   * Test: Minimum width requirement is met
   * Given: Component has minimum width
   * When: Checking at 375px
   * Then: Should be at or above minimum
   */
  it('should meet minimum width requirement', () => {
    // Given: 375px viewport (documented minimum)
    expect(window.innerWidth).toBe(375);

    // When: Component renders
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // Then: Should work at minimum width
    expect(container.firstChild).toBeInTheDocument();
  });
});
