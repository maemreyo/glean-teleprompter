/**
 * Story Data Validation
 * 
 * JSON schema validation for story data using ajv.
 * Validates story structure and slide types before rendering.
 * 
 * @feature 012-standalone-story
 */

import Ajv from 'ajv';
import storySchema from '@/specs/012-standalone-story/contracts/story-schema.json';
import type { StoryScript, ValidationResult } from '@/lib/story/types';

// Initialize AJV instance
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  coerceTypes: true,
});

// Compile the schema once
const validateStory = ajv.compile(storySchema);

/**
 * Validate story data against JSON schema
 * 
 * @param data - Unknown data to validate (typically from URL parsing)
 * @returns Validation result with errors if invalid
 * 
 * @example
 * ```ts
 * const result = validateStoryData(parsedJson);
 * if (!result.valid) {
 *   showError(result.errors);
 * }
 * ```
 */
export function validateStoryData(data: unknown): ValidationResult {
  try {
    // Check if data is valid according to schema
    const valid = validateStory(data);

    if (valid) {
      return { valid: true };
    }

    // Collect all validation errors with user-friendly messages
    const errors: string[] = [];
    
    if (validateStory.errors) {
      for (const error of validateStory.errors) {
        const path = error.instancePath || 'root';
        const message = error.message || 'Unknown error';
        
        // Convert technical schema paths to user-friendly messages
        const userFriendlyPath = formatSchemaPath(path);
        const userFriendlyMessage = formatValidationMessage(message, userFriendlyPath);
        errors.push(userFriendlyMessage);
      }
    }

    return {
      valid: false,
      errors,
    };
  } catch (unknownError) {
    // Handle unexpected errors during validation
    const error = unknownError instanceof Error ? unknownError : new Error(String(unknownError));
    return {
      valid: false,
      errors: [`Story validation failed unexpectedly: ${error.message}`],
    };
  }
}

/**
 * Format JSON schema path to user-friendly location description
 *
 * Examples:
 * - "" -> "Story"
 * - "/slides" -> "Story slides"
 * - "/slides/0" -> "Slide 1"
 * - "/slides/2/content" -> "Slide 3 content"
 */
function formatSchemaPath(path: string): string {
  if (!path || path === '/' || path === '') {
    return 'Story';
  }
  
  // Remove leading slash and split by /
  const parts = path.replace(/^\//, '').split('/');
  
  const formatted: string[] = ['Story'];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Array indices (0-based) - convert to 1-based for users
    if (/^\d+$/.test(part)) {
      formatted.push(`#${parseInt(part) + 1}`);
    } else if (part === 'slides') {
      formatted.push('slides');
    } else if (part === 'content') {
      formatted.push('content');
    } else if (part === 'type') {
      formatted.push('type');
    } else {
      formatted.push(part);
    }
  }
  
  return formatted.join(' ');
}

/**
 * Format validation error message to be more actionable
 */
function formatValidationMessage(message: string, path: string): string {
  // Map common AJV errors to user-friendly messages
  const messageMap: Record<string, string> = {
    'must have required property': 'is missing',
    'must be string': 'must be text',
    'must be array': 'must be a list',
    'must be object': 'must be an object',
    'must be null': 'must be empty',
    'must be boolean': 'must be true or false',
    'must be number': 'must be a number',
    'must be integer': 'must be a whole number',
    'must match pattern': 'has invalid format',
    'must be equal to one of the allowed values': 'has invalid value',
    'must match "then" schema': 'has invalid configuration',
    'must match "else" schema': 'has invalid configuration',
  };
  
  // Try to match and replace the message
  for (const [key, replacement] of Object.entries(messageMap)) {
    if (message.includes(key)) {
      return `${path} ${replacement}`;
    }
  }
  
  // If no specific mapping found, return generic message
  return `${path}: ${message}`;
}

// ============================================================================
// Teleprompter Validation Utilities
// ============================================================================

/**
 * Clamp focal point value to valid range (0-100)
 *
 * @param value - The focal point value to clamp
 * @returns Clamped value between 0 and 100
 *
 * @example
 * ```ts
 * clampFocalPoint(150) // returns 100
 * clampFocalPoint(-10) // returns 0
 * clampFocalPoint(50)  // returns 50
 * ```
 */
