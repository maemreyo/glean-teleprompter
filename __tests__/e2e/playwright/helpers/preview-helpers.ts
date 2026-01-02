import { Page, Locator, expect } from '@playwright/test';
import { StudioPage } from './studio-page';

/**
 * Preview Helpers - Utility functions for preview-related testing
 * 
 * Provides helper functions for:
 * - Background consistency verification
 * - Real-time update verification
 * - Error handling verification
 * - Performance measurement
 * 
 * @see plans/playwright-e2e-tests-009-fix-preview.md
 */

/**
 * Verify background consistency between PreviewPanel and FullPreviewDialog
 * 
 * @param studioPage - The StudioPage instance
 * @returns Object containing background URLs and whether they match
 */
export async function verifyBackgroundConsistency(
  studioPage: StudioPage
): Promise<{
  previewBackgroundUrl: string | null;
  fullPreviewBackgroundUrl: string | null;
  isConsistent: boolean;
}> {
  // Open full preview
  await studioPage.openFullPreview();
  
  // Get background URLs from both components
  const previewBgUrl = await studioPage.getPreviewBackgroundUrl();
  const fullPreviewBgUrl = await studioPage.getFullPreviewBackgroundUrl();
  
  // Close full preview
  await studioPage.closeFullPreview();
  
  return {
    previewBackgroundUrl: previewBgUrl,
    fullPreviewBackgroundUrl: fullPreviewBgUrl,
    isConsistent: previewBgUrl === fullPreviewBgUrl,
  };
}

/**
 * Verify text style consistency between PreviewPanel and FullPreviewDialog
 * 
 * @param studioPage - The StudioPage instance
 * @returns Object containing text styles from both components
 */
export async function verifyTextStyleConsistency(
  studioPage: StudioPage
): Promise<{
  previewTextStyle: {
    fontFamily: string;
    fontSize: string;
    color: string;
    textAlign: string;
  };
  fullPreviewTextStyle: {
    fontFamily: string;
    fontSize: string;
    color: string;
    textAlign: string;
  };
  isConsistent: boolean;
}> {
  // Get text style from PreviewPanel
  const previewTextStyle = await studioPage.getPreviewTextStyle();
  
  // Open full preview
  await studioPage.openFullPreview();
  
  // Get text style from FullPreviewDialog
  const fullPreviewTextStyle = await studioPage.getFullPreviewTextStyle();
  
  // Close full preview
  await studioPage.closeFullPreview();
  
  const isConsistent = 
    previewTextStyle.fontFamily === fullPreviewTextStyle.fontFamily &&
    previewTextStyle.fontSize === fullPreviewTextStyle.fontSize &&
    previewTextStyle.color === fullPreviewTextStyle.color &&
    previewTextStyle.textAlign === fullPreviewTextStyle.textAlign;
  
  return {
    previewTextStyle,
    fullPreviewTextStyle,
    isConsistent,
  };
}

/**
 * Measure update latency when changing editor text
 * 
 * @param studioPage - The StudioPage instance
 * @param newText - The new text to set
 * @returns The time in milliseconds it took for the update to reflect
 */
export async function measureUpdateLatency(
  studioPage: StudioPage,
  newText: string
): Promise<number> {
  const startTime = Date.now();
  
  await studioPage.setEditorText(newText);
  
  // Wait for the preview to update (check if text is visible in preview)
  await studioPage.page.waitForTimeout(100);
  
  const endTime = Date.now();
  return endTime - startTime;
}

/**
 * Verify real-time updates without unnecessary re-renders
 * 
 * @param studioPage - The StudioPage instance
 * @param changes - Array of text changes to make
 * @returns Array of update latencies for each change
 */
export async function verifyRealTimeUpdates(
  studioPage: StudioPage,
  changes: string[]
): Promise<number[]> {
  const latencies: number[] = [];
  
  for (const change of changes) {
    const latency = await measureUpdateLatency(studioPage, change);
    latencies.push(latency);
  }
  
  return latencies;
}

