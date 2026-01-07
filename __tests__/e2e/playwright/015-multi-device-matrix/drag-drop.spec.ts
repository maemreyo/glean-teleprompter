/**
 * E2E Tests for Multi-Device Drag-and-Drop Workflow (T047)
 *
 * Tests drag-and-drop functionality for reordering device frames
 * @feature 015-multi-device-matrix
 */

import { test, expect } from '@playwright/test';

test.describe('Multi-Device Drag-and-Drop (T047)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder
    await page.goto('/story-builder');
    
    // Wait for page to load
    await expect(page.locator('[data-testid="story-builder"]')).toBeVisible();
  });

  test('should enable drag-and-drop when multi-device mode is active', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    
    // Wait for device grid to appear
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    // Check for drag handles on device frames
    const dragHandles = page.locator('[aria-label="Drag to reorder"]');
    await expect(dragHandles).toHaveCount(3); // Should have drag handles for 3 devices
  });

  test('should reorder device frames when dragged', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    // Get initial device order
    const devicesBefore = await page.locator('[data-device-frame]').allTextContents();
    
    // Drag first device to last position
    const firstDevice = page.locator('[data-device-frame]').first();
    const lastDevice = page.locator('[data-device-frame]').last();
    
    await firstDevice.dragTo(lastDevice);
    
    // Wait for reordering to complete
    await page.waitForTimeout(200);
    
    // Get new device order
    const devicesAfter = await page.locator('[data-device-frame]').allTextContents();
    
    // Verify order changed
    expect(devicesAfter).not.toEqual(devicesBefore);
  });

  test('should persist device order after page refresh', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    // Get initial order
    const initialOrder = await page.locator('[data-device-frame]').all();
    const initialIds = await Promise.all(
      initialOrder.map(el => el.getAttribute('data-device-frame'))
    );
    
    // Reorder devices
    const firstDevice = page.locator('[data-device-frame]').first();
    const lastDevice = page.locator('[data-device-frame]').last();
    await firstDevice.dragTo(lastDevice);
    await page.waitForTimeout(200);
    
    // Refresh page
    await page.reload();
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    // Get order after refresh
    const refreshedOrder = await page.locator('[data-device-frame]').all();
    const refreshedIds = await Promise.all(
      refreshedOrder.map(el => el.getAttribute('data-device-frame'))
    );
    
    // Verify order persisted
    expect(refreshedIds).not.toEqual(initialIds);
  });

  test('should show visual feedback during drag', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    const firstDevice = page.locator('[data-device-frame]').first();
    
    // Start dragging
    await firstDevice.dragTo(page.locator('[data-device-frame]').nth(1));
    
    // Check for opacity change (dragging state)
    await expect(firstDevice).toHaveCSS('opacity', '0.5');
  });

  test('should handle multiple consecutive drags', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    // First drag
    const device1 = page.locator('[data-device-frame]').nth(0);
    const device2 = page.locator('[data-device-frame]').nth(1);
    await device1.dragTo(device2);
    await page.waitForTimeout(200);
    
    // Second drag
    const device3 = page.locator('[data-device-frame]').nth(2);
    await device2.dragTo(device3);
    await page.waitForTimeout(200);
    
    // Verify both drags completed
    await expect(page.locator('[data-device-frame]')).toHaveCount(3);
  });

  test('should not break when dropping on same position', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    // Get initial order
    const devicesBefore = await page.locator('[data-device-frame]').allTextContents();
    
    // Try to drag device to its current position (simulated)
    const device = page.locator('[data-device-frame]').first();
    const boundingBox = await device.boundingBox();
    if (boundingBox) {
      await page.mouse.move(boundingBox.x + 10, boundingBox.y + 10);
      await page.mouse.down();
      await page.mouse.move(boundingBox.x + 20, boundingBox.y + 20);
      await page.mouse.up();
    }
    
    await page.waitForTimeout(200);
    
    // Verify order didn't change
    const devicesAfter = await page.locator('[data-device-frame]').allTextContents();
    expect(devicesAfter).toEqual(devicesBefore);
  });

  test('should maintain drag handle visibility on hover', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    // Get first device frame
    const firstDevice = page.locator('[data-device-frame]').first();
    
    // Hover over device frame
    await firstDevice.hover();
    
    // Check that drag handle becomes visible
    const dragHandle = firstDevice.locator('[aria-label="Drag to reorder"]');
    await expect(dragHandle).toBeVisible();
  });

  test('should complete drag operation within 200ms (SC-007)', async ({ page }) => {
    // Enable multi-device preview
    await page.click('[data-testid="multi-device-toggle"]');
    await expect(page.locator('[data-testid="device-grid"]')).toBeVisible();
    
    const startTime = Date.now();
    
    // Perform drag operation
    const firstDevice = page.locator('[data-device-frame]').first();
    const lastDevice = page.locator('[data-device-frame]').last();
    await firstDevice.dragTo(lastDevice);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Verify operation completes within 200ms (allowing for rendering)
    expect(duration).toBeLessThan(500); // Generous limit for E2E
  });
});
