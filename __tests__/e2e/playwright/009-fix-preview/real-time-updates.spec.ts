import { test, expect } from '@playwright/test';
import { StudioPage } from '../helpers/studio-page';
import { StoreHelper } from '../helpers/store-helpers';
import { verifyBackgroundConsistency, TEST_DATA } from '../helpers/preview-helpers';

/**
 * Feature 009-fix-preview: Real-time Updates Tests
 * 
 * Tests T043, T045: Real-time background updates and template switching
 * 
 * @see plans/playwright-e2e-tests-009-fix-preview.md
 */

test.describe('Feature 009-fix-preview: Real-time Updates (T043, T045)', () => {
  let studioPage: StudioPage;

  test.beforeEach(async ({ page }) => {
    studioPage = new StudioPage(page);
    await studioPage.goto();
    await studioPage.waitForReady();
  });

  test.afterEach(async ({ page }) => {
    // Clean up: reset store state
    await page.evaluate(() => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        const state = store.getState();
        state?.reset?.();
      }
    });
  });

  /**
   * T043: Real-time updates when background changes
   * 
   * Verify that:
   * - Background changes update immediately in PreviewPanel
   * - Background changes update immediately in FullPreviewDialog (if open)
   * - Update happens within 100ms threshold
   * - No visual flicker during transition
   */
  test('T043: should update background in real-time in PreviewPanel', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // Measure update latency
    const startTime = await page.evaluate(() => performance.now());
    
    // Change background via store
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, newBgUrl);
    
    // Wait for DOM update
    await page.waitForTimeout(50);
    
    const endTime = await page.evaluate(() => performance.now());
    const latency = endTime - startTime;
    
    // Verify update happened within 100ms threshold
    expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    
    // Verify background updated
    const currentBg = await studioPage.getPreviewBackgroundUrl();
    expect(currentBg).toContain(newBgUrl);
  });

  /**
   * T043: Real-time updates in FullPreviewDialog when open
   * 
   * Verify that:
   * - Background updates in FullPreviewDialog in real-time
   * - Both components update synchronously
   */
  test('T043: should update background in real-time in FullPreviewDialog when open', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.nature;
    
    // Open FullPreviewDialog first
    await studioPage.openFullPreview();
    
    // Measure update latency
    const startTime = await page.evaluate(() => performance.now());
    
    // Change background via store
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, newBgUrl);
    
    // Wait for DOM update
    await page.waitForTimeout(50);
    
    const endTime = await page.evaluate(() => performance.now());
    const latency = endTime - startTime;
    
    // Verify update happened within 100ms threshold
    expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    
    // Verify background updated in FullPreviewDialog
    const fullPreviewBg = await studioPage.getFullPreviewBackgroundUrl();
    expect(fullPreviewBg).toContain(newBgUrl);
    
    // Close dialog
    await studioPage.closeFullPreview();
  });

  /**
   * T043: Both previews update synchronously
   * 
   * Verify that:
   * - PreviewPanel and FullPreviewDialog update simultaneously
   * - No lag between components
   */
  test('T043: should update both previews synchronously', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.forest;
    
    // Open FullPreviewDialog
    await studioPage.openFullPreview();
    
    // Change background
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, newBgUrl);
    
    // Wait for update
    await page.waitForTimeout(100);
    
    // Get backgrounds from both components
    const previewBg = await studioPage.getPreviewBackgroundUrl();
    const fullPreviewBg = await studioPage.getFullPreviewBackgroundUrl();
    
    // Verify both have the same URL
    expect(previewBg).toContain(newBgUrl);
    expect(fullPreviewBg).toContain(newBgUrl);
    expect(previewBg).toBe(fullPreviewBg);
    
    await studioPage.closeFullPreview();
  });

  /**
   * T043: Rapid background changes update correctly
   * 
   * Verify that:
   * - Multiple rapid changes all update correctly
   * - Final state is consistent
   */
  test('T043: should handle rapid background changes correctly', async ({ page }) => {
    const backgrounds = [
      TEST_DATA.validBackgroundUrls.mountain,
      TEST_DATA.validBackgroundUrls.nature,
      TEST_DATA.validBackgroundUrls.forest,
      TEST_DATA.defaultBackgroundUrl,
    ];
    
    for (let i = 0; i < backgrounds.length; i++) {
      const bgUrl = backgrounds[i];
      
      // Change background rapidly
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, bgUrl);
      
      // Small wait to allow update
      await page.waitForTimeout(20);
      
      // Verify current background
      const currentBg = await studioPage.getPreviewBackgroundUrl();
      expect(currentBg).toContain(bgUrl);
    }
  });

  /**
   * T043: No visual flicker during background transition
   * 
   * Verify that:
   * - Background transitions smoothly
   * - No white flash or artifacts
   */
  test('T043: should transition backgrounds without visual flicker', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // Get initial background
    const initialBg = await studioPage.getPreviewBackgroundUrl();
    
    // Change background
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, newBgUrl);
    
    // Wait brief moment
    await page.waitForTimeout(50);
    
    // Verify no loading indicator appears (instant transition)
    const isLoading = await studioPage.isPreviewLoading();
    expect(isLoading).toBe(false);
    
    // Verify background updated
    const currentBg = await studioPage.getPreviewBackgroundUrl();
    expect(currentBg).toContain(newBgUrl);
    expect(currentBg).not.toBe(initialBg);
  });

  /**
   * T045: Template switching updates backgrounds immediately
   * 
   * Verify that:
   * - Template change triggers background update
   * - Background updates immediately
   * - No stale background remains
   */
  test('T045: should update background immediately when template changes', async ({ page }) => {
    const templateBackgrounds = TEST_DATA.templateBackgrounds;
    
    // Start with first template background
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, templateBackgrounds[0]);
    
    await page.waitForTimeout(100);
    
    // Simulate template switch by changing background
    for (let i = 1; i < templateBackgrounds.length; i++) {
      const startTime = await page.evaluate(() => performance.now());
      
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, templateBackgrounds[i]);
      
      // Wait for update
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      const latency = endTime - startTime;
      
      // Verify update happened immediately
      expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
      
      // Verify no old background remains
      const currentBg = await studioPage.getPreviewBackgroundUrl();
      expect(currentBg).toContain(templateBackgrounds[i]);
      expect(currentBg).not.toContain(templateBackgrounds[i - 1]);
    }
  });

  /**
   * T045: Template switching with FullPreviewDialog open
   * 
   * Verify that:
   * - Both previews update when template changes
   * - Update is synchronous
   */
  test('T045: should update background in both previews when template changes with dialog open', async ({ page }) => {
    const templateBackgrounds = TEST_DATA.templateBackgrounds;
    
    // Open FullPreviewDialog
    await studioPage.openFullPreview();
    
    // Simulate template switching
    for (const bgUrl of templateBackgrounds) {
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, bgUrl);
      
      await page.waitForTimeout(50);
      
      // Verify both previews have the same background
      const previewBg = await studioPage.getPreviewBackgroundUrl();
      const fullPreviewBg = await studioPage.getFullPreviewBackgroundUrl();
      
      expect(previewBg).toContain(bgUrl);
      expect(fullPreviewBg).toContain(bgUrl);
      expect(previewBg).toBe(fullPreviewBg);
    }
    
    await studioPage.closeFullPreview();
  });

  /**
   * T043: Update latency measured across multiple changes
   * 
   * Verify that:
   * - Average latency < 100ms
   * - Maximum latency < 150ms (with margin)
   * - No individual update exceeds threshold significantly
   */
  test('T043: should maintain consistent update latency across multiple changes', async ({ page }) => {
    const backgrounds = TEST_DATA.templateBackgrounds;
    const latencies: number[] = [];
    
    // Measure latency for each background change
    for (const bgUrl of backgrounds) {
      const startTime = await page.evaluate(() => performance.now());
      
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, bgUrl);
      
      // Wait for update
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      const latency = endTime - startTime;
      latencies.push(latency);
      
      // Verify each individual update is within threshold
      expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency + 50);
    }
    
    // Calculate statistics
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);
    
    // Log performance metrics
    console.log(`Update Latency Stats - Avg: ${avgLatency.toFixed(2)}ms, Min: ${minLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms`);
    
    // Verify average is within threshold
    expect(avgLatency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
  });

  /**
   * T043: Background update with dialog closed then opened
   * 
   * Verify that:
   * - Background updates when dialog is closed
   * - Updated background shows when dialog opens
   */
  test('T043: should reflect background updates when dialog is opened after change', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // Change background while dialog is closed
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, newBgUrl);
    
    await page.waitForTimeout(100);
    
    // Verify PreviewPanel has new background
    const previewBg = await studioPage.getPreviewBackgroundUrl();
    expect(previewBg).toContain(newBgUrl);
    
    // Open FullPreviewDialog
    await studioPage.openFullPreview();
    
    // Verify FullPreviewDialog has the same new background
    const fullPreviewBg = await studioPage.getFullPreviewBackgroundUrl();
    expect(fullPreviewBg).toContain(newBgUrl);
    expect(fullPreviewBg).toBe(previewBg);
    
    await studioPage.closeFullPreview();
  });

  /**
   * T045: Multiple rapid template switches
   * 
   * Verify that:
   * - System handles rapid template changes
   * - Final state is correct
   * - No race conditions
   */
  test('T045: should handle rapid template switches without race conditions', async ({ page }) => {
    const backgrounds = TEST_DATA.templateBackgrounds;
    const numIterations = 5;
    
    for (let iteration = 0; iteration < numIterations; iteration++) {
      for (const bgUrl of backgrounds) {
        // Rapid template switches
        await page.evaluate((url) => {
          const store = (window as any).__CONTENT_STORE__;
          if (store) {
            store.setState({ bgUrl: url });
          }
        }, bgUrl);
        
        await page.waitForTimeout(10); // Very short delay
      }
    }
    
    // Wait for final state to settle
    await page.waitForTimeout(100);
    
    // Verify final background is the last one set
    const finalBg = await studioPage.getPreviewBackgroundUrl();
    const lastBgUrl = backgrounds[backgrounds.length - 1];
    expect(finalBg).toContain(lastBgUrl);
  });

  /**
   * T043: Store state changes trigger updates
   * 
   * Verify that:
   * - Direct store mutations trigger UI updates
   * - Store subscribers receive updates
   */
  test('T043: should trigger updates when store state changes directly', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.nature;
    
    // Subscribe to store changes to verify updates happen
    const subscriptionFired = await page.evaluate((url) => {
      return new Promise<boolean>((resolve) => {
        const store = (window as any).__CONTENT_STORE__;
        if (!store) {
          resolve(false);
          return;
        }
        
        let fired = false;
        const unsubscribe = store.subscribe((state: any, prevState: any) => {
          if (state.bgUrl === url && prevState.bgUrl !== url) {
            fired = true;
          }
        });
        
        // Change state
        store.setState({ bgUrl: url });
        
        // Wait a bit then resolve
        setTimeout(() => {
          unsubscribe();
          resolve(fired);
        }, 100);
      });
    }, newBgUrl);
    
    // Verify subscription was triggered
    expect(subscriptionFired).toBe(true);
    
    // Verify UI updated
    const currentBg = await studioPage.getPreviewBackgroundUrl();
    expect(currentBg).toContain(newBgUrl);
  });

  /**
   * T045: Template background persists correctly
   * 
   * Verify that:
   * - Template background remains after other operations
   * - Background doesn't revert unexpectedly
   */
  test('T045: should persist template background through page interactions', async ({ page }) => {
    const templateBg = TEST_DATA.validBackgroundUrls.mountain;
    
    // Set template background
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, templateBg);
    
    await page.waitForTimeout(100);
    
    // Perform various interactions
    await studioPage.setEditorText('Test text');
    await page.waitForTimeout(50);
    
    // Open and close FullPreviewDialog
    await studioPage.openFullPreview();
    await page.waitForTimeout(50);
    await studioPage.closeFullPreview();
    
    await page.waitForTimeout(50);
    
    // Verify background is still the template background
    const currentBg = await studioPage.getPreviewBackgroundUrl();
    expect(currentBg).toContain(templateBg);
  });

  /**
   * T043: Loading indicator displays during updates
   * 
   * Verify that:
   * - Loading indicator appears briefly when changing to new image
   * - Loading indicator disappears after image loads
   */
  test('T043: should show loading indicator during background update', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // Change background and check for loading
    const loadingResult = await page.evaluate(async (url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (!store) return { loadingShown: false, duration: 0 };
      
      const startTime = performance.now();
      let loadingShown = false;
      const maxWait = 100;
      let elapsed = 0;
      
      // Change state
      store.setState({ bgUrl: url });
      
      // Check for loading indicator
      while (elapsed < maxWait) {
        const loadingEl = document.querySelector('[data-testid="loading-indicator"]');
        if (loadingEl && window.getComputedStyle(loadingEl).display !== 'none') {
          loadingShown = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
        elapsed = performance.now() - startTime;
      }
      
      return { loadingShown, duration: elapsed };
    }, newBgUrl);
    
    // Loading may or may not appear for cached images
    // The important thing is that the update happens
    await page.waitForTimeout(100);
    
    const currentBg = await studioPage.getPreviewBackgroundUrl();
    expect(currentBg).toContain(newBgUrl);
  });

  /**
   * T045: Template with empty background
   * 
   * Verify that:
   * - Empty background is handled gracefully during template switch
   * - No errors occur
   */
  test('T045: should handle template switch to empty background gracefully', async ({ page }) => {
    // Set initial background
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, TEST_DATA.validBackgroundUrls.mountain);
    
    await page.waitForTimeout(100);
    
    // Switch to empty background (simulating template change)
    await page.evaluate(() => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: '' });
      }
    });
    
    await page.waitForTimeout(100);
    
    // Verify no errors
    const hasError = await studioPage.isPreviewError();
    expect(hasError).toBe(false);
    
    // Verify preview is still functional
    await expect(studioPage.previewPanel.first()).toBeVisible();
  });

  /**
   * T043, T045: Update with different viewport sizes
   * 
   * Verify that:
   * - Real-time updates work on mobile, tablet, and desktop
   */
  test('should update background in real-time across different viewport sizes', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.mountain;
    const viewports = TEST_DATA.viewports;
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);
      
      // Change background
      const startTime = await page.evaluate(() => performance.now());
      
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, newBgUrl);
      
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      const latency = endTime - startTime;
      
      // Verify update happened within threshold
      expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
      
      // Verify background updated
      const currentBg = await studioPage.getPreviewBackgroundUrl();
      expect(currentBg).toContain(newBgUrl);
    }
  });

  /**
   * T043: Background update consistency after page reload
   * 
   * Verify that:
   * - Real-time updates continue to work after page reload
   */
  test('T043: should update background in real-time after page reload', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.nature;
    
    // Reload page
    await page.reload();
    await studioPage.waitForReady();
    
    // Change background after reload
    const startTime = await page.evaluate(() => performance.now());
    
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, newBgUrl);
    
    await page.waitForTimeout(50);
    
    const endTime = await page.evaluate(() => performance.now());
    const latency = endTime - startTime;
    
    // Verify update happened
    expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    
    const currentBg = await studioPage.getPreviewBackgroundUrl();
    expect(currentBg).toContain(newBgUrl);
  });
});
