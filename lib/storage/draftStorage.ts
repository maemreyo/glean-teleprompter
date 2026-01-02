/**
 * Draft storage operations for localStorage
 * Handles save/load operations for single drafts and draft collections
 */

import {
  TeleprompterDraft,
  DraftsCollection,
  STORAGE_KEYS,
  QuotaExceededError,
  CorruptedDataError,
  StorageUnavailableError,
  SaveResult,
  ConflictData,
  ConflictResolution,
  StorageError,
} from './types';
import { migrateDraft } from './draftMigration';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Estimate data size in bytes (UTF-16 encoding)
 */
function estimateSize(data: string): number {
  return data.length * 2; // 2 bytes per character in UTF-16
}

/**
 * Validate draft has required fields
 */
function validateDraft(draft: unknown): TeleprompterDraft {
  if (!draft || typeof draft !== 'object') {
    throw new CorruptedDataError('Draft is not an object');
  }

  const d = draft as Partial<TeleprompterDraft>;
  
  if (!d._id || typeof d._id !== 'string') {
    throw new CorruptedDataError('Draft missing valid _id');
  }
  
  if (!d._version || typeof d._version !== 'string') {
    throw new CorruptedDataError('Draft missing valid _version');
  }
  
  if (!d._timestamp || typeof d._timestamp !== 'number') {
    throw new CorruptedDataError('Draft missing valid _timestamp');
  }

  return draft as TeleprompterDraft;
}

// ============================================================================
// Single Draft Operations
// ============================================================================

/**
 * Save a single draft to localStorage
 * @param draft - The draft to save
 * @throws QuotaExceededError when storage is full
 */
export function saveDraft(draft: TeleprompterDraft): void {
  try {
    const serialized = JSON.stringify(draft);
    localStorage.setItem(STORAGE_KEYS.DRAFT, serialized);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'QuotaExceededError' || 
          (error as any).code === 22 || 
          (error as any).code === 1014) {
        throw new QuotaExceededError('Storage quota exceeded while saving draft');
      }
    }
    throw new StorageUnavailableError(`Failed to save draft: ${error}`);
  }
}

/**
 * Load the active draft from localStorage
 * @returns The draft, or null if not found
 */
export function loadDraft(): TeleprompterDraft | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!serialized) {
      return null;
    }

    const draft = JSON.parse(serialized);
    
    // Apply migration if version mismatch
    const migrated = migrateDraft(draft);
    
    return validateDraft(migrated);
  } catch (error) {
    if (error instanceof CorruptedDataError) {
      throw error;
    }
    throw new CorruptedDataError(`Failed to load draft: ${error}`);
  }
}

/**
 * Delete the active draft from localStorage
 */
export function deleteDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  } catch (error) {
    throw new StorageUnavailableError(`Failed to delete draft: ${error}`);
  }
}

/**
 * Check if a draft exists
 */
export function hasDraft(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.DRAFT) !== null;
  } catch {
    return false;
  }
}

// ============================================================================
// Draft Collection Operations
// ============================================================================

/**
 * Get all drafts from the drafts collection
 */
export function loadAllDrafts(): TeleprompterDraft[] {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.DRAFTS_COLLECTION);
    if (!serialized) {
      return [];
    }

    const collection: DraftsCollection = JSON.parse(serialized);
    return collection.drafts || [];
  } catch (error) {
    console.error('Failed to load drafts collection:', error);
    return [];
  }
}

/**
 * Save a draft to the drafts collection
 * @param draft - The draft to add
 * @returns The ID of the saved draft
 */
export function addToCollection(draft: TeleprompterDraft): string {
  try {
    const drafts = loadAllDrafts();
    
    // Ensure draft has an ID
    const draftWithId = {
      ...draft,
      _id: draft._id || generateUUID(),
      _timestamp: draft._timestamp || Date.now(),
    };

    // Add to collection (upsert by ID)
    const existingIndex = drafts.findIndex(d => d._id === draftWithId._id);
    if (existingIndex >= 0) {
      drafts[existingIndex] = draftWithId;
    } else {
      drafts.push(draftWithId);
    }

    // Save collection
    const collection: DraftsCollection = {
      drafts,
      _schemaVersion: draftWithId._version,
      _lastUpdated: Date.now(),
    };

    const serialized = JSON.stringify(collection);
    localStorage.setItem(STORAGE_KEYS.DRAFTS_COLLECTION, serialized);

    return draftWithId._id;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new QuotaExceededError('Storage quota exceeded while adding to collection');
    }
    throw new StorageUnavailableError(`Failed to add draft to collection: ${error}`);
  }
}

