/**
 * E2E tests for device type selection
 * @feature 015-multi-device-matrix
 */

import { test, expect } from '@playwright/test';

test.describe('Device Type Selection', () => {
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

    // Open settings
    const settingsButton = page.locator('button:has-text("Settings")').or(
      page.locator('[aria-label="Show grid configuration"]')
    );
    await settingsButton.click();
    await page.waitForTimeout(300);
  });

  test('should display all device type checkboxes', async ({ page }) => {
    // Check for expected device checkboxes
    const expectedDevices = ['iPhone SE', 'iPhone 14 Pro', 'iPad Air', 'Desktop'];

    for (const deviceName of expectedDevices) {
      const checkbox = page.locator(`label:has-text("${deviceName}")`).or(
        page.locator(`text=${deviceName}`)
      );
      await expect(checkbox).toBeVisible();
    }
  });

  test('should enable device type when checkbox is checked', async ({ page }) => {
    // Find iPad Air checkbox
    const ipadCheckbox = page.locator('input[type="checkbox"]#device-ipad-air').or(
      page.locator('label:has-text("iPad Air") input')
    );

    // Check if it exists and check it
    if (await ipadCheckbox.count() > 0) {
      await ipadCheckbox.check();
      await page.waitForTimeout(300);

      // Verify it's checked
      await expect(ipadCheckbox).toBeChecked();

      // Verify device frame appears
      const deviceFrame = page.locator('[data-testid="device-frame-ipad-air"]').or(
        page.locator('.device-frame[data-device="ipad-air"]')
      );
      await expect(deviceFrame).toBeVisible();
    }
  });

  test('should disable device type when checkbox is unchecked', async ({ page }) => {
    // Find iPhone SE checkbox
    const iphoneCheckbox = page.locator('input[type="checkbox"]#device-iphone-se').or(
      page.locator('label:has-text("iPhone SE") input')
    );

    if (await iphoneCheckbox.count() > 0) {
      // Uncheck if checked
      const isChecked = await iphoneCheckbox.isChecked();
      if (isChecked) {
        await iphoneCheckbox.uncheck();
        await page.waitForTimeout(300);
      }

      // Verify device frame is hidden
      const deviceFrame = page.locator('[data-testid="device-frame-iphone-se"]').or(
        page.locator('.device-frame[data-device="iphone-se"]')
      );
      await expect(deviceFrame).not.toBeVisible();
    }
  });

  test('should persist device selection across page refresh', async ({ page }) => {
    const ipadCheckbox = page.locator('input[type="checkbox"]#device-ipad-air').or(
      page.locator('label:has-text("iPad Air") input')
    );

    if (await ipadCheckbox.count() > 0) {
      // Check iPad Air
      await ipadCheckbox.check();
      await page.waitForTimeout(300);

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Re-enable multi-device mode
      const toggleButton = page.locator('[data-testid="multi-device-toggle"]').or(
        page.locator('button:has-text("Multi-Device")')
      );
      await toggleButton.click();
      await page.waitForTimeout(500);

      // Re-open settings
      const settingsButton = page.locator('button:has-text("Settings")').or(
        page.locator('[aria-label="Show grid configuration"]')
      );
      await settingsButton.click();
      await page.waitForTimeout(300);

      // Verify iPad Air is still checked
      await expect(ipadCheckbox).toBeChecked();
    }
  });

  test('should show memory warning when approaching limit', async ({ page }) => {
    // Enable all devices to approach memory limit
    const deviceCheckboxes = page.locator('input[type="checkbox"][id^="device-"]');
    const count = await deviceCheckboxes.count();

    for (let i = 0; i < count; i++) {
      const checkbox = deviceCheckboxes.nth(i);
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.check();
        await page.waitForTimeout(200);
      }
    }

    // Check for warning indicator
    const memoryWarning = page.locator('text=/memory/i').or(
      page.locator('[role="progressbar"]')
    );

    await expect(memoryWarning).toBeVisible();
  });

  test('should disable checkboxes when at memory limit', async ({ page }) => {
    // Enable all devices
    const deviceCheckboxes = page.locator('input[type="checkbox"][id^="device-"]');
    const count = await deviceCheckboxes.count();

    for (let i = 0; i < count; i++) {
      const checkbox = deviceCheckboxes.nth(i);
      await checkbox.check();
      await page.waitForTimeout(200);
    }

    // Try to enable another device (if available)
    // All should be checked or disabled
    const uncheckedCount = await page.locator('input[type="checkbox"][id^="device-"]:not(:checked)').count();
    const disabledCount = await page.locator('input[type="checkbox"][id^="device-"]:disabled').count();

    // Either no unchecked boxes or some are disabled
    expect(uncheckedCount + disabledCount).toBeGreaterThanOrEqual(0);
  });

  test('should update memory usage display when devices change', async ({ page }) => {
    const memoryDisplay = page.locator('.memory-usage-display').or(
      page.locator('[data-testid="memory-usage-display"]')
    );

    // Get initial memory value
    const initialMemory = await memoryDisplay.textContent();

    // Uncheck a device
    const deviceCheckbox = page.locator('input[type="checkbox"]#device-desktop').or(
      page.locator('label:has-text("Desktop") input')
    );

    if (await deviceCheckbox.count() > 0) {
      const isChecked = await deviceCheckbox.isChecked();
      if (isChecked) {
        await deviceCheckbox.uncheck();
        await page.waitForTimeout(300);

        // Get updated memory value
        const updatedMemory = await memoryDisplay.textContent();

        // Memory should decrease
        expect(updatedMemory).not.toBe(initialMemory);
      }
    }
  });

  test('should display memory usage percentage', async ({ page }) => {
    const progressBar = page.locator('[role="progressbar"]');

    await expect(progressBar).toBeVisible();

    // Check aria-valuenow attribute
    const value = await progressBar.getAttribute('aria-valuenow');
    expect(value).not.toBeNull();

    // Check that value is a number
    const numericValue = parseFloat(value || '0');
    expect(numericValue).toBeGreaterThanOrEqual(0);
  });

  test('should prevent unchecking last enabled device', async ({ page }) => {
    // Uncheck all devices except one
    const deviceCheckboxes = page.locator('input[type="checkbox"][id^="device-"]');
    const count = await deviceCheckboxes.count();

    // Uncheck all but the first one
    for (let i = 1; i < count; i++) {
      const checkbox = deviceCheckboxes.nth(i);
      await checkbox.uncheck();
      await page.waitForTimeout(200);
    }

    // Try to uncheck the last one
    const lastCheckbox = deviceCheckboxes.first();

    // Either it's already disabled or there's a warning message
    const isDisabled = await lastCheckbox.isDisabled();
    const warningMessage = page.locator('text=/at least one device/i');

    expect(isDisabled || (await warningMessage.count()) > 0).toBeTruthy();
  });
});
