/**
 * Parameter Priority Tests for Studio Page
 * Tests that template parameter takes precedence over script parameter when both are present
 * User Story 6: Template Parameter Priority
 */

import { render, waitFor } from '@testing-library/react';
import React from 'react';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../../utils/studio-page-mocks';
import { mockUseTeleprompterStore } from '../../mocks/hooks/use-teleprompter-store.mock';
import { mockGetTemplateById } from '../../mocks/actions/get-template-by-id.mock';
import { mockLoadScriptAction } from '../../mocks/actions/load-script-action.mock';
import { mockToast } from '../../mocks/toast.mock';
import { setSearchParams } from '../../mocks/next-navigation.mock';
import { resetLocalStorage } from '../../mocks/local-storage.mock';
import * as templateFixtures from '../../fixtures/templates';
import * as scriptFixtures from '../../fixtures/scripts';

// Import the StudioLogic component directly
import StudioPage from '@/app/studio/page';

// Mock the AppProvider
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

// Mock AnimatePresence
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

describe('Studio Page - Template Parameter Priority (US6)', () => {
  beforeEach(() => {
    setupStudioPageMocks();
    // Clear localStorage to avoid draft loading interfering
    resetLocalStorage();
  });

  afterEach(() => {
    teardownStudioPageMocks();
  });

  /**
   * T059 [US6]: Test that template is prioritized over script when both parameters present
   * 
   * User Story: User navigates with both ?template= and ?script= → system loads template only
   * 
   * Given: URL with both ?template= and ?script= parameters pointing to valid resources
   * When: Page loads
   * Then: Template content and settings should be loaded (not script)
   */
  it('should prioritize template over script when both parameters present', async () => {
    // Given: URL with both ?template= and ?script= parameters
    const template = templateFixtures.modernTemplate;
    const scriptResult = scriptFixtures.scriptWithConfig;
    
    mockGetTemplateById.__setMockTemplate(template);
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ template: template.id, script: 'test-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Template should be loaded, not script
    await waitFor(() => {
      // Template loading should occur
      expect(mockGetTemplateById).toHaveBeenCalledWith(template.id);
      
      // Script loading should NOT occur
      expect(mockLoadScriptAction).not.toHaveBeenCalled();
      
      // Template content should be applied to teleprompter store
      expect(mockUseTeleprompterStore().setAll).toHaveBeenCalledWith(
        expect.objectContaining({
          text: template.content,
          font: template.settings.font,
          mode: 'setup'
        })
      );
    });
  });

  /**
   * T060 [US6]: Test that script loading action is NOT called when template parameter is present
   * 
   * User Story: User navigates with both ?template= and ?script= → script loading is skipped
   * 
   * Given: URL with both ?template= and ?script= parameters
   * When: Page loads
   * Then: loadScriptAction should never be called
   */
  it('should not load script when template parameter is present', async () => {
    // Given: URL with both parameters
    const template = templateFixtures.validTemplate;
    const scriptResult = scriptFixtures.scriptWithConfig;
    
    mockGetTemplateById.__setMockTemplate(template);
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ template: template.id, script: 'another-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Script loading action should not be called
    await waitFor(() => {
      // Verify template was fetched
      expect(mockGetTemplateById).toHaveBeenCalled();
      
      // Verify script action was never called
      expect(mockLoadScriptAction).not.toHaveBeenCalled();
      
      // Verify script-related settings were NOT applied
      expect(mockUseTeleprompterStore().setText).not.toHaveBeenCalledWith(
        scriptResult.script?.content
      );
      expect(mockUseTeleprompterStore().setBgUrl).not.toHaveBeenCalledWith(
        scriptResult.script?.bg_url
      );
    });
  });

  /**
   * T061 [US6]: Test that success toast mentions template (not script)
   * 
   * User Story: User navigates with both ?template= and ?script= → template success toast appears
   * 
   * Given: URL with both ?template= and ?script= parameters
   * When: Page loads
   * Then: Success toast should mention template, not script
   */
  it('should show template success toast (not script toast)', async () => {
    // Given: URL with both parameters
    const template = templateFixtures.neonTemplate;
    const scriptResult = scriptFixtures.scriptWithConfig;
    
    mockGetTemplateById.__setMockTemplate(template);
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ template: template.id, script: 'yet-another-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Success toast should mention template
    await waitFor(() => {
      // Toast should contain the template name
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringContaining(template.name)
      );
      
      // Toast should NOT mention "Loaded script" or script-related messages
      expect(mockToast.success).not.toHaveBeenCalledWith(
        expect.stringContaining('Loaded script')
      );
      
      // Verify only one success toast was shown (for template)
      expect(mockToast.success).toHaveBeenCalledTimes(1);
    });
  });
});
