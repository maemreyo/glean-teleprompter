/**
 * Story Data Loading Utility
 * 
 * Load and validate story data from URL parameters.
 * Handles decoding, validation, and error reporting.
 * 
 * @feature 012-standalone-story
 */

import { decodeStoryFromUrl, parseStoryUrl } from './urlEncoder';
import { validateStoryData } from '../validation';
import type { StoryScript, DecodedStoryResult } from '@/lib/story/types';

/**
 * Load story data from URL search params or pathname
 * 
 * @param urlParams - URL parameter value containing encoded story data
 * @returns Loaded and validated story script or error
 * 
 * @example
 * ```ts
 * const result = loadStoryFromUrl(params.storyId);
 * if (result.success) {
 *   renderStory(result.data);
 * } else {
 *   showError(result.error);
 * }
 * ```
 */
export function loadStoryFromUrl(urlParams: string): DecodedStoryResult {
  try {
    // Validate input is not empty
    if (!urlParams || urlParams.trim().length === 0) {
      return {
        success: false,
        error: 'Failed to load story: No story data provided. The URL may be incomplete.',
      };
    }
    
    // Decode the URL data
    const decoded = decodeStoryFromUrl(urlParams);
    
    if (!decoded.success) {
      return decoded;
    }
    
    // Validate against schema
    const validation = validateStoryData(decoded.data);
    
    if (!validation.valid) {
      return {
        success: false,
        error: `Failed to load story: Invalid story format.\n\nValidation errors:\n${validation.errors?.join('\n') || 'Unknown error'}\n\n` +
          `Please ensure the story data is properly formatted.`,
      };
    }
    
    return {
      success: true,
      data: decoded.data,
    };
  } catch (unknownError) {
    const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
    return {
      success: false,
      error: `Failed to load story: Unexpected error - ${error.message}`,
    };
  }
}

/**
 * Load story from current window URL
 * 
 * @returns Loaded story script or error based on current URL
 */
export function loadStoryFromCurrentUrl(): DecodedStoryResult {
  if (typeof window === 'undefined') {
    return {
      success: false,
      error: 'Failed to load story: Cannot access browser environment. This function only works in a browser.',
    };
  }

  const encodedData = parseStoryUrl(window.location.href);
  
  if (!encodedData) {
    return {
      success: false,
      error: 'Failed to load story: No story data found in URL. ' +
        'The URL may be malformed or missing story data. ' +
        'Expected format: /story/{encoded_data}',
    };
  }
  
  return loadStoryFromUrl(encodedData);
}

/**
 * Parse story ID from URL pathname
 * 
 * @param pathname - URL pathname (e.g., /story/abc123)
 * @returns Story ID (encoded data) or null
 */
export function extractStoryId(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  const storyIndex = parts.indexOf('story');
  
  if (storyIndex === -1 || storyIndex + 1 >= parts.length) {
    return null;
  }
  
  return parts[storyIndex + 1];
}
