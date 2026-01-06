/**
 * Slide Type Definitions Registry
 *
 * Provides a centralized registry of all available slide types
 * in the story builder along with their display labels.
 *
 * @module story-builder/templates/slideTypes
 */

import type { BuilderSlideType } from '../types';

// Re-export as SlideType for convenience
export type SlideType = BuilderSlideType;

/**
 * Array of all available slide types in the story builder.
 * Used for generating slide type selectors and validation.
 * 
 * @constant
 * @type {SlideType[]}
 */
export const SLIDE_TYPES: SlideType[] = [
  'teleprompter',
  'image',
  'text-highlight',
  'poll',
  'widget-chart',
];

/**
 * Human-readable labels for each slide type.
 * Maps slide type values to their display names shown in the UI.
 *
 * @constant
 * @type {Record<BuilderSlideType, string>}
 */
export const SLIDE_TYPE_LABELS: Record<BuilderSlideType, string> = {
  teleprompter: 'Teleprompter',
  image: 'Image',
  'text-highlight': 'Text Highlight',
  poll: 'Poll',
  'widget-chart': 'Widget Chart',
};

/**
 * Gets the human-readable label for a given slide type.
 * Falls back to returning the raw type value if no label is defined.
 *
 * @param {BuilderSlideType} type - The slide type to get a label for
 * @returns {string} The human-readable label for the slide type
 *
 * @example
 * ```ts
 * getSlideTypeLabel('teleprompter') // Returns: 'Teleprompter'
 * getSlideTypeLabel('poll') // Returns: 'Poll'
 * ```
 */
export const getSlideTypeLabel = (type: BuilderSlideType): string => {
  return SLIDE_TYPE_LABELS[type] || type;
};

/**
 * Gets a human-readable description for a given slide type.
 * Returns a short explanation of what the slide type does.
 *
 * @param {BuilderSlideType} type - The slide type to get a description for
 * @returns {string} The description of the slide type
 *
 * @example
 * ```ts
 * getSlideTypeDescription('teleprompter')
 * // Returns: 'Auto-scrolling text with customizable speed'
 * ```
 */
export const getSlideTypeDescription = (type: BuilderSlideType): string => {
  const descriptions: Record<BuilderSlideType, string> = {
    teleprompter: 'Auto-scrolling text with customizable speed',
    image: 'Full-screen image with optional caption',
    'text-highlight': 'Animated text with highlight effects',
    poll: 'Interactive poll with voting options',
    'widget-chart': 'Data visualization with animated charts',
  };
  return descriptions[type] || '';
};
