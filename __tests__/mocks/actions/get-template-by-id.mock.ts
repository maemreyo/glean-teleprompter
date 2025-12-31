/**
 * Mock getTemplateById
 * Mocks the template configuration lookup function
 */

import { TemplateResult, MockGetTemplateById } from '../../types/test-mocks';

// Global mock state
let mockTemplate: TemplateResult | null = null;

/**
 * Mock getTemplateById implementation
 */
export const mockGetTemplateById = jest.fn(
  (templateId: string): TemplateResult | null => {
    return mockTemplate;
  }
) as unknown as MockGetTemplateById;

/**
 * Set the mock template
 */
export function setMockTemplate(template: TemplateResult) {
  mockTemplate = template;
}

/**
 * Set the mock to return null
 */
export function setMockTemplateNull() {
  mockTemplate = null;
}

/**
 * Reset the mock to defaults
 */
export function resetGetTemplateById() {
  mockTemplate = null;
  // The mock function is already a jest.fn, so it has mockClear
}

// Add helper methods to the mock function
(mockGetTemplateById as unknown as MockGetTemplateById).__setMockTemplate = setMockTemplate;
(mockGetTemplateById as unknown as MockGetTemplateById).__setNull = setMockTemplateNull;
(mockGetTemplateById as unknown as MockGetTemplateById).__reset = resetGetTemplateById;

// Set up the Jest mock
jest.mock('@/lib/templates/templateConfig', () => ({
  getTemplateById: mockGetTemplateById
}));
