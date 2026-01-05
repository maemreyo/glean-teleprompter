/**
 * Story Validation Unit Tests
 *
 * Test JSON schema validation for story data.
 * Ensures invalid stories are properly rejected.
 *
 * @feature 012-standalone-story
 */

import { describe, it, expect } from '@jest/globals';
import { validateStoryData, isValidStoryScript, validateStoryOrThrow } from '@/lib/story/validation';
import type { StoryScript } from '@/lib/story/types';

describe('validateStoryData', () => {
  it('should validate a correct minimal story', () => {
    const validStory: StoryScript = {
      id: 'test-story-1',
      title: 'Test Story',
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

    const result = validateStoryData(validStory);

    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('should accept all slide types', () => {
    const story: StoryScript = {
      id: 'test-all-types',
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
            title: 'Chart',
            labels: ['A', 'B'],
            values: [10, 20],
          },
          duration: 5000,
        },
        {
          id: 'slide-3',
          type: 'image',
          content: 'https://example.com/image.jpg',
          duration: 5000,
        },
        {
          id: 'slide-4',
          type: 'poll',
          question: 'Favorite color?',
          options: [
            { id: '1', text: 'Red' },
            { id: '2', text: 'Blue' },
          ],
          duration: 5000,
        },
        {
          id: 'slide-5',
          type: 'teleprompter',
          content: 'Long text...',
          duration: 'manual',
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(story);

    expect(result.valid).toBe(true);
  });

  it('should reject story without required id field', () => {
    const invalidStory = {
      title: 'Test',
      slides: [],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors?.some(e => e.includes('id'))).toBe(true);
  });

  it('should reject story without slides array', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject empty slides array', () => {
    const invalidStory: StoryScript = {
      id: 'test',
      title: 'Test',
      slides: [],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject slide without required fields', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          // missing content
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
    expect(result.errors).toBeDefined();
  });

  it('should reject invalid slide type', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'invalid-type',
          content: 'Text',
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
  });

  it('should reject non-manual duration for teleprompter slide', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'teleprompter',
          content: 'Text',
          duration: 5000, // should be 'manual'
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
  });

  it('should reject invalid widget chart type', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'widget-chart',
          data: {
            type: 'invalid-chart',
            labels: [],
            values: [],
          },
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
  });

  it('should reject poll without options', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'poll',
          question: 'Question',
          options: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
  });

  it('should collect multiple validation errors', () => {
    const invalidStory = {
      title: 'Test',
      slides: [
        {
          type: 'invalid-type',
        },
      ],
      autoAdvance: 'not-a-boolean',
      version: '1.0',
    };

    const result = validateStoryData(invalidStory);

    expect(result.valid).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(1);
  });

  it('should accept story with animation effects', () => {
    const validStory: StoryScript = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Text',
          highlights: [],
          duration: 5000,
          animation: {
            type: 'slide-in',
            direction: 'left',
            duration: 300,
            easing: 'ease-in-out',
          },
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(validStory);

    expect(result.valid).toBe(true);
  });

  it('should accept story with slide effects', () => {
    const validStory: StoryScript = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Text',
          highlights: [],
          duration: 5000,
          effects: {
            glow: {
              color: '#ff0000',
              intensity: 0.5,
              blur: 10,
            },
            shadow: {
              color: '#000000',
              offsetX: 2,
              offsetY: 2,
              blur: 4,
            },
          },
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(validStory);

    expect(result.valid).toBe(true);
  });

  it('should accept manual duration for non-teleprompter slides', () => {
    const validStory: StoryScript = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Text',
          highlights: [],
          duration: 'manual',
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryData(validStory);

    expect(result.valid).toBe(true);
  });
});

describe('isValidStoryScript', () => {
  it('should return true for valid story', () => {
    const validStory: StoryScript = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Text',
          highlights: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    expect(isValidStoryScript(validStory)).toBe(true);
  });

  it('should return false for invalid story', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      // missing slides
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    expect(isValidStoryScript(invalidStory)).toBe(false);
  });

  it('should work as type guard', () => {
    const data: unknown = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Text',
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    if (isValidStoryScript(data)) {
      // TypeScript should know data is StoryScript here
      expect(data.slides[0].type).toBe('text-highlight');
    } else {
      fail('Data should be valid');
    }
  });
});

describe('validateStoryOrThrow', () => {
  it('should return story for valid data', () => {
    const validStory: StoryScript = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          id: 'slide-1',
          type: 'text-highlight',
          content: 'Text',
          highlights: [],
          duration: 5000,
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    const result = validateStoryOrThrow(validStory);

    expect(result).toEqual(validStory);
  });

  it('should throw error for invalid data', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      // missing slides
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    expect(() => validateStoryOrThrow(invalidStory)).toThrow('Invalid story data');
  });

  it('should include validation errors in thrown message', () => {
    const invalidStory = {
      id: 'test',
      title: 'Test',
      slides: [
        {
          type: 'invalid-type',
        },
      ],
      autoAdvance: true,
      showProgress: true,
      version: '1.0',
    };

    try {
      validateStoryOrThrow(invalidStory);
      fail('Should have thrown error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const message = (error as Error).message;
      expect(message).toContain('Invalid story data');
    }
  });
});
