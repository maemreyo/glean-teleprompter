/**
 * Mode Switching Tests for Studio Page
 * Tests Editor/Runner component rendering based on mode and AnimatePresence transitions
 * User Story 5: User switches between setup and run modes → system displays correct component with smooth transition
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../../utils/studio-page-mocks';
import {
  mockUseTeleprompterStore,
  setMockTeleprompterStore as setHookMockStore
} from '../../mocks/hooks/use-teleprompter-store.mock';
import StudioPage from '@/app/studio/page';
import { MockTeleprompterStore } from '../../types/test-mocks';
import '@testing-library/jest-dom';

/**
 * Helper to get the current hook mock store
 */
function getMockStore(): MockTeleprompterStore {
  return mockUseTeleprompterStore();
}

// Mock the AppProvider to avoid next-intl ESM issues
jest.mock('@/components/AppProvider', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-provider">{children}</div>
  )
}));

// Mock the Toaster
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    promise: jest.fn()
  },
  Toaster: () => <div data-testid="toaster" data-sonner-toaster>Toaster</div>
}));

// Mock the Editor component
jest.mock('@/components/teleprompter/Editor', () => ({
  Editor: () => <div data-testid="editor-component">Editor Component</div>
}));

// Mock the Runner component
jest.mock('@/components/teleprompter/Runner', () => ({
  Runner: () => <div data-testid="runner-component">Runner Component</div>
}));

// Track AnimatePresence mode prop
let animatePresenceMode: string | undefined;
let animatePresenceChildren: React.ReactNode | null = null;

