import { Page, Locator, expect } from '@playwright/test';

/**
 * StudioPage - Page object model for the Studio page
 * 
 * Provides methods for interacting with the Studio page, including:
 * - Navigation to the studio page
 * - Accessing PreviewPanel elements
 * - Opening FullPreviewDialog
 * - Configuring teleprompter settings
 * 
 * @see components/teleprompter/editor/ContentPanel.tsx
 * @see components/teleprompter/editor/PreviewPanel.tsx
 */
export class StudioPage {
  readonly page: Page;
  readonly url: string;

  // Preview Panel locators
  readonly previewPanel: Locator;
  readonly teleprompterText: Locator;
  readonly backgroundImage: Locator;
  readonly loadingIndicator: Locator;
  readonly errorIndicator: Locator;
  readonly fullPreviewTrigger: Locator;

  // Full Preview Dialog locators
  readonly fullPreviewDialog: Locator;
  readonly fullPreviewTeleprompterText: Locator;
  readonly fullPreviewBackgroundImage: Locator;
  readonly fullPreviewLoadingIndicator: Locator;
  readonly fullPreviewErrorIndicator: Locator;

  // Config Panel locators
  readonly configPanel: Locator;
  readonly contentEditor: Locator;

  constructor(page: Page, baseURL: string = 'http://localhost:3000') {
    this.page = page;
    this.url = `${baseURL}/studio`;

    // Preview Panel - desktop layout
    this.previewPanel = page.locator('div[class*="w-[70%]"]').filter({ hasText: '' }).first();
    this.teleprompterText = page.locator('[data-testid="teleprompter-text"]');
    this.backgroundImage = page.locator('.absolute.inset-0.bg-cover.bg-center').first();
    this.loadingIndicator = page.locator('[data-testid="loading-indicator"]');
    this.errorIndicator = page.locator('[data-testid="error-indicator"]');
    this.fullPreviewTrigger = page.locator('button[aria-label*="preview" i], button[title*="preview" i]');

    // Full Preview Dialog
    this.fullPreviewDialog = page.locator('[role="dialog"]').filter({ hasText: '' });
    this.fullPreviewTeleprompterText = this.fullPreviewDialog.locator('[data-testid="teleprompter-text"]');
    this.fullPreviewBackgroundImage = this.fullPreviewDialog.locator('.absolute.inset-0.bg-cover.bg-center');
    this.fullPreviewLoadingIndicator = this.fullPreviewDialog.locator('[data-testid="loading-indicator"]');
    this.fullPreviewErrorIndicator = this.fullPreviewDialog.locator('[data-testid="error-indicator"]');

    // Config Panel and Content Editor
    this.configPanel = page.locator('[data-testid="config-panel"], .w-\\/30, .w-\\[30\\%\\]');
    this.contentEditor = page.locator('textarea[data-testid="content-editor"], textarea');
  }

  /**
   * Navigate to the studio page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.url);
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for the studio page to be initialized
   */
  async waitForReady(): Promise<void> {
    // Wait for preview panel to be visible
    await expect(this.previewPanel).toBeVisible();
    // Wait for teleprompter text to be rendered
    await expect(this.teleprompterText.first()).toBeVisible();
  }

  /**
   * Get the current text content from the editor
   */
  async getEditorText(): Promise<string> {
    const editor = this.contentEditor.first();
    await expect(editor).toBeVisible();
    return await editor.inputValue();
  }

  /**
   * Set the text content in the editor
   */
  async setEditorText(text: string): Promise<void> {
    const editor = this.contentEditor.first();
    await expect(editor).toBeVisible();
    await editor.fill(text);
    // Wait for state to propagate
    await this.page.waitForTimeout(100);
  }

