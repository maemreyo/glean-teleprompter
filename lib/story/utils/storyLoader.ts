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
        error: `Story data validation failed:\n${validation.errors?.join('\n') || 'Unknown error'}`,
      };
    }
    
    return {
      success: true,
      data: decoded.data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to load story: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      error: 'Cannot load story: window object not available',
    };
  }

  const encodedData = parseStoryUrl(window.location.href);
  
  if (!encodedData) {
    return {
      success: false,
      error: 'No story data found in URL',
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
