/**
 * Mock loadScriptAction
 * Mocks the server action for loading saved scripts
 */

import { ScriptActionResult, MockLoadScriptAction } from '../../types/test-mocks';

// Global mock state
let mockResult: ScriptActionResult = { success: false, error: 'Not mocked' };
let mockDelay = 0;

/**
 * Mock loadScriptAction implementation
 */
export const mockLoadScriptAction = jest.fn(
  async (scriptId: string): Promise<ScriptActionResult> => {
    if (mockDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, mockDelay));
    }
    return mockResult;
  }
) as unknown as MockLoadScriptAction;

/**
 * Set the mock result for loadScriptAction
 */
export function setMockScriptResult(result: ScriptActionResult) {
  mockResult = result;
}

/**
 * Set the mock error for loadScriptAction
 */
export function setMockScriptError(error: string) {
  mockResult = { success: false, error };
}

/**
 * Set the mock delay for async operations
 */
export function setMockScriptDelay(ms: number) {
  mockDelay = ms;
}

/**
 * Reset the mock to defaults
 */
export function resetLoadScriptAction() {
  mockResult = { success: false, error: 'Not mocked' };
  mockDelay = 0;
  // The mock function is already a jest.fn, so we can call mockClear directly
  // The helper methods provide a clean API for tests
}

// Add helper methods to the mock function
(mockLoadScriptAction as unknown as MockLoadScriptAction).__setMockResult = setMockScriptResult;
(mockLoadScriptAction as unknown as MockLoadScriptAction).__setMockError = setMockScriptError;
(mockLoadScriptAction as unknown as MockLoadScriptAction).__setDelay = setMockScriptDelay;
(mockLoadScriptAction as unknown as MockLoadScriptAction).__reset = resetLoadScriptAction;

// Set up the Jest mock
jest.mock('@/actions/scripts', () => ({
  loadScriptAction: mockLoadScriptAction
}));
