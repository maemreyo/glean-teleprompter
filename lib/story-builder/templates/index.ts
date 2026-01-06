/**
 * Template Registry
 * 
 * Central registry for all story builder templates.
 * Provides template lookup and listing functionality.
 * 
 * @feature 013-visual-story-builder
 */

import type { Template } from '../types';
import { templates } from './data';

// ============================================================================
// Template Registry
// ============================================================================

/**
 * Get all available templates.
 */
export function getAllTemplates(): Template[] {
  return templates;
}

/**
 * Get template by ID.
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find((template) => template.id === id);
}

/**
 * Get templates by category.
 */
export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((template) => template.category === category);
}

/**
 * Get templates by difficulty.
 */
export function getTemplatesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Template[] {
  return templates.filter((template) => template.difficulty === difficulty);
}

/**
 * Search templates by name or description.
 */
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return templates.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery)
  );
}

// ============================================================================
// Template Validation
// ============================================================================

/**
 * Validate template structure.
 */
export function validateTemplate(template: unknown): template is Template {
  if (typeof template !== 'object' || template === null) {
    return false;
  }

  const t = template as Record<string, unknown>;

  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.description === 'string' &&
    typeof t.thumbnail === 'string' &&
    Array.isArray(t.slides) &&
    t.slides.length > 0
  );
}

/**
 * Check if a template ID exists.
 */
export function templateExists(id: string): boolean {
  return templates.some((template) => template.id === id);
}
