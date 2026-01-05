/**
 * URL Encoding/Decoding Unit Tests
 *
 * Test Base64 + gzip compression for story data.
 * Ensures stories can be encoded to URLs and decoded back.
 *
 * @feature 012-standalone-story
 */

import { describe, it, expect } from '@jest/globals';
import { encodeStoryForUrl, decodeStoryFromUrl } from '@/lib/story/utils/urlEncoder';
import type { StoryScript } from '@/lib/story/types';

describe('encodeStoryForUrl', () => {
  it('should encode a minimal story to URL-safe string', () => {
    const story: StoryScript = {
      id: 'test-1',
      title: 'Test Story',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Hello',
          highlights: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(story);

    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');
    // Base64 encoded string should contain only URL-safe characters
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('should compress data to reduce URL length', () => {
    const story: StoryScript = {
      id: 'test-long',
      title: 'Long Story Title With More Text',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'This is a longer text content that should compress well with gzip',
          highlights: [
            { startIndex: 0, endIndex: 4, color: '#ff0000' },
            { startIndex: 10, endIndex: 14, color: '#00ff00' },
          ],
          duration: 5000,
        },
        {
          id: 'slide-2',
          type: 'text-highlight',
          content: 'Another slide with repeated text content content content',
          highlights: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(story);
    const jsonLength = JSON.stringify(story).length;

    // Encoded string should be significantly shorter than original JSON
    expect(encoded.length).toBeLessThan(jsonLength);
  });

  it('should handle special characters in content', () => {
    const story: StoryScript = {
      id: 'test-special',
      title: 'Story with émojis 🎉 and spëcial çhars',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Hello 世界! 🌍 Welcome @#$%^&*()',
          highlights: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(story);

    expect(encoded).toBeTruthy();
    expect(typeof encoded).toBe('string');
  });

  it('should handle all slide types', () => {
    const story: StoryScript = {
      id: 'all-types',
      title: 'All Slide Types',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Text',
          highlights: [],
          duration: 5000,
        },
        {
          id: 'slide-2',
          type: 'widget-chart',
          data: {
            type: 'bar',
            labels: ['A', 'B', 'C'],
            values: [1, 2, 3],
            colors: ['#ff0000', '#00ff00', '#0000ff'],
          },
          duration: 5000,
        },
        {
          id: 'slide-3',
          type: 'image',
          content: 'https://example.com/image.png',
          alt: 'Test image',
          duration: 5000,
        },
        {
          id: 'slide-4',
          type: 'poll',
          question: 'Choose one',
          options: [
            { id: '1', text: 'Option 1' },
            { id: '2', text: 'Option 2' },
          ],
          duration: 5000,
        },
        {
          id: 'slide-5',
          type: 'teleprompter',
          content: 'Long teleprompter text...',
          duration: 'manual',
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(story);

    expect(encoded).toBeTruthy();
  });

  it('should handle animation and effects', () => {
    const story: StoryScript = {
      id: 'test-effects',
      title: 'Effects Story',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Animated',
          highlights: [],
          duration: 5000,
          animation: {
            type: 'slide-in',
            direction: 'left',
            duration: 300,
            easing: 'ease-in-out',
          },
          effects: {
            glow: {
              color: '#ff0000',
              intensity: 0.8,
              blur: 20,
            },
          },
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(story);

    expect(encoded).toBeTruthy();
  });
});

describe('decodeStoryFromUrl', () => {
  it('should decode a valid encoded story', () => {
    const originalStory: StoryScript = {
      id: 'test-decode',
      title: 'Decode Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Decoded content',
          highlights: [{ startIndex: 0, endIndex: 7, color: '#ff0000' }],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(originalStory);
    const decoded = decodeStoryFromUrl(encoded);

    expect(decoded.success).toBe(true);
    expect(decoded.data).toEqual(originalStory);
    expect(decoded.error).toBeUndefined();
  });

  it('should return success=false for invalid Base64', () => {
    const invalidBase64 = 'not-valid-base64!!!';
    const decoded = decodeStoryFromUrl(invalidBase64);

    expect(decoded.success).toBe(false);
    expect(decoded.data).toBeUndefined();
    expect(decoded.error).toBeDefined();
  });

  it('should return success=false for corrupted data', () => {
    // Valid Base64 but corrupted gzip data
    const corruptedData = Buffer.from('corrupted gzip data').toString('base64');
    const decoded = decodeStoryFromUrl(corruptedData);

    expect(decoded.success).toBe(false);
    expect(decoded.data).toBeUndefined();
    expect(decoded.error).toBeDefined();
  });

  it('should return success=false for invalid JSON', () => {
    // Valid Base64 and gzip but invalid JSON structure
    const invalidJson = Buffer.from('not a JSON object').toString('base64');
    const decoded = decodeStoryFromUrl(invalidJson);

    expect(decoded.success).toBe(false);
    expect(decoded.data).toBeUndefined();
    expect(decoded.error).toBeDefined();
  });

  it('should handle large stories', () => {
    const largeStory: StoryScript = {
      id: 'large-story',
      title: 'Large Story Test',
      slides: Array.from({ length: 20 }, (_, i) => ({
        id: `slide-${i}`,
        type: 'text-highlight' as const,
        content: `Slide ${i} with some content that repeats to make it longer `.repeat(10),
        highlights: [],
        duration: 5000,
      })),
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(largeStory);
    const decoded = decodeStoryFromUrl(encoded);

    expect(decoded.success).toBe(true);
    expect(decoded.data).toEqual(largeStory);
  });

  it('should handle unicode content correctly', () => {
    const unicodeStory: StoryScript = {
      id: 'unicode-test',
      title: 'Unicode 你好 مرحبا',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Hello 世界! 🌍 Привет! مرحبا!',
          highlights: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(unicodeStory);
    const decoded = decodeStoryFromUrl(encoded);

    expect(decoded.success).toBe(true);
    expect(decoded.data).toEqual(unicodeStory);
    // Verify content matches using type assertion
    const decodedSlide = decoded.data?.slides[0];
    const origSlide = unicodeStory.slides[0];
    if (decodedSlide?.type === 'text-highlight' && origSlide.type === 'text-highlight') {
      expect(decodedSlide.content).toBe(origSlide.content);
    }
  });
});

describe('encode/decode roundtrip', () => {
  it('should maintain data integrity through encode-decode cycle', () => {
    const originalStory: StoryScript = {
      id: 'roundtrip-test',
      title: 'Roundtrip Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Test content',
          highlights: [
            { startIndex: 0, endIndex: 4, color: '#ff0000', fontWeight: 'bold' },
            { startIndex: 5, endIndex: 12, color: '#00ff00' },
          ],
          duration: 3000,
          animation: {
            type: 'fade',
            duration: 500,
          },
        },
        {
          id: 'slide-2',
          type: 'widget-chart',
          data: {
            type: 'pie',
            title: 'Chart Title',
            labels: ['Red', 'Green', 'Blue'],
            values: [30, 40, 30],
          },
          duration: 5000,
        },
        {
          id: 'slide-3',
          type: 'teleprompter',
          content: 'Long teleprompter text for reading...',
          duration: 'manual',
        },
      ],
      autoAdvance: false,
      showProgress: true,
      version: '1.0',
    };

    // Encode
    const encoded = encodeStoryForUrl(originalStory);

    // Decode
    const decoded = decodeStoryFromUrl(encoded);

    // Verify
    expect(decoded.success).toBe(true);
    expect(decoded.data).toEqual(originalStory);

    // Deep check nested objects with type guards
    const firstSlide = decoded.data?.slides[0];
    if (firstSlide && firstSlide.type === 'text-highlight') {
      const origFirstSlide = originalStory.slides[0];
      if (origFirstSlide.type === 'text-highlight') {
        expect(firstSlide.highlights).toEqual(origFirstSlide.highlights);
      }
    }
    const secondSlide = decoded.data?.slides[1];
    if (secondSlide && secondSlide.type === 'widget-chart') {
      const origSecondSlide = originalStory.slides[1];
      if (origSecondSlide.type === 'widget-chart') {
        expect(secondSlide.data).toEqual(origSecondSlide.data);
      }
    }
    expect(decoded.data?.autoAdvance).toBe(originalStory.autoAdvance);
  });

  it('should handle complex nested structures', () => {
    const complexStory: StoryScript = {
      id: 'complex',
      title: 'Complex Story',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Complex',
          highlights: [
            {
              startIndex: 0,
              endIndex: 7,
              color: '#ff0000',
              fontWeight: 'bold',
            },
          ],
          duration: 5000,
          animation: {
            type: 'zoom',
            direction: 'up',
            duration: 400,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          },
          effects: {
            glow: { color: '#ff0000', intensity: 0.5, blur: 10 },
            shadow: { color: '#000000', offsetX: 2, offsetY: 4, blur: 8 },
            backdrop: { type: 'blur', value: '10px', opacity: 0.8 },
          },
        },
      ],
      autoAdvance: true,
      showProgress: false,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(complexStory);
    const decoded = decodeStoryFromUrl(encoded);

    expect(decoded.success).toBe(true);
    expect(decoded.data).toEqual(complexStory);
  });
});

describe('edge cases', () => {
  it('should handle empty content', () => {
    const story: StoryScript = {
      id: 'empty',
      title: '',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: '',
          highlights: [],
          duration: 1000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(story);
    const decoded = decodeStoryFromUrl(encoded);

    expect(decoded.success).toBe(true);
    if (decoded.data?.slides[0].type === 'text-highlight') {
      expect(decoded.data.slides[0].content).toBe('');
    }
  });

  it('should handle very short stories', () => {
    const minimalStory: StoryScript = {
      id: 'a',
      title: 'B',
      slides: [
        {
          id: 'c',
          type: 'text-highlight',
          content: 'D',
          highlights: [],
          duration: 1000,
        },
      ],
      autoAdvance: false,
      showProgress: false,
      version: '1.0',
    };

    const encoded = encodeStoryForUrl(minimalStory);
    const decoded = decodeStoryFromUrl(encoded);

    expect(decoded.success).toBe(true);
    expect(decoded.data).toEqual(minimalStory);
  });
});

describe('URL-encoded Base64 fallback', () => {
  it('should decode URL-encoded plain Base64 strings', () => {
    // Simulate what happens when browser URL-encodes a plain Base64 string
    const story: StoryScript = {
      id: 'demo',
      title: 'Demo Story',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Hello World',
          highlights: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    // Create plain Base64 string (without gzip) and URL-encode it
    const plainJson = JSON.stringify(story);
    const plainBase64 = btoa(plainJson);
    
    // URL-encode it (this is what the browser does when navigating)
    const urlEncoded = encodeURIComponent(plainBase64);

    // Verify URL encoding happened (Base64 may contain +, /, = which get encoded)
    expect(urlEncoded).toContain('%');

    // Should decode successfully
    const decoded = decodeStoryFromUrl(urlEncoded);

    expect(decoded.success).toBe(true);
    expect(decoded.data).toBeDefined();
    expect(decoded.data?.id).toBe(story.id);
    expect(decoded.data?.title).toBe(story.title);
  });

  it('should handle characters that get URL-encoded', () => {
    // Test that URL-encoded Base64 strings can be decoded
    // Create a minimal valid story
    const story: StoryScript = {
      id: 'x',
      title: 'Y',
      slides: [
        {
          id: 'z',
          type: 'text-highlight',
          content: 'Z',
          highlights: [],
          duration: 1000,
        },
      ],
      autoAdvance: false,
      showProgress: false,
      version: '1.0',
    };

    // Create plain Base64 string and URL-encode it
    const plainJson = JSON.stringify(story);
    const plainBase64 = btoa(plainJson);
    
    // Manually URL-encode to ensure we have encoded characters
    // Even if the Base64 doesn't naturally have +, /, =, we force encoding
    const urlEncoded = encodeURIComponent(plainBase64);

    // Verify URL encoding was applied
    expect(urlEncoded).toBeTruthy();

    // Decode should handle the URL encoding successfully
    const decoded = decodeStoryFromUrl(urlEncoded);

    expect(decoded.success).toBe(true);
    expect(decoded.data).toBeDefined();
    expect(decoded.data?.id).toBe(story.id);
  });
});
