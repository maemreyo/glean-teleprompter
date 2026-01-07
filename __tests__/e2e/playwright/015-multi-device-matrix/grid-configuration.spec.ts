/**
 * E2E tests for grid layout configuration
 * @feature 015-multi-device-matrix
 */

import { test, expect } from '@playwright/test';

test.describe('Grid Configuration', () => {
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

  test('should display grid configuration panel', async ({ page }) => {
    const configPanel = page.locator('.grid-configuration').or(
      page.locator('[data-testid="grid-configuration"]')
    );

    await expect(configPanel).toBeVisible();
  });

  test('should display grid layout selector', async ({ page }) => {
    const gridSelector = page.locator('#grid-config-select').or(
      page.locator('select[aria-label="Select grid configuration"]')
    );

    await expect(gridSelector).toBeVisible();
  });

  test('should change grid layout to 1x', async ({ page }) => {
    const gridSelector = page.locator('#grid-config-select').or(
      page.locator('select[aria-label="Select grid configuration"]')
    );

    await gridSelector.selectOption('1x');
    await page.waitForTimeout(500);

    // Verify only 1 device frame or empty slot is visible
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );
    const emptySlots = page.locator('.empty-slot');

    const totalSlots = await deviceFrames.count() + await emptySlots.count();
    expect(totalSlots).toBe(1);
  });

  test('should change grid layout to 2x', async ({ page }) => {
    const gridSelector = page.locator('#grid-config-select').or(
      page.locator('select[aria-label="Select grid configuration"]')
    );

    await gridSelector.selectOption('2x');
    await page.waitForTimeout(500);

    // Verify 2 slots are visible
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );
    const emptySlots = page.locator('.empty-slot');

    const totalSlots = await deviceFrames.count() + await emptySlots.count();
    expect(totalSlots).toBe(2);
  });

  test('should change grid layout to 2x2', async ({ page }) => {
    const gridSelector = page.locator('#grid-config-select').or(
      page.locator('select[aria-label="Select grid configuration"]')
    );

    await gridSelector.selectOption('2x2');
    await page.waitForTimeout(500);

    // Verify 4 slots are visible
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );
    const emptySlots = page.locator('.empty-slot');

    const totalSlots = await deviceFrames.count() + await emptySlots.count();
    expect(totalSlots).toBe(4);
  });

  test('should change grid layout to 3x2', async ({ page }) => {
    const gridSelector = page.locator('#grid-config-select').or(
      page.locator('select[aria-label="Select grid configuration"]')
    );

    await gridSelector.selectOption('3x2');
    await page.waitForTimeout(500);

    // Verify 6 slots are visible
    const deviceFrames = page.locator('[data-testid^="device-frame-"]').or(
      page.locator('.device-frame')
    );
    const emptySlots = page.locator('.empty-slot');

    const totalSlots = await deviceFrames.count() + await emptySlots.count();
    expect(totalSlots).toBe(6);
  });

  test('should persist grid configuration across page refresh', async ({ page }) => {
    const gridSelector = page.locator('#grid-config-select').or(
      page.locator('select[aria-label="Select grid configuration"]')
    );

    // Change to 2x2
    await gridSelector.selectOption('2x2');
    await page.waitForTimeout(500);

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Re-open settings
    const settingsButton = page.locator('button:has-text("Settings")').or(
      page.locator('[aria-label="Show grid configuration"]')
    );
    await settingsButton.click();
    await page.waitForTimeout(300);

    // Verify configuration is preserved
    const value = await gridSelector.inputValue();
    expect(value).toBe('2x2');
  });

  test('should display device type checklist', async ({ page }) => {
    const deviceChecklist = page.locator('.device-type-checklist').or(
      page.locator('[data-testid="device-type-checklist"]')
    );

    await expect(deviceChecklist).toBeVisible();

    // Check for device checkboxes
    const deviceCheckboxes = page.locator('input[type="checkbox"][id^="device-"]');
    const count = await deviceCheckboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display memory usage indicator', async ({ page }) => {
    const memoryDisplay = page.locator('.memory-usage-display').or(
      page.locator('[data-testid="memory-usage-display"]')
    );

    await expect(memoryDisplay).toBeVisible();

    // Check for progress bar
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('should show empty slots when devices < grid slots', async ({ page }) => {
    const gridSelector = page.locator('#grid-config-select').or(
      page.locator('select[aria-label="Select grid configuration"]')
    );

    // Select 3x2 grid (6 slots)
    await gridSelector.selectOption('3x2');
    await page.waitForTimeout(500);

    // Uncheck some devices to create empty slots
    const deviceCheckbox = page.locator('input[type="checkbox"]#device-desktop');
    if (await deviceCheckbox.count() > 0) {
      await deviceCheckbox.uncheck();
      await page.waitForTimeout(300);
    }

    // Verify empty slots are shown
    const emptySlots = page.locator('.empty-slot');
    const emptySlotCount = await emptySlots.count();
    expect(emptySlotCount).toBeGreaterThan(0);
  });
});
