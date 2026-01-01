/**
 * Type definitions for auto-save improvements feature
 * Schema Version: 2.0
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * Primary entity representing a saved teleprompter state
 * Contains all 11 teleprompter properties plus metadata
 */
export interface TeleprompterDraft {
  // Metadata
  _id: string;              // UUID v4 unique identifier
  _version: string;         // Schema version (e.g., "2.0")
  _timestamp: number;       // Unix timestamp (milliseconds)
  
  // Teleprompter properties (11 total)
  text: string;             // Script content
  backgroundUrl: string;    // Background image URL
  musicUrl: string;         // Background music URL
  fontStyle: string;        // Font family name
  colorIndex: number;       // Color preset index (0-9)
  scrollSpeed: number;      // Scroll speed (1-100)
  fontSize: number;         // Font size in pixels (12-72)
  textAlignment: string;    // "left" | "center" | "right"
  lineHeight: number;       // Line height (1.0-2.5)
  margin: number;           // Margin in pixels (0-100)
  overlayOpacity: number;   // Overlay opacity (0.0-1.0)
}

/**
 * Array of draft objects stored in localStorage for draft management UI
 */
export interface DraftsCollection {
  drafts: TeleprompterDraft[];
  _schemaVersion: string;  // Current schema version
  _lastUpdated: number;    // Unix timestamp
}

/**
 * Information about localStorage consumption
 */
export interface StorageUsageMetrics {
  used: number;        // Bytes currently used
  total: number;       // Estimated browser limit (bytes)
  percentage: number;  // 0-100
  byKey: Record<string, number>;  // Size per key
}

/**
 * Enum representing the current auto-save state
 */
export type SaveStatus = 
  | 'idle'        // No changes since last save
  | 'saving'      // Save operation in progress
  | 'saved'       // Successfully saved
  | 'error';      // Save failed (quota, corruption, etc.)

/**
 * User choice when multi-tab conflict is detected
 */
export type ConflictResolution = 
  | 'overwrite'    // Use current tab's version
  | 'reload'       // Reload to get newer version
  | 'cancel';      // Cancel the operation

/**
 * Warning level based on storage usage
 */
export type QuotaWarningLevel = 
  | 'normal'      // < 90% used
  | 'warning'     // 90-99% used
  | 'critical';   // 100% used (full)

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base error class for storage operations
 */
export class StorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Thrown when localStorage quota is exceeded
 */
export class QuotaExceededError extends StorageError {
  constructor(message: string = 'Storage quota exceeded') {
    super(message, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

/**
 * Thrown when draft data is corrupted or invalid
 */
export class CorruptedDataError extends StorageError {
  constructor(message: string, public readonly draftId?: string) {
    super(message, 'CORRUPTED_DATA');
    this.name = 'CorruptedDataError';
  }
}

/**
 * Thrown when migration fails
 */
export class MigrationError extends StorageError {
  constructor(
    message: string,
    public readonly fromVersion: string,
    public readonly toVersion: string
  ) {
    super(message, 'MIGRATION_FAILED');
    this.name = 'MigrationError';
  }
}

/**
 * Thrown when localStorage is not available (private browsing)
 */
export class StorageUnavailableError extends StorageError {
  constructor(message: string = 'localStorage unavailable') {
    super(message, 'STORAGE_UNAVAILABLE');
    this.name = 'StorageUnavailableError';
  }
}

// ============================================================================
// Additional Types for API Contracts
// ============================================================================

/**
 * Result of a save operation
 */
export interface SaveResult {
  success: boolean;
  conflict?: {
    hasNewerVersion: boolean;
    localTimestamp: number;
    remoteTimestamp: number;
  };
  error?: StorageError;
}

/**
 * Result of a cleanup operation
 */
export interface CleanupResult {
  deletedCount: number;
  bytesFreed: number;
  errors: Array<{ draftId: string; error: string }>;
}

/**
 * Conflict detection data
 */
export interface ConflictData {
  localDraft: TeleprompterDraft;
  remoteDraft: TeleprompterDraft;
  timeDifference: number; // milliseconds
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  version: string;
}

/**
 * Migration summary
 */
export interface MigrationSummary {
  migrated: number;
  failed: number;
  errors: Array<{ draftId: string; error: string }>;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Current schema version
 */
export const CURRENT_SCHEMA_VERSION = '2.0' as const;

/**
 * localStorage keys
 */
export const STORAGE_KEYS = {
  DRAFT: 'teleprompter_draft',
  DRAFTS_COLLECTION: 'teleprompter_drafts',
  WARNING_DISMISSED: 'teleprompter_storage_warning_dismissed',
  PRIVATE_BROWSING_DETECTED: 'teleprompter_private_browsing_detected',
} as const;

/**
 * Quota thresholds (percentage)
 */
export const QUOTA_THRESHOLDS = {
  WARNING: 90,
  CRITICAL: 100,
} as const;

/**
 * Draft retention period (days)
 */
export const DRAFT_RETENTION_DAYS = 30;

/**
 * Estimated browser limits (bytes)
 */
export const BROWSER_LIMITS = {
  CHROME: 10 * 1024 * 1024, // 10MB
  FIREFOX: 10 * 1024 * 1024, // 10MB
  SAFARI: 5 * 1024 * 1024, // 5MB
  DEFAULT: 5 * 1024 * 1024, // 5MB
} as const;

/**
 * Schema version type
 */
export type SchemaVersion = typeof CURRENT_SCHEMA_VERSION;