/**
 * Remove a draft from the collection by ID
 */
export function removeFromCollection(id: string): void {
  try {
    const drafts = loadAllDrafts();
    const filtered = drafts.filter(d => d._id !== id);

    const collection: DraftsCollection = {
      drafts: filtered,
      _schemaVersion: '2.0',
      _lastUpdated: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.DRAFTS_COLLECTION, JSON.stringify(collection));
  } catch (error) {
    throw new StorageUnavailableError(`Failed to remove draft from collection: ${error}`);
  }
}

/**
 * Clear all drafts from the collection
 */
export function clearCollection(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFTS_COLLECTION);
  } catch (error) {
    throw new StorageUnavailableError(`Failed to clear collection: ${error}`);
  }
}

// ============================================================================
// Conflict Detection
// ============================================================================

/**
 * Save draft with conflict detection
 * @param draft - Draft to save
 * @param options - Save options
 * @returns Save result with conflict info if applicable
 */
export function saveDraftWithConflictDetection(
  draft: TeleprompterDraft,
  options: {
    checkConflicts?: boolean;
    onConflict?: (conflict: ConflictData) => ConflictResolution;
  } = {}
): SaveResult {
  try {
    if (!options.checkConflicts) {
      saveDraft(draft);
      return { success: true };
    }

    // Check for conflicts
    const existingSerialized = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (existingSerialized) {
      const existingDraft = JSON.parse(existingSerialized);
      
      // Compare timestamps
      if (existingDraft._timestamp && draft._timestamp < existingDraft._timestamp) {
        // Conflict detected!
        const conflictData: ConflictData = {
          localDraft: draft,
          remoteDraft: existingDraft,
          timeDifference: existingDraft._timestamp - draft._timestamp,
        };

        // Ask handler what to do
        if (options.onConflict) {
          const resolution = options.onConflict(conflictData);
          
          if (resolution === 'cancel') {
            return {
              success: false,
              conflict: {
                hasNewerVersion: true,
                localTimestamp: draft._timestamp,
                remoteTimestamp: existingDraft._timestamp,
              },
            };
          }

          if (resolution === 'reload') {
            // Reload the newer version
            return {
              success: false,
              conflict: {
                hasNewerVersion: true,
                localTimestamp: draft._timestamp,
                remoteTimestamp: existingDraft._timestamp,
              },
            };
          }

          // If 'overwrite', continue with save
        }
      }
    }

    // No conflict or handler chose to overwrite
    saveDraft(draft);
    return { success: true };
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return {
        success: false,
        error: error as QuotaExceededError,
      };
    }
    if (error instanceof StorageUnavailableError) {
      return {
        success: false,
        error: error as StorageUnavailableError,
      };
    }
    return {
      success: false,
      error: new StorageError(`Failed to save with conflict detection: ${error}`, 'SAVE_FAILED'),
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new draft from current state
 */
export function createDraft(state: Partial<TeleprompterDraft>): TeleprompterDraft {
  return {
    _id: generateUUID(),
    _version: '2.0',
    _timestamp: Date.now(),
    text: state.text || '',
    backgroundUrl: state.backgroundUrl || '',
    musicUrl: state.musicUrl || '',
    fontStyle: state.fontStyle || 'Arial',
    colorIndex: state.colorIndex ?? 0,
    scrollSpeed: state.scrollSpeed ?? 50,
    fontSize: state.fontSize ?? 24,
    textAlignment: state.textAlignment || 'center',
    lineHeight: state.lineHeight ?? 1.5,
    margin: state.margin ?? 20,
    overlayOpacity: state.overlayOpacity ?? 0.5,
  };
}