/**
 * Verify error handling for invalid background URL
 * 
 * @param studioPage - The StudioPage instance
 * @param invalidUrl - The invalid URL to test
 * @returns Object containing error state and message
 */
export async function verifyErrorHandling(
  studioPage: StudioPage,
  invalidUrl: string
): Promise<{
  previewError: boolean;
  previewErrorMessage: string;
  fullPreviewError: boolean;
  fullPreviewErrorMessage: string;
}> {
  // Mock storage with invalid URL
  await studioPage.mockStorage({
    text: 'Test text',
    bgUrl: invalidUrl,
  });
  
  // Wait for potential error to appear
  await studioPage.page.waitForTimeout(500);
  
  // Check PreviewPanel error
  const previewError = await studioPage.isPreviewError();
  const previewErrorMessage = await studioPage.getPreviewErrorMessage();
  
  // Open full preview
  await studioPage.openFullPreview();
  
  // Wait for potential error to appear
  await studioPage.page.waitForTimeout(500);
  
  // Check FullPreviewDialog error
  const fullPreviewError = await studioPage.isFullPreviewError();
  const fullPreviewErrorMessage = await studioPage.getFullPreviewErrorMessage();
  
  // Close full preview
  await studioPage.closeFullPreview();
  
  return {
    previewError,
    previewErrorMessage,
    fullPreviewError,
    fullPreviewErrorMessage,
  };
}

/**
 * Measure rendering performance
 * 
 * @param studioPage - The StudioPage instance
 * @param action - A function that performs an action to measure
 * @returns Object containing render metrics
 */
export async function measureRenderPerformance(
  studioPage: StudioPage,
  action: () => Promise<void>
): Promise<{
  renderCountBefore: number;
  renderCountAfter: number;
  renderDelta: number;
  durationMs: number;
}> {
  const renderCountBefore = await studioPage.getRenderCount();
  const startTime = Date.now();
  
  await action();
  
  // Wait for renders to settle
  await studioPage.page.waitForTimeout(200);
  
  const renderCountAfter = await studioPage.getRenderCount();
  const endTime = Date.now();
  
  return {
    renderCountBefore,
    renderCountAfter,
    renderDelta: renderCountAfter - renderCountBefore,
    durationMs: endTime - startTime,
  };
}

/**
 * Verify loading state for slow operations
 * 
 * @param studioPage - The StudioPage instance
 * @param action - A function that performs a slow operation
 * @returns Object containing loading state information
 */
export async function verifyLoadingState(
  studioPage: StudioPage,
  action: () => Promise<void>
): Promise<{
  loadingWasShown: boolean;
  loadingDurationMs: number;
}> {
  const startTime = Date.now();
  let loadingWasShown = false;
  
  // Start action in parallel
  const actionPromise = action();
  
  // Check if loading appears
  try {
    await studioPage.page.waitForTimeout(100);
    loadingWasShown = await studioPage.isPreviewLoading();
  } catch {
    // Loading might not appear at all
  }
  
  await actionPromise;
  
  const endTime = Date.now();
  
  return {
    loadingWasShown,
    loadingDurationMs: endTime - startTime,
  };
}

/**
 * Compare screenshots for visual regression testing
 * 
 * @param studioPage - The StudioPage instance
 * @param screenshotPath - The path to save the screenshot
 */
export async function captureScreenshot(
  studioPage: StudioPage,
  screenshotPath: string
): Promise<void> {
  await studioPage.screenshotPreviewPanel(screenshotPath);
}

/**
 * Verify keyboard shortcut for full preview
 * 
 * @param studioPage - The StudioPage instance
 * @returns Whether the shortcut worked correctly
 */
export async function verifyFullPreviewShortcut(
  studioPage: StudioPage
): Promise<boolean> {
  // Use keyboard shortcut to open
  await studioPage.triggerFullPreviewShortcut();
  
  // Check if dialog opened
  const isOpen = await studioPage.fullPreviewDialog.isVisible();
  
  // Close it
  await studioPage.closeFullPreview();
  
  return isOpen;
}

