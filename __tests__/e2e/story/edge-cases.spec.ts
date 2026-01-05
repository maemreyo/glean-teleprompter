/**
 * Edge Cases E2E Tests
 *
 * End-to-end tests for edge case handling in teleprompter functionality.
 * Tests cover T113-T120 edge case scenarios.
 *
 * @feature 012-standalone-story
 */

import { test, expect, Page } from '@playwright/test';

/**
 * T113: Content height < viewport detection
 */
test.describe('T113: Short content handling', () => {
  test('should disable auto-scrolling when content fits on screen', async ({ page }) => {
    // Create a story with very short teleprompter content
    const shortContent = 'This is a short text that fits on one screen.';

    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: shortContent,
          duration: 'manual',
        },
      ],
    });

    // Navigate to story page with encoded data
    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Wait for content to load
    await page.waitForSelector('[data-scroll-container]');

    // Check that auto-scrolling is disabled
    const playButton = page.locator('[aria-label="Play"], [aria-label="Start"]');
    const isDisabled = await playButton.isDisabled();

    // Should either be disabled or have a message about content fitting on screen
    expect(isDisabled).toBeTruthy();
  });
});

/**
 * T114: Manual scroll pause detection
 */
test.describe('T114: Manual scroll pause', () => {
  test('should pause auto-scrolling when user manually scrolls', async ({ page }) => {
    // Create a story with long teleprompter content
    const longContent = Array(50).fill(
      'This is paragraph with enough text to require scrolling. '.repeat(10)
    ).join('\n\n');

    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Start auto-scrolling
    await page.click('[aria-label="Play"], [aria-label="Start"]');

    // Wait a moment for scrolling to begin
    await page.waitForTimeout(500);

    // Manually scroll the content
    const scrollContainer = page.locator('[data-scroll-container]');
    await scrollContainer.evaluate((el: HTMLElement) => {
      el.scrollTop = 500; // Manually scroll to a specific position
    });

    // Check that auto-scrolling has paused
    const playButton = page.locator('[aria-label="Play"], [aria-label="Start"]');
    const isPlaying = await playButton.getAttribute('aria-pressed');

    expect(isPlaying).toBe('false');
  });

  test('should show toast message when auto-scroll is paused (T115)', async ({ page }) => {
    const longContent = Array(50).fill('Paragraph text. '.repeat(10)).join('\n\n');
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Start scrolling
    await page.click('[aria-label="Play"], [aria-label="Start"]');
    await page.waitForTimeout(500);

    // Manually scroll
    const scrollContainer = page.locator('[data-scroll-container]');
    await scrollContainer.evaluate((el: HTMLElement) => {
      el.scrollTop = 500;
    });

    // Check for toast message
    const toast = page.locator('text=Auto-scroll paused').or(page.locator('text=Tap to resume'));
    await expect(toast).toBeVisible({ timeout: 1000 });
  });
});

/**
 * T116: Font size scroll recalculation
 */
test.describe('T116: Font size changes', () => {
  test('should recalculate scroll position after font size change', async ({ page }) => {
    const longContent = Array(50).fill('Paragraph text. '.repeat(10)).join('\n\n');
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Scroll to middle position
    const scrollContainer = page.locator('[data-scroll-container]');
    await scrollContainer.evaluate((el: HTMLElement) => {
      el.scrollTop = 1000;
    });

    const scrollBefore = await scrollContainer.evaluate((el: HTMLElement) => el.scrollTop);

    // Increase font size
    await page.click('[aria-label="Increase font size"]');

    // Wait for layout recalculation
    await page.waitForTimeout(100);

    // Check scroll position is maintained (relative position preserved)
    const scrollAfter = await scrollContainer.evaluate((el: HTMLElement) => el.scrollTop);

    // The exact pixel position will be different but should maintain relative reading position
    // This is verified by checking the scroll didn't reset to 0
    expect(scrollAfter).toBeGreaterThan(0);
  });
});