  /**
   * Get the background URL from PreviewPanel
   */
  async getPreviewBackgroundUrl(): Promise<string | null> {
    const bgElement = this.backgroundImage.first();
    const style = await bgElement.getAttribute('style');
    if (!style) return null;
    const match = style.match(/url\(['"]?(.+?)['"]?\)/);
    return match ? match[1] : null;
  }

  /**
   * Get the background URL from FullPreviewDialog
   */
  async getFullPreviewBackgroundUrl(): Promise<string | null> {
    const bgElement = this.fullPreviewBackgroundImage.first();
    const style = await bgElement.getAttribute('style');
    if (!style) return null;
    const match = style.match(/url\(['"]?(.+?)['"]?\)/);
    return match ? match[1] : null;
  }

  /**
   * Check if loading indicator is visible in PreviewPanel
   */
  async isPreviewLoading(): Promise<boolean> {
    return await this.loadingIndicator.isVisible().catch(() => false);
  }

  /**
   * Check if loading indicator is visible in FullPreviewDialog
   */
  async isFullPreviewLoading(): Promise<boolean> {
    return await this.fullPreviewLoadingIndicator.isVisible().catch(() => false);
  }

  /**
   * Check if error indicator is visible in PreviewPanel
   */
  async isPreviewError(): Promise<boolean> {
    return await this.errorIndicator.isVisible().catch(() => false);
  }

  /**
   * Check if error indicator is visible in FullPreviewDialog
   */
  async isFullPreviewError(): Promise<boolean> {
    return await this.fullPreviewErrorIndicator.isVisible().catch(() => false);
  }

  /**
   * Get error message from PreviewPanel
   */
  async getPreviewErrorMessage(): Promise<string> {
    const errorMsg = this.errorIndicator.locator('[data-testid="error-message"]');
    return await errorMsg.textContent() || '';
  }

  /**
   * Get error message from FullPreviewDialog
   */
  async getFullPreviewErrorMessage(): Promise<string> {
    const errorMsg = this.fullPreviewErrorIndicator.locator('[data-testid="error-message"]');
    return await errorMsg.textContent() || '';
  }

  /**
   * Open the Full Preview Dialog
   */
  async openFullPreview(): Promise<void> {
    await this.fullPreviewTrigger.click();
    // Wait for dialog to open
    await expect(this.fullPreviewDialog).toBeVisible();
    // Wait for teleprompter text to be rendered in dialog
    await expect(this.fullPreviewTeleprompterText.first()).toBeVisible();
  }

  /**
   * Close the Full Preview Dialog
   */
  async closeFullPreview(): Promise<void> {
    // Try clicking the close button or pressing Escape
    const closeButton = this.fullPreviewDialog.locator('button[aria-label*="close" i]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    } else {
      await this.page.keyboard.press('Escape');
    }
    // Wait for dialog to close
    await expect(this.fullPreviewDialog).not.toBeVisible();
  }

  /**
   * Get the computed text style from PreviewPanel
   */
  async getPreviewTextStyle(): Promise<{
    fontFamily: string;
    fontSize: string;
    color: string;
    textAlign: string;
  }> {
    const textElement = this.teleprompterText.first();
    return await textElement.evaluate((el) => ({
      fontFamily: window.getComputedStyle(el).fontFamily,
      fontSize: window.getComputedStyle(el).fontSize,
      color: window.getComputedStyle(el).color,
      textAlign: window.getComputedStyle(el).textAlign,
    }));
  }

  /**
   * Get the computed text style from FullPreviewDialog
   */
  async getFullPreviewTextStyle(): Promise<{
    fontFamily: string;
    fontSize: string;
    color: string;
    textAlign: string;
  }> {
    const textElement = this.fullPreviewTeleprompterText.first();
    return await textElement.evaluate((el) => ({
      fontFamily: window.getComputedStyle(el).fontFamily,
      fontSize: window.getComputedStyle(el).fontSize,
      color: window.getComputedStyle(el).color,
      textAlign: window.getComputedStyle(el).textAlign,
    }));
  }

  /**
   * Wait for background to load (no loading state)
   */
  async waitForBackgroundLoad(): Promise<void> {
    await this.page.waitForTimeout(300); // Wait for transition
    // Verify loading is no longer visible
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 5000 }).catch(() => {
      // Loading indicator might not be present at all
    });
  }

  /**
   * Trigger keyboard shortcut for full preview (Ctrl/Cmd + \)
   */
  async triggerFullPreviewShortcut(): Promise<void> {
    const isMac = await this.page.evaluate(() => navigator.platform.includes('Mac'));
    const modifier = isMac ? 'Meta' : 'Control';
    await this.page.keyboard.press(`${modifier}+\\`);
    // Wait for dialog to open
    await expect(this.fullPreviewDialog).toBeVisible();
  }

  /**
   * Clear localStorage and reload the page
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await this.page.reload();
    await this.waitForReady();
  }

  /**
   * Mock localStorage with a specific draft
   */
  async mockStorage(draft: { text: string; bgUrl?: string }): Promise<void> {
    await this.page.evaluate((data) => {
      localStorage.setItem('teleprompter-draft', JSON.stringify(data));
    }, draft);
    await this.page.reload();
    await this.waitForReady();
  }

  /**
   * Take a screenshot of the preview panel
   */
  async screenshotPreviewPanel(path: string): Promise<void> {
    await this.previewPanel.screenshot({ path });
  }

  /**
   * Take a screenshot of the full preview dialog
   */
  async screenshotFullPreview(path: string): Promise<void> {
    await this.fullPreviewDialog.screenshot({ path });
  }

  /**
   * Get number of renders from console (for performance testing)
   * This requires console.log instrumentation in the app
   */
  async getRenderCount(): Promise<number> {
    const renderCount = await this.page.evaluate(() => {
      // Custom property for testing
      return (window as Window & { __previewRenderCount?: number }).__previewRenderCount || 0;
    });
    return renderCount;
  }
}
