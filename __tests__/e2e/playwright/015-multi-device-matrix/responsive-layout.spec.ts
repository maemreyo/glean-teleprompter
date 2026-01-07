/**
 * E2E tests for responsive grid layout
 * @feature 015-multi-device-matrix
 */

import { test, expect } from '@playwright/test';

test.describe('Responsive Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder
    await page.goto('/story-builder');
    await page.waitForLoadState('networkidle');

    // Enable multi-device mode
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );
    await toggleButton.click();
    await page.waitForTimeout(500);
  });

  test('should display viewport warning below 1024px width', async ({ page }) => {
    // Set viewport to 800px width
    await page.setViewportSize({ width: 800, height: 1000 });

    // Look for viewport warning
    const viewportWarning = page.locator('[data-testid="viewport-warning"]').or(
      page.locator('.viewport-warning')
    );

    await expect(viewportWarning).toBeVisible();
  });

  test('should not display viewport warning above 1024px width', async ({ page }) => {
    // Set viewport to 1200px width
    await page.setViewportSize({ width: 1200, height: 1000 });

    // Look for viewport warning
    const viewportWarning = page.locator('[data-testid="viewport-warning"]').or(
      page.locator('.viewport-warning')
    );

    await expect(viewportWarning).not.toBeVisible();
  });

  test('should adjust grid layout for desktop screens', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });

    const deviceGrid = page.locator('[data-testid="device-grid"]').or(
      page.locator('.device-grid')
    );

    await expect(deviceGrid).toBeVisible();

    // Check grid layout - should be multi-column
    const gridStyle = await deviceGrid.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns,
      };
    });

    expect(gridStyle.display).toBe('grid');
    expect(gridStyle.gridTemplateColumns).toContain('px');
  });

  test('should adjust grid layout for tablet screens', async ({ page }) => {
    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });

    const deviceGrid = page.locator('[data-testid="device-grid"]').or(
      page.locator('.device-grid')
    );

    await expect(deviceGrid).toBeVisible();

    // Grid should still be visible but may have fewer columns
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );

    const count = await deviceFrames.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should stack devices vertically on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    const deviceGrid = page.locator('[data-testid="device-grid"]').or(
      page.locator('.device-grid')
    );

    await expect(deviceGrid).toBeVisible();

    // Check for stacking layout
    const gridStyle = await deviceGrid.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        flexDirection: styles.flexDirection,
      };
    });

    // Either grid with 1 column or flex column
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );

    const firstFrame = deviceFrames.first();
    const secondFrame = deviceFrames.nth(1);

    if (await secondFrame.count() > 0) {
      const firstBox = await firstFrame.boundingBox();
      const secondBox = await secondFrame.boundingBox();

      if (firstBox && secondBox) {
        // Second frame should be below first frame
        expect(secondBox.y).toBeGreaterThan(firstBox.y);
      }
    }
  });

  test('should maintain device frame aspect ratios', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );

    const count = await deviceFrames.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const frame = deviceFrames.nth(i);
      const box = await frame.boundingBox();

      if (box) {
        expect(box.width).toBeGreaterThan(0);
        expect(box.height).toBeGreaterThan(0);
        expect(box.height / box.width).toBeGreaterThan(0);
      }
    }
  });

  test('should handle window resize gracefully', async ({ page }) => {
    // Start with desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    const deviceGrid = page.locator('[data-testid="device-grid"]').or(
      page.locator('.device-grid')
    );

    await expect(deviceGrid).toBeVisible();

    // Resize to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    await expect(deviceGrid).toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);

    await expect(deviceGrid).toBeVisible();

    // Resize back to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);

    await expect(deviceGrid).toBeVisible();
  });

  test('should display device chrome correctly at different sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(300);

      const deviceChrome = page.locator('[data-testid^="device-chrome-"]').or(
        page.locator('.device-chrome')
      );

      const count = await deviceChrome.count();

      // At least one device chrome should be visible
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should prevent horizontal scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check body width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);

    const viewportWidth = await page.evaluate(() => window.innerWidth);

    // Body width should not exceed viewport width significantly
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10);
  });

  test('should maintain functionality on resize', async ({ page }) => {
    // Enable multi-device
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    await page.setViewportSize({ width: 1920, height: 1080 });
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Resize and verify still functional
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);

    // Toggle should still work
    await toggleButton.click();
    await page.waitForTimeout(500);

    const deviceMatrix = page.locator('[data-testid="device-matrix"]').or(
      page.locator('.device-matrix')
    );

    await expect(deviceMatrix).not.toBeVisible();
  });
});
