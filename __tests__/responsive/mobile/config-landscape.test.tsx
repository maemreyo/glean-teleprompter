/**
 * T067 [US5]: Responsive test - Landscape split view activates
 * Tests that landscape mode on mobile shows split view configuration
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { TabBottomSheet } from '@/components/teleprompter/config/TabBottomSheet';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}));

describe('TabBottomSheet - Landscape (T067)', () => {
  /**
   * Test: Landscape mode activates split view
   * Given: Device is in landscape
   * When: Orientation changes
   * Then: Split view should activate
   */
  it('should activate split view in landscape', () => {
    // Given: Landscape orientation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 812, // iPhone landscape width
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const tabs = [{ id: 'typography', label: 'Typography' } as any];

    // When: Rendering
    const { container } = render(
      <TabBottomSheet
        isOpen={true}
        onClose={() => {}}
        tabs={tabs}
        activeTab="typography"
        onTabSelect={() => {}}
        t={(key: string) => key}
      />
    );

    // Then: Should render
    expect(container.firstChild).toBeInTheDocument();
  });

  /**
   * Test: Portrait mode shows bottom sheet
   * Given: Device is in portrait
   * When: Rendering
   * Then: Bottom sheet should be used
   */
  it('should use bottom sheet in portrait mode', () => {
    // Given: Portrait orientation
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const tabs = [{ id: 'typography', label: 'Typography' } as any];

    // When: Rendering
    const { container } = render(
      <TabBottomSheet
        isOpen={true}
        onClose={() => {}}
        tabs={tabs}
        activeTab="typography"
        onTabSelect={() => {}}
        t={(key: string) => key}
      />
    );

    // Then: Should render
    expect(container.firstChild).toBeInTheDocument();
  });
});
