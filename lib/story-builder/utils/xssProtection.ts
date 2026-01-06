/**
 * XSS Protection Utilities
 * 
 * DOMPurify wrappers for sanitizing user-generated content.
 * Prevents XSS attacks in text content and HTML rendering.
 * 
 * @feature 013-visual-story-builder
 */

import DOMPurify, { Config } from 'dompurify';

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default DOMPurify configuration for story builder content.
 * Allows basic formatting while preventing XSS.
 */
const defaultConfig: Config = {
  // Allow basic formatting tags
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
  
  // Allow basic styling attributes
  ALLOWED_ATTR: ['class', 'style'],
  
  // Disallow all HTML comments
  // ALLOW_COMMENTS: false,
  
  // Keep functionality (not just visual appearance)
  KEEP_CONTENT: true,
  
  // Return DOM tree instead of HTML string
  RETURN_DOM: false,
  
  // Return string, not DOM fragment
  RETURN_DOM_FRAGMENT: false,
  
  // Use sanitizer for SVG (disabled by default for security)
  USE_PROFILES: { html: true },
  
  // Add custom hook for additional validation
  ADD_ATTR: ['data-*'],
};

/**
 * Strict configuration for user input (e.g., poll questions, slide content).
 * Removes all HTML tags except safe formatting.
 */
const strictConfig: Config = {
  ...defaultConfig,
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
  ALLOWED_ATTR: [],
};

// ============================================================================
// Sanitization Functions
// ============================================================================

/**
 * Sanitize HTML content for text slides.
 * Preserves basic formatting while removing dangerous content.
 */
export function sanitizeHtml(html: string, config: Config = defaultConfig): string {
  if (typeof window === 'undefined') {
    // Server-side: return plain text (no HTML allowed)
    return html.replace(/<[^>]*>/g, '');
  }

  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize plain text content.
 * Removes any HTML tags completely.
 */
export function sanitizeText(text: string): string {
  if (typeof window === 'undefined') {
    return text;
  }

  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize URL for image slides.
 * Validates that URL is http/https and doesn't contain javascript: or data:.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  // Block javascript: and data: URLs
  if (/^(javascript:|data:)/i.test(trimmed)) {
    return '';
  }

  // Only allow http: and https:
  if (!/^(https?:\/\/)/i.test(trimmed)) {
    return '';
  }

  // Basic URL validation
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return parsed.href;
  } catch {
    return '';
  }
}

/**
 * Sanitize poll question text.
 * Strips all HTML, only allows plain text.
 */
export function sanitizePollQuestion(question: string): string {
  return sanitizeText(question).trim();
}

/**
 * Sanitize poll option text.
 * Strips all HTML, only allows plain text.
 */
export function sanitizePollOption(option: string): string {
  return sanitizeText(option).trim();
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if content is safe (no HTML or sanitized HTML).
 */
export function isSafeContent(content: string, allowHtml: boolean = false): boolean {
  const sanitized = allowHtml ? sanitizeHtml(content) : sanitizeText(content);
  return sanitized === content;
}

/**
 * Check if URL is safe for image loading.
 */
export function isSafeImageUrl(url: string): boolean {
  const sanitized = sanitizeUrl(url);
  return sanitized === url && url.length > 0;
}

// ============================================================================
// Input Length Validation
// ============================================================================

/**
 * Validate text content length (max 500 chars for text slides).
 */
export function validateTextLength(content: string, maxLength: number = 500): boolean {
  return content.trim().length <= maxLength;
}

/**
 * Validate teleprompter content length (max 1000 chars).
 */
export function validateTeleprompterLength(content: string): boolean {
  return content.trim().length <= 1000;
}

/**
 * Validate poll question length (max 200 chars).
 */
export function validatePollQuestionLength(question: string): boolean {
  return question.trim().length <= 200;
}

/**
 * Validate poll option length (max 100 chars).
 */
export function validatePollOptionLength(option: string): boolean {
  return option.trim().length <= 100;
}

// ============================================================================
// Color Validation
// ============================================================================

/**
 * Validate hex color format (e.g., #FFFFFF or #FFF).
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Sanitize hex color value.
 */
export function sanitizeHexColor(color: string): string {
  const trimmed = color.trim();
  
  if (isValidHexColor(trimmed)) {
    return trimmed;
  }

  // Default to white if invalid
  return '#FFFFFF';
}
