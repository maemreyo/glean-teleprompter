# Data Model: Auto-save Improvements

**Feature**: 006-autosave-improvements  
**Date**: 2026-01-01  
**Schema Version**: 2.0

## Overview

This document defines the data structures for the unified auto-save system, including draft entities, storage collections, and migration schemas.

---

## Core Entities

### 1. TeleprompterDraft

The primary entity representing a saved teleprompter state.

```typescript
interface TeleprompterDraft {
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
```

**Storage Key**: `teleprompter_draft` (single active draft)

**Validation Rules**:
- `_id`: Must be valid UUID v4
- `_version`: Must match current schema version
- `_timestamp`: Must be positive integer
- `text`: Optional, max 500,000 characters
- `backgroundUrl`: Optional, valid URL string
- `musicUrl`: Optional, valid URL string
- `fontStyle`: Required, valid font name
- `colorIndex`: 0-9 integer
- `scrollSpeed`: 1-100 integer
- `fontSize`: 12-72 integer
- `textAlignment`: One of ["left", "center", "right"]
- `lineHeight`: 1.0-2.5 float, one decimal
- `margin`: 0-100 integer
- `overlayOpacity`: 0.0-1.0 float, two decimals

**State Transitions**:
```
[New/Empty] → [Editing] → [Saved] → [Editing] → [Saved]
     ↓            ↓          ↓           ↓          ↓
   (idle)    (dirty)   (persisted)  (dirty)   (persisted)
```

---

### 2. DraftsCollection

Array of draft objects stored in localStorage for draft management UI.

```typescript
interface DraftsCollection {
  drafts: TeleprompterDraft[];
  _schemaVersion: string;  // Current schema version
  _lastUpdated: number;    // Unix timestamp
}
```

**Storage Key**: `teleprompter_drafts`

**Storage Structure**:
```json
{
  "drafts": [
    {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "_version": "2.0",
      "_timestamp": 1704067200000,
      "text": "Example script...",
      "backgroundUrl": "...",
      "musicUrl": "...",
      "fontStyle": "Arial",
      "colorIndex": 0,
      "scrollSpeed": 50,
      "fontSize": 24,
      "textAlignment": "center",
      "lineHeight": 1.5,
      "margin": 20,
      "overlayOpacity": 0.5
    }
  ],
  "_schemaVersion": "2.0",
  "_lastUpdated": 1704067200000
}
```

---

### 3. StorageUsageMetrics

Information about localStorage consumption.

```typescript
interface StorageUsageMetrics {
  used: number;        // Bytes currently used
  total: number;       // Estimated browser limit (bytes)
  percentage: number;  // 0-100
  byKey: Record<string, number>;  // Size per key
}
```

**Calculation Method**:
```typescript
const calculateUsage = (): StorageUsageMetrics => {
  let used = 0;
  const byKey: Record<string, number> = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    const value = localStorage.getItem(key)!;
    const size = (key.length + value.length) * 2; // UTF-16 = 2 bytes/char
    used += size;
    byKey[key] = size;
  }
  
  const total = estimateBrowserLimit();
  return {
    used,
    total,
    percentage: (used / total) * 100,
    byKey
  };
};
```

**Browser Limits** (estimated):
- Chrome/Edge: ~10MB (10,485,760 bytes)
- Firefox: ~10MB (10,485,760 bytes)
- Safari: ~5MB (5,242,880 bytes)
- Mobile browsers: ~5MB (5,242,880 bytes)

---

### 4. SaveStatus

Enum representing the current auto-save state.

```typescript
type SaveStatus = 
  | 'idle'        // No changes since last save
  | 'saving'      // Save operation in progress
  | 'saved'       // Successfully saved
  | 'error';      // Save failed (quota, corruption, etc.)
```

**Display Mapping**:
- `idle`: "" (no indicator)
- `saving`: "Saving..." (with spinner)
- `saved`: "Saved just now" → "Saved 5s ago" → "Saved 1m ago"
- `error`: "Save failed" (with retry button)

