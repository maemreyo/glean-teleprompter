# Research Document: Auto-save Improvements

**Feature**: 006-autosave-improvements  
**Date**: 2026-01-01  
**Status**: Complete

## Overview

This document consolidates research findings for implementing a unified auto-save system with private browsing detection, storage quota management, schema migrations, and draft management UI. All unknowns from the Technical Context have been resolved.

---

## 1. Auto-save System Architecture

### Decision: Single Unified Auto-save Hook

**Implementation**: Consolidate existing dual auto-save mechanisms (useAutoSave hook + setInterval) into a single, unified `useAutoSave` hook that saves all 11 teleprompter properties atomically.

**Rationale**:
- Current dual system creates race conditions where partial data overwrites complete data
- Single hook ensures atomic saves of complete state
- Simplifies code maintenance and reduces bug surface area
- Easier to test with a single code path

**Alternatives Considered**:
1. **Keep dual system with synchronization**: Rejected due to increased complexity and continued race condition risk
2. **Use BroadcastChannel API for cross-tab sync**: Rejected as out of scope (spec explicitly excludes cross-tab synchronization)

**Technical Approach**:
```typescript
// Unified save operation using useIdleTimer for 1s debounce + 5s periodic
const useAutoSave = (store: TeleprompterStore, options: {
  debounceMs: number,      // 1000ms
  periodicMs: number,      // 5000ms
  onSave: (status: SaveStatus) => void
}) => {
  // Single save function that persists complete state atomically
  const saveState = useCallback(() => {
    const state = store.getState();
    localStorage.setItem('teleprompter_draft', JSON.stringify({
      ...state,
      _version: CURRENT_SCHEMA_VERSION,
      _timestamp: Date.now(),
      _id: generateUUID()
    }));
  }, [store]);

  // Debounced save (1s after last change)
  const debouncedSave = useDebounce(saveState, 1000);

  // Periodic save (every 5s)
  useEffect(() => {
    const interval = setInterval(saveState, 5000);
    return () => clearInterval(interval);
  }, [saveState]);

  // Trigger debounced save on state changes
  useEffect(() => {
    debouncedSave();
  }, [store, debouncedSave]);
};
```

**Best Practices**:
- Use `requestIdleCallback` for non-blocking saves when available
- Wrap localStorage writes in try-catch for quota exceeded handling
- Save complete state as single JSON object (atomic operation)
- Include metadata: schema version, timestamp, UUID

---

## 2. Private Browsing Detection

### Decision: Multi-layered Detection Strategy

**Implementation**: Test localStorage write capability and provide user warnings with fallbacks.

**Rationale**:
- No reliable API exists to detect private browsing mode across all browsers
- Testing localStorage write is best-effort (may work in session-only mode)
- Multi-layered approach manages user expectations regardless of detection accuracy

**Alternatives Considered**:
1. **Use FileSystem API detection**: Rejected as inconsistent across browsers
2. **Use IndexedDB detection**: Rejected as some private browsers allow IndexedDB
3. **Assume all storage is ephemeral**: Rejected as degrades experience for normal users

**Technical Approach**:
```typescript
const detectPrivateBrowsing = (): boolean => {
  try {
    const testKey = '__private_browsing_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return false;
  } catch (e) {
    return true; // localStorage failed = likely private browsing
  }
};

// Multi-layered defense (FR-018):
// 1. Show general storage info toast on first visit
// 2. Nudge to save to Supabase after 5min editing
// 3. Best-effort detection attempt (unreliable)
// 4. beforeunload warning for unsaved work not saved to account
```

**Best Practices**:
- Test on page load, cache result for session duration
- Show dismissible warning banner if detected
- Provide "Save to account" call-to-action in warning
- Don't block functionality in private browsing, just warn user
- Use aria-live for screen reader announcement of warning

---

## 3. Storage Quota Management

### Decision: Proactive Monitoring with User-Facing Recovery

**Implementation**: Track localStorage usage, warn at 90% capacity, provide cleanup tools when full.

**Rationale**:
- localStorage has hard limits (~5-10MB depending on browser)
- Users need visibility into storage usage before failures occur
- Automated cleanup (30-day retention) provides self-service recovery

**Alternatives Considered**:
1. **Use IndexedDB**: Rejected as overkill for this use case, adds complexity
2. **Implement compression**: Rejected as out of scope (spec excludes compression)
3. **Fail silently**: Rejected as poor UX, users need actionable feedback

