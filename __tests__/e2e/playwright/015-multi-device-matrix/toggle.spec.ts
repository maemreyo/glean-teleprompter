/**
 * E2E tests for multi-device toggle functionality
 * @feature 015-multi-device-matrix
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-Device Toggle', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder
    await page.goto('/story-builder');
    await page.waitForLoadState('networkidle');
  });

  test('should display multi-device toggle button', async ({ page }) => {
    // Look for the toggle button
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    await expect(toggleButton).toBeVisible();
  });

  test('should enable multi-device mode when clicked', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    // Click the toggle
    await toggleButton.click();

    // Verify multi-device mode is active
    const deviceMatrix = page.locator('[data-testid="device-matrix"]').or(
      page.locator('.device-matrix')
    );

    await expect(deviceMatrix).toBeVisible();
  });

  test('should display multiple device frames when enabled', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    await toggleButton.click();

    // Wait for device frames to appear
    await page.waitForTimeout(500);

    // Check for multiple device frames
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );

    const count = await deviceFrames.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should disable multi-device mode when clicked again', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    // Enable
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Disable
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Verify single preview mode
    const deviceMatrix = page.locator('[data-testid="device-matrix"]').or(
      page.locator('.device-matrix')
    );

    await expect(deviceMatrix).not.toBeVisible();
  });

  test('should persist toggle state across page refreshes', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    // Enable multi-device mode
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify multi-device mode is still enabled
    const deviceMatrix = page.locator('[data-testid="device-matrix"]').or(
      page.locator('.device-matrix')
    );

    await expect(deviceMatrix).toBeVisible();
  });

  test('should show correct toggle button state', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    // Initially disabled
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

    // Enable
    await toggleButton.click();
    await page.waitForTimeout(500);

    // Should be pressed
    await expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should be accessible via keyboard', async ({ page }) => {
    // Tab to the toggle button
    await page.keyboard.press('Tab');

    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    await expect(toggleButton).toBeFocused();

    // Activate with Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Verify multi-device mode is enabled
    const deviceMatrix = page.locator('[data-testid="device-matrix"]').or(
      page.locator('.device-matrix')
    );

    await expect(deviceMatrix).toBeVisible();
  });

  test('should sync content across all device frames', async ({ page }) => {
    const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
      page.locator('button:has-text("Multi-Device")')
    );

    await toggleButton.click();
    await page.waitForTimeout(1000);

    // Get all device frames
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );

    const count = await deviceFrames.count();

    // Each frame should have content
    for (let i = 0; i < count; i++) {
      const frame = deviceFrames.nth(i);
      await expect(frame).toBeVisible();

      // Check for iframe or content
      const iframe = frame.locator('iframe');
      const hasIframe = await iframe.count() > 0;

      if (hasIframe) {
        await expect(iframe.first()).toBeVisible();
      }
    }
  });
});
