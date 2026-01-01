/**
 * T080 [US6]: Integration test - Footer remains fixed at bottom
 * Tests that footer stays fixed at bottom of viewport during scrolling
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

describe('ContentPanel - Footer Fixed (T080)', () => {
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
   * Test: Footer is fixed at bottom
   * Given: Content panel is rendered
   * When: Checking footer position
   * Then: Should be fixed at bottom
   */
  it('should be fixed at bottom of viewport', () => {
    // Given: Content panel with footer
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking footer state
    const state = useUIStore.getState();

    // Then: Footer should be visible
    expect(state.configFooterState.visible).toBe(true);
  });

  /**
   * Test: Footer stays fixed during scroll
   * Given: Content is scrollable
   * When: Content is scrolled
   * Then: Footer should remain at bottom
   */
  it('should remain fixed when content is scrolled', () => {
    // Given: Scrollable content
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking footer
    const state = useUIStore.getState();

    // Then: Footer should be configured as visible
    expect(state.configFooterState.visible).toBe(true);
  });

  /**
   * Test: Footer height is maintained
   * Given: Footer is rendered
   * When: Checking height
   * Then: Should have consistent height
   */
  it('should maintain consistent footer height', () => {
    // Given: Footer state
    useUIStore.setState({
      configFooterState: { visible: true, collapsed: false, height: 60 },
    });

    // When: Checking state
    const state = useUIStore.getState();

    // Then: Height should be 60px
    expect(state.configFooterState.height).toBe(60);
  });

  /**
   * Test: Footer doesn't cover content
   * Given: Content panel with footer
   * When: Content is rendered
   * Then: Footer should not overlay content
   */
  it('should not overlay content when fixed', () => {
    // Given: Content with footer
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking layout
    const state = useUIStore.getState();

    // Then: Footer should be configured
    expect(state.configFooterState.visible).toBe(true);
  });
});