// Mock AnimatePresence to capture mode prop and children
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children, mode }: { children: React.ReactNode; mode?: string }) => {
    animatePresenceMode = mode;
    animatePresenceChildren = children;
    return <div data-testid="animate-presence" data-mode={mode}>{children}</div>;
  },
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('Studio Page - Mode Switching (US5)', () => {
  /**
   * Describe block: Component rendering based on mode
   * Tests that the correct component (Editor or Runner) is displayed based on the mode
   */
  describe('Component rendering based on mode', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      animatePresenceMode = undefined;
      animatePresenceChildren = null;
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * T053 [US5]: Should display Editor component when mode is setup
     * Given: Store mode is set to 'setup'
     * When: Page renders
     * Then: Editor component should be displayed
     */
    it('should display Editor component when mode is setup', async () => {
      // Given: Store mode is 'setup'
      const currentStore = getMockStore();
      const updatedStore = { ...currentStore, mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(updatedStore);

      // When: Page renders
      render(<StudioPage />);

      // Then: Editor component should be displayed
      await waitFor(() => {
        expect(screen.getByTestId('editor-component')).toBeInTheDocument();
      });

      // Runner should NOT be in the document
      expect(screen.queryByTestId('runner-component')).not.toBeInTheDocument();
    });

    /**
     * T054 [US5]: Should display Runner component when mode is run
     * Given: Store mode is set to 'run'
     * When: Page renders
     * Then: Runner component should be displayed
     */
    it('should display Runner component when mode is run', async () => {
      // Given: Store mode is 'run'
      const currentStore = getMockStore();
      const updatedStore = { ...currentStore, mode: 'run' as const, isReadOnly: false };
      setHookMockStore(updatedStore);

      // When: Page renders
      render(<StudioPage />);

      // Then: Runner component should be displayed
      await waitFor(() => {
        expect(screen.getByTestId('runner-component')).toBeInTheDocument();
      });

      // Editor should NOT be in the document
      expect(screen.queryByTestId('editor-component')).not.toBeInTheDocument();
    });
  });

  /**
   * Describe block: AnimatePresence configuration
   * Tests that AnimatePresence is configured correctly with mode='wait'
   */
  describe('AnimatePresence configuration', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      animatePresenceMode = undefined;
      animatePresenceChildren = null;
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * T057 [US5]: Should use mode='wait' for AnimatePresence
     * Given: Page renders in any mode
     * When: AnimatePresence is rendered
     * Then: It should use mode='wait' for proper exit animations
     */
    it('should use mode="wait" for AnimatePresence', async () => {
      // Given: Store in setup mode (default)
      const currentStore = getMockStore();
      const updatedStore = { ...currentStore, mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(updatedStore);

      // When: Page renders
      render(<StudioPage />);

      // Then: AnimatePresence should have mode='wait'
      await waitFor(() => {
        const animatePresence = screen.getByTestId('animate-presence');
        expect(animatePresence).toHaveAttribute('data-mode', 'wait');
      });

      // Verify the captured mode prop
      expect(animatePresenceMode).toBe('wait');
    });
  });

  /**
   * Describe block: Mode transitions
   * Tests that AnimatePresence handles mode transitions correctly
   */
  describe('Mode transitions', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      animatePresenceMode = undefined;
      animatePresenceChildren = null;
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * T055 [US5]: Should handle AnimatePresence transition from setup to run
     * Given: Store mode is initially 'setup' (showing Editor)
     * When: Mode changes to 'run'
     * Then: AnimatePresence should handle transition from Editor to Runner
     */
    it('should handle AnimatePresence transition from setup to run', async () => {
      // Given: Store mode is 'setup'
      const currentStore = getMockStore();
      const setupStore = { ...currentStore, mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(setupStore);

      // When: Page renders initially with setup mode
      const { rerender } = render(<StudioPage />);

      // Verify Editor is displayed initially
      await waitFor(() => {
        expect(screen.getByTestId('editor-component')).toBeInTheDocument();
      });

      // When: Mode changes to 'run'
      const runStore = { ...getMockStore(), mode: 'run' as const, isReadOnly: false };
      setHookMockStore(runStore);

      // Re-render to simulate state change
      rerender(<StudioPage />);

      // Then: Runner should now be displayed
      await waitFor(() => {
        expect(screen.getByTestId('runner-component')).toBeInTheDocument();
      });

      // Editor should no longer be in the document
      expect(screen.queryByTestId('editor-component')).not.toBeInTheDocument();

      // AnimatePresence mode should still be 'wait'
      const animatePresence = screen.getByTestId('animate-presence');
      expect(animatePresence).toHaveAttribute('data-mode', 'wait');
    });

    /**
     * T056 [US5]: Should handle AnimatePresence transition from run to setup
     * Given: Store mode is initially 'run' (showing Runner)
     * When: Mode changes to 'setup'
     * Then: AnimatePresence should handle transition from Runner to Editor
     */
    it('should handle AnimatePresence transition from run to setup', async () => {
      // Given: Store mode is 'run'
      const currentStore = getMockStore();
      const runStore = { ...currentStore, mode: 'run' as const, isReadOnly: false };
      setHookMockStore(runStore);

      // When: Page renders initially with run mode
      const { rerender } = render(<StudioPage />);

      // Verify Runner is displayed initially
      await waitFor(() => {
        expect(screen.getByTestId('runner-component')).toBeInTheDocument();
      });

      // When: Mode changes to 'setup'
      const setupStore = { ...getMockStore(), mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(setupStore);

      // Re-render to simulate state change
      rerender(<StudioPage />);

      // Then: Editor should now be displayed
      await waitFor(() => {
        expect(screen.getByTestId('editor-component')).toBeInTheDocument();
      });

      // Runner should no longer be in the document
      expect(screen.queryByTestId('runner-component')).not.toBeInTheDocument();

      // AnimatePresence mode should still be 'wait'
      const animatePresence = screen.getByTestId('animate-presence');
      expect(animatePresence).toHaveAttribute('data-mode', 'wait');
    });
  });

  /**
   * Describe block: Edge cases
   * Tests additional edge cases for mode switching
   */
  describe('Edge cases', () => {
    beforeEach(() => {
      setupStudioPageMocks();
      animatePresenceMode = undefined;
      animatePresenceChildren = null;
    });

    afterEach(() => {
      teardownStudioPageMocks();
    });

    /**
     * Edge case: Only one component should be visible at a time
     */
    it('should only show one component at a time (Editor or Runner, never both)', async () => {
      // Test with setup mode
      const setupStore = { ...getMockStore(), mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(setupStore);

      const { rerender } = render(<StudioPage />);

      await waitFor(() => {
        const editorVisible = screen.queryByTestId('editor-component') !== null;
        const runnerVisible = screen.queryByTestId('runner-component') !== null;
        
        // Exactly one should be visible
        expect(editorVisible || runnerVisible).toBe(true);
        expect(editorVisible && runnerVisible).toBe(false);
      });

      // Test with run mode
      const runStore = { ...getMockStore(), mode: 'run' as const, isReadOnly: false };
      setHookMockStore(runStore);

      rerender(<StudioPage />);

      await waitFor(() => {
        const editorVisible = screen.queryByTestId('editor-component') !== null;
        const runnerVisible = screen.queryByTestId('runner-component') !== null;
        
        // Exactly one should be visible
        expect(editorVisible || runnerVisible).toBe(true);
        expect(editorVisible && runnerVisible).toBe(false);
      });
    });

    /**
     * Edge case: AnimatePresence maintains mode='wait' across all transitions
     */
    it('should maintain mode="wait" across all mode transitions', async () => {
      // Start with setup mode
      const setupStore = { ...getMockStore(), mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(setupStore);

      const { rerender } = render(<StudioPage />);

      // Verify mode='wait' in setup
      await waitFor(() => {
        expect(animatePresenceMode).toBe('wait');
      });

      // Transition to run mode
      const runStore = { ...getMockStore(), mode: 'run' as const, isReadOnly: false };
      setHookMockStore(runStore);
      rerender(<StudioPage />);

      // Verify mode='wait' in run
      await waitFor(() => {
        expect(animatePresenceMode).toBe('wait');
      });

      // Transition back to setup mode
      const setupStore2 = { ...getMockStore(), mode: 'setup' as const, isReadOnly: false };
      setHookMockStore(setupStore2);
      rerender(<StudioPage />);

      // Verify mode='wait' is maintained
      await waitFor(() => {
        expect(animatePresenceMode).toBe('wait');
      });
    });
  });
});
