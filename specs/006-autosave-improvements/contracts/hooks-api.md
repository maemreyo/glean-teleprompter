# Hooks API Contract

**Feature**: 006-autosave-improvements  
**Type**: React Hooks Interface  
**Version**: 2.0

## Overview

This contract defines the React hooks for auto-save functionality, draft management, and private browsing detection.

---

## Module: `hooks/useAutoSave.ts`

### Hook: `useAutoSave`

```typescript
/**
 * Unified auto-save hook that consolidates dual save mechanisms.
 * Saves draft state with debouncing and periodic intervals.
 * 
 * @param store - Zustand store containing teleprompter state
 * @param options - Configuration options
 * @returns Object containing save status and control functions
 */
function useAutoSave(
  store: StoreApi<TeleprompterState>,
  options: UseAutoSaveOptions
): UseAutoSaveReturn;

/**
 * Configuration options for useAutoSave
 */
interface UseAutoSaveOptions {
  /**
   * Debounce delay in milliseconds after last change
   * @default 1000
   */
  debounceMs?: number;
  
  /**
   * Periodic save interval in milliseconds
   * @default 5000
   */
  periodicMs?: number;
  
  /**
   * Callback fired when save status changes
   */
  onStatusChange?: (status: SaveStatus) => void;
  
  /**
   * Enable beforeunload handler for page close protection
   * @default true
   */
  enableBeforeUnload?: boolean;
  
  /**
   * Current mode (setup, running, read-only)
   * Only saves in 'setup' mode
   */
  mode: 'setup' | 'running' | 'readonly';
  
  /**
   * Enable conflict detection for multi-tab scenarios
   * @default true
   */
  enableConflictDetection?: boolean;
}

/**
 * Return value from useAutoSave
 */
interface UseAutoSaveReturn {
  /**
   * Current save status
   */
  status: SaveStatus;
  
  /**
   * Last save timestamp (Unix ms)
   */
  lastSavedAt: number | null;
  
  /**
   * Trigger an immediate save (debounce bypass)
   */
  saveNow: () => void;
  
  /**
   * Cancel pending debounced save
   */
  cancelSave: () => void;
  
  /**
   * Reset save status to idle
   */
  resetStatus: () => void;
}
```

### Implementation Requirements

1. **Debounced Save**: Use `useDebounce` or custom debounce logic
2. **Periodic Save**: `useEffect` with `setInterval`
3. **Beforeunload Handler**: Add/remove event listener based on mode
4. **Conflict Detection**: Check timestamps before overwriting
5. **Non-blocking**: Use `requestIdleCallback` when available
6. **Error Handling**: Catch quota exceeded and other storage errors

### Usage Example

```typescript
const store = useTeleprompterStore();
const { status, lastSavedAt, saveNow } = useAutoSave(store, {
  debounceMs: 1000,
  periodicMs: 5000,
  mode: 'setup',
  onStatusChange: (status) => {
    console.log('Save status:', status);
  },
});

// Show save status in UI
<div>
  {status === 'saving' && 'Saving...'}
  {status === 'saved' && `Saved ${formatRelativeTime(lastSavedAt)}`}
  {status === 'error' && 'Save failed'}
</div>
```

---

## Module: `hooks/useDraftManagement.ts`

### Hook: `useDraftManagement`