---

### 5. ConflictResolution

User choice when multi-tab conflict is detected.

```typescript
type ConflictResolution = 
  | 'overwrite'    // Use current tab's version
  | 'reload'       // Reload to get newer version
  | 'cancel';      // Cancel the operation
```

**Dialog Data**:
```typescript
interface ConflictDialogData {
  localDraft: TeleprompterDraft;    // Current tab's version
  remoteDraft: TeleprompterDraft;   // Other tab's version
  timeDiff: number;                 // Age difference in milliseconds
  onResolve: (resolution: ConflictResolution) => void;
}
```

---

### 6. QuotaWarningLevel

Warning level based on storage usage.

```typescript
type QuotaWarningLevel = 
  | 'normal'      // < 90% used
  | 'warning'     // 90-99% used
  | 'critical';   // 100% used (full)
```

**Thresholds**:
- `normal`: percentage < 90
- `warning`: 90 ≤ percentage < 100
- `critical`: percentage ≥ 100

---

## Schema Versions and Migrations

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-31 | Initial schema (legacy dual-save system) |
| 2.0 | 2026-01-01 | Unified auto-save, added `overlayOpacity`, metadata fields |

### Migration: 1.0 → 2.0

```typescript
const migrate_1_0_to_2_0 = (draft: any): TeleprompterDraft => {
  return {
    ...draft,
    _version: '2.0',
    // Add new field with default
    overlayOpacity: draft.overlayOpacity ?? 0.5,
    // Ensure metadata exists
    _id: draft._id ?? generateUUID(),
    _timestamp: draft._timestamp ?? Date.now(),
  };
};
```

**Migration Rules**:
1. Preserve all existing fields
2. Add new fields with sensible defaults
3. Generate missing metadata
4. Validate resulting schema

---

## localStorage Keys

### Application Keys

| Key | Type | Description | Max Size |
|-----|------|-------------|----------|
| `teleprompter_draft` | TeleprompterDraft | Active draft (single) | ~50KB |
| `teleprompter_drafts` | DraftsCollection | All drafts (array) | ~5MB |
| `teleprompter_storage_warning_dismissed` | boolean | Warning dismissal state | ~10B |
| `teleprompter_private_browsing_detected` | boolean | Detection cache | ~10B |

### Key Naming Convention

- Application-specific keys prefixed with `teleprompter_`
- Metadata/setting keys use snake_case
- Draft-related keys use `draft` or `drafts` suffix

---

## Data Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    localStorage (Browser)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  teleprompter_draft (single active)                 │   │
│  │  └─ TeleprompterDraft                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↕                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  teleprompter_drafts (collection)                   │   │
│  │  └─ DraftsCollection                                │   │
│  │      ├─ drafts[] → TeleprompterDraft                │   │
│  │      ├─ _schemaVersion                              │   │
│  │      └─ _lastUpdated                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  StorageUsageMetrics (calculated)                   │   │
│  │  ├─ used, total, percentage                         │   │
│  │  └─ byKey (key → size mapping)                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘

                     (Optional Cloud Backup)
                               ↕
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (Cloud)                          │
├─────────────────────────────────────────────────────────────┤
│  drafts table                                                │
│  ├─ id: UUID (primary key)                                  │
│  ├─ user_id: UUID (foreign key)                             │
│  ├─ draft: JSON (TeleprompterDraft)                         │
│  └─ updated_at: timestamp                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Indexing and Query Patterns

### Local Storage Queries

**Get all drafts**:
```typescript
const getAllDrafts = (): TeleprompterDraft[] => {
  const collection = localStorage.getItem('teleprompter_drafts');
  return collection 
    ? JSON.parse(collection).drafts 
    : [];
};
```

