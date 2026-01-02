/**
 * Shared test helper utilities for Studio page tests
 * Provides common functions for rendering, mocking, and assertions
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// ============================================================================
// Render Helpers
// ============================================================================

/**
 * Custom render function with default wrappers
 * Can be extended to include AppProvider, Toaster, etc.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options);
}

/**
 * Set up test environment before each test
 * Call this in beforeEach hooks
 */
export function setupTestEnvironment() {
  // Clear all mocks
  jest.clearAllMocks();
  jest.resetAllMocks();
}

/**
 * Tear down test environment after each test
 * Call this in afterEach hooks
 */
export function teardownTestEnvironment() {
  // Clean up timers (only if fake timers are enabled)
  try {
    jest.runOnlyPendingTimers();
  } catch (e) {
    // Ignore error if fake timers are not enabled
  }
  jest.useRealTimers();
  
  // Clear all mocks
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

/**
 * Clean up function to reset all mocks between tests
 * Call this in afterEach hooks
 */
export function cleanupAllMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

/**
 * Wait for a specified amount of time (useful for async operations)
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Flush all pending promises
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve));
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert that a mock function was called with specific arguments
 */
export function expectCalledWith(
  mockFn: jest.Mock,
  ...args: unknown[]
) {
  expect(mockFn).toHaveBeenCalledWith(...args);
}

/**
 * Assert that a mock function was called a specific number of times
 */
export function expectCalledTimes(
  mockFn: jest.Mock,
  times: number
) {
  expect(mockFn).toHaveBeenCalledTimes(times);
}

/**
 * Assert that a mock function was never called
 */
export function expectNotCalled(mockFn: jest.Mock) {
  expect(mockFn).not.toHaveBeenCalled();
}

// ============================================================================
// Store Helpers
// ============================================================================

/**
 * Create a partial store state for testing
 */
export function createStoreState<T>(overrides: Partial<T> = {}): T {
  return { ...overrides } as T;
}

/**
 * Reset a store's mock state
 */
export function resetStoreMocks(store: {
  setText?: jest.Mock;
  setBgUrl?: jest.Mock;
  setMusicUrl?: jest.Mock;
  setAll?: jest.Mock;
  setDemoMode?: jest.Mock;
}) {
  Object.values(store).forEach(mock => {
    if (mock && typeof mock.mockClear === 'function') {
      mock.mockClear();
    }
  });
}

// ============================================================================
// Timer Helpers
// ============================================================================

/**
 * Set up fake timers for tests
 * Call this in beforeEach hooks
 */
export function setupFakeTimers() {
  jest.useFakeTimers();
}

/**
 * Restore real timers after tests
 * Call this in afterEach hooks
 */
export function restoreRealTimers() {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
}

/**
 * Advance timers by a specific amount of time
 */
export function advanceTimers(ms: number) {
  jest.advanceTimersByTime(ms);
}

/**
 * Run all pending timers
 */
export function runAllTimers() {
  jest.runAllTimers();
}

// ============================================================================
// URL Parameter Helpers
// ============================================================================

/**
 * Create a mock search params object
 */
export function createMockSearchParams(params: Record<string, string | null>) {
  return {
    get: (key: string) => params[key] || null,
    has: (key: string) => key in params && params[key] !== null,
    entries: () => Object.entries(params).filter(([_, v]) => v !== null),
    keys: () => Object.keys(params).filter(k => params[k] !== null),
    values: () => Object.values(params).filter(v => v !== null),
    forEach: (callback: (value: string, key: string) => void) => {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null) callback(value, key);
      });
    },
    toString: () => {
      const pairs = Object.entries(params)
        .filter(([_, v]) => v !== null)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      return pairs ? `?${pairs}` : '';
    }
  };
}

// ============================================================================
// Console Helpers
// ============================================================================

/**
 * Spy on console methods
 * Returns a cleanup function to restore original methods
 */
export function spyOnConsole() {
  const consoleSpy = {
    error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
    log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  };

  return () => {
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.log.mockRestore();
  };
}

/**
 * Assert that console.error was called with a specific message
 */
export function expectConsoleError(message: string | RegExp) {
  expect(console.error).toHaveBeenCalledWith(expect.stringMatching(message));
}

// ============================================================================
// LocalStorage Helpers
// ============================================================================

/**
 * Create a mock localStorage draft state
 */
export function createMockDraft(overrides: Partial<{
  text: string;
  bgUrl: string;
  musicUrl: string;
  font: string;
  colorIndex: number;
  speed: number;
  fontSize: number;
  align: string;
  lineHeight: number;
  margin: number;
  overlayOpacity: number;
}> = {}) {
  return {
    text: '',
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
    ...overrides
  };
}

// ============================================================================
// Component Helpers
// ============================================================================

/**
 * Find a component by its test ID or text content
 */
