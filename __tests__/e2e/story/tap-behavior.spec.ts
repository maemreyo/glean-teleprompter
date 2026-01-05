/**
 * Tap Behavior E2E Tests
 *
 * End-to-end tests for tap gesture behavior and slide advancement.
 *
 * @feature 012-standalone-story
 * @file __tests__/e2e/story/tap-behavior.spec.ts
 */

import { test, expect } from '@playwright/test';

/**
 * Helper function to create a test story URL
 */
function createTestStoryUrl(includeTeleprompter = true): string {
  const slides = includeTeleprompter
    ? [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: 'This is a teleprompter slide for testing tap behavior.\n'.repeat(20),
          duration: 'manual',
        },
        {
          id: 'slide-2',
          type: 'text-highlight',
          content: 'Second slide content',
          highlights: [
            { startIndex: 0, endIndex: 6, color: 'yellow', fontWeight: 'bold' },
          ],
          duration: 5000,
        },
      ]
    : [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'First slide content',
          highlights: [],
          duration: 5000,
        },
        {
          id: 'slide-2',
          type: 'image',
          content: 'https://example.com/image.jpg',
          alt: 'Test image',
          duration: 5000,
        },
      ];

  const storyData = {
    id: 'test-tap-behavior',
    title: 'Tap Behavior Test',
    slides,
    autoAdvance: false,
    showProgress: true,
    version: '1.0' as const,
  };

  const encoded = btoa(JSON.stringify(storyData));
  return `/story/test-tap-behavior?data=${encoded}`;
}

test.describe('Tap Behavior E2E Tests', () => {
  test('should not advance slide when tapping teleprompter slide (T080, T081)', async ({ page }) => {
    await page.goto(createTestStoryUrl(true));

    // Wait for teleprompter slide to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Get initial slide index
    const initialSlide = await page.locator('[data-testid="current-slide-index"]').textContent();

    // Tap center of teleprompter slide
    const container = page.locator('[data-testid="teleprompter-slide"]');
    const box = await container.boundingBox();
    if (box) {
      await page.click('[data-testid="teleprompter-slide"]', {
        position: { x: box.width / 2, y: box.height / 2 },
      });
    }

    // Wait a moment for any navigation to occur
    await page.waitForTimeout(500);

    // Slide should not have advanced
    const currentSlide = await page.locator('[data-testid="current-slide-index"]').textContent();
    expect(currentSlide).toBe(initialSlide);
  });

  test('should advance slide when tapping non-teleprompter slide (T083)', async ({ page }) => {
    await page.goto(createTestStoryUrl(false));

    // Wait for first slide to load
    await page.waitForSelector('[data-testid="slide-container"]');

    // Get initial slide index
    const initialSlide = await page.locator('[data-testid="current-slide-index"]').textContent();

    // Tap right side of slide (should advance)
    const container = page.locator('[data-testid="slide-container"]');
    const box = await container.boundingBox();
    if (box) {
      await page.click('[data-testid="slide-container"]', {
        position: { x: box.width * 0.8, y: box.height / 2 },
      });
    }

    // Wait for slide transition
    await page.waitForTimeout(500);

    // Slide should have advanced
    const currentSlide = await page.locator('[data-testid="current-slide-index"]').textContent();
    expect(currentSlide).not.toBe(initialSlide);
  });

  test('should advance slide when clicking Skip to Next button on teleprompter (T082)', async ({ page }) => {
    await page.goto(createTestStoryUrl(true));

    // Wait for teleprompter slide to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Click the Skip to Next button
    await page.click('[data-testid="skip-to-next-button"]');

    // Wait for slide transition
    await page.waitForTimeout(500);

    // Should be on second slide now
    const currentSlide = await page.locator('[data-testid="current-slide-index"]').textContent();
    expect(currentSlide).toBe('1');
  });

  test('should show control panel when tapping teleprompter slide (T081)', async ({ page }) => {
    await page.goto(createTestStoryUrl(true));

    // Wait for teleprompter slide to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Initially, controls may be hidden (after 3 seconds of inactivity)
    // Tap to show them
    await page.click('[data-testid="teleprompter-slide"]');

    // Controls should be visible
    await expect(page.locator('[data-testid="teleprompter-controls"]')).toBeVisible();

    // Control panel should contain play/pause, speed slider, font controls, skip button
    await expect(page.locator('[data-testid="play-pause-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="speed-slider"]')).toBeVisible();
    await expect(page.locator('[data-testid="font-size-control"]')).toBeVisible();
    await expect(page.locator('[data-testid="skip-to-next-button"]')).toBeVisible();
  });

  test('should handle rapid taps without accidentally advancing on teleprompter', async ({ page }) => {
    await page.goto(createTestStoryUrl(true));

    // Wait for teleprompter slide to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    const initialSlide = await page.locator('[data-testid="current-slide-index"]').textContent();

    // Rapidly tap multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="teleprompter-slide"]');
      await page.waitForTimeout(100);
    }

    // Slide should not have advanced despite multiple taps
    const currentSlide = await page.locator('[data-testid="current-slide-index"]').textContent();
    expect(currentSlide).toBe(initialSlide);
  });

  test('should maintain slide index when tapping different zones on teleprompter', async ({ page }) => {
    await page.goto(createTestStoryUrl(true));

    // Wait for teleprompter slide to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    const container = page.locator('[data-testid="teleprompter-slide"]');
    const box = await container.boundingBox();
    if (!box) {
      throw new Error('Container bounding box not found');
    }

    const initialSlide = await page.locator('[data-testid="current-slide-index"]').textContent();

    // Tap left side
    await page.click('[data-testid="teleprompter-slide"]', {
      position: { x: box.width * 0.2, y: box.height / 2 },
    });
    await page.waitForTimeout(200);

    // Tap center
    await page.click('[data-testid="teleprompter-slide"]', {
      position: { x: box.width / 2, y: box.height / 2 },
    });
    await page.waitForTimeout(200);

    // Tap right side
    await page.click('[data-testid="teleprompter-slide"]', {
      position: { x: box.width * 0.8, y: box.height / 2 },
    });
    await page.waitForTimeout(200);

    // Slide should not have advanced
    const currentSlide = await page.locator('[data-testid="current-slide-index"]').textContent();
    expect(currentSlide).toBe(initialSlide);
  });
});
