/**
 * URL Generator Utilities
 *
 * Integration with existing URL encoding from lib/story/utils/urlEncoder.ts.
 * Provides validation and length checking for generated URLs.
 *
 * @feature 013-visual-story-builder
 */

import type { BuilderSlide } from './types';
import { encodeStoryForUrl } from '../story/utils/urlEncoder';
import type { StoryScript } from '../story/types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Maximum URL length in bytes (32KB).
 * Most browsers support up to 2MB, but we use 32KB for safety.
 */
export const MAX_URL_LENGTH = 32 * 1024;

/**
 * Maximum slides to avoid exceeding URL length limit.
 */
export const MAX_SLIDES_FOR_URL = 20;

// ============================================================================
// URL Generation
// ============================================================================

/**
 * Generate a shareable URL for the story.
 * Uses existing encodeStoryForUrl from lib/story/utils/urlEncoder.ts
 */
export function generateStoryUrl(slides: BuilderSlide[], baseUrl: string = ''): string {
  if (slides.length === 0) {
    throw new Error('Cannot generate URL: no slides in story');
  }

  // Convert BuilderSlide to AnySlide by removing builder-specific properties
  const slidesForUrl = slides.map(
    ({ thumbnail, isDragging, isSelected, ...slide }) => slide
  );

  const storyScript: StoryScript = {
    id: crypto.randomUUID(),
    title: 'Story Builder Story',
    slides: slidesForUrl,
    autoAdvance: true,
    showProgress: true,
    version: '1.0',
  };

  const encoded = encodeStoryForUrl(storyScript);

  // Check URL length limit
  if (encoded.length > MAX_URL_LENGTH) {
    throw new Error(
      `Generated URL exceeds ${MAX_URL_LENGTH} bytes limit. Try reducing the number of slides or content.`
    );
  }

  return encoded;
}

/**
 * Validate that a story can be encoded without exceeding URL length limit.
 */
export function validateUrlLength(slides: BuilderSlide[]): { valid: boolean; estimatedSize: number; error?: string } {
  if (slides.length > MAX_SLIDES_FOR_URL) {
    return {
      valid: false,
      estimatedSize: 0,
      error: `Too many slides (maximum ${MAX_SLIDES_FOR_URL})`,
    };
  }

  try {
    const url = generateStoryUrl(slides);
    const size = new Blob([url]).size;

    if (size > MAX_URL_LENGTH) {
      return {
        valid: false,
        estimatedSize: size,
        error: `Generated URL would be ${size} bytes (maximum ${MAX_URL_LENGTH})`,
      };
    }

    return {
      valid: true,
      estimatedSize: size,
    };
  } catch (error) {
    return {
      valid: false,
      estimatedSize: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get estimated URL size for a story without generating the full URL.
 * Useful for showing progress warnings as user adds slides.
 */
export function estimateUrlSize(slides: BuilderSlide[]): number {
  // Rough estimate: each slide averages ~1KB when encoded
  const BASE_SIZE = 500; // Base URL structure
  const PER_SLIDE_SIZE = 1000;

  return BASE_SIZE + (slides.length * PER_SLIDE_SIZE);
}

/**
 * Check if adding another slide would likely exceed the URL length limit.
 */
export function wouldExceedUrlLimit(slides: BuilderSlide[]): boolean {
  if (slides.length >= MAX_SLIDES_FOR_URL) {
    return true;
  }

  const estimatedSize = estimateUrlSize(slides);
  const estimatedWithOneMore = estimatedSize + 1000; // Add ~1KB for another slide

  return estimatedWithOneMore > (MAX_URL_LENGTH * 0.9); // 90% threshold
}