**Technical Approach**:
```typescript
interface StorageUsage {
  used: number;      // bytes
  total: number;     // bytes (approximate browser limit)
  percentage: number; // 0-100
}

const getStorageUsage = (): StorageUsage => {
  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += key.length + localStorage[key].length;
    }
  }
  
  // Estimate browser limit based on user agent
  const total = estimateBrowserLimit();
  return { used, total, percentage: (used / total) * 100 };
};

// Cleanup old drafts
const cleanupOldDrafts = (daysOld: number = 30) => {
  const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  const drafts = loadDrafts();
  const filtered = drafts.filter(d => d._timestamp > cutoff);
  saveDrafts(filtered);
  return drafts.length - filtered.length; // count removed
};
```

**Browser Storage Limits**:
- Chrome/Edge: ~10MB
- Firefox: ~10MB
- Safari: ~5MB
- Mobile browsers: Varies, typically ~5MB

**Best Practices**:
- Calculate usage by enumerating all localStorage keys
- Show both percentage and absolute size (e.g., "4.5 MB of 5 MB used")
- Warn at 90% capacity, error at 100%
- Provide "Clear Old Drafts" button with summary of results
- Use toast notifications for quota warnings (Sonner library)
- Store quota warning dismissal state per session

---

## 4. Schema Migration System

### Decision: Versioned Schema with Cumulative Migrations

**Implementation**: Each draft includes schema version; migrations run on load to upgrade to current version.

**Rationale**:
- Backward compatibility ensures existing user data isn't lost
- Incremental migrations are easier to test and maintain
- Version tracking enables data integrity validation

**Alternatives Considered**:
1. **Break backward compatibility**: Rejected as data loss for existing users
2. **Support multiple schema versions simultaneously**: Rejected as increases complexity
3. **Auto-detect schema without version field**: Rejected as fragile and error-prone

**Technical Approach**:
```typescript
// Current schema version
const CURRENT_SCHEMA_VERSION = '2.0';

interface DraftMetadata {
  _version: string;      // Schema version
  _timestamp: number;    // Unix timestamp
  _id: string;          // UUID
}

interface TeleprompterDraft extends DraftMetadata {
  text: string;
  backgroundUrl: string;
  musicUrl: string;
  fontStyle: string;
  colorIndex: number;
  scrollSpeed: number;
  fontSize: number;
  textAlignment: string;
  lineHeight: number;
  margin: number;
  overlayOpacity: number;
}

// Migration functions (cumulative)
const migrations: Record<string, (draft: any) => any> = {
  '1.0->2.0': (draft) => ({
    ...draft,
    _version: '2.0',
    // Add new field with default
    overlayOpacity: draft.overlayOpacity ?? 0.5,
  }),
  // Future migrations added here
};

// Apply migrations
const migrateDraft = (draft: any): TeleprompterDraft => {
  let migrated = draft;
  const startVersion = draft._version || '1.0';
  
  for (const [migration, fn] of Object.entries(migrations)) {
    const [from] = migration.split('->');
    if (startVersion === from) {
      migrated = fn(migrated);
    }
  }
  
  return migrated;
};
```

**Best Practices**:
- Always increment schema version for breaking changes
- Write migration as pure functions (no side effects)
- Include tests for each migration path
- Preserve original draft on migration failure
- Use sensible defaults for new fields
- Document migration changes in data-model.md

---

## 5. Draft Management Interface

### Decision: Modal Dialog with Draft List

**Implementation**: Shadcn/ui Dialog component with sortable/filterable draft list, restore and delete actions.

**Rationale**:
- Modal keeps context on studio page
- Shadcn/ui Dialog provides consistent UX with existing app
- Draft list allows viewing, restoring, and deleting drafts

**Alternatives Considered**:
1. **Dedicated page**: Rejected as removes user from editing context
2. **Slide-over panel**: Rejected as less familiar pattern in this app
3. **Dropdown menu**: Rejected as insufficient space for draft details

**Technical Approach**:
```typescript
// Draft management hook
const useDraftManagement = () => {
  const [drafts, setDrafts] = useState<TeleprompterDraft[]>([]);
  
  const loadDrafts = useCallback(() => {
    const stored = localStorage.getItem('teleprompter_drafts');
    return stored ? JSON.parse(stored) : [];
  }, []);
  
  const restoreDraft = useCallback((id: string) => {
    const draft = drafts.find(d => d._id === id);
    if (draft) {
      // Apply to store, excluding metadata
      const { _id, _version, _timestamp, ...state } = draft;
      useTeleprompterStore.getState().setState(state);
    }
  }, [drafts]);
  
  const deleteDraft = useCallback((id: string) => {
    const filtered = drafts.filter(d => d._id !== id);
    localStorage.setItem('teleprompter_drafts', JSON.stringify(filtered));
    setDrafts(filtered);
  }, [drafts]);
  
  return { drafts, loadDrafts, restoreDraft, deleteDraft };
};
```

