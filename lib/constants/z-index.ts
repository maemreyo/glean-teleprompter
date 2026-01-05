/**
 * Z-Index Constants for Runner Component
 *
 * Z-INDEX LAYER STRATEGY:
 * - Base layers (0-99): Background and static content
 * - UI layers (100-499): Controls and panels
 * - Widget layers (500-999): Draggable widgets
 * - Overlay layers (1000+): Modals and dialogs
 *
 * SPACING RULES:
 * - Major layers: 100-step increments
 * - Within layers: 10-step increments
 * - Dynamic widgets: Reserve range of 50 for increments
 *
 * @module lib/constants/z-index
 */

/**
 * Base z-index for the lowest layer (background)
 * Usage: Background div, backdrop images
 */
export const Z_INDEX_BASE = 0;

/**
 * Overlay layer for tint/backdrop effects
 * Usage: Black overlay with opacity for text contrast
 */
export const Z_INDEX_OVERLAY = 1;

/**
 * Content text layer - the teleprompter scrolling text
 * Usage: TeleprompterText container
 */
export const Z_INDEX_CONTENT = 10;

/**
 * Top control bar layer
 * Usage: Theme switcher, quick settings button, camera toggle, back button
 */
export const Z_INDEX_CONTROLS_TOP = 100;

/**
 * Bottom control bar layer (playback controls)
 * Usage: Play/pause button, speed slider, font size slider, music toggle
 */
export const Z_INDEX_CONTROLS_BOTTOM = 110;

/**
 * Quick Settings Panel layer (dialog)
 * Must be higher than controls to avoid overlap
 * Usage: QuickSettingsPanel Radix Dialog override
 */
export const Z_INDEX_QUICK_SETTINGS = 200;

/**
 * Base layer for draggable widgets
 * Usage: DraggableCamera widget container
 */
export const Z_INDEX_WIDGET_BASE = 500;

/**
 * Drag handle indicator (nested within widget)
 * NOTE: Nested z-index has no effect - included for documentation
 * Usage: Visual drag handle at top of camera widget
 */
export const Z_INDEX_WIDGET_HANDLE = 530;

/**
 * Music Player Widget base layer
 * Allows camera to potentially be raised above via dynamic incrementing
 * Usage: MusicPlayerWidget draggable container
 */
export const Z_INDEX_MUSIC_WIDGET_BASE = 600;

/**
 * Music widget reconfigure button
 * Must be above the widget itself
 * Usage: Settings button that routes to /studio?tab=music
 */
export const Z_INDEX_MUSIC_WIDGET_CONFIGURE = 650;

/**
 * Maximum z-index for dynamic widget incrementing
 * Widgets can increment their z-index on focus/drag to bring to front
 * Reserved range: 600-649 for music widget dynamic increments
 */
export const Z_INDEX_MUSIC_WIDGET_MAX = 649;

/**
 * Maximum z-index for camera widget dynamic incrementing
 * Camera widget can increment on focus/drag to compete with music widget
 * Reserved range: 500-599 for camera widget dynamic increments
 */
export const Z_INDEX_WIDGET_MAX = 599;

/**
 * Modal/Dialog layer for future overlays
 * Usage: Error dialogs, confirmation modals (not yet implemented)
 */
export const Z_INDEX_MODAL = 1000;

/**
 * Z-Index enum for type-safe usage
 */
export enum ZIndex {
  Base = Z_INDEX_BASE,
  Overlay = Z_INDEX_OVERLAY,
  Content = Z_INDEX_CONTENT,
  ControlsTop = Z_INDEX_CONTROLS_TOP,
  ControlsBottom = Z_INDEX_CONTROLS_BOTTOM,
  QuickSettings = Z_INDEX_QUICK_SETTINGS,
  WidgetBase = Z_INDEX_WIDGET_BASE,
  WidgetHandle = Z_INDEX_WIDGET_HANDLE,
  WidgetMax = Z_INDEX_WIDGET_MAX,
  MusicWidgetBase = Z_INDEX_MUSIC_WIDGET_BASE,
  MusicWidgetConfigure = Z_INDEX_MUSIC_WIDGET_CONFIGURE,
  MusicWidgetMax = Z_INDEX_MUSIC_WIDGET_MAX,
  Modal = Z_INDEX_MODAL,
}

/**
 * Helper function to get z-index value from enum
 * Provides runtime type checking
 *
 * @param z - Z-index enum value or number
 * @returns Numeric z-index value
 *
 * @example
 * // Using enum
 * style={{ zIndex: getZIndex(ZIndex.Content) }}
 *
 * @example
 * // Using number (fallback)
 * style={{ zIndex: getZIndex(10) }}
 */
export function getZIndex(z: ZIndex | number): number {
  return typeof z === 'number' ? z : z;
}
