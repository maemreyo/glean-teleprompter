/**
 * Template Loading Tests for Studio Page
 * Tests template loading via ?template= parameter with settings application and toast notifications
 * User Story 2: Template Loading
 */

import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { setupStudioPageMocks, teardownStudioPageMocks } from '../../utils/studio-page-mocks';
import { mockUseTeleprompterStore } from '../../mocks/hooks/use-teleprompter-store.mock';
import { mockGetTemplateById } from '../../mocks/actions/get-template-by-id.mock';
import { mockToast } from '../../mocks/toast.mock';
import { setSearchParams } from '../../mocks/next-navigation.mock';
import { resetLocalStorage } from '../../mocks/local-storage.mock';
import * as templateFixtures from '../../fixtures/templates';

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

describe('Studio Page - Template Loading (US2)', () => {
  beforeEach(() => {
    setupStudioPageMocks();
    // Clear localStorage to avoid draft loading interfering
    resetLocalStorage();
  });

  afterEach(() => {
    teardownStudioPageMocks();
  });

  it('should load template content when ?template parameter present', async () => {
    // Given: URL with ?template parameter pointing to a valid template
    const template = templateFixtures.validTemplate;
    mockGetTemplateById.__setMockTemplate(template);
    setSearchParams({ template: template.id });

    // When: Page loads
    render(<StudioPage />);

    // Then: Template content should be loaded to teleprompter store
    await waitFor(() => {
      expect(mockGetTemplateById).toHaveBeenCalledWith(template.id);
      expect(mockUseTeleprompterStore().setAll).toHaveBeenCalledWith(
        expect.objectContaining({
          text: template.content,
          font: template.settings.font,
          mode: 'setup'
        })
      );
    });
  });

  it('should apply all template settings to teleprompter store', async () => {
    // Given: URL with ?template parameter for a template with all settings
    const template = templateFixtures.validTemplate;
    mockGetTemplateById.__setMockTemplate(template);
    setSearchParams({ template: template.id });

    // When: Page loads
    render(<StudioPage />);

    // Then: All template settings should be applied
    await waitFor(() => {
      expect(mockUseTeleprompterStore().setAll).toHaveBeenCalledWith(
        expect.objectContaining({
          text: template.content,
          font: template.settings.font,
          colorIndex: template.settings.colorIndex,
          speed: template.settings.speed,
          fontSize: template.settings.fontSize,
          align: template.settings.align,
          lineHeight: template.settings.lineHeight,
          margin: template.settings.margin,
          overlayOpacity: template.settings.overlayOpacity,
          mode: 'setup',
          isReadOnly: false
        })
      );
    });
  });

  it('should show success toast with template name after loading', async () => {
    // Given: URL with valid template parameter
    const template = templateFixtures.modernTemplate;
    mockGetTemplateById.__setMockTemplate(template);
    setSearchParams({ template: template.id });

    // When: Page loads
    render(<StudioPage />);

    // Then: Success toast should appear with template name
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringContaining(template.name)
      );
    });
  });

  it('should set mode to setup after template load', async () => {
    // Given: URL with template parameter
    const template = templateFixtures.validTemplate;
    mockGetTemplateById.__setMockTemplate(template);
    setSearchParams({ template: template.id });

    // When: Page loads
    render(<StudioPage />);

    // Then: Mode should be set to 'setup'
    await waitFor(() => {
      expect(mockUseTeleprompterStore().setAll).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'setup'
        })
      );
    });
  });

  it('should fall through to default initialization when template not found', async () => {
    // Given: URL with ?template parameter for non-existent template
    mockGetTemplateById.__setNull();
    setSearchParams({ template: 'nonexistent' });

    // When: Page loads
    render(<StudioPage />);

    // Then: Should fall through to default initialization (Editor should render)
    await waitFor(() => {
      expect(screen.getByTestId('editor-component')).toBeInTheDocument();
      expect(mockGetTemplateById).toHaveBeenCalledWith('nonexistent');
    });
  });

  it('should handle template with missing optional settings', async () => {
    // Given: URL with template that has minimal settings
    const template = templateFixtures.minimalTemplate;
    mockGetTemplateById.__setMockTemplate(template);
    setSearchParams({ template: template.id });

    // When: Page loads
    render(<StudioPage />);

    // Then: Should use default values for missing settings
    await waitFor(() => {
      expect(mockUseTeleprompterStore().setAll).toHaveBeenCalledWith(
        expect.objectContaining({
          text: template.content,
          font: template.settings.font,
          colorIndex: template.settings.colorIndex || 0,
          speed: template.settings.speed || 2,
          fontSize: template.settings.fontSize || 48,
          align: template.settings.align || 'center' as const,
          lineHeight: template.settings.lineHeight || 1.5,
          margin: template.settings.margin || 0,
          overlayOpacity: template.settings.overlayOpacity || 0.5,
          mode: 'setup'
        })
      );
    });
  });
});
