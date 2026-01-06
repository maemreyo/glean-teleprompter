/**
 * Configuration constants for the Visual Story Builder
 * These values are based on the design specifications and performance targets
 * 
 * @feature 013-visual-story-builder
 */

export const STORY_BUILDER_CONSTANTS = {
  /** Maximum number of slides allowed per story */
  MAX_SLIDES: 20,

  /** Auto-save interval in milliseconds (30 seconds) */
  AUTO_SAVE_INTERVAL: 30000,

  /** Maximum URL length limit (32KB - Next.js dynamic route limit) */
  MAX_URL_LENGTH: 32 * 1024,

  /** Preview update debounce threshold (milliseconds) */
  PREVIEW_DEBOUNCE_MS: 100,

  /** Touch target minimum size in pixels (WCAG AAA) */
  TOUCH_TARGET_MIN_SIZE: 44,

  /** Slide card dimensions (Instagram 9:16 ratio) */
  SLIDE_CARD_WIDTH: 120,
  SLIDE_CARD_HEIGHT: 213,

  /** Border radius for Instagram-like thumbnails */
  STORY_THUMBNAIL_RADIUS: 'rounded-2xl', // 24px

  /** Duration range for slide duration slider */
  DURATION_MIN: 1,
  DURATION_MAX: 30,
  DURATION_STEP: 0.5,

  /** Image file size limit in bytes (5MB) */
  IMAGE_MAX_SIZE: 5 * 1024 * 1024,

  /** Story rail gap between thumbnails */
  STORY_RAIL_GAP: 12,
} as const;

export const { 
  MAX_SLIDES, 
  AUTO_SAVE_INTERVAL, 
  PREVIEW_DEBOUNCE_MS,
  MAX_URL_LENGTH,
  TOUCH_TARGET_MIN_SIZE,
  SLIDE_CARD_WIDTH,
  SLIDE_CARD_HEIGHT,
  STORY_THUMBNAIL_RADIUS,
  DURATION_MIN,
  DURATION_MAX,
  DURATION_STEP,
  IMAGE_MAX_SIZE,
  STORY_RAIL_GAP
} = STORY_BUILDER_CONSTANTS;