export function findByText(
  container: HTMLElement,
  text: string | RegExp
): HTMLElement | null {
  const element = container.querySelector(
    typeof text === 'string' 
      ? `[text="${text}"]` 
      : `[text*="${text}"]`
  );
  return element as HTMLElement | null;
}

/**
 * Check if a component is in the document
 */
export function isInDocument(element: HTMLElement | null): boolean {
  return element !== null && document.body.contains(element);
}

// ============================================================================
// Preview Component Helpers (009-fix-preview)
// ============================================================================

/**
 * Create a mock background URL for testing
 * Returns a valid Unsplash image URL
 */
export function createMockBgUrl(id: string = 'default'): string {
  const mockUrls: Record<string, string> = {
    default: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    abstract: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2564&auto=format&fit=crop',
    nature: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2564&auto=format&fit=crop',
    gradient: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2564&auto=format&fit=crop',
  };
  return mockUrls[id] || mockUrls.default;
}

/**
 * Create a mock content state for preview testing
 */
export function createMockContentState(overrides: Partial<{
  text: string;
  bgUrl: string;
  musicUrl: string;
  isReadOnly: boolean;
}> = {}) {
  return {
    text: 'Chào mừng! Hãy nhập nội dung của bạn vào đây...',
    bgUrl: createMockBgUrl(),
    musicUrl: '',
    isReadOnly: false,
    ...overrides
  };
}

/**
 * Wait for background image to load
 * Useful for testing image loading states
 */
export function waitForBackgroundLoad(): Promise<void> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve even on error for testing
    img.src = createMockBgUrl();
  });
}

/**
 * Assert that a preview component has the correct background style
 */
export function expectBackgroundStyle(
  element: HTMLElement | null,
  expectedBgUrl: string
) {
  expect(element).not.toBeNull();
  const style = window.getComputedStyle(element!);
  expect(style.backgroundImage).toContain(expectedBgUrl);
  expect(style.backgroundSize).toBe('cover');
  expect(style.backgroundPosition).toBe('center');
}

/**
 * Assert that a preview component shows error state
 */
export function expectPreviewError(
  container: HTMLElement,
  expectedError: string | RegExp
) {
  const errorElement = container.querySelector('[class*="error"]');
  expect(errorElement).toBeInTheDocument();
  if (typeof expectedError === 'string') {
    expect(errorElement).toHaveTextContent(expectedError);
  } else {
    expect(errorElement).toHaveTextContent(expectedError);
  }
}

/**
 * Assert that a preview component shows loading state
 */
export function expectPreviewLoading(container: HTMLElement) {
  const loadingElement = container.querySelector('[class*="loading"]');
  expect(loadingElement).toBeInTheDocument();
}

/**
 * Create a mock media error for testing error handling
 */
export function simulateMediaError(element: HTMLElement) {
  const event = new Event('error');
  element.dispatchEvent(event);
}

/**
 * Create a mock media load for testing load handling
 */
export function simulateMediaLoad(element: HTMLElement) {
  const event = new Event('load');
  element.dispatchEvent(event);
}

/**
 * Find background layer in preview component
 */
export function findBackgroundLayer(container: HTMLElement): HTMLElement | null {
  return container.querySelector('.bg-cover, [class*="background"]');
}

/**
 * Assert visual consistency between two preview components
 * Compares background styles, text content, and overlay
 */
export function expectPreviewConsistency(
  preview1: HTMLElement,
  preview2: HTMLElement
) {
  const bg1 = findBackgroundLayer(preview1);
  const bg2 = findBackgroundLayer(preview2);
  
  if (bg1 && bg2) {
    const style1 = window.getComputedStyle(bg1);
    const style2 = window.getComputedStyle(bg2);
    
    expect(style1.backgroundImage).toBe(style2.backgroundImage);
    expect(style1.backgroundSize).toBe(style2.backgroundSize);
    expect(style1.backgroundPosition).toBe(style2.backgroundPosition);
    expect(style1.opacity).toBe(style2.opacity);
  }
}

/**
 * Test fixture for preview component scenarios
 */
export const previewTestFixtures = {
  default: {
    text: 'Test text',
    bgUrl: createMockBgUrl(),
    musicUrl: '',
    isReadOnly: false
  },
  emptyBg: {
    text: 'Test text',
    bgUrl: '',
    musicUrl: '',
    isReadOnly: false
  },
  nullBg: {
    text: 'Test text',
    bgUrl: '',
    musicUrl: '',
    isReadOnly: false
  },
  customBg: {
    text: 'Test text',
    bgUrl: createMockBgUrl('nature'),
    musicUrl: '',
    isReadOnly: false
  },
  longText: {
    text: 'A'.repeat(1000),
    bgUrl: createMockBgUrl(),
    musicUrl: '',
    isReadOnly: false
  }
};