**UI Components**:
- `DraftManagementDialog`: Main modal with draft list
- `DraftListItem`: Individual draft with preview, timestamp, size
- `DraftPreview`: Hover preview showing first 100 characters
- Uses shadcn/ui Dialog, Button, Badge components
- Tailwind CSS for styling

**Best Practices**:
- Show draft metadata: timestamp, size (KB), preview text
- Sort by timestamp descending (newest first)
- Multi-select for bulk delete operations
- Confirmation dialog before delete
- Success toast after restore/delete
- Accessible keyboard navigation (Arrow keys, Enter, Escape)
- ARIA labels for screen readers
- Focus trap in modal

---

## 6. beforeunload Handler

### Decision: Conditional Save on Page Close

**Implementation**: Add beforeunload event listener that saves immediately when in setup mode with unsaved changes.

**Rationale**:
- Prevents data loss when user accidentally closes tab
- Must be conditional (not in read-only or running mode)
- Save operation must complete within browser's beforeunload time limit

**Alternatives Considered**:
1. **Always save on beforeunload**: Rejected as unnecessary overhead in read-only/running modes
2. **Use Page Visibility API**: Rejected as doesn't catch tab close
3. **Use Beacon API**: Rejected as can't guarantee order of execution

**Technical Approach**:
```typescript
const useBeforeUnloadSave = (store: TeleprompterStore, mode: 'setup' | 'running' | 'readonly') => {
  useEffect(() => {
    if (mode !== 'setup') return; // Only in setup mode
    
    const handleBeforeUnload = () => {
      // Synchronous save (must complete before page closes)
      const state = store.getState();
      try {
        localStorage.setItem('teleprompter_draft', JSON.stringify({
          ...state,
          _version: CURRENT_SCHEMA_VERSION,
          _timestamp: Date.now(),
          _id: generateUUID()
        }));
      } catch (e) {
        // Quota exceeded or other error - log but don't block
        console.error('Failed to save on beforeunload:', e);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [store, mode]);
};
```

**Best Practices**:
- Keep save operation synchronous and fast (<100ms)
- Don't show confirmation dialog (save silently)
- Catch and log errors without blocking
- Remove listener on cleanup to prevent memory leaks
- Only active in setup mode (not read-only or running)

---

## 7. Multi-tab Conflict Detection

### Decision: Timestamp Comparison with User Choice

**Implementation**: On save, check if existing draft has newer timestamp; show conflict dialog if so.

**Rationale**:
- Users may have multiple tabs open simultaneously
- Last-write-wins silently overwrites newer data
- User should choose which version to keep

**Alternatives Considered**:
1. **Use BroadcastChannel API**: Rejected as out of scope (spec excludes)
2. **Always overwrite**: Rejected as potential data loss
3. **Auto-merge**: Rejected as complex and error-prone

**Technical Approach**:
```typescript
const saveWithConflictDetection = (draft: TeleprompterDraft) => {
  const existing = localStorage.getItem('teleprompter_draft');
  if (existing) {
    const existingDraft = JSON.parse(existing);
    if (existingDraft._timestamp > draft._timestamp) {
      // Show conflict dialog
      showConflictDialog({
        local: draft,
        remote: existingDraft,
        onOverwrite: () => localStorage.setItem('teleprompter_draft', JSON.stringify(draft)),
        onReload: () => window.location.reload(),
      });
      return;
    }
  }
  localStorage.setItem('teleprompter_draft', JSON.stringify(draft));
};
```

**UI Components**:
- `ConflictDialog`: Shadcn/ui Dialog with two diff previews
- Shows "Your version" vs "Newer version"
- "Overwrite" and "Reload" buttons
- ARIA labels for accessibility

**Best Practices**:
- Compare timestamps using `_timestamp` field
- Show clear diff between versions
- Default to "Reload" (safer option)
- Store conflict dismissal preference

---

## 8. Accessibility (WCAG 2.1 Level AA)

### Decision: Full Keyboard Navigation & Screen Reader Support

**Implementation**: All components keyboard accessible with ARIA labels, semantic HTML, visible focus indicators.

**Rationale**:
- WCAG 2.1 Level AA is constitutional requirement
- Users with disabilities must be able to use all features
- Screen reader users need clear feedback on save status

**Technical Approach**:
```typescript
// ARIA labels for save status
<div
  role="status"
  aria-live="polite"
  aria-label={`Auto-save ${status}`}
>
  {status === 'saving' && 'Saving...'}
  {status === 'saved' && 'Saved just now'}
  {status === 'error' && 'Save failed'}
</div>

// Keyboard navigation in draft list
<ul role="listbox">
  {drafts.map(draft => (
    <li
      role="option"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') restoreDraft(draft._id);
        if (e.key === 'Delete') deleteDraft(draft._id);
      }}
      aria-label={`Draft from ${formatRelativeTime(draft._timestamp)}`}
    >
      ...
    </li>
  ))}
</ul>
```

