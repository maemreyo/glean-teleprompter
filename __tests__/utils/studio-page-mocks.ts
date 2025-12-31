/**
 * Centralized Mock Setup for Studio Page Tests
 * Provides a single function to set up all mocks for Studio page testing
 */

// Import all mock setup functions
import { resetGlobalTeleprompterStore } from '../mocks/stores/teleprompter-store.mock';
import { resetGlobalConfigStore } from '../mocks/stores/config-store.mock';
import { resetGlobalDemoStore } from '../mocks/stores/demo-store.mock';
import { resetMockTeleprompterStore as resetHookTeleprompter } from '../mocks/hooks/use-teleprompter-store.mock';
import { resetMockConfigStore as resetHookConfig } from '../mocks/hooks/use-config-store.mock';
import { resetMockDemoStore as resetHookDemo } from '../mocks/hooks/use-demo-store.mock';
import { resetSearchParams } from '../mocks/next-navigation.mock';
import { clearToastMocks } from '../mocks/toast.mock';
import { resetLocalStorage } from '../mocks/local-storage.mock';
import { resetLoadScriptAction } from '../mocks/actions/load-script-action.mock';
import { resetGetTemplateById } from '../mocks/actions/get-template-by-id.mock';

/**
 * Set up all Studio page mocks before each test
 * Call this in beforeEach hooks
 */
export function setupStudioPageMocks() {
  // Reset all store mocks to default state
  resetGlobalTeleprompterStore();
  resetGlobalConfigStore();
  resetGlobalDemoStore();
  
  // Reset React hook mocks
  resetHookTeleprompter();
  resetHookConfig();
  resetHookDemo();
  
  // Reset navigation mocks
  resetSearchParams();
  
  // Reset utility mocks
  clearToastMocks();
  resetLocalStorage();
  
  // Reset action mocks
  resetLoadScriptAction();
  resetGetTemplateById();
  
  // Use fake timers for tests involving auto-save
  jest.useFakeTimers();
}

/**
 * Tear down all Studio page mocks after each test
 * Call this in afterEach hooks
 */
export function teardownStudioPageMocks() {
  // Run any pending timers
  jest.runOnlyPendingTimers();
  
  // Restore real timers
  jest.useRealTimers();
  
  // All mocks are already reset via setupStudioPageMocks
  // This function ensures cleanup between tests
}

/**
 * Set up mocks for a specific user story scenario
 * This allows more targeted mock setup
 */
export function setupUserStoryMocks(scenario: 'initial' | 'template' | 'script' | 'draft' | 'mode') {
  // Always run base setup first
  setupStudioPageMocks();
  
  // Scenario-specific setup can be added here
  switch (scenario) {
    case 'initial':
      // No additional setup needed
      break;
    case 'template':
      // Template-specific setup can be added
      break;
    case 'script':
      // Script-specific setup can be added
      break;
    case 'draft':
      // Draft-specific setup can be added
      break;
    case 'mode':
      // Mode switching setup can be added
      break;
  }
}
