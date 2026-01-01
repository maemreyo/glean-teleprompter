# Storage API Contract

**Feature**: 006-autosave-improvements  
**Type**: LocalStorage Interface  
**Version**: 2.0

## Overview

This contract defines the TypeScript interfaces for localStorage operations related to draft storage, quota management, and migrations.

---

## Module: `lib/storage/draftStorage.ts`

### Interface: DraftStorageAPI

```typescript
/**
 * Primary API for draft storage operations.
 * All operations are synchronous and work with localStorage.
 */
interface DraftStorageAPI {
  /**
   * Save a single draft to localStorage
   * @param draft - The draft to save
   * @throws QuotaExceededError when storage is full
   */
  saveDraft(draft: TeleprompterDraft): void;
  
  /**
   * Load the active draft from localStorage
   * @returns The draft, or null if not found
   */
  loadDraft(): TeleprompterDraft | null;
  
  /**
   * Delete the active draft from localStorage
   */
  deleteDraft(): void;
  
  /**
   * Check if a draft exists
   */
  hasDraft(): boolean;
  
  /**
   * Get all drafts from the drafts collection
   */
  loadAllDrafts(): TeleprompterDraft[];
  
  /**
   * Save a draft to the drafts collection
   * @param draft - The draft to add
   * @returns The ID of the saved draft
   */
  addToCollection(draft: TeleprompterDraft): string;
  
  /**
   * Remove a draft from the collection by ID
   */
  removeFromCollection(id: string): void;
  
  /**
   * Clear all drafts from the collection
   */
  clearCollection(): void;
}

/**
 * Implementation note: All operations must:
 * 1. Validate input data
 * 2. Apply migrations if version mismatch
 * 3. Handle QuotaExceededError
 * 4. Update collection metadata
 */
```

### Interface: QuotaManagerAPI

```typescript
/**
 * API for monitoring and managing localStorage quota.
 */
interface QuotaManagerAPI {
  /**
   * Calculate current storage usage
   * @returns Storage metrics including bytes used, total capacity, and percentage
   */
  getUsage(): StorageUsageMetrics;
  
  /**
   * Get the warning level based on current usage
   */
  getWarningLevel(): QuotaWarningLevel;
  
  /**
   * Check if a write would exceed quota
   * @param data - The data to check
   * @returns true if write would exceed quota
   */
  wouldExceedQuota(data: unknown): boolean;
  
  /**
   * Delete drafts older than specified days
   * @param daysOld - Age threshold in days (default: 30)
   * @returns Count of drafts deleted and bytes freed
   */
  cleanupOldDrafts(daysOld?: number): CleanupResult;
  
  /**
   * Get size of a specific key in bytes
   */
  getKeySize(key: string): number;
  
  /**
   * Get estimated browser storage limit
   */
  getBrowserLimit(): number;
}

/**
 * Implementation note: Size calculations use UTF-16 encoding:
 * - Each character = 2 bytes
 * - Size = (key.length + value.length) * 2
 */
```

### Interface: MigrationAPI

```typescript
/**
 * API for schema migrations.
 */
interface MigrationAPI {
  /**
   * Get current schema version
   */
  getCurrentVersion(): string;
  
  /**
   * Get draft schema version
   * @param draft - Draft to check
   * @returns Schema version, or '1.0' if not specified
   */
  getDraftVersion(draft: unknown): string;
  
  /**
   * Migrate a draft to current schema version
   * @param draft - Draft to migrate
   * @returns Migrated draft
   * @throws MigrationError if migration fails
   */
  migrateDraft(draft: unknown): TeleprompterDraft;
  
  /**
   * Register a new migration function
   * @param fromVersion - Source version
   * @param toVersion - Target version
   * @param migration - Migration function
   */
  registerMigration(
    fromVersion: string,
    toVersion: string,
    migration: (draft: unknown) => TeleprompterDraft
  ): void;
  
  /**
   * Check if a draft needs migration
   */
  needsMigration(draft: unknown): boolean;
}

/**
 * Implementation note:
 * - Migrations must be cumulative (1.0→2.0, 2.0→3.0)
 * - Each migration should be a pure function
 * - Original draft must be preserved on migration failure
 */
```

---

## Error Types

```typescript
/**
 * Base error class for storage operations
 */
class StorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Thrown when localStorage quota is exceeded
 */
class QuotaExceededError extends StorageError {
  constructor(message: string = 'Storage quota exceeded') {
    super(message, 'QUOTA_EXCEEDED');
    this.name = 'QuotaExceededError';
  }
}

/**
 * Thrown when draft data is corrupted or invalid
 */
class CorruptedDataError extends StorageError {
  constructor(message: string, public readonly draftId?: string) {
    super(message, 'CORRUPTED_DATA');
    this.name = 'CorruptedDataError';
  }
}

/**
 * Thrown when migration fails
 */
class MigrationError extends StorageError {
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
class StorageUnavailableError extends StorageError {
  constructor(message: string = 'localStorage unavailable') {
    super(message, 'STORAGE_UNAVAILABLE');
    this.name = 'StorageUnavailableError';
  }
}
```