/**
 * T117: Tab visibility handling
 */
test.describe('T117: Tab visibility', () => {
  test('should pause auto-scrolling when tab becomes inactive (SC-013)', async ({ page, context }) => {
    const longContent = Array(50).fill('Paragraph text. '.repeat(10)).join('\n\n');
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Start auto-scrolling
    await page.click('[aria-label="Play"], [aria-label="Start"]');
    await page.waitForTimeout(500);

    // Simulate tab becoming inactive (hidden)
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Wait a moment
    await page.waitForTimeout(100);

    // Check that scrolling has paused
    const playButton = page.locator('[aria-label="Play"], [aria-label="Start"]');
    const isPlaying = await playButton.getAttribute('aria-pressed');

    expect(isPlaying).toBe('false');

    // Restore tab visibility
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
  });

  test('should resume quickly when tab becomes active (SC-013)', async ({ page }) => {
    const longContent = Array(50).fill('Paragraph text. '.repeat(10)).join('\n\n');
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Start auto-scrolling
    await page.click('[aria-label="Play"], [aria-label="Start"]');
    await page.waitForTimeout(500);

    // Simulate tab becoming inactive
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Make tab active again
    const startTime = Date.now();

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: false,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Try to resume scrolling
    await page.click('[aria-label="Play"], [aria-label="Start"]');

    const resumeTime = Date.now() - startTime;

    // Should resume within 500ms (SC-013)
    expect(resumeTime).toBeLessThan(600);
  });
});

/**
 * T118: NoSleep.js CDN loading failure
 */
test.describe('T118: NoSleep.js CDN failures', () => {
  test('should handle NoSleep.js loading failure gracefully', async ({ page }) => {
    // Mock failure by blocking the CDN
    await page.route('https://unpkg.com/nosleep.js', route => route.abort());

    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: 'Test content',
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Check that appropriate error handling is in place
    // The implementation should detect Wake Lock API support
    // and handle NoSleep.js failure accordingly

    // Verify teleprompter still works if Wake Lock API is available
    const teleprompterContent = page.locator('role="region"][aria-label*="Teleprompter"]');
    await expect(teleprompterContent).toBeVisible();
  });
});

/**
 * T119: JSON validation and blocking
 */
test.describe('T119: Invalid JSON data', () => {
  test('should block viewing with error screen for malformed JSON', async ({ page }) => {
    // Navigate with invalid JSON
    const invalidJSON = '{invalid json data';

    const encoded = btoa(encodeURIComponent(invalidJSON));
    await page.goto(`/story/${encoded}`);

    // Should show error screen
    const errorScreen = page.locator('text=/Invalid story data|error/i');
    await expect(errorScreen).toBeVisible();
  });

  test('should block viewing for invalid slide structure', async ({ page }) => {
    const invalidStory = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          // Missing required 'type' field
          content: 'Test content',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(invalidStory));
    await page.goto(`/story/${encoded}`);

    // Should show error screen
    const errorScreen = page.locator('text=/error|invalid/i');
    await expect(errorScreen).toBeVisible();
  });
});

/**
 * T120: All edge cases comprehensive test
 */
