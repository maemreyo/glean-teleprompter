import { test, expect } from '@playwright/test';
import { StudioPage } from '../helpers/studio-page';
import { StoreHelper } from '../helpers/store-helpers';
import { verifyBackgroundConsistency, TEST_DATA } from '../helpers/preview-helpers';

/**
 * Feature 009-fix-preview: Background Consistency Tests
 * 
 * Tests T039-T040: Background display consistency between PreviewPanel and FullPreviewDialog
 * 
 * @see plans/playwright-e2e-tests-009-fix-preview.md
 */

test.describe('Feature 009-fix-preview: Background Consistency (T039-T040)', () => {
  let studioPage: StudioPage;

  test.beforeEach(async ({ page }) => {
    studioPage = new StudioPage(page);
    await studioPage.goto();
    await studioPage.waitForReady();
  });

  test.afterEach(async ({ page }) => {
    // Clean up: reset store state
    await page.evaluate(() => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        const state = store.getState();
        state?.reset?.();
      }
    });
  });

  /**
   * T039: Default background displays correctly in both previews
   * 
   * Verify that:
   * - Default background URL is used: https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe
   * - Background displays in PreviewPanel
   * - Background displays in FullPreviewDialog
   * - Both backgrounds match
   */
  test('T039: should display default background in both PreviewPanel and FullPreviewDialog', async ({ page }) => {
    // Get default background URL from store
    const defaultBgUrl = TEST_DATA.defaultBackgroundUrl;
    expect(defaultBgUrl).toBe('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe');

    // Verify background consistency using helper
    const consistency = await verifyBackgroundConsistency(studioPage);

    // Assert backgrounds match
    expect(consistency.isConsistent).toBe(true);
    expect(consistency.previewBackgroundUrl).toContain(defaultBgUrl);
    expect(consistency.fullPreviewBackgroundUrl).toContain(defaultBgUrl);

    // Take screenshots for visual verification
    const screenshotDir = '__tests__/e2e/playwright/screenshots/009-fix-preview/default-background';
    await studioPage.screenshotPreviewPanel(`${screenshotDir}/preview-panel.png`);
    
    await studioPage.openFullPreview();
    await studioPage.screenshotFullPreview(`${screenshotDir}/full-preview-dialog.png`);
    await studioPage.closeFullPreview();

    // Verify no console errors
    const consoleErrors = page.evaluate(() => {
      return (window as any).__consoleErrors || [];
    });
    expect(await consoleErrors).toEqual([]);
  });

  /**
   * T039: Verify default background has correct styles
   * 
   * Check that:
   * - Background covers entire preview area (bg-cover)
   * - Background is centered (bg-center)
   * - Opacity is applied correctly
   */
  test('T039: should apply correct styles to default background', async ({ page }) => {
    const previewPanel = studioPage.previewPanel.first();
    
    // Get computed styles of background element
    const backgroundStyles = await previewPanel.evaluate((el) => {
      const bg = el.querySelector('[data-testid="preview-background"]');
      if (!bg) return null;
      const computed = window.getComputedStyle(bg);
      return {
        backgroundSize: computed.backgroundSize,
        backgroundPosition: computed.backgroundPosition,
        backgroundRepeat: computed.backgroundRepeat,
        opacity: computed.opacity,
      };
    });

    // Verify background styles
    expect(backgroundStyles).not.toBeNull();
    expect(backgroundStyles?.backgroundSize).toBe('cover');
    expect(backgroundStyles?.backgroundPosition).toBe('center');
    expect(backgroundStyles?.backgroundRepeat).toBe('no-repeat');
    expect(parseFloat(backgroundStyles?.opacity || '0')).toBeGreaterThan(0);
  });

  /**
   * T040: Custom background displays correctly in both previews
   * 
   * Verify that:
   * - Custom background URL is set in store
   * - Custom background displays in PreviewPanel
   * - Custom background displays in FullPreviewDialog
   * - Both backgrounds match
   */
  test('T040: should display custom background in both PreviewPanel and FullPreviewDialog', async ({ page }) => {
    // Set custom background URL
    const customBgUrl = TEST_DATA.validBackgroundUrls.mountain;
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, customBgUrl);

    // Wait for background to update
    await page.waitForTimeout(200);

    // Verify background consistency using helper
    const consistency = await verifyBackgroundConsistency(studioPage);

    // Assert backgrounds match and contain custom URL
    expect(consistency.isConsistent).toBe(true);
    expect(consistency.previewBackgroundUrl).toContain(customBgUrl);
    expect(consistency.fullPreviewBackgroundUrl).toContain(customBgUrl);

    // Take screenshots for visual verification
    const screenshotDir = '__tests__/e2e/playwright/screenshots/009-fix-preview/custom-background';
    await studioPage.screenshotPreviewPanel(`${screenshotDir}/preview-panel.png`);
    
    await studioPage.openFullPreview();
    await studioPage.screenshotFullPreview(`${screenshotDir}/full-preview-dialog.png`);
    await studioPage.closeFullPreview();
  });

  /**
   * T040: Multiple custom backgrounds switch correctly
   * 
   * Verify that:
   * - Multiple custom backgrounds can be set
   * - Each background displays correctly in both previews
   * - Backgrounds switch without visual artifacts
   */
  test('T040: should switch between multiple custom backgrounds correctly', async ({ page }) => {
    const testUrls = [
      TEST_DATA.validBackgroundUrls.mountain,
      TEST_DATA.validBackgroundUrls.nature,
      TEST_DATA.defaultBackgroundUrl,
    ];

    for (let i = 0; i < testUrls.length; i++) {
      const url = testUrls[i];
      
      // Set background URL
      await page.evaluate((bgUrl) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl });
        }
      }, url);

      // Wait for update
      await page.waitForTimeout(200);

      // Verify consistency
      const consistency = await verifyBackgroundConsistency(studioPage);
      
      expect(consistency.isConsistent).toBe(true);
      expect(consistency.previewBackgroundUrl).toContain(url);
      expect(consistency.fullPreviewBackgroundUrl).toContain(url);

      // Take screenshot for each background
      const screenshotDir = '__tests__/e2e/playwright/screenshots/009-fix-preview/background-switching';
      await studioPage.screenshotPreviewPanel(`${screenshotDir}/background-${i + 1}.png`);
    }
  });

  /**
   * T039-T040: Verify background URLs match between components
   * 
   * Direct comparison of background URLs from both components
   */
  test('should have matching background URLs between PreviewPanel and FullPreviewDialog', async ({ page }) => {
    const testCases = [
      TEST_DATA.defaultBackgroundUrl,
      TEST_DATA.validBackgroundUrls.mountain,
      TEST_DATA.validBackgroundUrls.nature,
    ];

    for (const url of testCases) {
      // Set background
      await page.evaluate((bgUrl) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl });
        }
      }, url);

      await page.waitForTimeout(200);

      // Get URLs from both components
      const previewBg = await studioPage.getPreviewBackgroundUrl();
      await studioPage.openFullPreview();
      const fullPreviewBg = await studioPage.getFullPreviewBackgroundUrl();
      await studioPage.closeFullPreview();

      // Direct comparison
      expect(previewBg).toBe(fullPreviewBg);
      expect(previewBg).toContain(url);
    }
  });

  /**
   * T039: Verify background renders with dark overlay
   * 
   * Check that the dark overlay (bg-black/30) is applied correctly
   */
  test('T039: should apply dark overlay to background', async ({ page }) => {
    const previewPanel = studioPage.previewPanel.first();
    
    // Check for overlay element
    const hasOverlay = await previewPanel.evaluate((el) => {
      // Look for elements with backdrop or overlay classes
      const children = el.querySelectorAll('[class*="bg-black"]');
      return children.length > 0;
    });

    expect(hasOverlay).toBe(true);
  });

  /**
   * T040: Custom background from Unsplash loads and displays
   * 
   * Verify that external Unsplash images load correctly
   */
  test('T040: should load external Unsplash images correctly', async ({ page }) => {
    const externalUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // Set background
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, externalUrl);

    // Wait for image load (monitor network)
    const loadPromise = page.waitForResponse(
      (response) => response.url().includes('unsplash') && response.status() === 200
    );
    
    await Promise.race([
      loadPromise,
      page.waitForTimeout(5000), // 5 second timeout
    ]);

    // Verify loading indicator is not visible
    const isLoading = await studioPage.isPreviewLoading();
    expect(isLoading).toBe(false);

    // Verify no error
    const hasError = await studioPage.isPreviewError();
    expect(hasError).toBe(false);
  });

  /**
   * T039-T040: Background persistence across page reload
   * 
   * Verify that background settings persist after page reload
   */
  test('should persist background setting across page reload', async ({ page }) => {
    const customUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // Set background
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, customUrl);

    await page.waitForTimeout(200);

    // Get background before reload
    const bgBeforeReload = await studioPage.getPreviewBackgroundUrl();

    // Reload page
    await page.reload();
    await studioPage.waitForReady();

    // Get background after reload
    const bgAfterReload = await studioPage.getPreviewBackgroundUrl();

    // Verify persistence
    expect(bgBeforeReload).toContain(customUrl);
    expect(bgAfterReload).toContain(customUrl);
  });

  /**
   * T039: Verify background on different viewport sizes
   * 
   * Test responsive behavior
   */
  test('T039: should display default background correctly on different viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);

      // Verify background is still visible
      const bgUrl = await studioPage.getPreviewBackgroundUrl();
      expect(bgUrl).toContain(TEST_DATA.defaultBackgroundUrl);

      // Verify preview panel is visible
      await expect(studioPage.previewPanel.first()).toBeVisible();
    }
  });

  /**
   * T039-T040: No console errors with background changes
   * 
   * Ensure background operations don't produce console errors
   */
  test('should not produce console errors when changing backgrounds', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Change backgrounds multiple times
    const urls = [
      TEST_DATA.defaultBackgroundUrl,
      TEST_DATA.validBackgroundUrls.mountain,
      TEST_DATA.validBackgroundUrls.nature,
      TEST_DATA.defaultBackgroundUrl,
    ];

    for (const url of urls) {
      await page.evaluate((bgUrl) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl });
        }
      }, url);
      await page.waitForTimeout(200);
    }

    // Verify no errors
    expect(errors.filter(e => e.includes('background') || e.includes('image'))).toEqual([]);
  });
});
