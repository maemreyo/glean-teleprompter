/**
 * URL Encoding/Decoding Utilities
 * 
 * Encode and decode story data for URL-based sharing.
 * Process: JSON → gzip → Base64 (URL-safe)
 * 
 * @feature 012-standalone-story
 */

import { Base64 } from 'js-base64';
import pako from 'pako';
import type { StoryScript, DecodedStoryResult } from '@/lib/story/types';

/**
 * Maximum URL length to enforce (32KB for cross-browser compatibility)
 */
const MAX_URL_LENGTH = 32 * 1024; // 32KB

/**
 * Encode story data for URL
 * 
 * Process: JSON.stringify → gzip → Base64 (URL-safe)
 * 
 * @param story - Story script to encode
 * @returns Encoded data ready for URL
 * @throws Error if encoding fails or result exceeds URL length limit
 */
export function encodeStoryForUrl(story: StoryScript): string {
  try {
    // Step 1: Stringify to JSON
    let json: string;
    try {
      json = JSON.stringify(story);
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      throw new Error(
        `Failed to encode story data: Invalid story format - ` +
        `story contains unsupported data types (e.g., functions, circular references). ` +
        `Error: ${error.message}`
      );
    }
    
    // Step 2: Compress with gzip
    let compressed: Uint8Array;
    try {
      compressed = pako.gzip(json);
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      throw new Error(
        `Failed to encode story data: Compression failed - ${error.message}. ` +
        `The story data may be too large or corrupted.`
      );
    }
    
    // Step 3: Encode to Base64 (URL-safe)
    let encoded: string;
    try {
      encoded = Base64.fromUint8Array(compressed, true); // true = URL-safe
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      throw new Error(
        `Failed to encode story data: Base64 encoding failed - ${error.message}. ` +
        `The compressed data may be invalid.`
      );
    }
    
    // Check URL length limit
    if (encoded.length > MAX_URL_LENGTH) {
      throw new Error(
        `Failed to encode story data: Story exceeds URL length limit. ` +
        `Current size: ${encoded.length} bytes. Maximum allowed: ${MAX_URL_LENGTH} bytes (${MAX_URL_LENGTH / 1024}KB). ` +
        `To fix: Remove some slides or reduce content length. ` +
        `Tip: Large images or long text blocks can significantly increase URL size.`
      );
    }
    
    return encoded;
  } catch (error) {
    // Re-throw our custom errors as-is
    if (error instanceof Error && error.message.startsWith('Failed to encode story data:')) {
      throw error;
    }
    // Handle any unexpected errors
    throw new Error(
      `Failed to encode story data: Unexpected error - ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Decode story data from URL
 * 
 * Process: Base64 (URL-safe) → gunzip → JSON.parse
 * 
 * @param encoded - Encoded data from URL
 * @returns Decoded story result with data or error
 */
export function decodeStoryFromUrl(encoded: string): DecodedStoryResult {
  try {
    // Validate input is not empty
    if (!encoded || encoded.trim().length === 0) {
      return {
        success: false,
        error: 'Failed to decode story URL: No story data provided. The URL may be incomplete.',
      };
    }
    
    // Step 1: Decode from Base64 (URL-safe)
    let compressed: Uint8Array;
    try {
      compressed = Base64.toUint8Array(encoded);
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      return {
        success: false,
        error: `Failed to decode story URL: Corrupted or invalid URL encoding. ` +
          `The story data in the URL is damaged or incomplete. ` +
          `Technical detail: ${error.message}`,
      };
    }
    
    // Step 2: Decompress gzip
    let decompressed: string;
    try {
      decompressed = pako.ungzip(compressed, { to: 'string' });
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      return {
        success: false,
        error: `Failed to decode story URL: Unsupported or corrupted compression format. ` +
          `The story data could not be decompressed. ` +
          `Technical detail: ${error.message}`,
      };
    }
    
    // Step 3: Parse JSON
    let data: unknown;
    try {
      data = JSON.parse(decompressed);
    } catch (unknownError) {
      const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
      return {
        success: false,
        error: `Failed to decode story URL: Invalid story data format. ` +
          `The decompressed data is not valid JSON. ` +
          `Technical detail: ${error.message}`,
      };
    }
    
    return {
      success: true,
      data: data as StoryScript,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to decode story URL: Unexpected error - ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Generate complete story URL
 * 
 * @param story - Story script to encode
 * @param baseUrl - Base URL (default: /story/)
 * @returns Complete URL with encoded story data
 */
export function generateStoryUrl(
  story: StoryScript,
  baseUrl: string = '/story/'
): string {
  const encoded = encodeStoryForUrl(story);
  return `${baseUrl}${encoded}`;
}

/**
 * Parse story URL and extract encoded data
 * 
 * @param url - Full story URL
 * @returns Encoded data portion or null if invalid
 */
export function parseStoryUrl(url: string): string | null {
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    // Find the story ID (encoded data)
    // Expected format: /story/{encodedData}
    const storyIndex = pathParts.indexOf('story');
    if (storyIndex === -1 || storyIndex + 1 >= pathParts.length) {
      return null;
    }
    
    return pathParts[storyIndex + 1];
  } catch {
    return null;
  }
}
