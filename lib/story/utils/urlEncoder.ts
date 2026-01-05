/**
 * URL Encoding/Decoding Utilities
 * 
 * Encode and decode story data for URL-based sharing.
 * Process: JSON → gzip → Base64 (URL-safe)
 * 
 * @feature 012-standalone-story
 */

import { encode, decode } from 'js-base64';
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
    const json = JSON.stringify(story);
    
    // Step 2: Compress with gzip
    const compressed = pako.gzip(json);
    
    // Step 3: Encode to Base64 (URL-safe)
    const encoded = encode(compressed);
    
    // Check URL length limit
    if (encoded.length > MAX_URL_LENGTH) {
      throw new Error(
        `Encoded story data exceeds ${MAX_URL_LENGTH} bytes limit (${encoded.length} bytes). ` +
        `Consider reducing story content or using fewer slides.`
      );
    }
    
    return encoded;
  } catch (error) {
    if (error instanceof Error && error.message.includes('exceeds')) {
      throw error; // Re-throw our custom error
    }
    throw new Error(`Failed to encode story data: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    // Step 1: Decode from Base64 (URL-safe)
    const compressed = decode(encoded);
    
    // Step 2: Decompress gzip
    const decompressed = pako.ungzip(compressed, { to: 'string' });
    
    // Step 3: Parse JSON
    const data = JSON.parse(decompressed);
    
    return {
      success: true,
      data: data as StoryScript,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to decode story data: ${error instanceof Error ? error.message : 'Invalid data'}`,
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
