/**
 * Initialization Tests for Studio Page
 * Tests the initial page load behavior, demo mode handling, and component rendering
 * User Story 1: Initial Page Load and Fresh Start
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../../utils/studio-page-mocks';
import { mockUseDemoStore } from '../../mocks/hooks/use-demo-store.mock';

// Import the StudioLogic component directly to avoid AppProvider issues
import StudioPage from '@/app/studio/page';

// Extract StudioLogic component by mocking the full page structure
let StudioLogic: React.ComponentType;

// Mock the AppProvider to avoid next-intl ESM issues
jest.mock('@/components/AppProvider', () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
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

// Mock AnimatePresence to avoid framer-motion complexity
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('Studio Page - Initial Page Load (US1)', () => {
  beforeEach(() => {
    setupStudioPageMocks();
  });

  afterEach(() => {
    teardownStudioPageMocks();
  });

  it('should display Editor component when no URL parameters present', async () => {
    // Given: User navigates to studio page without parameters
    // (search params are already mocked to return empty by default)

    // When: Page loads
    render(<StudioPage />);

    // Then: Editor component should be displayed (not Runner)
    await waitFor(() => {
      expect(screen.getByTestId('editor-component')).toBeInTheDocument();
      expect(screen.queryByTestId('runner-component')).not.toBeInTheDocument();
    });
  });

  it('should disable demo mode on initial mount', async () => {
    // Given: Fresh page load without parameters

    // When: Page loads
    render(<StudioPage />);

    // Then: Demo mode should be disabled
    await waitFor(() => {
      expect(mockUseDemoStore().setDemoMode).toHaveBeenCalledWith(false);
    });
  });

  it('should initialize exactly once (no duplicate initialization)', async () => {
    // Given: User opens studio page for the first time
    // (search params are mocked to return empty, so no template/script loading)

    // When: Page loads
    const { rerender } = render(<StudioPage />);

    // Re-render to test initialization guards (simulate React re-render)
    rerender(<StudioPage />);

    // Then: Initialization should occur exactly once (useEffect guard works)
    await waitFor(() => {
      expect(mockUseDemoStore().setDemoMode).toHaveBeenCalledTimes(1);
      expect(mockUseDemoStore().setDemoMode).toHaveBeenCalledWith(false);
    });
  });


});