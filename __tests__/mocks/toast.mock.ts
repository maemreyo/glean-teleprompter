/**
 * Mock Toast (sonner)
 * Mocks the sonner toast notification library
 */

import { MockToast } from '../types/test-mocks';

// Create mock toast instance
export const mockToast: MockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  promise: jest.fn(),
};

/**
 * Assert that success toast was called with a message
 */
export function expectToastSuccess(message: string | RegExp) {
  expect(mockToast.success).toHaveBeenCalledWith(expect.stringMatching(message));
}

/**
 * Assert that error toast was called with a message
 */
export function expectToastError(message: string | RegExp) {
  expect(mockToast.error).toHaveBeenCalledWith(expect.stringMatching(message));
}

/**
 * Assert that no toasts were called
 */
export function expectNoToasts() {
  expect(mockToast.success).not.toHaveBeenCalled();
  expect(mockToast.error).not.toHaveBeenCalled();
  expect(mockToast.info).not.toHaveBeenCalled();
  expect(mockToast.warning).not.toHaveBeenCalled();
}

/**
 * Clear all toast mocks
 */
export function clearToastMocks() {
  mockToast.success.mockClear();
  mockToast.error.mockClear();
  mockToast.info.mockClear();
  mockToast.warning.mockClear();
  mockToast.promise.mockClear();
}

// Set up the Jest mock for sonner
jest.mock('sonner', () => ({
  toast: mockToast,
  Toaster: () => null // Don't render the Toaster component in tests
}));