export function clampFocalPoint(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Clamp font size value to valid range (16-72)
 *
 * @param value - The font size value to clamp
 * @returns Clamped value between 16 and 72
 *
 * @example
 * ```ts
 * clampFontSize(100) // returns 72
 * clampFontSize(10)  // returns 16
 * clampFontSize(24)  // returns 24
 * ```
 */
export function clampFontSize(value: number): number {
  return Math.max(16, Math.min(72, value));
}

/**
 * Clamp line height value to valid range (1.0-3.0)
 *
 * @param value - The line height value to clamp
 * @returns Clamped value between 1.0 and 3.0
 *
 * @example
 * ```ts
 * clampLineHeight(0.5) // returns 1.0
 * clampLineHeight(4.0) // returns 3.0
 * clampLineHeight(1.6) // returns 1.6
 * ```
 */
export function clampLineHeight(value: number): number {
  return Math.max(1.0, Math.min(3.0, value));
}

/**
 * Clamp letter spacing value to valid range (-5 to 20 pixels)
 *
 * @param value - The letter spacing value to clamp in pixels
 * @returns Clamped value between -5 and 20
 *
 * @example
 * ```ts
 * clampLetterSpacing(-10) // returns -5
 * clampLetterSpacing(30)  // returns 20
 * clampLetterSpacing(2)   // returns 2
 * ```
 */
export function clampLetterSpacing(value: number): number {
  return Math.max(-5, Math.min(20, value));
}

/**
 * Clamp background opacity value to valid range (0-100)
 *
 * @param value - The background opacity value to clamp
 * @returns Clamped value between 0 and 100
 *
 * @example
 * ```ts
 * clampBackgroundOpacity(-10) // returns 0
 * clampBackgroundOpacity(150) // returns 100
 * clampBackgroundOpacity(75)  // returns 75
 * ```
 */
export function clampBackgroundOpacity(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/**
 * Clamp safe area padding values to valid range (0-200 pixels)
 *
 * @param padding - The padding object with optional top, right, bottom, left values
 * @returns Clamped padding object with all values between 0 and 200
 *
 * @example
 * ```ts
 * clampSafeAreaPadding({ top: -10, right: 250, bottom: 50, left: 0 })
 * // returns { top: 0, right: 200, bottom: 50, left: 0 }
 * ```
 */
export function clampSafeAreaPadding(padding: {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}): { top: number; right: number; bottom: number; left: number } {
  const clamp = (value?: number) => {
    if (value === undefined) return 0;
    return Math.max(0, Math.min(200, value));
  };

  return {
    top: clamp(padding.top),
    right: clamp(padding.right),
    bottom: clamp(padding.bottom),
    left: clamp(padding.left),
  };
}

/**
 * Check if a string is a valid hex color
 *
 * @param color - The color string to validate
 * @returns True if the color is a valid hex color
 *
 * @example
 * ```ts
 * isValidHexColor('#000000') // returns true
 * isValidHexColor('#FFF')     // returns true
 * isValidHexColor('red')      // returns false
 * isValidHexColor('#GGGGGG')  // returns false
 * ```
 */
export function isValidHexColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

/**
 * Type guard to check if data is a valid StoryScript
 * 
 * @param data - Unknown data to check
 * @returns True if data is a valid StoryScript
 */
export function isValidStoryScript(data: unknown): data is StoryScript {
  const result = validateStoryData(data);
  return result.valid;
}

/**
 * Validate story and throw error if invalid
 * 
 * @param data - Unknown data to validate
 * @throws Error with validation details if invalid
 * @returns Validated StoryScript
 */
export function validateStoryOrThrow(data: unknown): StoryScript {
  const result = validateStoryData(data);
  
  if (!result.valid) {
    const errorMessages = result.errors?.join('; ') || 'Unknown validation error';
    throw new Error(
      `Invalid story data: ${errorMessages}\n\n` +
      `Please check the story structure and ensure all required fields are present.`
    );
  }
  
  return data as StoryScript;
}
