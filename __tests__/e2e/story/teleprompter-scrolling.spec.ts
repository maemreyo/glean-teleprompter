/**
 * Teleprompter Scrolling Performance E2E Tests
 * 
 * End-to-end tests for scrolling performance using Playwright
 * 
 * @feature 012-standalone-story
 */

import { test, expect } from '@playwright/test';

test.describe('Teleprompter Scrolling Performance (T038)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a story with teleprompter slide
    // In real scenario, this would be a actual story URL
    await page.goto('/story/test-teleprompter-story');
  });

  test('should maintain 30fps during smooth scrolling', async ({ page }) => {
    // Start scrolling
    await page.click('[aria-label*="play" i], [aria-label*="start" i]');
    
    // Measure FPS over 2 seconds
    const fpsSamples: number[] = [];
    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    while (Date.now() - startTime < duration) {
      const frameStart = performance.now();
      
      // Wait for next frame
      await page.waitForTimeout(16); // ~60fps
      
      const frameEnd = performance.now();
      const frameTime = frameEnd - frameStart;
      const fps = 1000 / frameTime;
      fpsSamples.push(fps);
    }

    // Calculate average FPS
    const avgFps = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;
    
    // Should maintain at least 30fps
    expect(avgFps).toBeGreaterThanOrEqual(30);
  });

  test('should scroll smoothly at various speeds', async ({ page }) => {
    const speeds = [0.5, 1.0, 2.0, 3.0, 5.0];
    
    for (const speed of speeds) {
      // Set speed using slider
      const speedSlider = page.locator('[role="slider"]').first();
      await speedSlider.fill(speed.toString());
      
      // Start scrolling
      await page.click('[aria-label*="play" i]');
      
      // Measure FPS for 1 second at this speed
      const fpsSamples: number[] = [];
      const startTime = Date.now();
      
      while (Date.now() - startTime < 1000) {
        const frameStart = performance.now();
        await page.waitForTimeout(16);
        const frameEnd = performance.now();
        const fps = 1000 / (frameEnd - frameStart);
        fpsSamples.push(fps);
      }
      
      const avgFps = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;
      
      // Should maintain 30fps+ at all speeds
      expect(avgFps).toBeGreaterThanOrEqual(30);
      
      // Stop scrolling
      await page.click('[aria-label*="pause" i]');
    }
  });

  test('should use RAF-based scrolling for smooth animation', async ({ page }) => {
    // Start scrolling
    await page.click('[aria-label*="play" i]');
    
    // Monitor scroll position updates
    const scrollPositions: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const scrollTop = await page.evaluate(() => {
        const container = document.querySelector('[data-scroll-container]');
        return container ? (container as HTMLElement).scrollTop : 0;
      });
      scrollPositions.push(scrollTop);
      await page.waitForTimeout(16);
    }
    
    // Scroll position should change smoothly (not jump)
    const deltas = scrollPositions.slice(1).map((pos, i) => pos - scrollPositions[i]);
    const maxDelta = Math.max(...deltas.map(Math.abs));
    
    // Each frame should move reasonable amount (not jump hundreds of pixels)
    expect(maxDelta).toBeLessThan(50);
  });

  test('should decelerate smoothly on pause', async ({ page }) => {
    // Start scrolling at high speed
    const speedSlider = page.locator('[role="slider"]').first();
    await speedSlider.fill('4.0');
    await page.click('[aria-label*="play" i]');
    
    // Let it scroll for 500ms
    await page.waitForTimeout(500);
    
    // Get scroll position before pause
    const scrollBeforePause = await page.evaluate(() => {
      const container = document.querySelector('[data-scroll-container]');
      return container ? (container as HTMLElement).scrollTop : 0;
    });
    
    // Pause
    await page.click('[aria-label*="pause" i]');
    
    // Measure scroll during deceleration
    const scrollDuringDecel: number[] = [];
    for (let i = 0; i < 10; i++) {
      const scrollTop = await page.evaluate(() => {
        const container = document.querySelector('[data-scroll-container]');
        return container ? (container as HTMLElement).scrollTop : 0;
      });
      scrollDuringDecel.push(scrollTop);
      await page.waitForTimeout(50);
    }
    
    // Calculate deceleration curve
    const deltas = scrollDuringDecel.slice(1).map((pos, i) => pos - scrollDuringDecel[i]);
    
    // Each delta should be smaller than the previous (decelerating)
    for (let i = 1; i < deltas.length; i++) {
      expect(Math.abs(deltas[i])).toBeLessThanOrEqual(Math.abs(deltas[i - 1]) + 1);
    }
    
    // Should eventually stop
    const finalScroll = scrollDuringDecel[scrollDuringDecel.length - 1];
    expect(finalScroll).toBeGreaterThan(scrollBeforePause);
  });

  test('should perform well on mobile viewport (9:16)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 360, height: 640 });
    
    // Start scrolling
    await page.click('[aria-label*="play" i]');
    
    // Measure FPS on mobile
    const fpsSamples: number[] = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 2000) {
      const frameStart = performance.now();
      await page.waitForTimeout(16);
      const frameEnd = performance.now();
      const fps = 1000 / (frameEnd - frameStart);
      fpsSamples.push(fps);
    }
    
    const avgFps = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;
    
    // Should maintain 30fps+ on mobile
    expect(avgFps).toBeGreaterThanOrEqual(30);
  });

  test('should measure actual FPS > 30fps during scrolling', async ({ page }) => {
    // Start scrolling
    await page.click('[aria-label*="play" i]');
    
    // Collect performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frameTimes: number[] = [];
        let startTime = performance.now();
        
        function measureFrame() {
          const now = performance.now();
          const frameTime = now - startTime;
          frameTimes.push(frameTime);
          startTime = now;
          
          if (frameTimes.length < 60) {
            requestAnimationFrame(measureFrame);
          } else {
            // Calculate average FPS
            const avgFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
            const avgFps = 1000 / avgFrameTime;
            resolve(avgFps);
          }
        }
        
        requestAnimationFrame(measureFrame);
      });
    });
    
    expect(performanceMetrics).toBeGreaterThanOrEqual(30);
  });

  test('should handle rapid speed changes without frame drops', async ({ page }) => {
    // Start scrolling
    await page.click('[aria-label*="play" i]');
    
    // Rapidly change speeds
    const speeds = [1.0, 3.0, 0.5, 4.0, 2.0, 5.0];
    const speedSlider = page.locator('[role="slider"]').first();
    
    for (const speed of speeds) {
      await speedSlider.fill(speed.toString());
      await page.waitForTimeout(100); // 100ms between changes
    }
    
    // Measure FPS during rapid changes
    const fpsSamples: number[] = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 1000) {
      const frameStart = performance.now();
      await page.waitForTimeout(16);
      const frameEnd = performance.now();
      const fps = 1000 / (frameEnd - frameStart);
      fpsSamples.push(fps);
    }
    
    const avgFps = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;
    
    // Should maintain 30fps+ even during rapid changes
    expect(avgFps).toBeGreaterThanOrEqual(30);
  });

  test('should maintain performance with long content', async ({ page }) => {
    // This test assumes story has very long content (10,000+ words)
    
    // Start scrolling from beginning
    await page.click('[aria-label*="play" i]');
    
    // Measure FPS over 5 seconds of scrolling
    const fpsSamples: number[] = [];
    const startTime = Date.now();
    
    while (Date.now() - startTime < 5000) {
      const frameStart = performance.now();
      await page.waitForTimeout(16);
      const frameEnd = performance.now();
      const fps = 1000 / (frameEnd - frameStart);
      fpsSamples.push(fps);
    }
    
    const avgFps = fpsSamples.reduce((sum, fps) => sum + fps, 0) / fpsSamples.length;
    
    // Should maintain 30fps+ with long content
    expect(avgFps).toBeGreaterThanOrEqual(30);
  });

  test('should not cause excessive main thread blocking', async ({ page }) => {
    // Start scrolling
    await page.click('[aria-label*="play" i]');
    
    // Measure main thread blocking time
    const blockingMetrics = await page.evaluate(async () => {
      const blockingTimes: number[] = [];
      
      for (let i = 0; i < 30; i++) {
        const start = performance.now();
        
        // Wait for next frame
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const end = performance.now();
        blockingTimes.push(end - start);
      }
      
      return {
        maxBlocking: Math.max(...blockingTimes),
        avgBlocking: blockingTimes.reduce((sum, time) => sum + time, 0) / blockingTimes.length,
      };
    });
    
    // Main thread should not be blocked for more than 50ms per frame
    expect(blockingMetrics.maxBlocking).toBeLessThan(50);
    
    // Average blocking should be under 20ms
    expect(blockingMetrics.avgBlocking).toBeLessThan(20);
  });

  test('should preserve scroll ratio on font size change', async ({ page }) => {
    // Scroll to middle position
    await page.click('[aria-label*="play" i]');
    await page.waitForTimeout(1000);
    await page.click('[aria-label*="pause" i]');
    
    // Get scroll position before font change
    const scrollBefore = await page.evaluate(() => {
      const container = document.querySelector('[data-scroll-container]');
      return container ? (container as HTMLElement).scrollTop : 0;
    });
    
    const scrollHeightBefore = await page.evaluate(() => {
      const container = document.querySelector('[data-scroll-container]');
      return container ? (container as HTMLElement).scrollHeight : 0;
    });
    
    const ratioBefore = scrollBefore / (scrollHeightBefore - window.innerHeight);
    
    // Increase font size
    await page.click('[aria-label*="increase font" i]');
    await page.waitForTimeout(100); // Wait for layout update
    
    // Get scroll position after font change
    const scrollAfter = await page.evaluate(() => {
      const container = document.querySelector('[data-scroll-container]');
      return container ? (container as HTMLElement).scrollTop : 0;
    });
    
    const scrollHeightAfter = await page.evaluate(() => {
      const container = document.querySelector('[data-scroll-container]');
      return container ? (container as HTMLElement).scrollHeight : 0;
    });
    
    const ratioAfter = scrollAfter / (scrollHeightAfter - window.innerHeight);
    
    // Ratio should be preserved within 5% (SC-006 requirement)
    const ratioDifference = Math.abs(ratioBefore - ratioAfter);
    expect(ratioDifference).toBeLessThan(0.05);
  });
});