**Get draft by ID**:
```typescript
const getDraftById = (id: string): TeleprompterDraft | null => {
  const drafts = getAllDrafts();
  return drafts.find(d => d._id === id) ?? null;
};
```

**Get drafts by date range**:
```typescript
const getDraftsByDateRange = (start: number, end: number): TeleprompterDraft[] => {
  const drafts = getAllDrafts();
  return drafts.filter(d => d._timestamp >= start && d._timestamp <= end);
};
```

**Sort drafts** (newest first):
```typescript
const sortDraftsByTimestamp = (drafts: TeleprompterDraft[]): TeleprompterDraft[] => {
  return [...drafts].sort((a, b) => b._timestamp - a._timestamp);
};
```

---

## Data Integrity Constraints

### Uniqueness
- `_id` must be unique across all drafts
- Generated using UUID v4

### Referential Integrity
- No foreign keys in localStorage (single-client storage)
- Supabase drafts table references `auth.users` via `user_id`

### Data Consistency
- Single source of truth: `teleprompter_draft` key
- Drafts collection updated atomically
- Writes wrapped in try-catch for quota handling

### Validation on Load
```typescript
const validateDraft = (draft: any): TeleprompterDraft => {
  // Apply migration if version mismatch
  if (draft._version !== CURRENT_SCHEMA_VERSION) {
    return migrateDraft(draft);
  }
  
  // Validate required fields
  if (!draft._id || !draft._timestamp) {
    throw new Error('Invalid draft: missing metadata');
  }
  
  return draft as TeleprompterDraft;
};
```

---

## Cleanup and Retention Policies

### Automatic Cleanup
- **Triggered**: When storage quota exceeded
- **Criteria**: Delete drafts older than 30 days
- **Scope**: Only drafts in `teleprompter_drafts` collection
- **Preservation**: Active draft (`teleprompter_draft`) never auto-deleted

### Manual Cleanup
- User can trigger via "Clear Old Drafts" button
- Shows summary of drafts deleted and space freed
- Confirmation dialog before deletion

### Cleanup Function
```typescript
const cleanupOldDrafts = (daysOld: number = 30): CleanupResult => {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  const drafts = getAllDrafts();
  
  const toKeep = drafts.filter(d => d._timestamp > cutoff);
  const deleted = drafts.length - toKeep.length;
  const bytesFreed = calculateSize(drafts) - calculateSize(toKeep);
  
  localStorage.setItem('teleprompter_drafts', JSON.stringify({
    drafts: toKeep,
    _schemaVersion: CURRENT_SCHEMA_VERSION,
    _lastUpdated: Date.now()
  }));
  
  return { deletedCount: deleted, bytesFreed };
};
```

---

## Error States and Recovery

### Quota Exceeded
**State**: `SaveStatus = 'error'`
**Recovery**: 
1. Show error toast with "Clear Old Drafts" button
2. Offer "Save to account" option
3. Preserve unsaved changes in memory

### Corrupted Data
**State**: Parse error on load
**Recovery**:
1. Show error message
2. Offer to restore from backup (if available)
3. Preserve corrupted draft for manual recovery

### Migration Failure
**State**: Migration throws exception
**Recovery**:
1. Log error with draft ID
2. Skip migration, preserve original data
3. Show warning to user

---

## TypeScript Types Export

```typescript
// lib/storage/types.ts
export type {
  TeleprompterDraft,
  DraftsCollection,
  StorageUsageMetrics,
  SaveStatus,
  ConflictResolution,
  QuotaWarningLevel
};

export const CURRENT_SCHEMA_VERSION = '2.0' as const;
export type SchemaVersion = typeof CURRENT_SCHEMA_VERSION;
```

---

## Next Steps

1. Implement storage utilities in `lib/storage/`
2. Create migration functions in `lib/storage/draftMigration.ts`
3. Build auto-save hook in `hooks/useAutoSave.ts`
4. Develop draft management UI components
5. Write comprehensive tests for all data operations
