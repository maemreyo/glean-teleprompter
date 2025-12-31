/**
 * Test render utilities with custom providers
 * Provides render wrappers with mocked providers for Studio page tests
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { AppProvider } from '@/components/AppProvider';
import { Toaster } from 'sonner';

// ============================================================================
// Custom Render with Providers
// ============================================================================

/**
 * Custom render function that includes AppProvider and Toaster
 * Use this for rendering Studio page and other components that need providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AppProvider>
      {children}
      <Toaster position="top-center" richColors />
    </AppProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Render without providers for components that don't need them
 */
export function renderWithoutProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  return render(ui, options);
}

/**
 * Render with custom wrapper function
 */
export function renderWithCustomWrapper(
  ui: ReactElement,
  wrapper: (children: React.ReactNode) => ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => wrapper(children);
  return render(ui, { wrapper: Wrapper, ...options });
}

// ============================================================================
// Re-exports
// ============================================================================

// Re-export testing library utilities for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Re-export screen for easier access
export { screen } from '@testing-library/react';
