/**
 * Unit Tests for FullPreviewDialog - Background Preview Consistency (T009-T012)
 * 
 * User Story 1 (MVP): Fix background preview inconsistency between PreviewPanel and FullPreviewDialog
 * 
 * These tests verify that FullPreviewDialog correctly subscribes to and displays bgUrl from useContentStore,
 * matching the behavior of PreviewPanel.
 * 
 * IMPORTANT: These tests MUST FAIL initially because FullPreviewDialog doesn't yet implement:
 * - bgUrl subscription from useContentStore
 * - Background style application
 * 
 * Implementation will be handled in a subsequent task.
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { useContentStore } from '@/lib/stores/useContentStore';
import { FullPreviewDialog } from '@/components/teleprompter/editor/FullPreviewDialog';
import {
  createMockBgUrl,
  expectBackgroundStyle,
  setupTestEnvironment,
  teardownTestEnvironment,
} from '@/__tests__/utils/test-helpers';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Ensure matchMedia is mocked before all tests
beforeAll(() => {
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
});

describe('FullPreviewDialog - Background Preview Consistency (T009-T012)', () => {
  beforeEach(() => {
    setupTestEnvironment();
    
    // Reset content store to default state
    useContentStore.setState({
      text: 'Test teleprompter content',
      bgUrl: '',
      musicUrl: '',
      isReadOnly: false,
    });
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  /**
   * T009: Unit test - bgUrl store subscription
   * 
   * Test that FullPreviewDialog subscribes to bgUrl from useContentStore
   * and updates the background when bgUrl changes.
   * 
   * Expected: FAIL - FullPreviewDialog doesn't subscribe to bgUrl yet
   */
  describe('T009: bgUrl Store Subscription', () => {
    it('should subscribe to bgUrl from useContentStore on mount', () => {
      // Given: A bgUrl is set in the content store
      const testBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: The component should have access to bgUrl
      // This test verifies that bgUrl is being read from the store
      const currentState = useContentStore.getState();
      expect(currentState.bgUrl).toBe(testBgUrl);
      
      // The actual background should be applied (this will FAIL until implementation)
      // We'll check for the background element with the correct style
      const backgroundElement = document.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();
      
      // Verify the background image URL is in the computed style
      // This will FAIL because FullPreviewDialog doesn't apply bgUrl to background yet
      if (backgroundElement) {
        const style = window.getComputedStyle(backgroundElement);
        // The background image should contain our test URL
        // Currently this will fail because background style is not dynamic
        expect(style.backgroundImage).toContain(testBgUrl);
      }
    });

    it('should update background when bgUrl changes in store', async () => {
      // Given: FullPreviewDialog is rendered with initial bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();
      const { rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Verify initial state
      let backgroundElement = document.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      // When: bgUrl is updated in the store
      const newBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: newBgUrl });

      // Re-render to reflect store changes
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Background should update to new bgUrl
      // This will FAIL until bgUrl subscription is implemented
      await waitFor(() => {
        backgroundElement = document.querySelector('.bg-cover');
        if (backgroundElement) {
          const style = window.getComputedStyle(backgroundElement);
          expect(style.backgroundImage).toContain(newBgUrl);
        }
      });
    });
  });

  /**
   * T010: Unit test - Background style application with valid bgUrl
   * 
   * Test that backgroundStyle is applied correctly when bgUrl has a valid URL.
   * Verifies backgroundImage, backgroundSize, and backgroundPosition are set.
   * 
   * Expected: FAIL - FullPreviewDialog doesn't apply dynamic background style yet
   */
  describe('T010: Background Style Application (Valid bgUrl)', () => {
    it('should apply correct background style when bgUrl is valid', () => {
      // Given: A valid bgUrl is set
      const testBgUrl = createMockBgUrl('gradient');
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Background should have correct style properties
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        // Use helper function to verify background style
        // This will FAIL until background style is applied dynamically
        expectBackgroundStyle(backgroundElement as HTMLElement, testBgUrl);
      }
    });

    it('should set backgroundImage to the bgUrl value', () => {
      // Given: Valid bgUrl
      const testBgUrl = createMockBgUrl('abstract');
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: backgroundImage should contain the URL
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        const style = window.getComputedStyle(backgroundElement);
        // This will FAIL - background is currently hardcoded/empty
        expect(style.backgroundImage).toContain(testBgUrl);
        expect(style.backgroundImage).toMatch(/^url\(/);
      }
    });

    it('should set backgroundSize to cover', () => {
      // Given: Valid bgUrl
      const testBgUrl = createMockBgUrl();
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: backgroundSize should be 'cover'
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        const style = window.getComputedStyle(backgroundElement);
        expect(style.backgroundSize).toBe('cover');
      }
    });

    it('should set backgroundPosition to center', () => {
      // Given: Valid bgUrl
      const testBgUrl = createMockBgUrl();
      useContentStore.setState({ bgUrl: testBgUrl });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: backgroundPosition should be 'center'
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        const style = window.getComputedStyle(backgroundElement);
        expect(style.backgroundPosition).toBe('center');
      }
    });
  });

  /**
   * T011: Unit test - Empty bgUrl handling
   * 
   * Test behavior when bgUrl is an empty string.
   * Verify no errors and graceful handling.
   * 
   * Expected: FAIL - FullPreviewDialog doesn't handle empty bgUrl gracefully yet
   */
  describe('T011: Empty bgUrl Handling', () => {
    it('should handle empty bgUrl without errors', () => {
      // Given: bgUrl is an empty string
      useContentStore.setState({ bgUrl: '' });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      // Then: Should not throw any errors
      expect(() => {
        render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }).not.toThrow();
    });

    it('should render with empty bgUrl without crashing', () => {
      // Given: Empty bgUrl
      useContentStore.setState({ bgUrl: '' });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Component should render successfully
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should have no background image when bgUrl is empty', () => {
      // Given: Empty bgUrl
      useContentStore.setState({ bgUrl: '' });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Background should be empty or have default styling
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        const style = window.getComputedStyle(backgroundElement);
        // Either no background image or empty url()
        const hasNoBackground = !style.backgroundImage || 
                               style.backgroundImage === 'none' ||
                               style.backgroundImage === 'url()';
        expect(hasNoBackground).toBe(true);
      }
    });

    it('should maintain opacity when bgUrl is empty', () => {
      // Given: Empty bgUrl
      useContentStore.setState({ bgUrl: '' });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Background element should still exist with proper opacity
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        const style = window.getComputedStyle(backgroundElement);
        // Opacity should still be set (currently hardcoded to 0.7)
        expect(style.opacity).toBe('0.7');
      }
    });
  });

  /**
   * T012: Unit test - Null/Undefined bgUrl handling
   * 
   * Test behavior when bgUrl is null or undefined.
   * Verify proper fallback behavior.
   * 
   * Expected: FAIL - FullPreviewDialog doesn't handle null/undefined bgUrl yet
   */
  describe('T012: Null/Undefined bgUrl Handling', () => {
    it('should handle null bgUrl gracefully', () => {
      // Given: bgUrl is null
      useContentStore.setState({ bgUrl: null as any });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      // Then: Should not throw errors
      expect(() => {
        render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }).not.toThrow();
    });

    it('should handle undefined bgUrl gracefully', () => {
      // Given: bgUrl is undefined
      useContentStore.setState({ bgUrl: undefined as any });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      // Then: Should not throw errors
      expect(() => {
        render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }).not.toThrow();
    });

    it('should fallback to default background when bgUrl is null', () => {
      // Given: null bgUrl
      useContentStore.setState({ bgUrl: null as any });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Should render with fallback behavior
      expect(container.firstChild).toBeInTheDocument();
      
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();
    });

    it('should fallback to default background when bgUrl is undefined', () => {
      // Given: undefined bgUrl
      useContentStore.setState({ bgUrl: undefined as any });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Should render with fallback behavior
      expect(container.firstChild).toBeInTheDocument();
      
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();
    });

    it('should not crash when switching from valid bgUrl to null', async () => {
      // Given: Valid initial bgUrl
      const initialBgUrl = createMockBgUrl();
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();
      const { rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: bgUrl changes to null
      useContentStore.setState({ bgUrl: null as any });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Should handle gracefully without errors
      await waitFor(() => {
        const backgroundElement = document.querySelector('.bg-cover');
        expect(backgroundElement).toBeInTheDocument();
      });
    });

    it('should not crash when switching from valid bgUrl to undefined', async () => {
      // Given: Valid initial bgUrl
      const initialBgUrl = createMockBgUrl();
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();
      const { rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: bgUrl changes to undefined
      useContentStore.setState({ bgUrl: undefined as any });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Should handle gracefully without errors
      await waitFor(() => {
        const backgroundElement = document.querySelector('.bg-cover');
        expect(backgroundElement).toBeInTheDocument();
      });
    });
  });

  /**
   * Additional edge case tests for robustness
   */
  describe('Edge Cases', () => {
    it('should handle very long bgUrl', () => {
      // Given: Extremely long bgUrl
      const longBgUrl = 'https://example.com/' + 'a'.repeat(2000) + '.jpg';
      useContentStore.setState({ bgUrl: longBgUrl });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      // Then: Should not crash
      expect(() => {
        render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }).not.toThrow();
    });

    it('should handle bgUrl with special characters', () => {
      // Given: bgUrl with special characters
      const specialBgUrl = 'https://example.com/image-with-special-chars-?-test-=-value.jpg';
      useContentStore.setState({ bgUrl: specialBgUrl });

      const onOpenChange = jest.fn();

      // When: Rendering dialog
      // Then: Should handle without errors
      expect(() => {
        render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }).not.toThrow();
    });

    it('should handle rapid bgUrl changes', async () => {
      // Given: Initial bgUrl
      const bgUrl1 = createMockBgUrl('abstract');
      const bgUrl2 = createMockBgUrl('nature');
      const bgUrl3 = createMockBgUrl('gradient');
      
      useContentStore.setState({ bgUrl: bgUrl1 });

      const onOpenChange = jest.fn();
      const { rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Rapidly changing bgUrl
      useContentStore.setState({ bgUrl: bgUrl2 });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      
      useContentStore.setState({ bgUrl: bgUrl3 });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Should handle without errors
      await waitFor(() => {
        const backgroundElement = document.querySelector('.bg-cover');
        expect(backgroundElement).toBeInTheDocument();
      });
    });
  });
});

/**
 * ============================================================================
 * User Story 2 Tests: Real-time Preview Updates (T019-T021)
 * ============================================================================
 *
 * These tests verify that FullPreviewDialog responds immediately to bgUrl changes
 * in the store, meeting the 100ms update latency requirement.
 *
 * Expected Results:
 * - T019: PASS - User Story 1 already implemented Zustand reactivity
 * - T020: PASS - Both components now subscribe to same store
 * - T021: PASS - useMemo with bgUrl dependency is efficient
 */

describe('FullPreviewDialog - Real-time Preview Updates (T019)', () => {
  beforeEach(() => {
    setupTestEnvironment();
    
    // Reset content store to default state
    useContentStore.setState({
      text: 'Test teleprompter content',
      bgUrl: '',
      musicUrl: '',
      isReadOnly: false,
    });
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  /**
   * T019: Unit test - bgUrl reactivity
   *
   * Test that FullPreviewDialog re-renders when bgUrl changes in the store
   * and responds to store updates immediately.
   *
   * Expected: PASS - Zustand reactivity is already implemented
   */
  describe('T019: bgUrl Reactivity', () => {
    it('should re-render when bgUrl changes in useContentStore', async () => {
      // Given: FullPreviewDialog is rendered with initial bgUrl
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Verify initial background
      let backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      // When: bgUrl is updated in the store
      const newBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: newBgUrl });

      // Trigger re-render
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Background should update immediately (reactive to store changes)
      await waitFor(() => {
        backgroundElement = container.querySelector('.bg-cover');
        expect(backgroundElement).toBeInTheDocument();
        
        if (backgroundElement) {
          const style = window.getComputedStyle(backgroundElement);
          expect(style.backgroundImage).toContain(newBgUrl);
        }
      });
    });

    it('should respond to store updates immediately without manual refresh', async () => {
      // Given: FullPreviewDialog is open
      const bgUrl1 = createMockBgUrl('abstract');
      useContentStore.setState({ bgUrl: bgUrl1 });

      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Store updates multiple times
      const bgUrl2 = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: bgUrl2 });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      const bgUrl3 = createMockBgUrl('gradient');
      useContentStore.setState({ bgUrl: bgUrl3 });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Should reflect latest store state immediately
      await waitFor(() => {
        const backgroundElement = container.querySelector('.bg-cover');
        expect(backgroundElement).toBeInTheDocument();
        
        if (backgroundElement) {
          const style = window.getComputedStyle(backgroundElement);
          // Should show the most recent bgUrl
          expect(style.backgroundImage).toContain(bgUrl3);
        }
      });
    });

    it('should handle multiple rapid bgUrl changes', async () => {
      // Given: FullPreviewDialog is rendered
      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Rapidly changing bgUrl multiple times
      const bgUrls = [
        createMockBgUrl('default'),
        createMockBgUrl('abstract'),
        createMockBgUrl('nature'),
        createMockBgUrl('gradient'),
        createMockBgUrl('abstract'),
      ];

      for (const bgUrl of bgUrls) {
        useContentStore.setState({ bgUrl });
        rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }

      // Then: Should handle all changes without errors
      await waitFor(() => {
        const backgroundElement = container.querySelector('.bg-cover');
        expect(backgroundElement).toBeInTheDocument();
        
        if (backgroundElement) {
          const style = window.getComputedStyle(backgroundElement);
          // Should show the last bgUrl
          expect(style.backgroundImage).toContain(bgUrls[bgUrls.length - 1]);
        }
      });
    });

    it('should maintain reactivity after dialog close and reopen', async () => {
      // Given: Dialog is initially open with bgUrl1
      const bgUrl1 = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: bgUrl1 });

      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Verify initial state
      let backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      // When: Dialog is closed
      rerender(<FullPreviewDialog open={false} onOpenChange={onOpenChange} />);

      // And bgUrl changes while dialog is closed
      const bgUrl2 = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: bgUrl2 });

      // And dialog is reopened
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Should show updated bgUrl immediately
      await waitFor(() => {
        backgroundElement = container.querySelector('.bg-cover');
        expect(backgroundElement).toBeInTheDocument();
        
        if (backgroundElement) {
          const style = window.getComputedStyle(backgroundElement);
          expect(style.backgroundImage).toContain(bgUrl2);
        }
      });
    });

    it('should update backgroundStyle memo when bgUrl dependency changes', async () => {
      // Given: FullPreviewDialog is rendered
      const initialBgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl: initialBgUrl });

      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Get initial background style
      const bgElement1 = container.querySelector('.bg-cover');
      const initialStyle = bgElement1 ? window.getComputedStyle(bgElement1).backgroundImage : '';

      // When: bgUrl changes (useMemo dependency)
      const newBgUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: newBgUrl });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: backgroundStyle should be recalculated (useMemo with bgUrl dependency)
      await waitFor(() => {
        const bgElement2 = container.querySelector('.bg-cover');
        expect(bgElement2).toBeInTheDocument();
        
        if (bgElement2) {
          const newStyle = window.getComputedStyle(bgElement2).backgroundImage;
          expect(newStyle).not.toBe(initialStyle);
          expect(newStyle).toContain(newBgUrl);
        }
      });
    });

    it('should not re-render unnecessarily when other state changes', async () => {
      // Given: FullPreviewDialog is rendered
      const bgUrl = createMockBgUrl('default');
      useContentStore.setState({ bgUrl });

      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Get initial background style
      const bgElement1 = container.querySelector('.bg-cover');
      const initialStyle = bgElement1 ? window.getComputedStyle(bgElement1).backgroundImage : '';

      // When: Other content store properties change (not bgUrl)
      useContentStore.setState({ text: 'Updated text' });
      useContentStore.setState({ musicUrl: 'https://example.com/music.mp3' });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Background style should remain the same (useMemo optimization)
      const bgElement2 = container.querySelector('.bg-cover');
      expect(bgElement2).toBeInTheDocument();
      
      if (bgElement2) {
        const newStyle = window.getComputedStyle(bgElement2).backgroundImage;
        // Background should not change when bgUrl doesn't change
        expect(newStyle).toBe(initialStyle);
      }
    });

    it('should handle concurrent bgUrl updates from multiple sources', async () => {
      // Given: Multiple components might update bgUrl
      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Simulating concurrent updates
      const updates = [
        createMockBgUrl('abstract'),
        createMockBgUrl('nature'),
        createMockBgUrl('gradient'),
      ];

      // Simulate rapid concurrent updates
      updates.forEach((bgUrl, index) => {
        setTimeout(() => {
          useContentStore.setState({ bgUrl });
          rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
        }, index * 10);
      });

      // Then: Should settle on final state
      await waitFor(
        () => {
          const backgroundElement = container.querySelector('.bg-cover');
          expect(backgroundElement).toBeInTheDocument();
          
          if (backgroundElement) {
            const style = window.getComputedStyle(backgroundElement);
            expect(style.backgroundImage).toContain(updates[updates.length - 1]);
          }
        },
        { timeout: 200 }
      );
    });
  });
});

