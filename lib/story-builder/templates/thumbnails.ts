/**
 * Template Thumbnail Paths
 * 
 * Provides paths for template thumbnail images.
 * Thumbnails are used in the template gallery modal.
 * 
 * @feature 013-visual-story-builder
 */

/**
 * Get thumbnail URL for a template by ID.
 */
export function getTemplateThumbnail(templateId: string): string {
  const thumbnails: Record<string, string> = {
    'product-announcement': '/templates/product-announcement.svg',
    'tutorial': '/templates/tutorial.svg',
    'qa': '/templates/qa.svg',
  };

  return thumbnails[templateId] || '/templates/default.svg';
}

/**
 * Get all thumbnail URLs.
 */
export function getAllThumbnailUrls(): string[] {
  return [
    '/templates/product-announcement.svg',
    '/templates/tutorial.svg',
    '/templates/qa.svg',
  ];
}
