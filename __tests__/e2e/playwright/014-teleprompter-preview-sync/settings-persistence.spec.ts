/**
 * E2E tests for settings persistence across slide navigation
 * @feature 014-teleprompter-preview-sync
 */

import { test, expect } from '@playwright/test';

test.describe('Settings Persistence Across Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder
    await page.goto('/story-builder');
    
    // Wait for the page to load
    await expect(page.locator('[data-testid="story-builder"]')).toBeVisible();
  });

  test('should persist focalPoint when switching between teleprompter slides', async ({ page }) => {
    // Add two teleprompter slides
    await page.click('[data-testid="add-slide-teleprompter"]');
    await page.click('[data-testid="add-slide-teleprompter"]');
    
    // Set focal point on first slide to 40
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    await focalPointSlider.first().click({ position: { x: 120, y: 0 } });
    await page.waitForTimeout(150);
    
    let focalPointValue = page.locator('[data-testid="focal-point-value"]').first();
    await expect(focalPointValue).toContainText('40');
    
    // Switch to second slide
    await page.click('[data-testid="slide-1"]');
    await page.waitForTimeout(100);
    
    // Set focal point on second slide to 70
    await focalPointSlider.click({ position: { x: 210, y: 0 } });
    await page.waitForTimeout(150);
    
    focalPointValue = page.locator('[data-testid="focal-point-value"]');
    await expect(focalPointValue).toContainText('70');
    
    // Switch back to first slide
    await page.click('[data-testid="slide-0"]');
    await page.waitForTimeout(100);
    
    // Verify first slide still has focal point of 40
    focalPointValue = page.locator('[data-testid="focal-point-value"]').first();
    await expect(focalPointValue).toContainText('40');
  });

  test('should persist fontSize when switching between teleprompter slides', async ({ page }) => {
    // Add two teleprompter slides
    await page.click('[data-testid="add-slide-teleprompter"]');
    await page.click('[data-testid="add-slide-teleprompter"]');
    
    // Set font size on first slide to 20
    const fontSizeSlider = page.locator('[data-testid="font-size-slider"]');
    await fontSizeSlider.first().click({ position: { x: 40, y: 0 } });
    await page.waitForTimeout(150);
    
    let fontSizeValue = page.locator('[data-testid="font-size-value"]').first();
    await expect(fontSizeValue).toContainText('20');
    
    // Switch to second slide
    await page.click('[data-testid="slide-1"]');
    await page.waitForTimeout(100);
    
    // Set font size on second slide to 40
    await fontSizeSlider.click({ position: { x: 200, y: 0 } });
    await page.waitForTimeout(150);
    
    fontSizeValue = page.locator('[data-testid="font-size-value"]');
    await expect(fontSizeValue).toContainText('40');
    
    // Switch back to first slide
    await page.click('[data-testid="slide-0"]');
    await page.waitForTimeout(100);
    
    // Verify first slide still has font size of 20
    fontSizeValue = page.locator('[data-testid="font-size-value"]').first();
    await expect(fontSizeValue).toContainText('20');
  });

  test('should persist both settings across multiple slides', async ({ page }) => {
    // Add three teleprompter slides
    await page.click('[data-testid="add-slide-teleprompter"]');
    await page.click('[data-testid="add-slide-teleprompter"]');
    await page.click('[data-testid="add-slide-teleprompter"]');
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    const fontSizeSlider = page.locator('[data-testid="font-size-slider"]');
    
    // Configure each slide differently
    // Slide 0: focalPoint=30, fontSize=18
    await focalPointSlider.first().click({ position: { x: 90, y: 0 } });
    await fontSizeSlider.first().click({ position: { x: 20, y: 0 } });
    await page.waitForTimeout(150);
    
    // Slide 1: focalPoint=50, fontSize=24 (defaults)
    await page.click('[data-testid="slide-1"]');
    await page.waitForTimeout(100);
    
    // Slide 2: focalPoint=80, fontSize=36
    await page.click('[data-testid="slide-2"]');
    await page.waitForTimeout(100);
    await focalPointSlider.click({ position: { x: 240, y: 0 } });
    await fontSizeSlider.click({ position: { x: 180, y: 0 } });
    await page.waitForTimeout(150);
    
    // Navigate through all slides and verify settings
    await page.click('[data-testid="slide-0"]');
    await page.waitForTimeout(100);
    
    let focalPointValue = page.locator('[data-testid="focal-point-value"]').first();
    let fontSizeValue = page.locator('[data-testid="font-size-value"]').first();
    await expect(focalPointValue).toContainText('30');
    await expect(fontSizeValue).toContainText('18');
    
    await page.click('[data-testid="slide-1"]');
    await page.waitForTimeout(100);
    
    focalPointValue = page.locator('[data-testid="focal-point-value"]');
    fontSizeValue = page.locator('[data-testid="font-size-value"]');
    await expect(focalPointValue).toContainText('50');
    await expect(fontSizeValue).toContainText('24');
    
    await page.click('[data-testid="slide-2"]');
    await page.waitForTimeout(100);
    
    focalPointValue = page.locator('[data-testid="focal-point-value"]');
    fontSizeValue = page.locator('[data-testid="font-size-value"]');
    await expect(focalPointValue).toContainText('80');
    await expect(fontSizeValue).toContainText('36');
  });

  test('should persist settings after removing intermediate slides', async ({ page }) => {
    // Add three teleprompter slides
    await page.click('[data-testid="add-slide-teleprompter"]');
    await page.click('[data-testid="add-slide-teleprompter"]');
    await page.click('[data-testid="add-slide-teleprompter"]');
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    
    // Set focal points: 20, 50, 80
    await focalPointSlider.nth(0).click({ position: { x: 60, y: 0 } });
    await page.waitForTimeout(150);
    
    await page.click('[data-testid="slide-1"]');
    await page.waitForTimeout(100);
    await focalPointSlider.click({ position: { x: 150, y: 0 } });
    await page.waitForTimeout(150);
    
    await page.click('[data-testid="slide-2"]');
    await page.waitForTimeout(100);
    await focalPointSlider.click({ position: { x: 240, y: 0 } });
    await page.waitForTimeout(150);
    
    // Remove middle slide
    await page.click('[data-testid="slide-1"] [data-testid="remove-slide"]');
    await page.waitForTimeout(100);
    
    // Verify remaining slides have correct settings
    await page.click('[data-testid="slide-0"]');
    await page.waitForTimeout(100);
    
    let focalPointValue = page.locator('[data-testid="focal-point-value"]').first();
    await expect(focalPointValue).toContainText('20');
    
    await page.click('[data-testid="slide-1"]');
    await page.waitForTimeout(100);
    
    // This was originally slide 2 with focal point 80
    focalPointValue = page.locator('[data-testid="focal-point-value"]');
    await expect(focalPointValue).toContainText('80');
  });

  test('should persist settings after rapid navigation', async ({ page }) => {
    // Add multiple teleprompter slides
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="add-slide-teleprompter"]');
    }
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    
    // Set different focal points for each slide
    for (let i = 0; i < 5; i++) {
      await page.click(`[data-testid="slide-${i}"]`);
      await page.waitForTimeout(50);
      await focalPointSlider.click({ position: { x: i * 60, y: 0 } });
      await page.waitForTimeout(100);
    }
    
    // Rapidly navigate through slides
    for (let i = 0; i < 10; i++) {
      const slideIndex = i % 5;
      await page.click(`[data-testid="slide-${slideIndex}"]`);
      await page.waitForTimeout(50);
    }
    
    // Verify all settings are preserved
    for (let i = 0; i < 5; i++) {
      await page.click(`[data-testid="slide-${i}"]`);
      await page.waitForTimeout(100);
      
      const expectedFocalPoint = Math.round((i * 60 / 300) * 100);
      const focalPointValue = page.locator('[data-testid="focal-point-value"]');
      
      // Allow some tolerance for the slider position calculation
      const text = await focalPointValue.textContent();
      const value = parseInt(text || '0', 10);
      expect(value).toBeGreaterThanOrEqual(expectedFocalPoint - 5);
      expect(value).toBeLessThanOrEqual(expectedFocalPoint + 5);
    }
  });

  test('should persist settings when switching between different slide types', async ({ page }) => {
    // Add mixed slide types
    await page.click('[data-testid="add-slide-teleprompter"]');
    await page.click('[data-testid="add-slide-text-highlight"]');
    await page.click('[data-testid="add-slide-teleprompter"]');
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    
    // Set focal point on first teleprompter slide
    await focalPointSlider.first().click({ position: { x: 90, y: 0 } });
    await page.waitForTimeout(150);
    
    let focalPointValue = page.locator('[data-testid="focal-point-value"]').first();
    await expect(focalPointValue).toContainText('30');
    
    // Switch to text highlight slide
    await page.click('[data-testid="slide-1"]');
    await page.waitForTimeout(100);
    
    // Switch back to first teleprompter slide
    await page.click('[data-testid="slide-0"]');
    await page.waitForTimeout(100);
    
    // Verify settings preserved
    focalPointValue = page.locator('[data-testid="focal-point-value"]').first();
    await expect(focalPointValue).toContainText('30');
    
    // Switch to second teleprompter slide
    await page.click('[data-testid="slide-2"]');
    await page.waitForTimeout(100);
    
    // Set focal point on second teleprompter slide
    await focalPointSlider.click({ position: { x: 210, y: 0 } });
    await page.waitForTimeout(150);
    
    focalPointValue = page.locator('[data-testid="focal-point-value"]');
    await expect(focalPointValue).toContainText('70');
    
    // Switch back to first teleprompter slide
    await page.click('[data-testid="slide-0"]');
    await page.waitForTimeout(100);
    
    // Verify first slide settings still preserved
    focalPointValue = page.locator('[data-testid="focal-point-value"]').first();
    await expect(focalPointValue).toContainText('30');
  });

  test('should handle real-world user workflow', async ({ page }) => {
    // User creates a teleprompter story with 4 slides
    for (let i = 0; i < 4; i++) {
      await page.click('[data-testid="add-slide-teleprompter"]');
    }
    
    const focalPointSlider = page.locator('[data-testid="focal-point-slider"]');
    const fontSizeSlider = page.locator('[data-testid="font-size-slider"]');
    
    // User customizes each slide
    const configurations = [
      { slide: 0, focalPoint: 35, fontSize: 20, name: 'Introduction' },
      { slide: 1, focalPoint: 45, fontSize: 22, name: 'Point 1' },
      { slide: 2, focalPoint: 55, fontSize: 24, name: 'Point 2' },
      { slide: 3, focalPoint: 65, fontSize: 26, name: 'Conclusion' },
    ];
    
    for (const config of configurations) {
      await page.click(`[data-testid="slide-${config.slide}"]`);
      await page.waitForTimeout(100);
      
      // Set focal point
      const focalX = (config.focalPoint / 100) * 300;
      await focalPointSlider.click({ position: { x: focalX, y: 0 } });
      
      // Set font size
      const fontX = ((config.fontSize - 16) / (48 - 16)) * 300;
      await fontSizeSlider.click({ position: { x: fontX, y: 0 } });
      
      // Update content
      const textarea = page.locator('textarea').first();
      await textarea.fill(config.name);
      
      await page.waitForTimeout(150);
    }
    
    // User navigates through all slides to review
    const navigationOrder = [1, 2, 3, 0, 2, 1];
    for (const slideIndex of navigationOrder) {
      await page.click(`[data-testid="slide-${slideIndex}"]`);
      await page.waitForTimeout(100);
    }
    
    // Verify all settings preserved
    for (const config of configurations) {
      await page.click(`[data-testid="slide-${config.slide}"]`);
      await page.waitForTimeout(100);
      
      const focalPointValue = page.locator('[data-testid="focal-point-value"]');
      const fontSizeValue = page.locator('[data-testid="font-size-value"]');
      const textarea = page.locator('textarea').first();
      
      await expect(focalPointValue).toContainText(config.focalPoint.toString());
      await expect(fontSizeValue).toContainText(config.fontSize.toString());
      await expect(textarea).toHaveValue(config.name);
    }
  });
});
