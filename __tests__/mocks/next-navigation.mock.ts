/**
 * Mock next/navigation
 * Mocks Next.js App Router navigation hooks
 */

import { MockSearchParams } from '../types/test-mocks';

// Global mock search params
let mockSearchParams: Record<string, string | null> = {};

/**
 * Set URL search parameters for testing
 */
export const setSearchParams = (params: Record<string, string | null>) => {
  mockSearchParams = { ...params };
};

/**
 * Get current search parameters
 */
export const getSearchParams = () => ({ ...mockSearchParams });

/**
 * Reset search parameters
 */
export const resetSearchParams = () => {
  mockSearchParams = {};
};

/**
 * Create mock useSearchParams return value
 */
export const createMockUseSearchParams = (): MockSearchParams => ({
  get: (key: string) => mockSearchParams[key] || null,
  has: (key: string) => key in mockSearchParams && mockSearchParams[key] !== null,
  entries: () => Object.entries(mockSearchParams).filter(([_, v]) => v !== null),
  keys: () => Object.keys(mockSearchParams).filter(k => mockSearchParams[k] !== null),
  values: () => Object.values(mockSearchParams).filter(v => v !== null),
  forEach: (callback: (value: string, key: string) => void) => {
    Object.entries(mockSearchParams).forEach(([key, value]) => {
      if (value !== null) callback(value, key);
    });
  },
  toString: () => {
    const pairs = Object.entries(mockSearchParams)
      .filter(([_, v]) => v !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return pairs ? `?${pairs}` : '';
  }
});

// Set up the Jest mock
jest.mock('next/navigation', () => ({
  useSearchParams: () => createMockUseSearchParams(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/studio',
}));