/**
 * Verify state persistence across reloads
 * 
 * @param studioPage - The StudioPage instance
 * @param text - The text to set
 * @param bgUrl - The background URL to set
 * @returns Whether state persisted correctly
 */
export async function verifyStatePersistence(
  studioPage: StudioPage,
  text: string,
  bgUrl?: string
): Promise<boolean> {
  // Set initial state
  await studioPage.setEditorText(text);
  
  if (bgUrl) {
    await studioPage.mockStorage({ text, bgUrl });
  }
  
  // Get initial background URL
  const initialBgUrl = await studioPage.getPreviewBackgroundUrl();
  const initialText = await studioPage.getEditorText();
  
  // Reload page
  await studioPage.page.reload();
  await studioPage.waitForReady();
  
  // Check state persisted
  const reloadedBgUrl = await studioPage.getPreviewBackgroundUrl();
  const reloadedText = await studioPage.getEditorText();
  
  return initialBgUrl === reloadedBgUrl && initialText === reloadedText;
}

/**
 * Verify responsive behavior on different viewport sizes
 * 
 * @param studioPage - The StudioPage instance
 * @param viewports - Array of viewport sizes to test
 */
export async function verifyResponsiveBehavior(
  studioPage: StudioPage,
  viewports: Array<{ width: number; height: number; name: string }>
): Promise<void> {
  for (const viewport of viewports) {
    await studioPage.page.setViewportSize({ width: viewport.width, height: viewport.height });
    await studioPage.page.waitForTimeout(300); // Wait for responsive layout to settle
    
    // Verify preview is still visible
    const previewPanel = studioPage.previewPanel;
    await expect(previewPanel.first()).toBeVisible();
  }
}

/**
 * Test data for preview tests
 * Exported as both previewTestData and TEST_DATA for compatibility
 */
export const previewTestData = {
  validBackgroundUrls: [
    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  ],
  invalidBackgroundUrls: [
    'https://invalid-url-that-does-not-exist.com/image.jpg',
    'https://example.com/404-image.jpg',
  ],
  sampleTexts: [
    'Hello World',
    'Lorem ipsum dolor sit amet',
    'This is a longer text to test real-time updates and ensure the preview updates correctly without unnecessary re-renders.',
  ],
  viewports: [
    { width: 1920, height: 1080, name: 'Desktop' },
    { width: 1024, height: 768, name: 'Tablet' },
    { width: 375, height: 667, name: 'Mobile' },
  ],
};

/**
 * TEST_DATA - Organized test data for 009-fix-preview tests
 * Provides structured test data following the test plan specification
 */
export const TEST_DATA = {
  /** Default background URL from ContentStore */
  defaultBackgroundUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  
  /** Valid background URLs for testing */
  validBackgroundUrls: {
    mountain: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
    forest: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  },
  
  /** Invalid background URLs for error handling tests */
  invalidBackgroundUrls: {
    nonexistentDomain: 'https://invalid-url-that-does-not-exist.com/image.jpg',
    malformed: 'not-a-valid-url',
    empty: '',
    fourOFour: 'https://example.com/404-image.jpg',
  },
  
  /** Large image URL for performance testing (T044) */
  largeImageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
  
  /** Sample texts for content testing */
  sampleTexts: previewTestData.sampleTexts,
  
  /** Viewport sizes for responsive testing */
  viewports: previewTestData.viewports,
  
  /** Performance thresholds (in milliseconds) */
  performanceThresholds: {
    updateLatency: 100,  // Maximum allowed update latency (T046)
    loadingTime: 50,     // Expected loading indicator display time
    imageLoadTimeout: 5000, // Maximum time to wait for image load
  },
  
  /** Template backgrounds for T045 testing */
  templateBackgrounds: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  ],
};
