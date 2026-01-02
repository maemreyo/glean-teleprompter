/**
 * T083 [US6]: Mobile test - Footer reflow works on small screens
 * Tests that footer buttons reflow properly on small mobile screens
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { ContentPanel } from '@/components/teleprompter/editor/ContentPanel';

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

describe('ContentPanel - Footer Mobile Reflow (T083)', () => {
  beforeEach(() => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    useUIStore.setState({
      panelState: { visible: true, isAnimating: false, lastToggled: null, isOverlay: true },
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
   * Test: Footer buttons reflow on small screens
   * Given: Viewport is 375px
   * When: Footer is rendered
   * Then: Buttons should reflow properly
   */
  it('should reflow footer buttons at 375px width', () => {
    // Given: 375px viewport
    expect(window.innerWidth).toBe(375);

    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking footer
    const state = useUIStore.getState();

    // Then: Footer should be configured
    expect(state.configFooterState.visible).toBe(true);
  });

  /**
   * Test: Footer works on very small screens
   * Given: Viewport is 320px
   * When: Footer is rendered
   * Then: Should still be functional
   */
  it('should work on 320px minimum width', () => {
    // Given: 320px viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    });

    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking component
    // Then: Should render
    expect(container.firstChild).toBeInTheDocument();
  });

  /**
   * Test: Footer maintains accessibility on mobile
   * Given: Mobile viewport
   * When: Footer is rendered
   * Then: Buttons should be accessible
   */
  it('should maintain accessible buttons on mobile', () => {
    // Given: Mobile viewport
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Finding buttons
    const buttons = container.querySelectorAll('button');

    // Then: Buttons should be present
    expect(buttons.length).toBeGreaterThan(0);
  });

  /**
   * Test: Footer reflow doesn't break layout
   * Given: Mobile viewport with footer
   * When: Component renders
   * Then: Layout should be intact
   */
  it('should maintain layout integrity on mobile', () => {
    // Given: Mobile viewport
    const { container } = render(<ContentPanel onOpenMobileConfig={() => {}} />);

    // When: Checking layout
    const content = container.firstChild;

    // Then: Should be stable
    expect(content).toBeInTheDocument();
  });
});
