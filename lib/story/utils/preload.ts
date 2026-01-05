/**
 * Slide Preloading Utility
 *
 * Calculates which slides should be preloaded based on current slide index.
 * Preloads slides +1 and +2 ahead of current position to prevent loading delays.
 *
 * @feature 012-standalone-story
 * @task T029
 */

/**
 * Calculate which slide indices should be preloaded
 *
 * Preloads the next 2 slides ahead of the current position to ensure
 * smooth transitions without loading delays.
 *
 * @param currentIndex - Current slide index (0-based)
 * @param totalSlides - Total number of slides in the story
 * @returns Array of slide indices to preload
 *
 * @example
 * ```ts
 * // On slide 0 of 10 slides
 * preloadSlides(0, 10); // Returns [1, 2]
 *
 * // On slide 8 of 10 slides (near end)
 * preloadSlides(8, 10); // Returns [9]
 *
 * // On last slide
 * preloadSlides(9, 10); // Returns []
 * ```
 */
export function getSlidesToPreload(
  currentIndex: number,
  totalSlides: number
): number[] {
  const indicesToPreload: number[] = [];

  // Preload slide +1 ahead
  const nextSlideIndex = currentIndex + 1;
  if (nextSlideIndex < totalSlides) {
    indicesToPreload.push(nextSlideIndex);
  }

  // Preload slide +2 ahead
  const nextNextSlideIndex = currentIndex + 2;
  if (nextNextSlideIndex < totalSlides) {
    indicesToPreload.push(nextNextSlideIndex);
  }

  return indicesToPreload;
}

/**
 * Check if a specific slide should be preloaded
 *
 * @param slideIndex - Index of the slide to check
 * @param currentIndex - Current slide index
 * @returns Whether the slide should be preloaded
 *
 * @example
 * ```ts
 * shouldPreloadSlide(2, 0); // true (2 is +2 ahead)
 * shouldPreloadSlide(3, 0); // false (3 is too far ahead)
 * shouldPreloadSlide(0, 0); // false (current slide)
 * ```
 */
export function shouldPreloadSlide(
  slideIndex: number,
  currentIndex: number
): boolean {
  const offset = slideIndex - currentIndex;
  return offset === 1 || offset === 2;
}

/**
 * Get preloading priority for a slide
 *
 * Higher priority slides should be loaded first.
 * Priority 1 = next slide, Priority 2 = slide after next.
 *
 * @param slideIndex - Index of the slide to prioritize
 * @param currentIndex - Current slide index
 * @returns Priority level (0 = don't preload, 1 = high, 2 = low)
 *
 * @example
 * ```ts
 * getPreloadPriority(1, 0); // 1 (high priority)
 * getPreloadPriority(2, 0); // 2 (low priority)
 * getPreloadPriority(3, 0); // 0 (don't preload)
 * ```
 */
export function getPreloadPriority(
  slideIndex: number,
  currentIndex: number
): 0 | 1 | 2 {
  const offset = slideIndex - currentIndex;

  if (offset === 1) return 1; // Next slide - high priority
  if (offset === 2) return 2; // Slide after next - low priority
  return 0; // Don't preload
}
