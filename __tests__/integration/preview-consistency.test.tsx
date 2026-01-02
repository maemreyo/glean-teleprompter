/**
 * Integration Test for Visual Consistency (T013)
 *
 * User Story 1 (MVP): Fix background preview inconsistency between PreviewPanel and FullPreviewDialog
 *
 * This test verifies that both PreviewPanel and FullPreviewDialog display identical background images
 * for the same bgUrl value from useContentStore.
 *
 * IMPORTANT: This test MUST FAIL initially because FullPreviewDialog doesn't yet implement
 * bgUrl subscription, while PreviewPanel already has it implemented.
 *
 * Implementation will be handled in a subsequent task.
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useContentStore } from '@/lib/stores/useContentStore';
import { useConfigStore } from '@/lib/stores/useConfigStore';
import { PreviewPanel } from '@/components/teleprompter/editor/PreviewPanel';
import { FullPreviewDialog } from '@/components/teleprompter/editor/FullPreviewDialog';
import {
  createMockBgUrl,
  expectPreviewConsistency,
  findBackgroundLayer,
  setupTestEnvironment,
  teardownTestEnvironment,
} from '@/__tests__/utils/test-helpers';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock window.matchMedia for useMediaQuery hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Visual Consistency - PreviewPanel and FullPreviewDialog (T013)', () => {
  beforeEach(() => {
    setupTestEnvironment();
    
    // Reset stores to default state
    useContentStore.setState({
      text: 'Test teleprompter content for consistency check',
      bgUrl: '',
      musicUrl: '',
      isReadOnly: false,
    });

    useConfigStore.setState({
      typography: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 48,
        letterSpacing: 0,
        lineHeight: 1.5,
        textTransform: 'none',
      },
      layout: {
        horizontalMargin: 0,
        verticalPadding: 0,
        textAlign: 'center',
        columnCount: 2,
        columnGap: 32,
        textAreaWidth: 100,
        textAreaPosition: 'center',
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
      historyStack: {
        past: [],
        future: [],
        maxSize: 50,
      },
      currentHistoryIndex: -1,
      isUndoing: false,
      isRedoing: false,
      isRecording: false,
    });
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  /**
   * T013: Integration test - Visual consistency between PreviewPanel and FullPreviewDialog
   * 
   * Test that both components display identical background images for the same bgUrl.
   * Compare rendered output between PreviewPanel and FullPreviewDialog.
   * 
   * Expected: FAIL - FullPreviewDialog doesn't implement bgUrl subscription yet
   */
  describe('T013: Background Consistency', () => {
    it('should display identical backgrounds for the same bgUrl', async () => {
      // Given: A bgUrl is set in the content store
      const testBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: testBgUrl });

      // When: Both PreviewPanel and FullPreviewDialog are rendered
      const onOpenChange = jest.fn();

      // Render PreviewPanel
      const { container: previewContainer } = render(
        <PreviewPanel />
      );

      // Render FullPreviewDialog
      const { container: dialogContainer } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Both should have the same background style
      // This will FAIL until FullPreviewDialog implements bgUrl subscription
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();

        if (previewBg && dialogBg) {
          // Use helper to verify consistency
          expectPreviewConsistency(previewBg, dialogBg);
        }
      });
    });

    it('should maintain consistency when bgUrl changes', async () => {
      // Given: Initial bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();

      // Render both components
      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: bgUrl changes
      const newBgUrl = createMockBgUrl('gradient');
      useContentStore.setState({ bgUrl: newBgUrl });

      // Re-render both components
      previewRerender(<PreviewPanel />);
      dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Both should update to the new background
      // This will FAIL until FullPreviewDialog implements bgUrl subscription
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          // Both should have the new background
          expect(previewStyle.backgroundImage).toContain(newBgUrl);
          expect(dialogStyle.backgroundImage).toContain(newBgUrl);
          
          // And they should be identical
          expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
        }
      });
    });

    it('should handle empty bgUrl consistently', async () => {
      // Given: Empty bgUrl
      useContentStore.setState({ bgUrl: '' });

      const onOpenChange = jest.fn();

      // When: Both components are rendered
      const { container: previewContainer } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Both should handle empty bgUrl the same way
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          // Both should have the same background style (empty/none)
          const previewHasBg = previewStyle.backgroundImage && 
                             previewStyle.backgroundImage !== 'none' &&
                             previewStyle.backgroundImage !== 'url()';
          const dialogHasBg = dialogStyle.backgroundImage && 
                             dialogStyle.backgroundImage !== 'none' &&
                             dialogStyle.backgroundImage !== 'url()';

          // Both should either have background or not have it - consistent behavior
          expect(previewHasBg).toBe(dialogHasBg);
        }
      });
    });

    it('should have matching backgroundSize and backgroundPosition', async () => {
      // Given: A valid bgUrl
      const testBgUrl = createMockBgUrl('abstract');
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: Both components are rendered
      const { container: previewContainer } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Both should have the same backgroundSize and backgroundPosition
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          // Both should use 'cover' for backgroundSize
          expect(previewStyle.backgroundSize).toBe('cover');
          expect(dialogStyle.backgroundSize).toBe('cover');

          // Both should use 'center' for backgroundPosition
          expect(previewStyle.backgroundPosition).toBe('center');
          expect(dialogStyle.backgroundPosition).toBe('center');
        }
      });
    });

    it('should maintain opacity consistency', async () => {
      // Given: A valid bgUrl
      const testBgUrl = createMockBgUrl();
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: Both components are rendered
      const { container: previewContainer } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Both should have the same background opacity
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          // Both should have opacity of 0.7
          expect(previewStyle.opacity).toBe('0.7');
          expect(dialogStyle.opacity).toBe('0.7');
        }
      });
    });

    it('should handle multiple bgUrl changes consistently', async () => {
      // Given: Initial state
      const bgUrls = [
        createMockBgUrl('default'),
        createMockBgUrl('nature'),
        createMockBgUrl('gradient'),
        createMockBgUrl('abstract'),
      ];

      const onOpenChange = jest.fn();

      // Render both components
      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Changing bgUrl multiple times
      for (const bgUrl of bgUrls) {
        useContentStore.setState({ bgUrl });
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

        // Then: Both should always have the same background
        await waitFor(() => {
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);

          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);

            // This will FAIL until FullPreviewDialog implements bgUrl subscription
            expect(previewStyle.backgroundImage).toContain(bgUrl);
            expect(dialogStyle.backgroundImage).toContain(bgUrl);
            expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          }
        });
      }
    });

    it('should render background elements with same structure', async () => {
      // Given: A valid bgUrl
      const testBgUrl = createMockBgUrl();
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: Both components are rendered
      const { container: previewContainer } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Both should have background elements with same CSS classes
      await waitFor(() => {
        // Both should have a background layer with bg-cover class
        const previewBg = previewContainer.querySelector('.bg-cover');
        const dialogBg = dialogContainer.querySelector('.bg-cover');

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();

        // Both should have the same base classes
        expect(previewBg?.className).toContain('bg-cover');
        expect(previewBg?.className).toContain('bg-center');
        
        expect(dialogBg?.className).toContain('bg-cover');
        expect(dialogBg?.className).toContain('bg-center');
      });
    });
  });

  /**
   * Additional consistency tests for comprehensive coverage
   */
  describe('Additional Consistency Tests', () => {
    it('should both respond to content store updates', async () => {
      // Given: Initial bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();

      // Render both components
      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Verify initial state
      let previewBg = findBackgroundLayer(previewContainer);
      let dialogBg = findBackgroundLayer(dialogContainer);

      expect(previewBg).toBeInTheDocument();
      expect(dialogBg).toBeInTheDocument();

      // When: Updating bgUrl through content store
      const updatedBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: updatedBgUrl });

      previewRerender(<PreviewPanel />);
      dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Both should update
      await waitFor(() => {
        previewBg = findBackgroundLayer(previewContainer);
        dialogBg = findBackgroundLayer(dialogContainer);

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          // PreviewPanel will have the new URL (already implemented)
          expect(previewStyle.backgroundImage).toContain(updatedBgUrl);
          
          // FullPreviewDialog will NOT have it yet (will FAIL until implemented)
          expect(dialogStyle.backgroundImage).toContain(updatedBgUrl);
        }
      });
    });

    it('should both handle rapid bgUrl changes without breaking', async () => {
      // Given: Multiple rapid bgUrl changes
      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Rapidly changing bgUrl
      for (let i = 0; i < 5; i++) {
        const bgUrl = createMockBgUrl(i % 2 === 0 ? 'nature' : 'abstract');
        useContentStore.setState({ bgUrl });
        
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }

      // Then: Both should still be functional
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();
      });
    });
  });
});

