/**
 * Schema migration system for drafts
 * Handles version upgrades and data transformation
 */

import {
  TeleprompterDraft,
  CURRENT_SCHEMA_VERSION,
  MigrationError,
  MigrationSummary,
} from './types';

// ============================================================================
// Migration Registry
// ============================================================================

type MigrationFunction = (draft: unknown) => TeleprompterDraft;

interface Migration {
  fromVersion: string;
  toVersion: string;
  migrate: MigrationFunction;
}

const migrations: Map<string, Migration> = new Map();

// ============================================================================
// Migration Functions
// ============================================================================

/**
 * Migration from schema 1.0 to 2.0
 * - Add overlayOpacity field
 * - Ensure metadata exists
 */
export const migrate_1_0_to_2_0 = (draft: any): TeleprompterDraft => {
  return {
    ...draft,
    _version: '2.0',
    // Add new field with default
    overlayOpacity: draft.overlayOpacity ?? 0.5,
    // Ensure metadata exists
    _id: draft._id || generateUUID(),
    _timestamp: draft._timestamp || Date.now(),
  };
};

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

// ============================================================================
// Migration API
// ============================================================================

/**
 * Get current schema version
 */
export function getCurrentVersion(): string {
  return CURRENT_SCHEMA_VERSION;
}

/**
 * Get draft schema version
 * @param draft - Draft to check
 * @returns Schema version, or '1.0' if not specified
 */
export function getDraftVersion(draft: unknown): string {
  if (!draft || typeof draft !== 'object') {
    return '1.0';
  }

  const d = draft as Partial<TeleprompterDraft>;
  return d._version || '1.0';
}

/**
 * Register a new migration function
 * @param fromVersion - Source version
 * @param toVersion - Target version
 * @param migration - Migration function
 */
export function registerMigration(
  fromVersion: string,
  toVersion: string,
  migration: MigrationFunction
): void {
  const key = `${fromVersion}->${toVersion}`;
  migrations.set(key, { fromVersion, toVersion, migrate: migration });
}

/**
 * Check if a draft needs migration
 */
export function needsMigration(draft: unknown): boolean {
  const draftVersion = getDraftVersion(draft);
  return draftVersion !== CURRENT_SCHEMA_VERSION;
}

/**
 * Migrate a draft to current schema version
 * @param draft - Draft to migrate
 * @returns Migrated draft
 * @throws MigrationError if migration fails
 */
export function migrateDraft(draft: unknown): TeleprompterDraft {
  try {
    // If draft is already at current version, return as-is
    if (!needsMigration(draft)) {
      return draft as TeleprompterDraft;
    }

    let currentDraft = draft;
    let currentVersion = getDraftVersion(draft);

    // Apply migrations sequentially
    while (currentVersion !== CURRENT_SCHEMA_VERSION) {
      const migrationKey = `${currentVersion}->${getNextVersion(currentVersion)}`;
      const migration = migrations.get(migrationKey);

      if (!migration) {
        // No migration path found - try to handle gracefully
        console.warn(`No migration path from ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`);
        
        // If it looks like a valid draft, just update version
        if (isValidDraftStructure(currentDraft)) {
          return {
            ...(typeof currentDraft === 'object' ? currentDraft : {}),
            _version: CURRENT_SCHEMA_VERSION,
          } as TeleprompterDraft;
        }

        throw new MigrationError(
          `No migration path from ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`,
          currentVersion,
          CURRENT_SCHEMA_VERSION
        );
      }

      // Apply migration
      currentDraft = migration.migrate(currentDraft);
      currentVersion = migration.toVersion;
    }

    return currentDraft as TeleprompterDraft;
  } catch (error) {
    if (error instanceof MigrationError) {
      throw error;
    }

    // Preserve original data on migration failure
    console.error('Migration failed, preserving original data:', error);
    throw new MigrationError(
      `Migration failed: ${error}`,
      getDraftVersion(draft),
      CURRENT_SCHEMA_VERSION
    );
  }
}

/**
 * Migrate all drafts in collection
 * @returns Count of migrated drafts and any errors
 */
export function migrateCollection(drafts: unknown[]): MigrationSummary {
  const summary: MigrationSummary = {
    migrated: 0,
    failed: 0,
    errors: [],
  };

  for (const draft of drafts) {
    try {
      migrateDraft(draft);
      summary.migrated++;
    } catch (error) {
      summary.failed++;
      const draftId = typeof draft === 'object' && draft && '_id' in draft 
        ? (draft as any)._id 
        : 'unknown';
      summary.errors.push({
        draftId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return summary;
}

/**
 * Get all registered migrations
 */
export function getRegisteredMigrations(): Map<string, MigrationFunction> {
  const result = new Map<string, MigrationFunction>();
  for (const [key, migration] of migrations.entries()) {
    result.set(key, migration.migrate);
  }
  return result;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the next version in the migration chain
 */
function getNextVersion(currentVersion: string): string {
  // Known migration paths
  const paths: Record<string, string> = {
    '1.0': '2.0',
    // Add future versions here
  };

  return paths[currentVersion] || CURRENT_SCHEMA_VERSION;
}

/**
 * Check if draft has valid structure (defensive check)
 */
function isValidDraftStructure(draft: unknown): boolean {
  if (!draft || typeof draft !== 'object') {
    return false;
  }

  const d = draft as Record<string, unknown>;

  // Check for at least some teleprompter properties
  const hasText = typeof d.text === 'string';
  const hasBackground = typeof d.backgroundUrl === 'string';
  const hasMusic = typeof d.musicUrl === 'string';

  return hasText || hasBackground || hasMusic;
}

// ============================================================================
// Initialize Default Migrations
// ============================================================================

// Register the 1.0 -> 2.0 migration
registerMigration('1.0', '2.0', migrate_1_0_to_2_0);