**Requirements Met**:
- Full keyboard navigation: ✓ (Tab, Enter, Escape, Arrow keys)
- Visible focus indicators: ✓ (Tailwind focus:ring)
- Screen reader support: ✓ (aria-labels, aria-live regions)
- Semantic HTML: ✓ (button, dialog, listbox)
- Color contrast ≥4.5:1: ✓ (shadcn/ui default theme)
- Toast timing ≥5 seconds: ✓ (Sonner default duration)
- Proper heading hierarchy: ✓ (h2 for dialog titles)

---

## 9. Testing Strategy

### Decision: Multi-level Testing with Mocked localStorage

**Implementation**: Unit tests for individual functions, integration tests for workflows, mocked localStorage for consistency.

**Rationale**:
- localStorage behavior must be consistent across tests
- Integration tests verify complete workflows
- Unit tests isolate logic for fast feedback

**Test Coverage**:
```
__tests__/
├── unit/
│   ├── hooks/useAutoSave.test.ts           # Debounce, periodic save
│   ├── hooks/useDraftManagement.test.ts    # CRUD operations
│   ├── storage/draftStorage.test.ts        # LocalStorage wrapper
│   ├── storage/draftMigration.test.ts      # Migration functions
│   ├── storage/storageQuota.test.ts        # Usage calculation
│   └── utils/privateBrowsing.test.ts       # Detection logic
└── integration/
    ├── autosave/unified-save.test.tsx      # Complete save flow
    ├── autosave/beforeunload.test.tsx      # Page close protection
    ├── autosave/conflict-detection.test.tsx # Multi-tab scenario
    ├── draft-management/draft-list.test.tsx # UI operations
    └── draft-management/restore-delete.test.tsx # User actions
```

**Best Practices**:
- Mock localStorage using jest-localstorage-mixin
- Test happy paths and error cases (quota exceeded, corrupted data)
- Test migration paths from all historical schema versions
- Verify accessibility with jest-axe
- Measure performance with Jest performance timers
- Test debouncing with fake timers

---

## 10. Supabase Cloud Save Integration

### Decision: Non-blocking Cloud Save with Fallback to Local

**Implementation**: Optional "Save to account" action that saves to Supabase while preserving local draft.

**Rationale**:
- Local storage is primary, cloud is optional backup
- Network failures shouldn't block local saves
- Users without accounts can still use auto-save

**Error Handling** (FR-017):
```typescript
const saveToSupabase = async (draft: TeleprompterDraft) => {
  try {
    await supabase.from('drafts').upsert({
      user_id: user.id,
      draft: draft,
      updated_at: new Date().toISOString(),
    });
    toast.success('Saved to account');
  } catch (error) {
    if (error.message.includes('offline')) {
      toast.error('Offline: Draft saved locally. Retry when online.');
    } else if (error.message.includes('rate limit')) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.message.includes('auth')) {
      toast.error('Authentication failed. Please sign in again.');
    } else {
      toast.error('Failed to save to account. Local draft preserved.');
    }
  }
};
```

**Best Practices**:
- Keep local draft as source of truth
- Show specific error messages based on error type
- Include retry button in error toast
- Don't block UI on cloud save operations
- Preserve local draft on any Supabase failure

---

## Summary of Technical Decisions

| Area | Decision | Key Trade-off |
|------|----------|---------------|
| Auto-save architecture | Single unified hook | Simplicity over flexibility |
| Private browsing detection | Multi-layered defense | Manage expectations over perfect detection |
| Storage quota | Proactive monitoring + cleanup | User control over automation |
| Schema migrations | Versioned with cumulative migrations | Backward compatibility over simplicity |
| Draft management UI | Modal dialog with shadcn/ui | Consistency with existing patterns |
| beforeunload handler | Conditional save on page close | Data safety over performance overhead |
| Multi-tab conflicts | Timestamp comparison + user choice | User control over automation |
| Accessibility | Full WCAG 2.1 AA compliance | Constitutional requirement |
| Testing | Unit + integration with mocked localStorage | Coverage over speed |
| Cloud save | Optional non-blocking Supabase sync | Local-first over cloud-first |

---

## Unresolved Issues

**None**. All technical unknowns have been resolved through research.

---

## Next Steps

1. **Phase 1**: Generate data-model.md with entity definitions
2. **Phase 1**: Generate API contracts in contracts/ directory
3. **Phase 1**: Generate quickstart.md for developers
4. **Phase 1**: Update agent context with new technologies
5. **Phase 2**: Re-evaluate Constitution Check post-design
