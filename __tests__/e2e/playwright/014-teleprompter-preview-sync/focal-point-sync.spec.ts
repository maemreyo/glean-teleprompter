/**
 * E2E tests for focal point real-time preview synchronization
 * @feature 014-teleprompter-preview-sync
 */

import { test, expect } from '@playwright/test';

test.describe('Focal Point Real-time Preview', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder
    await page.goto('/story-builder');
    
    // Wait for the page to load
    await expect(page.locator('[data-testid="story-builder"]')).toBeVisible();
  });

  test('should show focal point indicator in preview when adjusted in builder', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-teleprompter"]');
    
    // Wait for slide to be added
    await expect(page.locator('[data-testid="slide-0"]')).toBeVisible();
    
    // Adjust focal point slider to 75%
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    await focalPointSlider.click({ position: { x: 300, y: 0 } }); // Click near the end
    
    // Wait for preview to update
    await page.waitForTimeout(150); // 100ms debounce + buffer
    
    // Verify focal point value is displayed
    await expect(page.locator('[data-testid="focal-point-value"]')).toContainText('75');
    
    // Verify focal point indicator position in preview iframe
    const previewFrame = page.frameLocator('[data-testid="preview-frame"]');
    const indicator = previewFrame.locator('[data-testid="focal-point-indicator"]');
    
    // Check that indicator is visible
    await expect(indicator).toBeVisible();
    
    // Verify the indicator position (top style should be around 75vh)
    const indicatorTop = await indicator.getAttribute('style');
    expect(indicatorTop).toContain('top: 75vh');
  });

  test('should sync focal point changes within 100ms', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-teleprompter"]');
    await expect(page.locator('[data-testid="slide-0"]')).toBeVisible();
    
    // Start performance measurement
    const startTime = Date.now();
    
    // Adjust focal point slider
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    await focalPointSlider.click({ position: { x: 200, y: 0 } });
    
    // Wait for preview update
    const previewFrame = page.frameLocator('[data-testid="preview-frame"]');
    const indicator = previewFrame.locator('[data-testid="focal-point-indicator"]');
    
    // Poll for indicator update
    await indicator.waitFor({ state: 'visible', timeout: 500 });
    
    const endTime = Date.now();
    const syncTime = endTime - startTime;
    
    // Verify sync time is within 100ms target (with small buffer for test overhead)
    expect(syncTime).toBeLessThan(150);
  });

  test('should handle rapid focal point adjustments without lag', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-teleprompter"]');
    await expect(page.locator('[data-testid="slide-0"]')).toBeVisible();
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    const previewFrame = page.frameLocator('[data-testid="preview-frame"]');
    
    // Make 5 rapid adjustments
    const positions = [0, 25, 50, 75, 100];
    
    for (const pos of positions) {
      const startX = (pos / 100) * 300; // Assuming 300px slider width
      
      await focalPointSlider.click({ position: { x: startX, y: 0 } });
      
      // Small wait to allow debouncing
      await page.waitForTimeout(20);
    }
    
    // Wait for final update
    await page.waitForTimeout(150);
    
    // Verify final position is correct
    const indicator = previewFrame.locator('[data-testid="focal-point-indicator"]');
    const indicatorTop = await indicator.getAttribute('style');
    expect(indicatorTop).toContain('top: 100vh');
  });

  test('should persist focal point value when switching slides', async ({ page }) => {
    // Add first teleprompter slide
    await page.click('[data-testid="add-slide-teleprompter"]');
    await expect(page.locator('[data-testid="slide-0"]')).toBeVisible();
    
    // Set focal point to 60
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    await focalPointSlider.click({ position: { x: 180, y: 0 } });
    await page.waitForTimeout(150);
    
    // Add second teleprompter slide
    await page.click('[data-testid="add-slide-teleprompter"]');
    await expect(page.locator('[data-testid="slide-1"]')).toBeVisible();
    
    // Verify second slide has default focal point
    const focalPointValue1 = page.locator('[data-testid="focal-point-value"]');
    await expect(focalPointValue1).toContainText('50');
    
    // Switch back to first slide
    await page.click('[data-testid="slide-0"]');
    await page.waitForTimeout(100);
    
    // Verify first slide still has focal point of 60
    const focalPointValue0 = page.locator('[data-testid="focal-point-value"]');
    await expect(focalPointValue0).toContainText('60');
  });

  test('should handle boundary values (0 and 100) correctly', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-teleprompter"]');
    await expect(page.locator('[data-testid="slide-0"]')).toBeVisible();
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    const previewFrame = page.frameLocator('[data-testid="preview-frame"]');
    const indicator = previewFrame.locator('[data-testid="focal-point-indicator"]');
    
    // Test minimum value (0)
    await focalPointSlider.click({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(150);
    
    let indicatorTop = await indicator.getAttribute('style');
    expect(indicatorTop).toContain('top: 0vh');
    
    // Test maximum value (100)
    await focalPointSlider.click({ position: { x: 300, y: 0 } });
    await page.waitForTimeout(150);
    
    indicatorTop = await indicator.getAttribute('style');
    expect(indicatorTop).toContain('top: 100vh');
  });

  test('should update indicator position in real-time as slider is dragged', async ({ page }) => {
    // Add a teleprompter slide
    await page.click('[data-testid="add-slide-teleprompter"]');
    await expect(page.locator('[data-testid="slide-0"]')).toBeVisible();
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    const previewFrame = page.frameLocator('[data-testid="preview-frame"]');
    const indicator = previewFrame.locator('[data-testid="focal-point-indicator"]');
    
    // Drag slider from left to right
    const box = await focalPointSlider.boundingBox();
    if (!box) throw new Error('Slider not found');
    
    // Start drag
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await page.mouse.down();
    
    // Move to middle
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(50);
    
    // Check intermediate position
    let indicatorTop = await indicator.getAttribute('style');
    expect(indicatorTop).toMatch(/top: (4[5-5]|5[0-5])vh/); // Around 50vh
    
    // Move to end
    await page.mouse.move(box.x + box.width - 10, box.y + box.height / 2);
    await page.mouse.up();
    
    await page.waitForTimeout(150);
    
    // Check final position
    indicatorTop = await indicator.getAttribute('style');
    expect(indicatorTop).toContain('top: 100vh');
  });
});
