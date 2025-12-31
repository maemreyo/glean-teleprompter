/**
 * Template Fixtures
 * Provides mock template data for testing template loading functionality
 */

import { TemplateResult } from '../types/test-mocks';

/**
 * Valid template with all settings
 */
export const validTemplate: TemplateResult = {
  id: 'classic-news',
  name: 'Classic News Broadcast',
  content: 'Welcome to the evening news. Tonight we cover important stories from around the world.',
  settings: {
    font: 'Classic',
    colorIndex: 0,
    speed: 3,
    fontSize: 48,
    align: 'center',
    lineHeight: 1.5,
    margin: 0,
    overlayOpacity: 0.5
  }
};

/**
 * Template with minimal settings (uses defaults)
 */
export const minimalTemplate: TemplateResult = {
  id: 'minimal',
  name: 'Minimal Template',
  content: 'Simple content with minimal styling',
  settings: {
    font: 'Modern',
    colorIndex: 0
  }
};

/**
 * Template with modern settings
 */
export const modernTemplate: TemplateResult = {
  id: 'modern',
  name: 'Modern Style',
  content: 'Modern teleprompter content with clean aesthetics',
  settings: {
    font: 'Modern',
    colorIndex: 2,
    speed: 4,
    fontSize: 52,
    align: 'left',
    lineHeight: 1.6,
    margin: 10,
    overlayOpacity: 0.4
  }
};

/**
 * Template for neon style
 */
export const neonTemplate: TemplateResult = {
  id: 'neon',
  name: 'Neon Nights',
  content: 'Glowing text for night recording sessions',
  settings: {
    font: 'Neon',
    colorIndex: 3,
    speed: 5,
    fontSize: 56,
    align: 'center',
    lineHeight: 1.7,
    margin: 0,
    overlayOpacity: 0.6
  }
};

/**
 * Template with typewriter font
 */
export const typewriterTemplate: TemplateResult = {
  id: 'typewriter',
  name: 'Typewriter Classic',
  content: 'Classic typewriter effect for vintage broadcasts',
  settings: {
    font: 'Typewriter',
    colorIndex: 1,
    speed: 2,
    fontSize: 44,
    align: 'center',
    lineHeight: 1.4,
    margin: 5,
    overlayOpacity: 0.3
  }
};

/**
 * Novel template for book reading
 */
export const novelTemplate: TemplateResult = {
  id: 'novel',
  name: 'Novel Reader',
  content: 'Chapter 1: The Beginning\n\nOnce upon a time...',
  settings: {
    font: 'Novel',
    colorIndex: 0,
    speed: 1,
    fontSize: 40,
    align: 'center',
    lineHeight: 1.8,
    margin: 20,
    overlayOpacity: 0.2
  }
};

/**
 * All templates array
 */
export const allTemplates: TemplateResult[] = [
  validTemplate,
  minimalTemplate,
  modernTemplate,
  neonTemplate,
  typewriterTemplate,
  novelTemplate
];

/**
 * Get template by ID
 */
export function getTemplateFixtureById(id: string): TemplateResult | undefined {
  return allTemplates.find(t => t.id === id);
}
