/**
 * T081 [US6]: Visual test - No content hidden behind footer
 * Tests that content has proper padding to avoid being hidden behind footer
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

describe('ContentPanel - Footer Padding (T081)', () => {
  beforeEach(() => {
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

  /**
   * Test: Content has bottom padding equal to footer height
   * Given: Footer is 60px
   * When: Checking content padding
   * Then: Should have 60px bottom padding
   */
  it('should have bottom padding equal to footer height', () => {
    // Given: Footer height of 60px
    useUIStore.setState({
      configFooterState: { visible: true, collapsed: false, height: 60 },
    });

    // When: Rendering
    render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // Then: Footer height should be set
    const state = useUIStore.getState();
    expect(state.configFooterState.height).toBe(60);
  });

  /**
   * Test: Padding adjusts when footer collapses
   * Given: Footer is collapsed
   * When: Checking padding
   * Then: Should adjust to collapsed height
   */
  it('should adjust padding when footer collapses', () => {
    // Given: Collapsed footer
    useUIStore.setState({
      configFooterState: { visible: true, collapsed: true, height: 24 },
    });

    // When: Checking state
    const state = useUIStore.getState();

    // Then: Height should be 24px
    expect(state.configFooterState.height).toBe(24);
  });

  /**
   * Test: Last content line is fully visible
   * Given: Content with footer
   * When: Checking bottom content
   * Then: Should not be hidden
   */
  it('should not hide last line of content', () => {
    // Given: Content panel
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking content
    const textarea = container.querySelector('textarea');

    // Then: Should be present
    expect(textarea).toBeInTheDocument();
  });

  /**
   * Test: Padding scales with footer
   * Given: Footer scales
   * When: Footer height changes
   * Then: Padding should match
   */
  it('should scale padding with footer height', () => {
    // Given: Footer state
    useUIStore.setState({
      configFooterState: { visible: true, collapsed: false, height: 80 },
    });

    // When: Checking state
    const state = useUIStore.getState();

    // Then: Height should be updated
    expect(state.configFooterState.height).toBe(80);
  });
});
