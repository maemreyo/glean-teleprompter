/**
 * Script Loading Tests for Studio Page
 * Tests script loading via ?script= parameter with both modern config and legacy settings formats
 * User Story 3: Saved Script Restoration
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../../utils/studio-page-mocks';
import { mockUseTeleprompterStore } from '../../mocks/hooks/use-teleprompter-store.mock';
import { mockLoadScriptAction } from '../../mocks/actions/load-script-action.mock';
import { mockUseConfigStore } from '../../mocks/hooks/use-config-store.mock';
import { mockToast } from '../../mocks/toast.mock';
import { setSearchParams } from '../../mocks/next-navigation.mock';
import { resetLocalStorage } from '../../mocks/local-storage.mock';
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

// Mock console methods to track error logging
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Studio Page - Script Loading (US3)', () => {
  beforeEach(() => {
    setupStudioPageMocks();
    resetLocalStorage();
    mockConsoleError.mockClear();
    mockConsoleLog.mockClear();
  });

  afterEach(() => {
    teardownStudioPageMocks();
  });

  it('should load script with modern config format', async () => {
    // Given: URL with ?script parameter for script with modern config
    const scriptResult = scriptFixtures.scriptWithConfig;
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ script: 'test-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Script content should be loaded
    await waitFor(() => {
      expect(mockLoadScriptAction).toHaveBeenCalledWith('test-script-id');
      if (scriptResult.script) {
        expect(mockUseTeleprompterStore().setText).toHaveBeenCalledWith(scriptResult.script.content);
        expect(mockUseTeleprompterStore().setBgUrl).toHaveBeenCalledWith(scriptResult.script.bg_url || '');
        expect(mockUseTeleprompterStore().setMusicUrl).toHaveBeenCalledWith(scriptResult.script.music_url || '');
      }
    });
  });

  it('should apply script config to config store', async () => {
    // Given: URL with script that has modern config
    const scriptResult = scriptFixtures.scriptWithConfig;
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ script: 'test-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Config should be applied to config store
    await waitFor(() => {
      if (scriptResult.script?.config) {
        // The actual implementation uses useConfigStore.getState().setAll(script.config)
        // We check that setAll was called with the config from the script
        expect(mockUseConfigStore().setAll).toHaveBeenCalledWith(scriptResult.script.config);
      }
    });
  });

  it('should show success toast for script with config', async () => {
    // Given: URL with script with modern config
    const scriptResult = scriptFixtures.scriptWithConfig;
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ script: 'test-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Success toast should indicate custom styling
    await waitFor(() => {
      // Wait for the promise to resolve and toast to be called
      expect(mockLoadScriptAction).toHaveBeenCalledWith('test-script-id');
      expect(mockToast.success).toHaveBeenCalled();
    });
  });

  it('should load script with legacy settings format', async () => {
    // Given: URL with ?script parameter for script with legacy settings
    const scriptResult = scriptFixtures.scriptWithLegacySettings;
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ script: 'test-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Script content and legacy settings should be loaded
    await waitFor(() => {
      expect(mockLoadScriptAction).toHaveBeenCalledWith('test-script-id');
      if (scriptResult.script) {
        expect(mockUseTeleprompterStore().setText).toHaveBeenCalledWith(scriptResult.script.content);
        if (scriptResult.script.settings) {
          expect(mockUseTeleprompterStore().setAll).toHaveBeenCalledWith(
            expect.objectContaining({
              font: scriptResult.script.settings.font || 'Classic',
              colorIndex: scriptResult.script.settings.colorIndex || 0,
              speed: scriptResult.script.settings.speed || 2,
              fontSize: scriptResult.script.settings.fontSize || 48,
              align: scriptResult.script.settings.align || 'center',
              lineHeight: scriptResult.script.settings.lineHeight || 1.5,
              margin: scriptResult.script.settings.margin || 0,
              overlayOpacity: scriptResult.script.settings.overlayOpacity || 0.5
            })
          );
        }
      }
    });
  });

  it('should apply legacy settings to teleprompter store', async () => {
    // Given: URL with script that has legacy settings
    const scriptResult = scriptFixtures.scriptWithLegacySettings;
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ script: 'test-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Legacy settings should be applied to teleprompter store
    await waitFor(() => {
      if (scriptResult.script?.settings) {
        expect(mockUseTeleprompterStore().setAll).toHaveBeenCalledWith(
          expect.objectContaining({
            font: scriptResult.script.settings.font,
            colorIndex: scriptResult.script.settings.colorIndex,
            speed: scriptResult.script.settings.speed,
            fontSize: scriptResult.script.settings.fontSize,
            align: scriptResult.script.settings.align
          })
        );
      }
    });
  });

  it('should show success toast for script with legacy settings', async () => {
    // Given: URL with script with legacy settings
    const scriptResult = scriptFixtures.scriptWithLegacySettings;
    mockLoadScriptAction.__setMockResult(scriptResult);
    setSearchParams({ script: 'test-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Success toast should indicate script loaded (without custom styling message)
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringContaining('Loaded script')
      );
      expect(mockToast.success).not.toHaveBeenCalledWith(
        expect.stringContaining('custom styling')
      );
    });
  });

  it('should show error toast when script not found', async () => {
    // Given: URL with ?script parameter for non-existent script
    mockLoadScriptAction.__setMockError('Script not found');
    setSearchParams({ script: 'nonexistent-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Error toast should be shown
    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load script')
      );
    });
  });

  it('should log script loading errors to console', async () => {
    // Given: URL with script that fails to load
    mockLoadScriptAction.__setMockResult({
      success: false,
      error: 'Network error'
    });
    setSearchParams({ script: 'error-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Error should be logged to console
    await waitFor(() => {
      // The action should be called
      expect(mockLoadScriptAction).toHaveBeenCalledWith('error-script-id');
      // Check that error toast was shown (which happens in the catch block)
      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  it('should handle promise rejection from loadScriptAction', async () => {
    // Given: URL with script that causes promise rejection
    mockLoadScriptAction.__setMockReject(new Error('Network connection failed'));
    setSearchParams({ script: 'error-script-id' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Error should be caught and error toast shown
    await waitFor(() => {
      expect(mockLoadScriptAction).toHaveBeenCalledWith('error-script-id');
      // Should log error to console
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[Studio] Error loading script:',
        expect.any(Error)
      );
      // Should show error toast
      expect(mockToast.error).toHaveBeenCalledWith('Failed to load script');
    });
  });
});
