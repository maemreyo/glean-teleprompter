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