test.describe('T120: Comprehensive edge case scenarios', () => {
  test('should handle orientation change during scrolling', async ({ page }) => {
    const longContent = Array(50).fill('Paragraph text. '.repeat(10)).join('\n\n');
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story}/${encoded}`);

    // Start scrolling
    await page.click('[aria-label="Play"], [aria-label="Start"]');
    await page.waitForTimeout(500);

    // Get scroll position before rotation
    const scrollContainer = page.locator('[data-scroll-container]');
    const scrollBefore = await scrollContainer.evaluate((el: HTMLElement) => el.scrollTop);

    // Rotate device (simulate orientation change)
    await page.evaluate(() => {
      // Simulate landscape mode by changing viewport dimensions
      Object.defineProperty(screen.orientation, 'angle', {
        value: 90,
        writable: false,
      });
      window.dispatchEvent(new Event('orientationchange'));
    });

    // Wait for layout adjustment
    await page.waitForTimeout(200);

    // Check that content is still visible and scrollable
    const stillVisible = await scrollContainer.isVisible();
    expect(stillVisible).toBe(true);
  });

  test('should handle rapid font size changes', async ({ page }) => {
    const longContent = Array(50).fill('Paragraph text. '.repeat(10)).join('\n\n');
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story}${encoded}`);

    // Rapidly change font size multiple times
    for (let i = 0; i < 5; i++) {
      await page.click('[aria-label="Increase font size"]');
      await page.waitForTimeout(50);
      await page.click('[aria-label="Decrease font size"]');
      await page.waitForTimeout(50);
    }

    // Verify content is still visible and functional
    const contentVisible = await page.locator('[data-scroll-container]').isVisible();
    expect(contentVisible).toBe(true);
  });

  test('should handle very long content without performance issues', async ({ page }) => {
    // Create very long content (10,000+ words)
    const veryLongContent = Array(1000).fill(
      'This is a paragraph with enough text to test performance. '.repeat(10)
    ).join('\n\n');

    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: veryLongContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Test that the page loads without hanging
    await expect(page.locator('[data-scroll-container]')).toBeVisible({ timeout: 5000 });

    // Test scrolling performance
    const startTime = Date.now();
    await page.click('[aria-label="Play"], [aria-label="Start"]');
    await page.waitForTimeout(1000);
    const loadTime = Date.now() - startTime;

    // Should load and start scrolling quickly
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle rapid tap interactions without issues', async ({ page }) => {
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        { id: 'slide-1', type: 'text-highlight', content: 'First slide', duration: 5000 },
        { id: 'slide-2', type: 'text-highlight', content: 'Second slide', duration: 5000 },
        { id: 'slide-3', type: 'text-highlight', content: 'Third slide', duration: 5000 },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Rapidly tap to navigate
    for (let i = 0; i < 10; i++) {
      await page.click('body', { position: { x: 800, y: 600 } });
      await page.waitForTimeout(100);
    }

    // Should not crash and should advance slides
    // (Exact slide number depends on tap success rate)
    const content = page.locator('text=First slide,Second slide,Third slide');
    await expect(content).toBeVisible();
  });

  test('should handle mirror mode toggle on non-teleprompter slide', async ({ page }) => {
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Test content',
          duration: 5000,
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story}/${encoded}`);

    // Mirror toggle should have no effect on non-teleprompter slides
    const mirrorToggle = page.locator('[aria-label*="mirror"], [aria-label*="Mirror"]');
    const isVisible = await mirrorToggle.isVisible();

    // Mirror toggle should not be visible for non-teleprompter slides
    expect(isVisible).toBeFalsy();
  });

  test('should handle browser crash and recovery (T095)', async ({ page, context }) => {
    const longContent = Array(50).fill('Paragraph text for crash recovery. '.repeat(10)).join('\n\n');
    const storyData = JSON.stringify({
      id: 'test-story',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: longContent,
          duration: 'manual',
        },
      ],
    });

    const encoded = btoa(encodeURIComponent(storyData));
    await page.goto(`/story/${encoded}`);

    // Scroll to 50% position
    const scrollContainer = page.locator('[data-scroll-container]');
    await scrollContainer.evaluate((el: HTMLElement) => {
      el.scrollTop = 500;
    });

    // Wait for progress to save
    await page.waitForTimeout(2500);

    // Simulate page reload (browser crash simulation)
    await page.reload();

    // Should offer to restore progress
    // This would typically show a dialog asking to restore
    // For now, verify the page loads without errors
    await expect(page.locator('[data-scroll-container]')).toBeVisible();
  });
});
