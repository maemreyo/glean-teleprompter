import { test, expect } from '@playwright/test';
import { StudioPage } from '../helpers/studio-page';
import { measureRenderPerformance, TEST_DATA } from '../helpers/preview-helpers';

/**
 * Feature 009-fix-preview: Performance Tests
 * 
 * Tests T046: 100ms update latency performance requirement
 * 
 * @see plans/playwright-e2e-tests-009-fix-preview.md
 */

test.describe('Feature 009-fix-preview: Performance (T046)', () => {
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
   * T046: 100ms update latency performance requirement
   * 
   * Verify that:
   * - Average update time < 100ms
   * - 95th percentile < 100ms
   * - No individual update > 150ms (allowing margin)
   */
  test('T046: should meet 100ms update latency performance requirement', async ({ page }) => {
    const backgrounds = TEST_DATA.templateBackgrounds;
    const latencies: number[] = [];
    const numIterations = 10;

    // Measure update latency for multiple changes
    for (let i = 0; i < numIterations; i++) {
      const bgUrl = backgrounds[i % backgrounds.length];
      
      const startTime = await page.evaluate(() => performance.now());
      
      // Change background
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, bgUrl);
      
      // Wait for DOM update
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      const latency = endTime - startTime;
      latencies.push(latency);
      
      // Verify each update is within acceptable range
      expect(latency).toBeLessThan(150); // Allow 50ms margin
    }

    // Calculate statistics
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const maxLatency = Math.max(...latencies);
    const minLatency = Math.min(...latencies);
    
    // Sort for percentile calculation
    const sorted = [...latencies].sort((a, b) => a - b);
    const percentile95Index = Math.floor(sorted.length * 0.95);
    const percentile95 = sorted[percentile95Index] || maxLatency;

    // Log performance metrics
    console.log(`Update Latency Performance:`);
    console.log(`  Average: ${avgLatency.toFixed(2)}ms`);
    console.log(`  Min: ${minLatency.toFixed(2)}ms`);
    console.log(`  Max: ${maxLatency.toFixed(2)}ms`);
    console.log(`  95th Percentile: ${percentile95.toFixed(2)}ms`);
    console.log(`  Threshold: ${TEST_DATA.performanceThresholds.updateLatency}ms`);

    // Verify performance requirements
    expect(avgLatency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    expect(percentile95).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    expect(maxLatency).toBeLessThan(150); // Allow margin for individual updates
  });

  /**
   * T046: Render performance measurement
   * 
   * Verify that:
   * - Renders are efficient
   * - No unnecessary re-renders
   * - Render count is reasonable
   */
  test('T046: should measure render performance accurately', async ({ page }) => {
    const newBgUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // Measure render performance using helper
    const metrics = await measureRenderPerformance(
      studioPage,
      async () => {
        await page.evaluate((url) => {
          const store = (window as any).__CONTENT_STORE__;
          if (store) {
            store.setState({ bgUrl: url });
          }
        }, newBgUrl);
      }
    );

    // Log render metrics
    console.log(`Render Performance Metrics:`);
    console.log(`  Renders Before: ${metrics.renderCountBefore}`);
    console.log(`  Renders After: ${metrics.renderCountAfter}`);
    console.log(`  Render Delta: ${metrics.renderDelta}`);
    console.log(`  Duration: ${metrics.durationMs.toFixed(2)}ms`);

    // Verify duration is within threshold
    expect(metrics.durationMs).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    
    // Verify background updated
    const currentBg = await studioPage.getPreviewBackgroundUrl();
    expect(currentBg).toContain(newBgUrl);
  });

  /**
   * T046: Multiple rapid changes performance
   * 
   * Verify that:
   * - System handles rapid changes efficiently
   * - No performance degradation over time
   * - Each change meets latency requirement
   */
  test('T046: should handle multiple rapid changes without performance degradation', async ({ page }) => {
    const backgrounds = TEST_DATA.templateBackgrounds;
    const numCycles = 5;
    const allLatencies: number[][] = [];

    for (let cycle = 0; cycle < numCycles; cycle++) {
      const cycleLatencies: number[] = [];

      for (const bgUrl of backgrounds) {
        const startTime = await page.evaluate(() => performance.now());
        
        await page.evaluate((url) => {
          const store = (window as any).__CONTENT_STORE__;
          if (store) {
            store.setState({ bgUrl: url });
          }
        }, bgUrl);
        
        await page.waitForTimeout(50);
        
        const endTime = await page.evaluate(() => performance.now());
        cycleLatencies.push(endTime - startTime);
      }

      allLatencies.push(cycleLatencies);
    }

    // Calculate average latency per cycle
    const cycleAvgs = allLatencies.map(latencies => 
      latencies.reduce((a, b) => a + b, 0) / latencies.length
    );

    console.log(`Rapid Changes Performance by Cycle:`);
    cycleAvgs.forEach((avg, i) => {
      console.log(`  Cycle ${i + 1}: ${avg.toFixed(2)}ms`);
    });

    // Verify no significant degradation (last cycle not 2x slower than first)
    const firstCycleAvg = cycleAvgs[0];
    const lastCycleAvg = cycleAvgs[cycleAvgs.length - 1];
    const degradationRatio = lastCycleAvg / firstCycleAvg;

    console.log(`Degradation Ratio: ${degradationRatio.toFixed(2)}x`);

    expect(degradationRatio).toBeLessThan(2.0); // Allow up to 2x degradation
    
    // Verify all cycles meet performance requirement
    cycleAvgs.forEach(avg => {
      expect(avg).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    });
  });

  /**
   * T046: Performance with FullPreviewDialog open
   * 
   * Verify that:
   * - Updates are fast even with dialog open
   * - Both components update efficiently
   */
  test('T046: should maintain performance with FullPreviewDialog open', async ({ page }) => {
    const backgrounds = TEST_DATA.templateBackgrounds;
    const latencies: number[] = [];

    // Open FullPreviewDialog
    await studioPage.openFullPreview();

    for (const bgUrl of backgrounds) {
      const startTime = await page.evaluate(() => performance.now());
      
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, bgUrl);
      
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      latencies.push(endTime - startTime);
    }

    await studioPage.closeFullPreview();

    // Calculate average
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log(`Performance with Dialog Open: ${avgLatency.toFixed(2)}ms average`);

    expect(avgLatency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
  });

  /**
   * T046: Performance after page reload
   * 
   * Verify that:
   * - Performance is consistent after reload
   * - No memory leaks affecting performance
   */
  test('T046: should maintain consistent performance after page reload', async ({ page }) => {
    const testUrl = TEST_DATA.validBackgroundUrls.mountain;
    const numReloads = 3;
    const allLatencies: number[] = [];

    for (let i = 0; i < numReloads; i++) {
      // Reload page
      await page.reload();
      await studioPage.waitForReady();

      // Measure latency
      const startTime = await page.evaluate(() => performance.now());
      
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, testUrl);
      
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      allLatencies.push(endTime - startTime);
    }

    console.log(`Performance After Reloads:`);
    allLatencies.forEach((latency, i) => {
      console.log(`  Reload ${i + 1}: ${latency.toFixed(2)}ms`);
    });

    // Verify all measurements meet threshold
    allLatencies.forEach(latency => {
      expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    });

    // Verify consistency (no significant degradation)
    const firstLatency = allLatencies[0];
    const lastLatency = allLatencies[allLatencies.length - 1];
    const ratio = lastLatency / firstLatency;

    expect(ratio).toBeLessThan(1.5); // Allow up to 50% variance
  });

  /**
   * T046: Performance under concurrent updates
   * 
   * Verify that:
   * - System handles concurrent state changes
   * - Performance remains acceptable
   */
  test('T046: should handle concurrent state changes efficiently', async ({ page }) => {
    const backgrounds = TEST_DATA.templateBackgrounds;
    const numConcurrent = 5;
    const latencies: number[] = [];

    for (let i = 0; i < numConcurrent; i++) {
      const bgUrl = backgrounds[i % backgrounds.length];
      
      const startTime = await page.evaluate(() => performance.now());
      
      // Change background along with text (simulating concurrent updates)
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          // Change both background and text
          store.setState({ 
            bgUrl: url,
            text: `Concurrent update ${i}`
          });
        }
      }, bgUrl);
      
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      latencies.push(endTime - startTime);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log(`Concurrent Updates Performance: ${avgLatency.toFixed(2)}ms average`);

    expect(avgLatency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency + 50); // Slightly higher threshold for concurrent
  });

  /**
   * T046: Performance on different viewport sizes
   * 
   * Verify that:
   * - Performance is consistent across viewports
   * - No significant performance difference
   */
  test('T046: should maintain consistent performance across different viewports', async ({ page }) => {
    const viewports = TEST_DATA.viewports;
    const testUrl = TEST_DATA.validBackgroundUrls.mountain;
    const viewportLatencies: { name: string; latency: number }[] = [];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(300);

      // Measure latency
      const startTime = await page.evaluate(() => performance.now());
      
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, testUrl);
      
      await page.waitForTimeout(50);
      
      const endTime = await page.evaluate(() => performance.now());
      const latency = endTime - startTime;
      
      viewportLatencies.push({ name: viewport.name, latency });
    }

    console.log(`Performance by Viewport:`);
    viewportLatencies.forEach(({ name, latency }) => {
      console.log(`  ${name}: ${latency.toFixed(2)}ms`);
    });

    // Verify all viewports meet threshold
    viewportLatencies.forEach(({ latency }) => {
      expect(latency).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
    });

    // Verify consistency (max variance 2x)
    const minLatency = Math.min(...viewportLatencies.map(v => v.latency));
    const maxLatency = Math.max(...viewportLatencies.map(v => v.latency));
    const variance = maxLatency / minLatency;

    expect(variance).toBeLessThan(2.0);
  });

  /**
   * T046: No performance warnings in console
   * 
   * Verify that:
   * - No React performance warnings
   * - No memory leak warnings
   * - No layout shift warnings
   */
  test('T046: should not produce performance warnings in console', async ({ page }) => {
    const warnings: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // Perform multiple background changes
    const backgrounds = TEST_DATA.templateBackgrounds;
    for (const bgUrl of backgrounds) {
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) {
          store.setState({ bgUrl: url });
        }
      }, bgUrl);
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);

    // Check for performance-related warnings
    const perfWarnings = warnings.filter(w => 
      w.toLowerCase().includes('performance') ||
      w.toLowerCase().includes('memory') ||
      w.toLowerCase().includes('render') ||
      w.toLowerCase().includes('layout shift') ||
      w.toLowerCase().includes('forced reflow')
    );

    console.log(`Performance Warnings: ${perfWarnings.length}`);
    if (perfWarnings.length > 0) {
      console.log('Warnings:', perfWarnings);
    }

    // Expect no performance warnings
    expect(perfWarnings.length).toBe(0);
  });

  /**
   * T046: Frame rate during background changes
   * 
   * Verify that:
   * - Frame rate remains acceptable during updates
   * - No jank or stutter
   */
  test('T046: should maintain acceptable frame rate during background changes', async ({ page }) => {
    const numFrames = 60;
    const frameTimes: number[] = [];

    // Measure frame times during background change
    await page.evaluate(async (num) => {
      return new Promise<void>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();
        const times: number[] = [];

        function measureFrame() {
          const now = performance.now();
          times.push(now);
          frameCount++;

          if (frameCount >= num) {
            // Store results for retrieval
            (window as any).__frameTimes = times;
            resolve();
            return;
          }

          requestAnimationFrame(measureFrame);
        }

        // Change background midway through measurement
        setTimeout(() => {
          const store = (window as any).__CONTENT_STORE__;
          if (store) {
            store.setState({ bgUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba' });
          }
        }, 500);

        requestAnimationFrame(measureFrame);
      });
    }, numFrames);

    // Retrieve frame times
    const frameTimesResult = await page.evaluate(() => {
      return (window as any).__frameTimes || [];
    });

    // Calculate average frame time
    const frameDeltas = [];
    for (let i = 1; i < frameTimesResult.length; i++) {
      frameDeltas.push(frameTimesResult[i] - frameTimesResult[i - 1]);
    }

    const avgFrameTime = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
    const avgFps = 1000 / avgFrameTime;

    console.log(`Frame Rate Performance:`);
    console.log(`  Average Frame Time: ${avgFrameTime.toFixed(2)}ms`);
    console.log(`  Average FPS: ${avgFps.toFixed(2)}`);

    // Verify frame rate is acceptable (> 30 FPS for smooth animation)
    expect(avgFps).toBeGreaterThan(30);
  });

  /**
   * T046: Memory usage during background changes
   * 
   * Verify that:
   * - No significant memory increase
   * - No memory leaks
   */
  test('T046: should not leak memory during background changes', async ({ page }) => {
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Perform many background changes
    const backgrounds = TEST_DATA.templateBackgrounds;
    const numIterations = 20;

    for (let i = 0; i < numIterations; i++) {
      for (const bgUrl of backgrounds) {
        await page.evaluate((url) => {
          const store = (window as any).__CONTENT_STORE__;
          if (store) {
            store.setState({ bgUrl: url });
          }
        }, bgUrl);
        await page.waitForTimeout(10);
      }
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    await page.waitForTimeout(500);

    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const increasePercent = (memoryIncrease / initialMemory) * 100;

      console.log(`Memory Usage:`);
      console.log(`  Initial: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Final: ${(finalMemory / 1024 / 1024).toFixed(2)}MB`);
      console.log(`  Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${increasePercent.toFixed(1)}%)`);

      // Allow up to 50% memory increase (accounting for caching)
      expect(increasePercent).toBeLessThan(50);
    } else {
      console.log('Memory API not available, skipping memory check');
    }
  });

  /**
   * T046: Performance with cached vs uncached images
   * 
   * Verify that:
   * - Cached images load faster
   * - Performance improvement is noticeable
   */
  test('T046: should load cached images faster than uncached', async ({ page }) => {
    const testUrl = TEST_DATA.validBackgroundUrls.mountain;
    
    // First load (uncached)
    const startTime1 = await page.evaluate(() => performance.now());
    
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, testUrl);
    
    // Wait for network request
    await Promise.race([
      page.waitForResponse((response) => response.url().includes('unsplash')),
      page.waitForTimeout(2000),
    ]);
    
    await page.waitForTimeout(100);
    
    const endTime1 = await page.evaluate(() => performance.now());
    const firstLoadTime = endTime1 - startTime1;

    // Second load (cached)
    await page.evaluate(() => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: '' }); // Clear
      }
    });
    
    await page.waitForTimeout(200);

    const startTime2 = await page.evaluate(() => performance.now());
    
    await page.evaluate((url) => {
      const store = (window as any).__CONTENT_STORE__;
      if (store) {
        store.setState({ bgUrl: url });
      }
    }, testUrl);
    
    await page.waitForTimeout(100);
    
    const endTime2 = await page.evaluate(() => performance.now());
    const cachedLoadTime = endTime2 - startTime2;

    console.log(`Cache Performance:`);
    console.log(`  First Load: ${firstLoadTime.toFixed(2)}ms`);
    console.log(`  Cached Load: ${cachedLoadTime.toFixed(2)}ms`);
    console.log(`  Speedup: ${(firstLoadTime / cachedLoadTime).toFixed(2)}x`);

    // Cached load should be faster
    expect(cachedLoadTime).toBeLessThanOrEqual(firstLoadTime);
    
    // Both should meet performance threshold
    expect(cachedLoadTime).toBeLessThan(TEST_DATA.performanceThresholds.updateLatency);
  });

  /**
   * T046: Performance summary report
   * 
   * Generate comprehensive performance report
   */
  test('T046: should generate comprehensive performance report', async ({ page }) => {
    const report: any = {
      timestamp: new Date().toISOString(),
      userAgent: await page.evaluate(() => navigator.userAgent),
      viewport: await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight })),
      tests: [],
    };

    // Test 1: Basic update latency
    const latencies: number[] = [];
    for (let i = 0; i < 10; i++) {
      const startTime = await page.evaluate(() => performance.now());
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) store.setState({ bgUrl: url });
      }, TEST_DATA.validBackgroundUrls.mountain);
      await page.waitForTimeout(50);
      const endTime = await page.evaluate(() => performance.now());
      latencies.push(endTime - startTime);
    }

    report.tests.push({
      name: 'Basic Update Latency',
      avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      min: Math.min(...latencies),
      max: Math.max(...latencies),
      passed: latencies.every(l => l < TEST_DATA.performanceThresholds.updateLatency),
    });

    // Test 2: With dialog open
    await studioPage.openFullPreview();
    const dialogLatencies: number[] = [];
    for (let i = 0; i < 5; i++) {
      const startTime = await page.evaluate(() => performance.now());
      await page.evaluate((url) => {
        const store = (window as any).__CONTENT_STORE__;
        if (store) store.setState({ bgUrl: url });
      }, TEST_DATA.validBackgroundUrls.nature);
      await page.waitForTimeout(50);
      const endTime = await page.evaluate(() => performance.now());
      dialogLatencies.push(endTime - startTime);
    }
    await studioPage.closeFullPreview();

    report.tests.push({
      name: 'Update with Dialog Open',
      avg: dialogLatencies.reduce((a, b) => a + b, 0) / dialogLatencies.length,
      min: Math.min(...dialogLatencies),
      max: Math.max(...dialogLatencies),
      passed: dialogLatencies.every(l => l < TEST_DATA.performanceThresholds.updateLatency),
    });

    console.log('\n=== Performance Report ===');
    console.log(JSON.stringify(report, null, 2));
    console.log('========================\n');

    // Verify all tests passed
    report.tests.forEach((test: any) => {
      expect(test.passed).toBe(true);
    });
  });
});
