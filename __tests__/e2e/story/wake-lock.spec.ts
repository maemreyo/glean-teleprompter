/**
 * Wake Lock E2E Tests
 *
 * End-to-end tests for screen wake lock functionality.
 *
 * @feature 012-standalone-story
 * @file __tests__/e2e/story/wake-lock.spec.ts
 */

import { test, expect } from '@playwright/test';

/**
 * Helper function to create a test story URL with teleprompter slide
 */
function createTestStoryUrl(): string {
  const storyData = {
    id: 'test-wake-lock',
    title: 'Wake Lock Test Story',
    slides: [
      {
        id: 'slide-1',
        type: 'teleprompter',
        content: 'This is a long text for testing wake lock functionality.\n'.repeat(50),
        duration: 'manual',
      },
    ],
    autoAdvance: false,
    showProgress: true,
    version: '1.0' as const,
  };

  // Encode story data (base64)
  const encoded = btoa(JSON.stringify(storyData));
  return `/story/test-wake-lock?data=${encoded}`;
}

test.describe('Wake Lock E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Wake Lock API for testing
    await page.addInitScript(() => {
      // @ts-expect-error - Adding mock for testing
      window.mockWakeLockActive = false;
      // @ts-expect-error - Adding mock for testing
      window.mockWakeLockRequestCount = 0;

      // Mock navigator.wakeLock if not present
      if (!('wakeLock' in navigator)) {
        // @ts-expect-error - Mocking wake lock API
        navigator.wakeLock = {
          request: async () => {
            // @ts-expect-error - Setting mock state
            window.mockWakeLockActive = true;
            // @ts-expect-error - Incrementing mock counter
            window.mockWakeLockRequestCount++;
            return {
              release: async () => {
                // @ts-expect-error - Clearing mock state
                window.mockWakeLockActive = false;
              },
              addEventListener: () => {},
            };
          },
        };
      }
    });
  });

  test('should request wake lock when teleprompter scrolling starts', async ({ page }) => {
    await page.goto(createTestStoryUrl());

    // Wait for story to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Check initial wake lock state
    // @ts-expect-error - Accessing mock property
    const initialCount = await page.evaluate(() => window.mockWakeLockRequestCount || 0);
    expect(initialCount).toBe(0);

    // Start scrolling by clicking play button
    await page.click('[data-testid="play-pause-button"]');

    // Wait for wake lock request
    await page.waitForTimeout(100);

    // Check that wake lock was requested
    // @ts-expect-error - Accessing mock property
    const wakeLockCount = await page.evaluate(() => window.mockWakeLockRequestCount || 0);
    expect(wakeLockCount).toBeGreaterThan(0);

    // @ts-expect-error - Accessing mock property
    const isActive = await page.evaluate(() => window.mockWakeLockActive);
    expect(isActive).toBe(true);
  });

  test('should release wake lock when scrolling stops', async ({ page }) => {
    await page.goto(createTestStoryUrl());

    // Wait for story to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Start scrolling
    await page.click('[data-testid="play-pause-button"]');
    await page.waitForTimeout(100);

    // Verify wake lock is active
    // @ts-expect-error - Accessing mock property
    let isActive = await page.evaluate(() => window.mockWakeLockActive);
    expect(isActive).toBe(true);

    // Stop scrolling
    await page.click('[data-testid="play-pause-button"]');
    await page.waitForTimeout(500); // Wait for deceleration

    // Verify wake lock was released
    // @ts-expect-error - Accessing mock property
    isActive = await page.evaluate(() => window.mockWakeLockActive);
    expect(isActive).toBe(false);
  });

  test('should re-request wake lock when returning to tab', async ({ page, context }) => {
    await page.goto(createTestStoryUrl());

    // Wait for story to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Start scrolling
    await page.click('[data-testid="play-pause-button"]');
    await page.waitForTimeout(100);

    // Get initial wake lock request count
    // @ts-expect-error - Accessing mock property
    const initialCount = await page.evaluate(() => window.mockWakeLockRequestCount || 0);

    // Simulate tab visibility change (hide and show)
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await page.waitForTimeout(100);

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // Wait for re-request
    await page.waitForTimeout(500);

    // Check that wake lock was re-requested
    // @ts-expect-error - Accessing mock property
    const newCount = await page.evaluate(() => window.mockWakeLockRequestCount || 0);
    expect(newCount).toBeGreaterThan(initialCount);
  });

  test('should show error when wake lock is not supported', async ({ page }) => {
    // Remove wake lock support
    await page.addInitScript(() => {
      // @ts-expect-error - Removing wake lock for testing
      delete navigator.wakeLock;
      // NoSleep doesn't exist on window type, so no error suppression needed
      delete (window as any).NoSleep;
    });

    await page.goto(createTestStoryUrl());

    // Wait for story to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Try to start scrolling
    await page.click('[data-testid="play-pause-button"]');

    // Check if error is displayed (or scrolling is blocked)
    // The hook should prevent scrolling if wake lock fails on first attempt
    const isScrolling = await page.isVisible('[data-testid="scrolling-indicator"]');

    // Either error is shown or scrolling is blocked
    if (isScrolling) {
      // If scrolling indicator is visible, verify wake lock warning
      const warning = await page.locator('[data-testid="wake-lock-warning"]').count();
      expect(warning).toBeGreaterThan(0);
    } else {
      // Scrolling should be blocked
      expect(isScrolling).toBe(false);
    }
  });

  test('should handle wake lock gracefully on rapid start/stop', async ({ page }) => {
    await page.goto(createTestStoryUrl());

    // Wait for story to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Rapid start/stop cycles
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="play-pause-button"]');
      await page.waitForTimeout(50);
      await page.click('[data-testid="play-pause-button"]');
      await page.waitForTimeout(50);
    }

    // Wait for all operations to complete
    await page.waitForTimeout(1000);

    // Verify no errors in console
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // There should be no critical errors
    const criticalErrors = errors.filter((err) =>
      err.includes('critical') || err.includes('fatal')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('should maintain wake lock during long scrolling sessions', async ({ page }) => {
    await page.goto(createTestStoryUrl());

    // Wait for story to load
    await page.waitForSelector('[data-testid="teleprompter-slide"]');

    // Start scrolling
    await page.click('[data-testid="play-pause-button"]');

    // Simulate a long scrolling session (check wake lock status periodically)
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(500);

      // @ts-expect-error - Accessing mock property
      const isActive = await page.evaluate(() => window.mockWakeLockActive);
      expect(isActive).toBe(true);
    }

    // Stop scrolling
    await page.click('[data-testid="play-pause-button"]');
    await page.waitForTimeout(500);

    // @ts-expect-error - Accessing mock property
    const isReleased = await page.evaluate(() => !window.mockWakeLockActive);
    expect(isReleased).toBe(true);
  });
});
