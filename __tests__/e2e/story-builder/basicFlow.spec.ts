/**
 * E2E Test for Story Builder Basic Flow (T031)
 *
 * Tests complete story creation flow from start to finish
 * @feature 013-visual-story-builder
 */

import { test, expect } from '@playwright/test';

test.describe('Story Builder E2E - Complete Flow (T031)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to story builder page
    await page.goto('/story-builder');
    
    // Wait for page to load
    await page.waitForSelector('[data-testid="story-builder"]', { timeout: 5000 });
  });

  test('should create a complete story with multiple slides', async ({ page }) => {
    // Step 1: Verify initial state - empty story
    await expect(page.locator('[data-testid="story-rail"]')).toContainText('0 slides');
    
    // Step 2: Add first slide - Text Highlight
    await page.click('[data-testid="slide-type-text-highlight"]');
    await expect(page.locator('[data-testid="story-rail"]')).toContainText('1 slide');
    
    // Step 3: Add second slide - Image
    await page.click('[data-testid="slide-type-image"]');
    await expect(page.locator('[data-testid="story-rail"]')).toContainText('2 slides');
    
    // Step 4: Add third slide - Teleprompter
    await page.click('[data-testid="slide-type-teleprompter"]');
    await expect(page.locator('[data-testid="story-rail"]')).toContainText('3 slides');
    
    // Step 5: Verify slides are in correct order in rail
    const slides = page.locator('[data-testid^="slide-card-"]');
    await expect(slides).toHaveCount(3);
    
    // Step 6: Click on second slide to select it
    await slides.nth(1).click();
    await expect(slides.nth(1)).toHaveAttribute('aria-pressed', 'true');
    
    // Step 7: Verify preview updates
    await expect(page.locator('[data-testid="preview-panel"]')).toBeVisible();
    
    // Step 8: Delete a slide
    await page.click('[data-testid="slide-card-1"] [data-testid="delete-slide-button"]');
    await expect(page.locator('[data-testid="story-rail"]')).toContainText('2 slides');
    
    // Step 9: Verify save status changed to unsaved
    await expect(page.locator('[data-testid="save-status"]')).toContainText('unsaved');
  });

  test('should reorder slides using drag and drop', async ({ page }) => {
    // Add 3 slides
    await page.click('[data-testid="slide-type-text-highlight"]');
    await page.click('[data-testid="slide-type-image"]');
    await page.click('[data-testid="slide-type-teleprompter"]');
    
    const firstSlide = page.locator('[data-testid="slide-card-0"]');
    const lastSlide = page.locator('[data-testid="slide-card-2"]');
    
    // Get initial slide types
    const initialFirstSlideText = await firstSlide.textContent();
    const initialLastSlideText = await lastSlide.textContent();
    
    // Drag first slide to last position
    await firstSlide.dragTo(lastSlide);
    
    // Verify slides were reordered
    const newFirstSlide = page.locator('[data-testid="slide-card-0"]');
    const newLastSlide = page.locator('[data-testid="slide-card-2"]');
    
    expect(await newFirstSlide.textContent()).toBe(initialLastSlideText);
    expect(await newLastSlide.textContent()).toBe(initialFirstSlideText);
  });

  test('should prevent adding more than 20 slides', async ({ page }) => {
    // Try to add 21 slides
    for (let i = 0; i < 21; i++) {
      await page.click('[data-testid="slide-type-text-highlight"]');
    }
    
    // Should still have only 20 slides
    await expect(page.locator('[data-testid="story-rail"]')).toContainText('20 slides');
    
    // Should show warning in console
    page.on('console', msg => {
      if (msg.type() === 'warning') {
        expect(msg.text()).toContain('maximum of 20 slides');
      }
    });
  });

  test('should generate shareable URL', async ({ page }) => {
    // Add a slide
    await page.click('[data-testid="slide-type-text-highlight"]');
    
    // Click share button
    await page.click('[data-testid="share-button"]');
    
    // Verify URL was generated
    const urlInput = page.locator('[data-testid="share-url-input"]');
    await expect(urlInput).toHaveValue(/./); // Should have some value
    
    // Verify URL contains encoded story data
    const url = await urlInput.inputValue();
    expect(url.length).toBeGreaterThan(0);
    expect(url).toContain('?story=');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Add a slide
    await page.click('[data-testid="slide-type-text-highlight"]');
    
    // Select the slide
    await page.click('[data-testid="slide-card-0"]');
    
    // Press Delete key
    await page.keyboard.press('Delete');
    
    // Verify slide was removed
    await expect(page.locator('[data-testid="story-rail"]')).toContainText('0 slides');
  });

  test('should load template and replace existing story', async ({ page }) => {
    // Add some slides first
    await page.click('[data-testid="slide-type-text-highlight"]');
    await page.click('[data-testid="slide-type-image"]');
    
    // Open template modal
    await page.click('[data-testid="template-gallery-button"]');
    
    // Wait for modal to appear
    await expect(page.locator('[data-testid="template-gallery-modal"]')).toBeVisible();
    
    // Click on first template
    const templateCards = page.locator('[data-testid^="template-card-"]');
    await templateCards.first().click();
    
    // Click "Use Template" button
    await page.click('[data-testid="use-template-button"]');
    
    // Modal should close
    await expect(page.locator('[data-testid="template-gallery-modal"]')).not.toBeVisible();
    
    // Story should be replaced with template slides
    // (Template slides count varies, just verify we have some slides)
    const slides = page.locator('[data-testid^="slide-card-"]');
    const slideCount = await slides.count();
    expect(slideCount).toBeGreaterThan(0);
  });
});