```typescript
/**
 * Hook for managing local drafts collection.
 * Provides CRUD operations for draft list UI.
 * 
 * @param options - Configuration options
 * @returns Draft management operations and state
 */
function useDraftManagement(
  options?: UseDraftManagementOptions
): UseDraftManagementReturn;

/**
 * Configuration options
 */
interface UseDraftManagementOptions {
  /**
   * Auto-load drafts on mount
   * @default true
   */
  autoLoad?: boolean;
  
  /**
   * Sort drafts by timestamp descending
   * @default true
   */
  sortNewestFirst?: boolean;
  
  /**
   * Maximum number of drafts to keep
   * @default Infinity (no limit)
   */
  maxDrafts?: number;
}

/**
 * Return value from useDraftManagement
 */
interface UseDraftManagementReturn {
  /**
   * Array of all saved drafts
   */
  drafts: TeleprompterDraft[];
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * Error state
   */
  error: Error | null;
  
  /**
   * Load all drafts from storage
   */
  loadDrafts: () => Promise<void>;
  
  /**
   * Restore a draft to the editor
   */
  restoreDraft: (id: string) => void;
  
  /**
   * Delete one or more drafts
   */
  deleteDrafts: (ids: string[]) => Promise<void>;
  
  /**
   * Get a single draft by ID
   */
  getDraft: (id: string) => TeleprompterDraft | null;
  
  /**
   * Create a new draft from current state
   */
  createDraft: (state: TeleprompterState) => string;
  
  /**
   * Refresh drafts list
   */
  refresh: () => Promise<void>;
}
```

### Implementation Requirements

1. **Load on Mount**: Fetch drafts from localStorage on mount if `autoLoad=true`
2. **Sorting**: Sort by `_timestamp` descending if `sortNewestFirst=true`
3. **Max Drafts**: Remove oldest drafts when exceeding `maxDrafts`
4. **Restore**: Apply draft state to teleprompter store
5. **Delete**: Remove from localStorage and update state
6. **Error Handling**: Show toast notifications for errors

### Usage Example

```typescript
const {
  drafts,
  isLoading,
  restoreDraft,
  deleteDrafts
} = useDraftManagement();

// Show draft list
{drafts.map(draft => (
  <DraftListItem
    key={draft._id}
    draft={draft}
    onRestore={() => restoreDraft(draft._id)}
    onDelete={() => deleteDrafts([draft._id])}
  />
))}
```

---

## Module: `hooks/useStorageQuota.ts`

### Hook: `useStorageQuota`

```typescript
/**
 * Hook for monitoring localStorage quota usage.
 * Provides metrics and warning levels for storage management.
 * 
 * @param options - Configuration options
 * @returns Storage quota metrics and utilities
 */
function useStorageQuota(
  options?: UseStorageQuotaOptions
): UseStorageQuotaReturn;

/**
 * Configuration options
 */
interface UseStorageQuotaOptions {
  /**
   * Polling interval for checking quota (ms)
   * @default 10000 (10 seconds)
   */
  checkInterval?: number;
  
  /**
   * Enable polling (otherwise checks on mount only)
   * @default false
   */
  enablePolling?: boolean;
  
  /**
   * Show warning when usage exceeds threshold
   * @default 90
   */
  warningThreshold?: number;
}

/**
 * Return value from useStorageQuota
 */
interface UseStorageQuotaReturn {
  /**
   * Current storage usage metrics
   */
  usage: StorageUsageMetrics;
  
   /**
   * Current warning level
   */
  warningLevel: QuotaWarningLevel;
  
  /**
   * Whether storage is full
   */
  isFull: boolean;
  
  /**
   * Whether storage is almost full
   */
  isAlmostFull: boolean;
  
  /**
   * Refresh usage metrics
   */
  refresh: () => void;
  
  /**
   * Clean up old drafts
   */
  cleanup: (daysOld?: number) => Promise<CleanupResult>;
  
  /**
   * Get formatted usage string for display
   */
  formatUsage: () => string;
}
```

### Implementation Requirements

1. **Metrics Calculation**: Sum all localStorage key sizes
2. **Warning Levels**: normal (<90%), warning (90-99%), critical (100%)
3. **Polling**: Use `setInterval` if `enablePolling=true`
4. **Cleanup**: Call `cleanupOldDrafts` from storage API
5. **Formatting**: Return human-readable string (e.g., "4.5 MB of 5 MB")

### Usage Example

```typescript
const {
  usage,
  warningLevel,
  isAlmostFull,
  cleanup
} = useStorageQuota({ warningThreshold: 90 });

// Show warning if almost full
{isAlmostFull && (
  <StorageQuotaWarning
    usage={usage}
    onCleanup={() => cleanup(30)}
  />
)}
```

---