/**
 * ============================================================================
 * User Story 3 Tests: Edge Case Error Handling (T024-T026)
 * ============================================================================
 *
 * These tests verify robust error handling for edge cases:
 * - T024: Invalid background URL handling (404, CORS, malformed URLs)
 * - T025: Large image loading state (5MB+, loading indicators, timeouts)
 * - T026: Template switching background updates (integration test)
 *
 * Expected Results:
 * - T024: FAIL - FullPreviewDialog doesn't have error handling state (hasError, handleMediaError)
 * - T025: FAIL - FullPreviewDialog doesn't have loading state (isLoading, handleMediaLoad)
 * - T026: FAIL - Template switching doesn't trigger background updates yet
 */

describe('FullPreviewDialog - Edge Case Error Handling (T024-T026)', () => {
  beforeEach(() => {
    setupTestEnvironment();
    
    // Reset content store to default state
    useContentStore.setState({
      text: 'Test teleprompter content',
      bgUrl: '',
      musicUrl: '',
      isReadOnly: false,
    });
  });

  afterEach(() => {
    teardownTestEnvironment();
  });

  /**
   * T024: Unit test - Invalid background URL handling
   *
   * Test handling of various error scenarios:
   * - 404 errors (image not found)
   * - CORS errors (cross-origin blocked)
   * - Malformed URLs
   *
   * Expected: FAIL - FullPreviewDialog doesn't have:
   * - hasError state
   * - errorMessage state
   * - handleMediaError callback
   * - onError handler on background div
   * - Error indicator UI
   */
  describe('T024: Invalid URL Handling', () => {
    it('should handle 404 errors (image not found) gracefully', () => {
      // Given: A bgUrl that will return 404
      const notFoundUrl = 'https://example.com/images/not-found.jpg';
      useContentStore.setState({ bgUrl: notFoundUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Should not crash
      expect(container.firstChild).toBeInTheDocument();

      // This will FAIL - FullPreviewDialog doesn't have error state
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      // This will FAIL - No onError handler exists
      if (backgroundElement) {
        expect(backgroundElement).toHaveAttribute('onError');
      }
    });

    it('should set hasError state when image fails to load', async () => {
      // Given: A bgUrl that will fail to load
      const invalidUrl = 'https://invalid-domain-404.com/image.jpg';
      useContentStore.setState({ bgUrl: invalidUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Simulate image load error by triggering error event
      const backgroundElement = container.querySelector('.bg-cover');
      
      if (backgroundElement) {
        // This will FAIL - No onError handler exists
        const errorEvent = new ErrorEvent('error');
        backgroundElement.dispatchEvent(errorEvent);
      }

      // Then: Error state should be set (will FAIL - no hasError state)
      await waitFor(() => {
        // This will FAIL - hasError state doesn't exist
        const errorIndicator = container.querySelector('[data-testid="error-indicator"]');
        expect(errorIndicator).toBeInTheDocument();
      });
    });

    it('should handle CORS errors (cross-origin blocked)', () => {
      // Given: A bgUrl that will trigger CORS error
      const corsUrl = 'https://restricted-domain.com/image.jpg';
      useContentStore.setState({ bgUrl: corsUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      // Then: Should not crash and should handle gracefully
      expect(() => {
        render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      }).not.toThrow();
    });

    it('should handle malformed URLs', () => {
      // Given: Various malformed URLs
      const malformedUrls = [
        'not-a-url',
        'htp://missing-protocol.com',
        'https://',
        'https://.com',
        'javascript:alert(1)',
      ];

      const onOpenChange = jest.fn();

      malformedUrls.forEach(malformedUrl => {
        useContentStore.setState({ bgUrl: malformedUrl });

        // When: Rendering with malformed URL
        // Then: Should not crash
        expect(() => {
          render(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
        }).not.toThrow();
      });
    });

    it('should display error message when background fails to load', async () => {
      // Given: An invalid bgUrl
      const invalidUrl = 'https://example.com/404-image.jpg';
      useContentStore.setState({ bgUrl: invalidUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Trigger error event
      const backgroundElement = container.querySelector('.bg-cover');
      if (backgroundElement) {
        const errorEvent = new ErrorEvent('error');
        backgroundElement.dispatchEvent(errorEvent);
      }

      // Then: Error message should be displayed (will FAIL)
      await waitFor(() => {
        // This will FAIL - No error UI exists
        const errorMessage = container.querySelector('[data-testid="error-message"]');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage?.textContent).toContain('failed to load');
      });
    });

    it('should have error indicator icon when error occurs', async () => {
      // Given: A bgUrl that will fail
      const invalidUrl = 'https://example.com/missing-image.jpg';
      useContentStore.setState({ bgUrl: invalidUrl });

      const onOpenChange = jest.fn();

      // When: Rendering and error occurs
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      const backgroundElement = container.querySelector('.bg-cover');
      if (backgroundElement) {
        const errorEvent = new ErrorEvent('error');
        backgroundElement.dispatchEvent(errorEvent);
      }

      // Then: Error indicator should be visible (will FAIL)
      await waitFor(() => {
        // This will FAIL - No error indicator UI exists
        const errorIcon = container.querySelector('[data-testid="error-icon"]');
        expect(errorIcon).toBeInTheDocument();
      });
    });

    it('should recover from error when valid URL is provided', async () => {
      // Given: Initial invalid URL causing error
      const invalidUrl = 'https://example.com/404.jpg';
      useContentStore.setState({ bgUrl: invalidUrl });

      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Trigger initial error
      const bgElement1 = container.querySelector('.bg-cover');
      if (bgElement1) {
        const errorEvent = new ErrorEvent('error');
        bgElement1.dispatchEvent(errorEvent);
      }

      // Wait for error state (will FAIL)
      await waitFor(() => {
        const errorIndicator = container.querySelector('[data-testid="error-indicator"]');
        expect(errorIndicator).toBeInTheDocument();
      });

      // When: Valid URL is provided
      const validUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: validUrl });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Error should be cleared (will FAIL)
      await waitFor(() => {
        const errorIndicator = container.querySelector('[data-testid="error-indicator"]');
        expect(errorIndicator).not.toBeInTheDocument();
      });
    });

    it('should not crash on rapid error events', async () => {
      // Given: A bgUrl that will fail
      const invalidUrl = 'https://example.com/error.jpg';
      useContentStore.setState({ bgUrl: invalidUrl });

      const onOpenChange = jest.fn();
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      const backgroundElement = container.querySelector('.bg-cover');

      // When: Rapidly triggering error events
      if (backgroundElement) {
        for (let i = 0; i < 10; i++) {
          const errorEvent = new ErrorEvent('error');
          backgroundElement.dispatchEvent(errorEvent);
        }
      }

      // Then: Should handle without crashing
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  /**
   * T025: Unit test - Large image loading state
   *
   * Test loading indicator display for large images (5MB+):
   * - Loading indicator display
   * - Loading state transitions (loading → loaded → error)
   * - Timeout scenarios
   * - Performance degradation prevention
   *
   * Expected: FAIL - FullPreviewDialog doesn't have:
   * - isLoading state
   * - handleMediaLoad callback
   * - onLoad handler on background div
   * - Loading indicator UI
   */
  describe('T025: Large Image Loading State', () => {
    it('should show loading indicator when large image starts loading', async () => {
      // Given: A bgUrl for a large image (5MB+)
      const largeImageUrl = 'https://example.com/large-image-5mb.jpg';
      useContentStore.setState({ bgUrl: largeImageUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Loading indicator should be shown (will FAIL)
      await waitFor(() => {
        // This will FAIL - No loading state exists
        const loadingIndicator = container.querySelector('[data-testid="loading-indicator"]');
        expect(loadingIndicator).toBeInTheDocument();
      });
    });

    it('should have isLoading state during image load', async () => {
      // Given: A bgUrl for a large image
      const largeImageUrl = 'https://example.com/heavy-image.jpg';
      useContentStore.setState({ bgUrl: largeImageUrl });

      const onOpenChange = jest.fn();

      // When: FullPreviewDialog is rendered
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Should be in loading state (will FAIL)
      // This will FAIL - No isLoading state exists
      const backgroundElement = container.querySelector('.bg-cover');
      expect(backgroundElement).toBeInTheDocument();

      if (backgroundElement) {
        // This will FAIL - No onLoad handler exists
        expect(backgroundElement).toHaveAttribute('onLoad');
      }
    });

    it('should transition from loading to loaded state', async () => {
      // Given: A bgUrl
      const imageUrl = createMockBgUrl('nature');
      useContentStore.setState({ bgUrl: imageUrl });

      const onOpenChange = jest.fn();
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Initially should show loading (will FAIL)
      const loadingIndicator = container.querySelector('[data-testid="loading-indicator"]');
      expect(loadingIndicator).toBeInTheDocument();

      // When: Image finishes loading
      const backgroundElement = container.querySelector('.bg-cover');
      if (backgroundElement) {
        const loadEvent = new Event('load');
        backgroundElement.dispatchEvent(loadEvent);
      }

      // Then: Should hide loading indicator (will FAIL)
      await waitFor(() => {
        const loadingIndicatorAfter = container.querySelector('[data-testid="loading-indicator"]');
        expect(loadingIndicatorAfter).not.toBeInTheDocument();
      });
    });

    it('should transition from loading to error state on failure', async () => {
      // Given: A bgUrl that will fail
      const invalidUrl = 'https://example.com/404-image.jpg';
      useContentStore.setState({ bgUrl: invalidUrl });

      const onOpenChange = jest.fn();
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Initially should show loading (will FAIL)
      const loadingIndicator = container.querySelector('[data-testid="loading-indicator"]');
      expect(loadingIndicator).toBeInTheDocument();

      // When: Image fails to load
      const backgroundElement = container.querySelector('.bg-cover');
      if (backgroundElement) {
        const errorEvent = new ErrorEvent('error');
        backgroundElement.dispatchEvent(errorEvent);
      }

      // Then: Should show error instead of loading (will FAIL)
      await waitFor(() => {
        const loadingIndicatorAfter = container.querySelector('[data-testid="loading-indicator"]');
        expect(loadingIndicatorAfter).not.toBeInTheDocument();

        const errorIndicator = container.querySelector('[data-testid="error-indicator"]');
        expect(errorIndicator).toBeInTheDocument();
      });
    });

    it('should handle loading timeout for very slow images', async () => {
      // Given: A bgUrl for a very slow loading image
      const slowImageUrl = 'https://example.com/very-slow-image.jpg';
      useContentStore.setState({ bgUrl: slowImageUrl });

      const onOpenChange = jest.fn();
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Loading takes too long (simulating timeout)
      // This will FAIL - No timeout handling exists
      await waitFor(
        () => {
          const loadingIndicator = container.querySelector('[data-testid="loading-indicator"]');
          expect(loadingIndicator).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should display loading spinner icon', async () => {
      // Given: A bgUrl for a large image
      const largeImageUrl = 'https://example.com/large-file.jpg';
      useContentStore.setState({ bgUrl: largeImageUrl });

      const onOpenChange = jest.fn();

      // When: Rendering
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Loading spinner should be visible (will FAIL)
      await waitFor(() => {
        // This will FAIL - No loading spinner UI exists
        const loadingSpinner = container.querySelector('[data-testid="loading-spinner"]');
        expect(loadingSpinner).toBeInTheDocument();
      });
    });

    it('should not degrade performance with multiple loading states', async () => {
      // Given: Rapid bgUrl changes causing multiple loading states
      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Changing bgUrl rapidly
      const bgUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
        'https://example.com/image4.jpg',
        'https://example.com/image5.jpg',
      ];

      const startTime = performance.now();

      bgUrls.forEach(bgUrl => {
        useContentStore.setState({ bgUrl });
        rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Then: Performance should not degrade (will FAIL if no loading state management)
      expect(renderTime).toBeLessThan(1000); // Should complete in less than 1 second

      // This will FAIL - No loading indicators to check
      const loadingIndicators = container.querySelectorAll('[data-testid="loading-indicator"]');
      expect(loadingIndicators.length).toBeGreaterThan(0);
    });

    it('should reset loading state when component unmounts', () => {
      // Given: A bgUrl causing loading state
      const largeImageUrl = 'https://example.com/large.jpg';
      useContentStore.setState({ bgUrl: largeImageUrl });

      const onOpenChange = jest.fn();
      const { container, unmount } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Component unmounts
      expect(() => {
        unmount();
      }).not.toThrow();

      // Then: Should clean up properly without errors
      expect(container.firstChild).not.toBeInTheDocument();
    });

    it('should show appropriate loading message', async () => {
      // Given: A large image URL
      const largeImageUrl = 'https://example.com/5mb-image.jpg';
      useContentStore.setState({ bgUrl: largeImageUrl });

      const onOpenChange = jest.fn();

      // When: Rendering
      const { container } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // Then: Should show loading message (will FAIL)
      await waitFor(() => {
        // This will FAIL - No loading message UI exists
        const loadingMessage = container.querySelector('[data-testid="loading-message"]');
        expect(loadingMessage).toBeInTheDocument();
        expect(loadingMessage?.textContent).toContain('loading');
      });
    });

    it('should handle concurrent loading and error states', async () => {
      // Given: Multiple rapid bgUrl changes
      const onOpenChange = jest.fn();
      const { container, rerender } = render(
        <FullPreviewDialog open={true} onOpenChange={onOpenChange} />
      );

      // When: Rapidly switching between valid and invalid URLs
      useContentStore.setState({ bgUrl: 'https://example.com/image1.jpg' });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      useContentStore.setState({ bgUrl: 'https://example.com/invalid.jpg' });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      useContentStore.setState({ bgUrl: createMockBgUrl('nature') });
      rerender(<FullPreviewDialog open={true} onOpenChange={onOpenChange} />);

      // Then: Should handle state transitions correctly (will FAIL)
      await waitFor(() => {
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });
});
