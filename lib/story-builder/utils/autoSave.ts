/**
 * Auto-Save Utilities
 * 
 * localStorage-based auto-save functionality for story builder drafts.
 * Handles save operations, draft restoration, and error management.
 * 
 * @feature 013-visual-story-builder
 */

import type { AutoSaveDraft } from '../types';
import { DRAFT_STORAGE_KEY } from '../types';

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Save draft to localStorage.
 * Handles QuotaExceededError and other storage errors.
 */
export async function saveDraft(draft: AutoSaveDraft): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('localStorage is not available');
      return false;
    }

    const serialized = JSON.stringify(draft);
    localStorage.setItem(DRAFT_STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded. Cannot save draft.');
      } else {
        console.error('Failed to save draft:', error.message);
      }
    }
    return false;
  }
}

/**
 * Load draft from localStorage.
 */
export function loadDraft(): AutoSaveDraft | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const serialized = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!serialized) {
      return null;
    }

    const draft: AutoSaveDraft = JSON.parse(serialized);
    return draft;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear draft from localStorage.
 */
export function clearDraft(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear draft:', error);
    return false;
  }
}

/**
 * Check if a draft exists in localStorage.
 */
export function hasDraft(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    const serialized = localStorage.getItem(DRAFT_STORAGE_KEY);
    return serialized !== null;
  } catch (error) {
    console.error('Failed to check for draft:', error);
    return false;
  }
}

// ============================================================================
// Draft Validation
// ============================================================================

/**
 * Validate draft structure and version.
 */
export function validateDraft(draft: unknown): draft is AutoSaveDraft {
  if (typeof draft !== 'object' || draft === null) {
    return false;
  }

  const d = draft as Record<string, unknown>;

  return (
    d.id === DRAFT_STORAGE_KEY &&
    typeof d.savedAt === 'number' &&
    typeof d.version === 'string' &&
    Array.isArray(d.slides) &&
    typeof d.activeSlideIndex === 'number'
  );
}

/**
 * Check if draft is stale (older than 24 hours).
 */
export function isDraftStale(draft: AutoSaveDraft, maxAge: number = 24 * 60 * 60 * 1000): boolean {
  const age = Date.now() - draft.savedAt;
  return age > maxAge;
}

// ============================================================================
// Draft Migration
// ============================================================================

/**
 * Migrate draft to latest version if needed.
 * Currently only version 1.0 exists, but this function prepares for future migrations.
 */
export function migrateDraft(draft: AutoSaveDraft): AutoSaveDraft {
  // No migrations needed for version 1.0
  if (draft.version === '1.0') {
    return draft;
  }

  // Future migrations would go here
  return draft;
}