## Module: `hooks/usePrivateBrowsing.ts`

### Hook: `usePrivateBrowsing`

```typescript
/**
 * Hook for detecting private browsing mode.
 * Tests localStorage write capability and caches result.
 * 
 * @returns Detection state and utilities
 */
function usePrivateBrowsing(): UsePrivateBrowsingReturn;

/**
 * Return value from usePrivateBrowsing
 */
interface UsePrivateBrowsingReturn {
  /**
   * Whether private browsing mode is detected
   */
  isPrivate: boolean;
  
  /**
   * Detection completed
   */
  isDetected: boolean;
  
  /**
   * Whether warning should be shown
   */
  shouldShowWarning: boolean;
  
  /**
   * Dismiss warning for current session
   */
  dismissWarning: () => void;
  
  /**
   * Re-check detection (clears cache)
   */
  recheck: () => void;
}
```

### Implementation Requirements

1. **Detection Test**: Try writing to localStorage on mount
2. **Cache Result**: Store in `teleprompter_private_browsing_detected` key
3. **Session Dismissal**: Store dismissal state in memory (not persisted)
4. **Re-check**: Clear cache and re-run detection

### Usage Example

```typescript
const { isPrivate, shouldShowWarning, dismissWarning } = usePrivateBrowsing();

// Show warning banner
{shouldShowWarning && (
  <PrivateBrowsingWarning
    onDismiss={dismissWarning}
    onSaveToAccount={() => router.push('/save')}
  />
)}
```

---

## Module: `hooks/useBeforeUnloadSave.ts`

### Hook: `useBeforeUnloadSave`

```typescript
/**
 * Hook for protecting against accidental tab closure.
 * Saves state immediately before page unload.
 * 
 * @param store - Zustand store to save
 * @param options - Configuration options
 */
function useBeforeUnloadSave(
  store: StoreApi<TeleprompterState>,
  options: UseBeforeUnloadSaveOptions
): void;

/**
 * Configuration options
 */
interface UseBeforeUnloadSaveOptions {
  /**
   * Only save in setup mode
   * @default true
   */
  setupOnly?: boolean;
  
  /**
   * Current mode
   */
  mode: 'setup' | 'running' | 'readonly';
  
  /**
   * Callback before save (can prevent save)
   */
  beforeSave?: () => boolean | Promise<boolean>;
}
```

### Implementation Requirements

1. **Event Listener**: Add `beforeunload` listener on mount
2. **Conditional Save**: Only save if `mode === 'setup'` (unless `setupOnly=false`)
3. **Synchronous Save**: Must complete within browser's beforeunload time limit
4. **Error Handling**: Catch errors without blocking unload
5. **Cleanup**: Remove listener on unmount

### Usage Example

```typescript
useBeforeUnloadSave(store, {
  mode: currentMode,
  beforeSave: async () => {
    // Return false to prevent save
    return true; // Allow save
  },
});
```

---

## Type Exports

```typescript
// hooks/useAutoSave.ts
export type { UseAutoSaveOptions, UseAutoSaveReturn };

// hooks/useDraftManagement.ts
export type { UseDraftManagementOptions, UseDraftManagementReturn };

// hooks/useStorageQuota.ts
export type { UseStorageQuotaOptions, UseStorageQuotaReturn };

// hooks/usePrivateBrowsing.ts
export type { UsePrivateBrowsingReturn };

// hooks/useBeforeUnloadSave.ts
export type { UseBeforeUnloadSaveOptions };
```

---

## Testing Requirements

All hooks must have tests covering:
- Mount/unmount behavior
- Effect cleanup
- Error handling
- Callback invocation
- State updates
- Edge cases (empty data, large data, etc.)

Use `@testing-library/react-hooks` for hook testing.

---

## Performance Requirements

1. **Debounce Overhead**: < 5ms
2. **Periodic Save Impact**: < 1% CPU
3. **Storage Read**: < 10ms
4. **Storage Write**: < 50ms
5. **Re-render Frequency**: Minimize unnecessary re-renders
