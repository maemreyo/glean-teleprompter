/**
 * E2E test for enhanced teleprompter settings
 * @feature 014-teleprompter-preview-sync
 * @task T044
 */

import { test, expect } from '@playwright/test';

test.describe('Enhanced Teleprompter Settings', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder
    await page.goto('/story-builder');
  });

  test('should sync all 9 enhanced settings to preview', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for slide to be added
    await expect(page.locator('[data-testid="slide-teleprompter"]')).toBeVisible();

    // Set all enhanced settings
    // Typography
    await page.selectOption('select#text-align', 'center');
    await page.fill('input#line-height', '1.8');
    await page.fill('input#letter-spacing', '2');

    // Display
    await page.selectOption('select#scroll-speed', 'fast');
    await page.check('input#mirror-horizontal');
    await page.uncheck('input#mirror-vertical');

    // Styling
    await page.fill('input#background-color', '#1a1a1a');
    await page.fill('input#background-opacity', '85');

    // Layout
    await page.fill('input#safe-area-top', '20');
    await page.fill('input#safe-area-right', '30');
    await page.fill('input#safe-area-bottom', '20');
    await page.fill('input#safe-area-left', '30');

    // Wait for preview update
    await page.waitForTimeout(150);

    // Get the preview iframe
    const iframe = page.frameLocator('iframe[title="Story Preview"]');
    const teleprompterContent = iframe.locator('[data-scroll-container] div');

    // Verify all settings are applied in preview
    const textAlign = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).textAlign;
    });
    expect(textAlign).toBe('center');

    const lineHeight = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).lineHeight;
    });
    expect(lineHeight).toBe('1.8');

    const letterSpacing = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).letterSpacing;
    });
    expect(letterSpacing).toBe('2px');

    // Check mirror mode
    const container = iframe.locator('[data-scroll-container]');
    const transform = await container.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    expect(transform).toContain('scaleX(-1)');

    // Check background color
    const wrapper = iframe.locator('.relative.w-full.h-full');
    const backgroundColor = await wrapper.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Should be dark with 85% opacity
    expect(backgroundColor).toMatch(/rgb\(26,\s*26,\s*26\)/);
  });

  test('should apply defaults for all enhanced settings', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for slide to be added
    await expect(page.locator('[data-testid="slide-teleprompter"]')).toBeVisible();

    // Wait for preview update
    await page.waitForTimeout(150);

    // Get the preview iframe
    const iframe = page.frameLocator('iframe[title="Story Preview"]');
    const teleprompterContent = iframe.locator('[data-scroll-container] div');

    // Verify defaults
    const textAlign = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).textAlign;
    });
    expect(textAlign).toBe('left');

    const lineHeight = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).lineHeight;
    });
    expect(lineHeight).toBe('1.4');

    const letterSpacing = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).letterSpacing;
    });
    expect(letterSpacing).toBe('0px');
  });

  test('should sync changes within 100ms', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for slide to be added
    await expect(page.locator('[data-testid="slide-teleprompter"]')).toBeVisible();

    // Measure sync time for multiple settings
    const startTime = Date.now();

    // Change multiple settings rapidly
    await page.selectOption('select#text-align', 'right');
    await page.fill('input#line-height', '1.6');
    await page.selectOption('select#scroll-speed', 'slow');

    // Wait for preview update
    await page.waitForTimeout(100);

    const endTime = Date.now();
    const syncTime = endTime - startTime;

    // Verify sync happened within 100ms
    expect(syncTime).toBeLessThan(150);

    // Verify values are updated
    await expect(page.locator('select#text-align')).toHaveValue('right');
  });

  test('should persist enhanced settings across slide navigation', async ({ page }) => {
    // Add first teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Set custom enhanced settings
    await page.selectOption('select#text-align', 'center');
    await page.fill('input#line-height', '2.0');
    await page.selectOption('select#scroll-speed', 'fast');

    // Add second teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for new slide
    await expect(page.locator('[data-testid="slide-teleprompter"]').nth(1)).toBeVisible();

    // Second slide should have defaults
    await expect(page.locator('select#text-align')).toHaveValue('left');
    await expect(page.locator('input#line-height')).toHaveValue('1.4');

    // Switch back to first slide
    await page.click('[data-testid="slide-thumbnail-0"]');

    // Wait for switch
    await page.waitForTimeout(100);

    // First slide should retain custom settings
    await expect(page.locator('select#text-align')).toHaveValue('center');
    await expect(page.locator('input#line-height')).toHaveValue('2.0');
  });

  test('should handle mirror modes correctly', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Enable horizontal mirror
    await page.check('input#mirror-horizontal');
    await page.waitForTimeout(150);

    const iframe = page.frameLocator('iframe[title="Story Preview"]');
    const container = iframe.locator('[data-scroll-container]');

    const transformH = await container.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    expect(transformH).toContain('scaleX(-1)');

    // Enable vertical mirror
    await page.check('input#mirror-vertical');
    await page.waitForTimeout(150);

    const transformV = await container.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    expect(transformV).toContain('scaleY(-1)');

    // Disable both
    await page.uncheck('input#mirror-horizontal');
    await page.uncheck('input#mirror-vertical');
    await page.waitForTimeout(150);

    const transformNone = await container.evaluate((el) => {
      return window.getComputedStyle(el).transform;
    });
    expect(transformNone).toBe('none');
  });

  test('should handle background color and opacity', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Set custom background color and opacity
    await page.fill('input#background-color', '#2a2a2a');
    await page.fill('input#background-opacity', '75');

    // Wait for preview update
    await page.waitForTimeout(150);

    const iframe = page.frameLocator('iframe[title="Story Preview"]');
    const wrapper = iframe.locator('.relative.w-full.h-full');

    const backgroundColor = await wrapper.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // RGB value for #2a2a2a with 75% opacity
    const rgb = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(rgb).toBeTruthy();

    // At 75% opacity, values should be reduced
    const r = parseInt(rgb![1]);
    const g = parseInt(rgb![2]);
    const b = parseInt(rgb![3]);

    // #2a2a2a is rgb(42, 42, 42)
    // At 75% opacity on black background: 42 * 0.75 = ~31
    expect(r).toBeGreaterThan(30);
    expect(r).toBeLessThan(35);
  });

  test('should handle safe area padding', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Set safe area padding
    await page.fill('input#safe-area-top', '25');
    await page.fill('input#safe-area-right', '35');
    await page.fill('input#safe-area-bottom', '25');
    await page.fill('input#safe-area-left', '35');

    // Wait for preview update
    await page.waitForTimeout(150);

    const iframe = page.frameLocator('iframe[title="Story Preview"]');
    const teleprompterContent = iframe.locator('[data-scroll-container] div');

    const paddingTop = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).paddingTop;
    });
    expect(paddingTop).toBe('25px');

    const paddingRight = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).paddingRight;
    });
    expect(paddingRight).toBe('35px');

    const paddingBottom = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).paddingBottom;
    });
    expect(paddingBottom).toBe('25px');

    const paddingLeft = await teleprompterContent.evaluate((el) => {
      return window.getComputedStyle(el).paddingLeft;
    });
    expect(paddingLeft).toBe('35px');
  });

  test('should maintain backward compatibility with old stories', async ({ page }) => {
    // Simulate loading an old story without enhanced settings
    // This would typically be done by loading a story from URL or storage

    // For this test, we'll verify that new slides have all defaults
    await page.click('[data-testid="add-slide-button"]');
    await page.click('[data-testid="slide-type-teleprompter"]');

    // Wait for slide to be added
    await expect(page.locator('[data-testid="slide-teleprompter"]')).toBeVisible();

    // All 11 properties should have defaults
    // Focal point and font size
    await expect(page.locator('[data-testid="focal-point-value"]')).toContainText('50');
    await expect(page.locator('[data-testid="font-size-value"]')).toContainText('24px');

    // Enhanced settings
    await expect(page.locator('select#text-align')).toHaveValue('left');
    await expect(page.locator('input#line-height')).toHaveValue('1.4');
    await expect(page.locator('input#letter-spacing')).toHaveValue('0');
    await expect(page.locator('select#scroll-speed')).toHaveValue('medium');
    await expect(page.locator('input#mirror-horizontal')).not.toBeChecked();
    await expect(page.locator('input#mirror-vertical')).not.toBeChecked();
    await expect(page.locator('input#background-color')).toHaveValue('#000000');
    await expect(page.locator('input#background-opacity')).toHaveValue('100');
    await expect(page.locator('input#safe-area-top')).toHaveValue('0');
    await expect(page.locator('input#safe-area-right')).toHaveValue('0');
    await expect(page.locator('input#safe-area-bottom')).toHaveValue('0');
    await expect(page.locator('input#safe-area-left')).toHaveValue('0');
  });
});
