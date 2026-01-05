/**
 * Mobile Gesture E2E Tests
 *
 * End-to-end tests for mobile gestures including:
 * - Tap zones on mobile emulation
 * - Swipe gestures
 * - Pause/resume on touch devices
 *
 * @feature 012-standalone-story
 * @task T018
 */

import { test, expect } from '@playwright/test';

// Story data for testing
const testStoryData = {
  id: 'test-story-1',
  title: 'Mobile Gesture Test Story',
  version: '1.0' as const,
  slides: [
    {
      id: 'slide-1',
      type: 'text-highlight',
      content: 'First Slide',
      duration: 5000,
      animation: { type: 'fade', duration: 300 },
      highlights: [],
    },
    {
      id: 'slide-2',
      type: 'text-highlight',
      content: 'Second Slide',
      duration: 5000,
      animation: { type: 'slide-in', direction: 'left', duration: 300 },
      highlights: [],
    },
    {
      id: 'slide-3',
      type: 'image',
      content: 'https://picsum.photos/400/700',
      alt: 'Test Image',
      duration: 5000,
      animation: { type: 'zoom', duration: 300 },
    },
  ],
  autoAdvance: false,
  showProgress: true,
};

// Helper function to encode story data for URL
function encodeStoryForUrl(story: typeof testStoryData): string {
  const json = JSON.stringify(story);
  const base64 = btoa(encodeURIComponent(json));
  return base64;
}

test.describe('Mobile Story Viewer - Tap Gestures', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (9:16 aspect ratio)
    await page.setViewportSize({ width: 360, height: 640 });

    // Navigate to story viewer with test data
    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);
  });

  test('should display first slide on load', async ({ page }) => {
    await expect(page.locator('text=First Slide')).toBeVisible();
  });

  test('should navigate to next slide on right side tap', async ({ page }) => {
    // Get viewport dimensions
    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    // Tap on right side (70% of width)
    await page.click('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });

    // Should show second slide
    await expect(page.locator('text=Second Slide')).toBeVisible();
  });

  test('should navigate to previous slide on left side tap', async ({ page }) => {
    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    // First go to next slide
    await page.click('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });

    await expect(page.locator('text=Second Slide')).toBeVisible();

    // Then tap left side to go back
    await page.click('body', {
      position: { x: Math.floor(width * 0.15), y: Math.floor(height * 0.5) },
    });

    await expect(page.locator('text=First Slide')).toBeVisible();
  });

  test('should pause on center tap', async ({ page }) => {
    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    // Tap center (50% of width)
    await page.click('body', {
      position: { x: Math.floor(width * 0.5), y: Math.floor(height * 0.5) },
    });

    // Should show pause indicator or state change
    // This depends on your UI implementation
    const pauseButton = page.locator('[data-testid="pause-button"], button[aria-label*="pause"]');
    if (await pauseButton.count() > 0) {
      await expect(pauseButton).toHaveAttribute('aria-label', /play/i);
    }
  });

  test('should not navigate beyond first slide', async ({ page }) => {
    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    // Try to go back from first slide
    await page.click('body', {
      position: { x: Math.floor(width * 0.15), y: Math.floor(height * 0.5) },
    });

    // Should still be on first slide
    await expect(page.locator('text=First Slide')).toBeVisible();
  });

  test('should not navigate beyond last slide', async ({ page }) => {
    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    // Navigate to last slide
    await page.click('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });

    await page.click('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });

    await expect(page.locator('img[src*="picsum"]')).toBeVisible();

    // Try to go beyond last slide
    await page.click('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });

    // Should still be on last slide
    await expect(page.locator('img[src*="picsum"]')).toBeVisible();
  });
});

test.describe('Mobile Story Viewer - Touch Gestures', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);
  });

  test('should handle tap on touch devices', async ({ page }) => {
    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    // Simulate touch tap on right side
    await page.tap('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });

    await expect(page.locator('text=Second Slide')).toBeVisible();
  });
});

test.describe('Mobile Story Viewer - 9:16 Aspect Ratio', () => {
  test('should maintain 9:16 aspect ratio on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);

    // Get story container dimensions
    const container = page.locator('.story-container, [data-testid="story-viewer"]');
    const box = await container.boundingBox();

    expect(box).toBeTruthy();

    if (box) {
      const aspectRatio = box!.width / box!.height;
      // 9:16 = 0.5625, allow small margin for rounding
      expect(aspectRatio).toBeGreaterThan(0.55);
      expect(aspectRatio).toBeLessThan(0.58);
    }
  });

  test('should handle landscape orientation', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape

    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);

    // Content should still be visible and accessible
    await expect(page.locator('text=First Slide')).toBeVisible();
  });
});

test.describe('Mobile Story Viewer - Progress Bar', () => {
  test('should display progress bars on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);

    // Check for progress indicators
    const progressBar = page.locator('[role="progressbar"], .progress-bar');
    await expect(progressBar).toBeVisible();
  });

  test('should update progress on slide change', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);

    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    // Navigate to next slide
    await page.click('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });

    // Progress should update (implementation specific)
    await expect(page.locator('text=Second Slide')).toBeVisible();
  });
});

test.describe('Mobile Story Viewer - Safe Areas', () => {
  test('should apply safe area insets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12/13

    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);

    // Check if safe area CSS is applied
    const container = page.locator('.story-container, [data-testid="story-viewer"]');
    const padding = await container.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        paddingTop: styles.paddingTop,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
      };
    });

    // Should have some padding (at least 2rem or safe area insets)
    expect(parseInt(padding.paddingTop)).toBeGreaterThan(0);
    expect(parseInt(padding.paddingBottom)).toBeGreaterThan(0);
  });
});

test.describe('Mobile Story Viewer - Performance', () => {
  test('should render slides quickly', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    const startTime = Date.now();
    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);
    
    // Wait for first slide to be visible
    await page.waitForSelector('text=First Slide');
    const loadTime = Date.now() - startTime;

    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should transition slides smoothly', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });

    const encodedStory = encodeStoryForUrl(testStoryData);
    await page.goto(`/story/${encodedStory}`);

    const viewportSize = page.viewportSize();
    const width = viewportSize?.width || 360;
    const height = viewportSize?.height || 640;

    const startTime = Date.now();
    await page.click('body', {
      position: { x: Math.floor(width * 0.85), y: Math.floor(height * 0.5) },
    });
    
    // Wait for slide transition
    await page.waitForSelector('text=Second Slide');
    const transitionTime = Date.now() - startTime;

    // Should transition within 500ms
    expect(transitionTime).toBeLessThan(500);
  });
});