---

## Function Signatures

### Draft Storage Functions

```typescript
/**
 * Save draft with conflict detection
 * @param draft - Draft to save
 * @param options - Save options
 * @returns Save result with conflict info if applicable
 */
function saveDraftWithConflictDetection(
  draft: TeleprompterDraft,
  options: {
    checkConflicts?: boolean;
    onConflict?: (conflict: ConflictData) => ConflictResolution;
  } = {}
): SaveResult;

/**
 * Load draft with automatic migration
 * @returns Loaded and migrated draft, or null
 */
function loadDraftMigrated(): TeleprompterDraft | null;

/**
 * Batch save multiple drafts atomically
 * @param drafts - Drafts to save
 * @throws QuotaExceededError if total size exceeds quota
 */
function saveDraftsBatch(drafts: TeleprompterDraft[]): void;
```

### Quota Management Functions

```typescript
/**
 * Get formatted storage usage string for display
 * @returns Human-readable usage (e.g., "4.5 MB of 5 MB used (90%)")
 */
function formatStorageUsage(): string;

/**
 * Estimate size of data before writing
 * @param data - Data to measure
 * @returns Size in bytes
 */
function estimateDataSize(data: unknown): number;

/**
 * Get largest storage keys by size
 * @param limit - Number of keys to return (default: 10)
 * @returns Array of keys with their sizes
 */
function getLargestKeys(limit?: number): Array<{ key: string; size: number }>;
```

### Migration Functions

```typescript
/**
 * Validate draft schema
 * @param draft - Draft to validate
 * @returns Validation result with errors if any
 */
function validateDraftSchema(draft: unknown): ValidationResult;

/**
 * Get all registered migrations
 * @returns Map of version pairs to migration functions
 */
function getRegisteredMigrations(): Map<string, (draft: unknown) => TeleprompterDraft>;

/**
 * Migrate all drafts in collection
 * @returns Count of migrated drafts and any errors
 */
function migrateCollection(): MigrationSummary;
```

---

## Type Definitions

```typescript
/**
 * Result of a save operation
 */
interface SaveResult {
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
interface CleanupResult {
  deletedCount: number;
  bytesFreed: number;
  errors: Array<{ draftId: string; error: string }>;
}

/**
 * Conflict detection data
 */
interface ConflictData {
  localDraft: TeleprompterDraft;
  remoteDraft: TeleprompterDraft;
  timeDifference: number; // milliseconds
}

/**
 * Validation result
 */
interface ValidationResult {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  version: string;
}

/**
 * Migration summary
 */
interface MigrationSummary {
  migrated: number;
  failed: number;
  errors: Array<{ draftId: string; error: string }>;
}
```

---

## Constants

```typescript
/**
 * Current schema version
 */
const CURRENT_SCHEMA_VERSION = '2.0';

/**
 * localStorage keys
 */
const STORAGE_KEYS = {
  DRAFT: 'teleprompter_draft',
  DRAFTS_COLLECTION: 'teleprompter_drafts',
  WARNING_DISMISSED: 'teleprompter_storage_warning_dismissed',
  PRIVATE_BROWSING_DETECTED: 'teleprompter_private_browsing_detected',
} as const;

/**
 * Quota thresholds (percentage)
 */
const QUOTA_THRESHOLDS = {
  WARNING: 90,
  CRITICAL: 100,
} as const;

/**
 * Draft retention period (days)
 */
const DRAFT_RETENTION_DAYS = 30;

/**
 * Estimated browser limits (bytes)
 */
const BROWSER_LIMITS = {
  CHROME: 10 * 1024 * 1024, // 10MB
  FIREFOX: 10 * 1024 * 1024, // 10MB
  SAFARI: 5 * 1024 * 1024, // 5MB
  DEFAULT: 5 * 1024 * 1024, // 5MB
} as const;
```

---

## Usage Example

```typescript
import { saveDraft, loadDraft, getUsage } from '@/lib/storage/draftStorage';

// Save draft with conflict detection
const draft: TeleprompterDraft = {
  _id: 'uuid',
  _version: '2.0',
  _timestamp: Date.now(),
  text: 'Hello world',
  // ... other properties
};

try {
  saveDraft(draft);
} catch (error) {
  if (error instanceof QuotaExceededError) {
    // Show quota warning with cleanup option
    showQuotaWarning();
  }
}

// Load draft with automatic migration
const loaded = loadDraft();
if (loaded) {
  console.log('Loaded draft from', new Date(loaded._timestamp));
}

// Check storage usage
const usage = getUsage();
if (usage.percentage >= 90) {
  console.warn(`Storage ${usage.percentage.toFixed(1)}% full`);
}
```

---

## Testing Requirements

All functions must have unit tests covering:
- Happy path (success cases)
- Error cases (quota exceeded, corrupted data, etc.)
- Edge cases (empty data, large data, etc.)
- Migration paths (all version transitions)

Mock localStorage using `jest-localstorage-mixin` for consistent test behavior.
