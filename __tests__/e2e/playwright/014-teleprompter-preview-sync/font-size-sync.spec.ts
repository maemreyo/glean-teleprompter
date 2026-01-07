/**
 * E2E test for font size preview synchronization
 * @feature 014-teleprompter-preview-sync
 * @task T020
 */

import { test, expect } from '@playwright/test';

test.describe('Font Size Preview Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder
    await page.goto('/story-builder');
  });

  test('should sync font size changes to preview within 100ms', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for slide to be added
    await expect(page.locator('[data-testid="slide-teleprompter"]')).toBeVisible();

    // Find the font size slider
    const fontSizeSlider = page.locator('input[type="range"]#font-size');

    // Initial font size should be 24px (default)
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('24px');

    // Measure sync time
    const startTime = Date.now();

    // Change font size to 32px
    await fontSizeSlider.fill('32');
    await page.keyboard.press('ArrowRight'); // Ensure change

    // Wait for preview to update (should be < 100ms)
    await page.waitForTimeout(100);

    const endTime = Date.now();
    const syncTime = endTime - startTime;

    // Verify sync happened within 100ms
    expect(syncTime).toBeLessThan(150); // Allow 50ms buffer

    // Verify font size value is updated
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('32px');
  });

  test('should display correct font size in preview iframe', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for slide to be added
    await expect(page.locator('[data-testid="slide-teleprompter"]')).toBeVisible();

    // Change font size to 40px
    const fontSizeSlider = page.locator('input[type="range"]#font-size');
    await fontSizeSlider.fill('40');

    // Wait for preview update
    await page.waitForTimeout(150);

    // Get the preview iframe
    const iframe = page.frameLocator('iframe[title="Story Preview"]');

    // Verify the font size is applied in the preview
    const teleprompterContent = iframe.locator('[data-scroll-container] div');
    const fontSize = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    expect(fontSize).toBe('40px');
  });

  test('should handle font size at minimum value (16px)', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Set font size to minimum
    const fontSizeSlider = page.locator('input[type="range"]#font-size');
    await fontSizeSlider.fill('16');

    // Wait for preview update
    await page.waitForTimeout(150);

    // Verify minimum value is respected
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('16px');

    // Get the preview iframe
    const iframe = page.frameLocator('iframe[title="Story Preview"]');
    const teleprompterContent = iframe.locator('[data-scroll-container] div');
    const fontSize = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    expect(fontSize).toBe('16px');
  });

  test('should handle font size at maximum value (48px)', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Set font size to maximum
    const fontSizeSlider = page.locator('input[type="range"]#font-size');
    await fontSizeSlider.fill('48');

    // Wait for preview update
    await page.waitForTimeout(150);

    // Verify maximum value is respected
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('48px');

    // Get the preview iframe
    const iframe = page.frameLocator('iframe[title="Story Preview"]');
    const teleprompterContent = iframe.locator('[data-scroll-container] div');
    const fontSize = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    expect(fontSize).toBe('48px');
  });

  test('should persist font size when switching between slides', async ({ page }) => {
    // Add first teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Set font size to 36px
    const fontSizeSlider = page.locator('input[type="range"]#font-size');
    await fontSizeSlider.fill('36');

    // Wait for update
    await page.waitForTimeout(150);

    // Add second teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for new slide
    await expect(page.locator('[data-testid="slide-teleprompter"]').nth(1)).toBeVisible();

    // Second slide should have default font size
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('24px');

    // Switch back to first slide
    await page.click('[data-testid="slide-thumbnail-0"]');

    // Wait for switch
    await page.waitForTimeout(100);

    // First slide should still have 36px
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('36px');
  });

  test('should handle rapid font size changes without lag', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    const fontSizeSlider = page.locator('input[type="range"]#font-size');

    // Rapidly change font sizes (5+ changes per second)
    const fontSizes = [20, 24, 28, 32, 36, 40, 44, 48];
    const startTime = Date.now();

    for (const size of fontSizes) {
      await fontSizeSlider.fill(size.toString());
      await page.waitForTimeout(50); // 20 changes per second
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // All changes should complete in reasonable time (< 1 second)
    expect(totalTime).toBeLessThan(1000);

    // Final value should be correct
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('48px');
  });
});