/**
 * ============================================================================
 * User Story 2 Tests: Real-time Preview Updates (T020)
 * ============================================================================
 *
 * These tests verify that both PreviewPanel and FullPreviewDialog update
 * immediately and remain in sync when bgUrl changes, without requiring
 * dialog close/reopen.
 *
 * Expected: PASS - Both components now subscribe to the same store
 */

describe('Real-time Preview Updates - Both Components (T020)', () => {
  beforeEach(() => {
    setupTestEnvironment();
    
    // Reset stores to default state
    useContentStore.setState({
      text: 'Test teleprompter content for real-time updates',
      bgUrl: '',
      musicUrl: '',
      isReadOnly: false,
    });

    useConfigStore.setState({
      typography: {
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 48,
        letterSpacing: 0,
        lineHeight: 1.5,
        textTransform: 'none',
      },
      layout: {
        horizontalMargin: 0,
        verticalPadding: 0,
        textAlign: 'center',
        columnCount: 2,
        columnGap: 32,
        textAreaWidth: 100,
        textAreaPosition: 'center',
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
      historyStack: {
        past: [],
        future: [],
        maxSize: 50,
      },
      currentHistoryIndex: -1,
      isUndoing: false,
      isRedoing: false,
      isRecording: false,
    });
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  /**
   * T020: Integration test - Real-time updates when bgUrl changes
   *
   * Test that both PreviewPanel and FullPreviewDialog update when bgUrl changes
   * and verify updates happen without requiring dialog close/reopen.
   *
   * Expected: PASS - Both components now subscribe to same store
   */
  describe('T020: Real-time Background Updates', () => {
    it('should update both components when bgUrl changes', async () => {
      // Given: Both components are rendered with initial bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Verify initial state
      let previewBg = findBackgroundLayer(previewContainer);
      let dialogBg = findBackgroundLayer(dialogContainer);
      expect(previewBg).toBeInTheDocument();
      expect(dialogBg).toBeInTheDocument();

      // When: bgUrl changes in the store
      const newBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: newBgUrl });

      // Re-render both components
      previewRerender(<PreviewPanel />);
      dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Both should update to new bgUrl
      await waitFor(() => {
        previewBg = findBackgroundLayer(previewContainer);
        dialogBg = findBackgroundLayer(dialogContainer);

        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          expect(previewStyle.backgroundImage).toContain(newBgUrl);
          expect(dialogStyle.backgroundImage).toContain(newBgUrl);
          
          // Both should have identical backgrounds
          expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
        }
      });
    });

    it('should update without requiring dialog close/reopen', async () => {
      // Given: FullPreviewDialog is open with initial bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: bgUrl changes while dialog remains open
      const updatedBgUrl = createMockBgUrl('gradient');
      useContentStore.setState({ bgUrl: updatedBgUrl });

      // Re-render without changing open state (dialog stays open)
      previewRerender(<PreviewPanel />);
      dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Dialog should update without being closed/reopened
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          expect(previewStyle.backgroundImage).toContain(updatedBgUrl);
          expect(dialogStyle.backgroundImage).toContain(updatedBgUrl);
        }

        // Verify dialog was never closed (onOpenChange not called with false)
        expect(onOpenChange).not.toHaveBeenCalledWith(false);
      });
    });

    it('should maintain sync during multiple rapid bgUrl changes', async () => {
      // Given: Both components are rendered
      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Changing bgUrl multiple times rapidly
      const bgUrls = [
        createMockBgUrl('default'),
        createMockBgUrl('abstract'),
        createMockBgUrl('nature'),
        createMockBgUrl('gradient'),
      ];

      for (const bgUrl of bgUrls) {
        useContentStore.setState({ bgUrl });
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

        // After each change, verify both components are in sync
        await waitFor(() => {
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);

          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);

            // Both should show the current bgUrl
            expect(previewStyle.backgroundImage).toContain(bgUrl);
            expect(dialogStyle.backgroundImage).toContain(bgUrl);
            
            // They should be identical
            expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          }
        });
      }

      // Final verification - both should show the last bgUrl
      const finalPreviewBg = findBackgroundLayer(previewContainer);
      const finalDialogBg = findBackgroundLayer(dialogContainer);

      if (finalPreviewBg && finalDialogBg) {
        const finalPreviewStyle = window.getComputedStyle(finalPreviewBg);
        const finalDialogStyle = window.getComputedStyle(finalDialogBg);

        expect(finalPreviewStyle.backgroundImage).toContain(bgUrls[bgUrls.length - 1]);
        expect(finalDialogStyle.backgroundImage).toContain(bgUrls[bgUrls.length - 1]);
        expect(finalPreviewStyle.backgroundImage).toBe(finalDialogStyle.backgroundImage);
      }
    });

    it('should remain in sync when dialog is closed and reopened', async () => {
      // Given: Both components with initial bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Dialog is closed
      dialogRerender(<FullPreviewDialog open={false} onOpenChange={onOpenChange} />);

      // And bgUrl changes while dialog is closed
      const newBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: newBgUrl });

      // Re-render preview (it should update)
      previewRerender(<PreviewPanel />);

      // And dialog is reopened
      dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Both should show the same new bgUrl
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          expect(previewStyle.backgroundImage).toContain(newBgUrl);
          expect(dialogStyle.backgroundImage).toContain(newBgUrl);
          expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
        }
      });
    });

    it('should sync background style properties during updates', async () => {
      // Given: Both components with valid bgUrl
      const bgUrl = createMockBgUrl('abstract');
      useContentStore.setState({ bgUrl });

      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: bgUrl changes
      const newBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: newBgUrl });

      previewRerender(<PreviewPanel />);
      dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: All background style properties should remain in sync
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          // backgroundImage should match
          expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          
          // backgroundSize should both be 'cover'
          expect(previewStyle.backgroundSize).toBe('cover');
          expect(dialogStyle.backgroundSize).toBe('cover');
          
          // backgroundPosition should both be 'center'
          expect(previewStyle.backgroundPosition).toBe('center');
          expect(dialogStyle.backgroundPosition).toBe('center');
          
          // opacity should both be '0.7'
          expect(previewStyle.opacity).toBe('0.7');
          expect(dialogStyle.opacity).toBe('0.7');
        }
      });
    });

    it('should handle empty bgUrl consistently across both components', async () => {
      // Given: Both components with valid bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: bgUrl is cleared
      useContentStore.setState({ bgUrl: '' });

      previewRerender(<PreviewPanel />);
      dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Both should handle empty bgUrl the same way
      await waitFor(() => {
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);

        if (previewBg && dialogBg) {
          const previewStyle = window.getComputedStyle(previewBg);
          const dialogStyle = window.getComputedStyle(dialogBg);

          // Both should have empty/none background
          const previewHasBg = previewStyle.backgroundImage &&
                              previewStyle.backgroundImage !== 'none' &&
                              previewStyle.backgroundImage !== 'url()';
          const dialogHasBg = dialogStyle.backgroundImage &&
                              dialogStyle.backgroundImage !== 'none' &&
                              dialogStyle.backgroundImage !== 'url()';

          // Both should have the same state (both empty or both with bg)
          expect(previewHasBg).toBe(dialogHasBg);
        }
      });
    });

    it('should maintain sync when switching between multiple bgUrls', async () => {
      // Given: Both components are rendered
      const onOpenChange = jest.fn();

      const { container: previewContainer, rerender: previewRerender } = render(
        <PreviewPanel />
      );
      const { container: dialogContainer, rerender: dialogRerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Switching between different bgUrls
      const scenarios = [
        { bgUrl: createMockBgUrl('default'), name: 'default' },
        { bgUrl: createMockBgUrl('nature'), name: 'nature' },
        { bgUrl: '', name: 'empty' },
        { bgUrl: createMockBgUrl('gradient'), name: 'gradient' },
        { bgUrl: createMockBgUrl('abstract'), name: 'abstract' },
      ];

      for (const scenario of scenarios) {
        useContentStore.setState({ bgUrl: scenario.bgUrl });
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

        // Verify sync after each change
        await waitFor(() => {
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);

          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);

            // Backgrounds should match
            expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          }
        });
      }
    });
  });
  
  /**
   * ============================================================================
   * User Story 3 Tests: Template Switching Background Updates (T026)
   * ============================================================================
   *
   * These tests verify that both PreviewPanel and FullPreviewDialog correctly
   * update backgrounds when switching templates, ensuring no artifacts remain.
   *
   * Expected Results:
   * - T026: FAIL - Template switching doesn't trigger proper background updates yet
   */
  
  describe('Template Switching Background Updates (T026)', () => {
    beforeEach(() => {
      setupTestEnvironment();
      
      // Reset stores to default state
      useContentStore.setState({
        text: 'Test teleprompter content for template switching',
        bgUrl: '',
        musicUrl: '',
        isReadOnly: false,
      });
  
      useConfigStore.setState({
        typography: {
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: 48,
          letterSpacing: 0,
          lineHeight: 1.5,
          textTransform: 'none',
        },
        layout: {
          horizontalMargin: 0,
          verticalPadding: 0,
          textAlign: 'center',
          columnCount: 2,
          columnGap: 32,
          textAreaWidth: 100,
          textAreaPosition: 'center',
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
        historyStack: {
          past: [],
          future: [],
          maxSize: 50,
        },
        currentHistoryIndex: -1,
        isUndoing: false,
        isRedoing: false,
        isRecording: false,
      });
    });
  
    afterEach(() => {
      teardownTestEnvironment();
    });
  
    /**
     * T026: Integration test - Template switching background updates
     *
     * Test that both PreviewPanel and FullPreviewDialog update backgrounds
     * correctly when switching templates, and verify no artifacts remain.
     *
     * Expected: FAIL - Template switching doesn't properly update backgrounds yet
     */
    describe('T026: Template Switching Background Updates', () => {
      it('should update backgrounds in both components when switching templates', async () => {
        // Given: Both components rendered with initial template
        const initialBgUrl = createMockBgUrl('template1');
        useContentStore.setState({ bgUrl: initialBgUrl });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // Verify initial state
        let previewBg = findBackgroundLayer(previewContainer);
        let dialogBg = findBackgroundLayer(dialogContainer);
        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();
  
        // When: Switching to a new template (changing bgUrl)
        const newTemplateBgUrl = createMockBgUrl('template2');
        useContentStore.setState({ bgUrl: newTemplateBgUrl });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Both components should update to new background
        await waitFor(() => {
          previewBg = findBackgroundLayer(previewContainer);
          dialogBg = findBackgroundLayer(dialogContainer);
  
          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);
  
            // This will FAIL - backgrounds may not update properly on template switch
            expect(previewStyle.backgroundImage).toContain(newTemplateBgUrl);
            expect(dialogStyle.backgroundImage).toContain(newTemplateBgUrl);
            
            // Both should be in sync
            expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          }
        });
      });
  
      it('should sync both preview components after template change', async () => {
        // Given: Template 1 with background
        const template1Bg = createMockBgUrl('minimal');
        useContentStore.setState({ bgUrl: template1Bg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // When: Switching to Template 2 with different background
        const template2Bg = createMockBgUrl('cinematic');
        useContentStore.setState({ bgUrl: template2Bg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Both should show the new template background
        await waitFor(() => {
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);
  
          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);
  
            // This will FAIL - sync may not work correctly
            expect(previewStyle.backgroundImage).toContain(template2Bg);
            expect(dialogStyle.backgroundImage).toContain(template2Bg);
            expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          }
        });
      });
  
      it('should handle multiple rapid template switches', async () => {
        // Given: Initial template
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // When: Rapidly switching between multiple templates
        const templates = [
          createMockBgUrl('minimal'),
          createMockBgUrl('cinematic'),
          createMockBgUrl('bold'),
          createMockBgUrl('elegant'),
          createMockBgUrl('dramatic'),
        ];
  
        for (const templateBg of templates) {
          useContentStore.setState({ bgUrl: templateBg });
          previewRerender(<PreviewPanel />);
          dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
          // Verify sync after each switch
          await waitFor(() => {
            const previewBg = findBackgroundLayer(previewContainer);
            const dialogBg = findBackgroundLayer(dialogContainer);
  
            if (previewBg && dialogBg) {
              const previewStyle = window.getComputedStyle(previewBg);
              const dialogStyle = window.getComputedStyle(dialogBg);
  
              // This will FAIL - rapid switches may cause sync issues
              expect(previewStyle.backgroundImage).toContain(templateBg);
              expect(dialogStyle.backgroundImage).toContain(templateBg);
              expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
            }
          });
        }
  
        // Final verification - should show last template
        const finalPreviewBg = findBackgroundLayer(previewContainer);
        const finalDialogBg = findBackgroundLayer(dialogContainer);
  
        if (finalPreviewBg && finalDialogBg) {
          const finalPreviewStyle = window.getComputedStyle(finalPreviewBg);
          const finalDialogStyle = window.getComputedStyle(finalDialogBg);
  
          expect(finalPreviewStyle.backgroundImage).toContain(templates[templates.length - 1]);
          expect(finalDialogStyle.backgroundImage).toContain(templates[templates.length - 1]);
          expect(finalPreviewStyle.backgroundImage).toBe(finalDialogStyle.backgroundImage);
        }
      });
  
      it('should not leave background artifacts when switching templates', async () => {
        // Given: Template with background image
        const template1Bg = createMockBgUrl('nature');
        useContentStore.setState({ bgUrl: template1Bg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // Get initial background styles
        const previewBg1 = findBackgroundLayer(previewContainer);
        const dialogBg1 = findBackgroundLayer(dialogContainer);
        
        const initialPreviewStyle = previewBg1 ? window.getComputedStyle(previewBg1).backgroundImage : '';
        const initialDialogStyle = dialogBg1 ? window.getComputedStyle(dialogBg1).backgroundImage : '';
  
        // When: Switching to template with different background
        const template2Bg = createMockBgUrl('abstract');
        useContentStore.setState({ bgUrl: template2Bg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Old background should be completely replaced
        await waitFor(() => {
          const previewBg2 = findBackgroundLayer(previewContainer);
          const dialogBg2 = findBackgroundLayer(dialogContainer);
  
          if (previewBg2 && dialogBg2) {
            const newPreviewStyle = window.getComputedStyle(previewBg2).backgroundImage;
            const newDialogStyle = window.getComputedStyle(dialogBg2).backgroundImage;
  
            // Should have new background
            expect(newPreviewStyle).toContain(template2Bg);
            expect(newDialogStyle).toContain(template2Bg);
  
            // Should NOT have old background (no artifacts)
            expect(newPreviewStyle).not.toContain(initialPreviewStyle);
            expect(newDialogStyle).not.toContain(initialDialogStyle);
          }
        });
      });
  
      it('should handle template switch to empty background', async () => {
        // Given: Template with background
        const templateBg = createMockBgUrl('gradient');
        useContentStore.setState({ bgUrl: templateBg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // Verify initial background
        let previewBg = findBackgroundLayer(previewContainer);
        let dialogBg = findBackgroundLayer(dialogContainer);
        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();
  
        // When: Switching to template with no background
        useContentStore.setState({ bgUrl: '' });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Both should handle empty background correctly
        await waitFor(() => {
          previewBg = findBackgroundLayer(previewContainer);
          dialogBg = findBackgroundLayer(dialogContainer);
  
          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);
  
            // Both should have empty background
            const previewHasBg = previewStyle.backgroundImage &&
                                previewStyle.backgroundImage !== 'none' &&
                                previewStyle.backgroundImage !== 'url()';
            const dialogHasBg = dialogStyle.backgroundImage &&
                                dialogStyle.backgroundImage !== 'none' &&
                                dialogStyle.backgroundImage !== 'url()';
  
            // This will FAIL - may not handle empty background correctly
            expect(previewHasBg).toBe(false);
            expect(dialogHasBg).toBe(false);
          }
        });
      });
  
      it('should maintain sync when switching between template and custom background', async () => {
        // Given: Template background
        const templateBg = createMockBgUrl('template-default');
        useContentStore.setState({ bgUrl: templateBg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // When: Switching to custom background
        const customBg = createMockBgUrl('custom-user-upload');
        useContentStore.setState({ bgUrl: customBg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Both should show custom background
        await waitFor(() => {
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);
  
          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);
  
            expect(previewStyle.backgroundImage).toContain(customBg);
            expect(dialogStyle.backgroundImage).toContain(customBg);
            expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          }
        });
  
        // When: Switching back to template
        const anotherTemplateBg = createMockBgUrl('template-cinematic');
        useContentStore.setState({ bgUrl: anotherTemplateBg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Both should update to new template
        await waitFor(() => {
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);
  
          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);
  
            // This will FAIL - may not switch back correctly
            expect(previewStyle.backgroundImage).toContain(anotherTemplateBg);
            expect(dialogStyle.backgroundImage).toContain(anotherTemplateBg);
            expect(previewStyle.backgroundImage).toBe(dialogStyle.backgroundImage);
          }
        });
      });
  
      it('should handle template switch while dialog is closed', async () => {
        // Given: Dialog is initially open with template background
        const template1Bg = createMockBgUrl('minimal');
        useContentStore.setState({ bgUrl: template1Bg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // Verify initial state
        const previewBg = findBackgroundLayer(previewContainer);
        const dialogBg = findBackgroundLayer(dialogContainer);
        expect(previewBg).toBeInTheDocument();
        expect(dialogBg).toBeInTheDocument();
  
        // When: Dialog is closed
        dialogRerender(<FullPreviewDialog open={false} onOpenChange={onOpenChange} />);
  
        // And template is switched while dialog is closed
        const template2Bg = createMockBgUrl('cinematic');
        useContentStore.setState({ bgUrl: template2Bg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={false} onOpenChange={onOpenChange} />);
  
        // Preview should update
        await waitFor(() => {
          const updatedPreviewBg = findBackgroundLayer(previewContainer);
          if (updatedPreviewBg) {
            const previewStyle = window.getComputedStyle(updatedPreviewBg);
            expect(previewStyle.backgroundImage).toContain(template2Bg);
          }
        });
  
        // When: Dialog is reopened
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Dialog should show the new template background
        await waitFor(() => {
          const reopenedDialogBg = findBackgroundLayer(dialogContainer);
          const currentPreviewBg = findBackgroundLayer(previewContainer);
  
          if (reopenedDialogBg && currentPreviewBg) {
            const dialogStyle = window.getComputedStyle(reopenedDialogBg);
            const previewStyle = window.getComputedStyle(currentPreviewBg);
  
            // This will FAIL - dialog may not update when reopened
            expect(dialogStyle.backgroundImage).toContain(template2Bg);
            expect(dialogStyle.backgroundImage).toBe(previewStyle.backgroundImage);
          }
        });
      });
  
      it('should not flash old background during template switch', async () => {
        // Given: Template with background
        const template1Bg = createMockBgUrl('nature');
        useContentStore.setState({ bgUrl: template1Bg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // When: Switching to new template
        const template2Bg = createMockBgUrl('gradient');
        useContentStore.setState({ bgUrl: template2Bg });
  
        // Then: Should transition smoothly without showing old background
        // This is a visual test - we verify the final state is correct
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        await waitFor(() => {
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);
  
          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);
  
            // Should have new background
            expect(previewStyle.backgroundImage).toContain(template2Bg);
            expect(dialogStyle.backgroundImage).toContain(template2Bg);
  
            // Should NOT have old background (no flash)
            expect(previewStyle.backgroundImage).not.toContain(template1Bg);
            expect(dialogStyle.backgroundImage).not.toContain(template1Bg);
          }
        });
      });
  
      it('should reset any error states when switching templates', async () => {
        // Given: Template with invalid background (error state)
        const invalidBg = 'https://example.com/invalid-image.jpg';
        useContentStore.setState({ bgUrl: invalidBg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // Trigger error (will likely fail since error handling doesn't exist)
        const previewBgElement = findBackgroundLayer(previewContainer);
        const dialogBgElement = findBackgroundLayer(dialogContainer);
  
        if (previewBgElement) {
          const errorEvent = new ErrorEvent('error');
          previewBgElement.dispatchEvent(errorEvent);
        }
  
        if (dialogBgElement) {
          const errorEvent = new ErrorEvent('error');
          dialogBgElement.dispatchEvent(errorEvent);
        }
  
        // When: Switching to valid template
        const validBg = createMockBgUrl('nature');
        useContentStore.setState({ bgUrl: validBg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Error states should be cleared (will FAIL - no error state management)
        await waitFor(() => {
          const errorIndicators = previewContainer.querySelectorAll('[data-testid="error-indicator"]');
          expect(errorIndicators.length).toBe(0);
  
          const dialogErrorIndicators = dialogContainer.querySelectorAll('[data-testid="error-indicator"]');
          expect(dialogErrorIndicators.length).toBe(0);
  
          // Should have valid background
          const newPreviewBg = findBackgroundLayer(previewContainer);
          const newDialogBg = findBackgroundLayer(dialogContainer);
  
          if (newPreviewBg && newDialogBg) {
            const previewStyle = window.getComputedStyle(newPreviewBg);
            const dialogStyle = window.getComputedStyle(newDialogBg);
  
            expect(previewStyle.backgroundImage).toContain(validBg);
            expect(dialogStyle.backgroundImage).toContain(validBg);
          }
        });
      });
  
      it('should handle template switch during loading state', async () => {
        // Given: Template with large image (loading state)
        const largeImageBg = 'https://example.com/large-image-5mb.jpg';
        useContentStore.setState({ bgUrl: largeImageBg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // When: Switching to another template while still loading
        const quickLoadBg = createMockBgUrl('gradient');
        useContentStore.setState({ bgUrl: quickLoadBg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Should handle loading interruption gracefully (will FAIL)
        await waitFor(() => {
          const loadingIndicators = previewContainer.querySelectorAll('[data-testid="loading-indicator"]');
          // Loading state should be cancelled/updated
          expect(loadingIndicators.length).toBe(0);
  
          // Should show new background
          const previewBg = findBackgroundLayer(previewContainer);
          const dialogBg = findBackgroundLayer(dialogContainer);
  
          if (previewBg && dialogBg) {
            const previewStyle = window.getComputedStyle(previewBg);
            const dialogStyle = window.getComputedStyle(dialogBg);
  
            expect(previewStyle.backgroundImage).toContain(quickLoadBg);
            expect(dialogStyle.backgroundImage).toContain(quickLoadBg);
          }
        });
      });
  
      it('should preserve background style properties during template switch', async () => {
        // Given: Template with background
        const template1Bg = createMockBgUrl('minimal');
        useContentStore.setState({ bgUrl: template1Bg });
  
        const onOpenChange = jest.fn();
  
        const { container: previewContainer, rerender: previewRerender } = render(
          <PreviewPanel />
        );
        const { container: dialogContainer, rerender: dialogRerender } = render(
          <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
        );
  
        // Get initial style properties
        const initialPreviewBg = findBackgroundLayer(previewContainer);
        const initialDialogBg = findBackgroundLayer(dialogContainer);
  
        const initialPreviewSize = initialPreviewBg ? window.getComputedStyle(initialPreviewBg).backgroundSize : '';
        const initialPreviewPosition = initialPreviewBg ? window.getComputedStyle(initialPreviewBg).backgroundPosition : '';
        const initialPreviewOpacity = initialPreviewBg ? window.getComputedStyle(initialPreviewBg).opacity : '';
  
        // When: Switching to new template
        const template2Bg = createMockBgUrl('cinematic');
        useContentStore.setState({ bgUrl: template2Bg });
  
        previewRerender(<PreviewPanel />);
        dialogRerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
  
        // Then: Style properties should be preserved
        await waitFor(() => {
          const newPreviewBg = findBackgroundLayer(previewContainer);
          const newDialogBg = findBackgroundLayer(dialogContainer);
  
          if (newPreviewBg && newDialogBg) {
            const newPreviewSize = window.getComputedStyle(newPreviewBg).backgroundSize;
            const newPreviewPosition = window.getComputedStyle(newPreviewBg).backgroundPosition;
            const newPreviewOpacity = window.getComputedStyle(newPreviewBg).opacity;
  
            // Should maintain same style properties
            expect(newPreviewSize).toBe(initialPreviewSize || 'cover');
            expect(newPreviewPosition).toBe(initialPreviewPosition || 'center');
            expect(newPreviewOpacity).toBe(initialPreviewOpacity || '0.7');
          }
        });
      });
    });
  });
});
