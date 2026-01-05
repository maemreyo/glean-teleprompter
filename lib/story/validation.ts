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

    // Collect all validation errors
    const errors: string[] = [];
    
    if (validateStory.errors) {
      for (const error of validateStory.errors) {
        const path = error.instancePath || 'root';
        const message = error.message || 'Unknown error';
        errors.push(`${path}: ${message}`);
      }
    }

    return {
      valid: false,
      errors,
    };
  } catch (error) {
    // Handle unexpected errors during validation
    return {
      valid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
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
    const errorMessages = result.errors?.join(', ') || 'Unknown validation error';
    throw new Error(`Invalid story data: ${errorMessages}`);
  }
  
  return data as StoryScript;
}
