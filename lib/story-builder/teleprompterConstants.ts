/**
 * Teleprompter Constants
 *
 * Magic numbers and configuration values for teleprompter functionality.
 * Extracted from inline values to improve maintainability and documentation.
 *
 * @feature 014-teleprompter-preview-sync
 */

// ============================================================================
// Focal Point Constants
// ============================================================================

/**
 * Focal point base position (top section) as percentage
 * Values 0-33 represent the top section of the screen
 */
export const FOCAL_POINT_BASE = 33;

/**
 * Focal point center position with safe area as percentage
 * Values 34-66 represent the center section of the screen (recommended)
 */
export const FOCAL_POINT_WITH_SAFE_AREA = 38;

/**
 * Minimum focal point value (top of screen)
 */
export const FOCAL_POINT_MIN = 0;

/**
 * Maximum focal point value (bottom of screen)
 */
export const FOCAL_POINT_MAX = 100;

/**
 * Focal point slider step increment
 */
export const FOCAL_POINT_STEP = 5;

// ============================================================================
// Font Size Constants
// ============================================================================

/**
 * Minimum font size in pixels
 */
export const FONT_SIZE_MIN = 16;

/**
 * Maximum font size in pixels
 */
export const FONT_SIZE_MAX = 48;

/**
 * Default font size in pixels
 */
export const FONT_SIZE_DEFAULT = 24;

/**
 * Font size slider step increment
 */
export const FONT_SIZE_STEP = 2;

// ============================================================================
// Performance Constants
// ============================================================================

/**
 * Preview sync debounce delay in milliseconds
 * Prevents excessive postMessage updates during rapid editing
 */
export const PREVIEW_SYNC_DEBOUNCE_MS = 100;

/**
 * Maximum acceptable preview sync latency in milliseconds
 * Updates exceeding this threshold trigger a warning
 */
export const PREVIEW_SYNC_MAX_LATENCY_MS = 100;

// ============================================================================
// UI Constants
// ============================================================================

/**
 * Height of gradient overlay on top/bottom of teleprompter
 * Uses viewport height units (35vh = 35% of viewport height)
 */
export const TELEPROMPTER_GRADIENT_HEIGHT = '35vh';

/**
 * Minimum height of teleprompter text area in pixels
 */
export const TELEPROMPTER_TEXT_MIN_HEIGHT = 120;

// ============================================================================
// Safe Area Padding Constants
// ============================================================================

/**
 * Maximum safe area padding value in pixels
 */
export const SAFE_AREA_PADDING_MAX = 200;

/**
 * Default safe area padding (no padding)
 */
export const SAFE_AREA_PADDING_DEFAULT = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

// ============================================================================
// Validation Range Constants
// ============================================================================

/**
 * Line height minimum value
 */
export const LINE_HEIGHT_MIN = 1.0;

/**
 * Line height maximum value
 */
export const LINE_HEIGHT_MAX = 3.0;

/**
 * Default line height
 */
export const LINE_HEIGHT_DEFAULT = 1.4;

/**
 * Letter spacing minimum value in pixels
 */
export const LETTER_SPACING_MIN = -5;

/**
 * Letter spacing maximum value in pixels
 */
export const LETTER_SPACING_MAX = 20;

/**
 * Default letter spacing in pixels
 */
export const LETTER_SPACING_DEFAULT = 0;

/**
 * Background opacity minimum value (0% = transparent)
 */
export const BACKGROUND_OPACITY_MIN = 0;

/**
 * Background opacity maximum value (100% = opaque)
 */
export const BACKGROUND_OPACITY_MAX = 100;

/**
 * Default background opacity (100% = fully opaque)
 */
export const BACKGROUND_OPACITY_DEFAULT = 100;

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default focal point position (center)
 */
export const FOCAL_POINT_DEFAULT = 50;

/**
 * Default text alignment
 */
export const TEXT_ALIGN_DEFAULT: 'left' | 'center' | 'right' = 'left';

/**
 * Default scroll speed preset
 */
export const SCROLL_SPEED_DEFAULT: 'slow' | 'medium' | 'fast' = 'medium';

/**
 * Default mirror horizontal setting
 */
export const MIRROR_HORIZONTAL_DEFAULT = false;

/**
 * Default mirror vertical setting
 */
export const MIRROR_VERTICAL_DEFAULT = false;

/**
 * Default background color (black)
 */
export const BACKGROUND_COLOR_DEFAULT = '#000000';

// ============================================================================
// Focal Point Region Labels
// ============================================================================

/**
 * Focal point region boundaries for display labels
 */
export const FOCAL_POINT_REGION_TOP = FOCAL_POINT_BASE;
export const FOCAL_POINT_REGION_CENTER = 66;

/**
 * Get focal point region label for display
 * @param value - Focal point value (0-100)
 * @returns Region label: 'Top', 'Center', or 'Bottom'
 */
export function getFocalPointRegionLabel(value: number): string {
  if (value < FOCAL_POINT_REGION_TOP) return 'Top';
  if (value < FOCAL_POINT_REGION_CENTER) return 'Center';
  return 'Bottom';
}
