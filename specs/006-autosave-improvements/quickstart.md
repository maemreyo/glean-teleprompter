# Quickstart: Auto-save Improvements

**Feature**: 006-autosave-improvements  
**Branch**: `006-autosave-improvements`  
**Date**: 2026-01-01

## Overview

This guide helps developers quickly get started with implementing the auto-save improvements feature. It covers setup, key files, testing, and common workflows.

---

## Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Access to Supabase (for cloud save testing, optional)

---

## Initial Setup

### 1. Clone and Checkout Feature Branch

```bash
# Navigate to project root
cd glean-teleprompter

# Create and checkout feature branch
git checkout -b 006-autosave-improvements

# Install dependencies (if not already installed)
npm install
```

### 2. Verify Existing Codebase

```bash
# Run existing tests to ensure baseline
npm test

# Check for linting errors
npm run lint

# Run type checking
npx tsc --noEmit
```

---

## Project Structure

### Key Files for This Feature

```
glean-teleprompter/
├── hooks/
│   ├── useAutoSave.ts                    # TO REFACTOR: Unified auto-save
│   └── useDraftManagement.ts             # TO CREATE: Draft management
├── lib/
│   ├── storage/
│   │   ├── draftStorage.ts               # TO CREATE: LocalStorage wrapper
│   │   ├── draftMigration.ts             # TO CREATE: Schema migrations
│   │   └── storageQuota.ts               # TO CREATE: Quota monitoring
│   ├── utils/
│   │   └── privateBrowsing.ts            # TO CREATE: Detection utility
│   └── a11y/
│       └── ariaLabels.ts                 # TO UPDATE: Add new labels
├── components/teleprompter/
│   ├── config/ui/
│   │   ├── AutoSaveStatus.tsx            # TO UPDATE: Enhanced status
│   │   ├── PrivateBrowsingWarning.tsx    # TO CREATE: Warning banner
│   │   └── StorageQuotaWarning.tsx       # TO CREATE: Quota warning
│   └── editor/
│       └── DraftManagementDialog.tsx     # TO CREATE: Draft UI
└── __tests__/
    ├── unit/                              # TO CREATE: Unit tests
    └── integration/                       # TO CREATE: Integration tests
```

---

## Development Workflow

### Step 1: Create Storage Layer

Start with the foundational storage utilities:

```bash
# Create storage directory
mkdir -p lib/storage

# Create base files
touch lib/storage/draftStorage.ts
touch lib/storage/draftMigration.ts
touch lib/storage/storageQuota.ts
touch lib/storage/types.ts
```

**Implementation Order**:
1. `types.ts` - Define TypeScript interfaces
2. `draftStorage.ts` - Core save/load operations
3. `draftMigration.ts` - Schema version handling
4. `storageQuota.ts` - Usage monitoring

### Step 2: Create Detection Utility

```bash
# Create private browsing detection
touch lib/utils/privateBrowsing.ts
```

### Step 3: Refactor Auto-save Hook

Update the existing `useAutoSave.ts`:

```typescript
// hooks/useAutoSave.ts
// TODO: Consolidate dual save mechanisms
// TODO: Add conflict detection
// TODO: Add beforeunload handler
```

### Step 4: Create Draft Management Hook

```bash
# Create new hook
touch hooks/useDraftManagement.ts
```

### Step 5: Create UI Components

```bash
# Update existing component
# components/teleprompter/config/ui/AutoSaveStatus.tsx

# Create new components
touch components/teleprompter/config/ui/PrivateBrowsingWarning.tsx
touch components/teleprompter/config/ui/StorageQuotaWarning.tsx
touch components/teleprompter/editor/DraftManagementDialog.tsx
```

### Step 6: Write Tests

```bash
# Create test structure
mkdir -p __tests__/unit/hooks
mkdir -p __tests__/unit/storage
mkdir -p __tests__/unit/utils
mkdir -p __tests__/integration/autosave
mkdir -p __tests__/integration/draft-management

# Create test files
touch __tests__/unit/hooks/useAutoSave.test.ts
touch __tests__/unit/hooks/useDraftManagement.test.ts
touch __tests__/unit/storage/draftStorage.test.ts
touch __tests__/unit/storage/draftMigration.test.ts
touch __tests__/unit/storage/storageQuota.test.ts
touch __tests__/unit/utils/privateBrowsing.test.ts
touch __tests__/integration/autosave/unified-save.test.tsx
touch __tests__/integration/autosave/beforeunload.test.tsx
touch __tests__/integration/autosave/conflict-detection.test.tsx
touch __tests__/integration/draft-management/draft-list.test.tsx
touch __tests__/integration/draft-management/restore-delete.test.tsx
```

---

## Testing Guide

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- useAutoSave.test.ts

# Run tests with coverage
npm test -- --coverage
```

### Mock localStorage

Use the existing mock:

```typescript
// __tests__/mocks/local-storage.mock.ts
import { mockLocalStorage } from './local-storage.mock';

beforeEach(() => {
  mockLocalStorage.setup();
});

afterEach(() => {
  mockLocalStorage.teardown();
});
```

### Test Patterns

**Unit Test Example**:

```typescript
describe('draftStorage', () => {
  it('should save draft to localStorage', () => {
    const draft = createMockDraft();
    saveDraft(draft);
    expect(localStorage.getItem('teleprompter_draft')).toBeTruthy();
  });
});
```

**Integration Test Example**:

```typescript
describe('Auto-save integration', () => {
  it('should save after debounce period', async () => {
    const { result } = renderHook(() => useAutoSave(mockStore, options));
    act(() => {
      mockStore.setState({ text: 'New text' });
    });
    await waitFor(() => {
      expect(result.current.status).toBe('saved');
    });
  });
});
```

---

## Common Tasks

### Adding a New Migration

```typescript
// lib/storage/draftMigration.ts
export const migrate_2_0_to_3_0 = (draft: any): TeleprompterDraft => {
  return {
    ...draft,
    _version: '3.0',
    newField: draft.newField ?? 'default',
  };
};

// Register migration
registerMigration('2.0', '3.0', migrate_2_0_to_3_0);
```

### Adding a New Storage Key

```typescript
// lib/storage/types.ts
export const STORAGE_KEYS = {
  DRAFT: 'teleprompter_draft',
  DRAFTS_COLLECTION: 'teleprompter_drafts',
  YOUR_NEW_KEY: 'teleprompter_your_key',
} as const;
```

### Adding ARIA Labels

```typescript
// lib/a11y/ariaLabels.ts
export const draftManagementLabels = {
  draftList: 'List of saved drafts',
  restoreDraft: (timestamp: number) => `Restore draft from ${formatRelativeTime(timestamp)}`,
  deleteDraft: 'Delete draft',
  // ...
} as const;
```

---

## Debugging

### View localStorage State

```javascript
// Browser console
JSON.parse(localStorage.getItem('teleprompter_drafts'));
JSON.parse(localStorage.getItem('teleprompter_draft'));
```

### Monitor Save Operations

Add logging in development:

```typescript
const saveDraft = (draft: TeleprompterDraft) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Auto-save] Saving draft:', draft);
  }
  // ... save logic
};
```

### Test Private Browsing

1. Open browser in private/incognito mode
2. Navigate to localhost:3000
3. Check for warning banner
4. Verify localStorage operations

### Test Quota Exceeded

```javascript
// Browser console - fill localStorage
const data = 'x'.repeat(1024 * 1024); // 1MB
for (let i = 0; i < 10; i++) {
  localStorage.setItem(`test_${i}`, data);
}
// Trigger save to see error handling
```

---

## Performance Profiling

### Measure Save Performance

```typescript
const saveDraft = (draft: TeleprompterDraft) => {
  const start = performance.now();
  localStorage.setItem('teleprompter_draft', JSON.stringify(draft));
  const end = performance.now();
  console.log(`Save took ${end - start}ms`);
};
```

### Profile with React DevTools

1. Install React DevTools Profiler
2. Record profiling during edits
3. Check for unnecessary re-renders
4. Optimize hook dependencies

---

## Accessibility Testing

### Keyboard Navigation

- Tab: Navigate between elements
- Enter/Space: Activate buttons
- Escape: Close modals
- Arrow keys: Navigate draft list

### Screen Reader Testing

1. Enable VoiceOver (macOS) or NVDA (Windows)
2. Navigate to draft management UI
3. Verify announcements:
   - "List of 5 drafts"
   - "Draft saved just now"
   - "Storage 90% full"

### ARIA Labels Check

```bash
# Use axe DevTools to check for ARIA issues
# Chrome extension: axe DevTools
```

---

## Git Workflow

### Commit Messages

Follow conventional commits:

```bash
git commit -m "feat(storage): add draft migration system"
git commit -m "fix(hooks): resolve race condition in auto-save"
git commit -m "test(integration): add beforeunload handler tests"
git commit -m "docs(readme): update quickstart guide"
```

### Push to Remote

```bash
# Push feature branch
git push -u origin 006-autosave-improvements
```

### Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select `006-autosave-improvements` branch
4. Link to issue #6 (if exists)
5. Request review from team
6. Ensure CI checks pass

---

## Troubleshooting

### Issue: Tests Fail with localStorage Errors

**Solution**: Ensure localStorage mock is properly set up:

```typescript
beforeEach(() => {
  localStorage.clear();
  jest.spyOn(Storage.prototype, 'setItem');
});
```

### Issue: Migration Throws Errors

**Solution**: Add error handling and preserve original data:

```typescript
try {
  return migrateDraft(draft);
} catch (error) {
  console.error('Migration failed:', error);
  return draft; // Return original for recovery
}
```

### Issue: beforeunload Not Triggering

**Solution**: Check browser settings and mode:

```typescript
// Only works in setup mode
if (mode !== 'setup') return;

// Some browsers block beforeunload
// Test in normal browsing mode
```

### Issue: Quota Calculation Inaccurate

**Solution**: Account for UTF-16 encoding:

```typescript
const size = (key.length + value.length) * 2; // 2 bytes per char
```

---

## Resources

### Documentation

- [Feature Spec](./spec.md)
- [Research Document](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/)
- [Constitution](../../.specify/memory/constitution.md)

### External References

- [localStorage MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [beforeunload MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Zustand Docs](https://github.com/pmndrs/zustand)

---

## Next Steps

After completing this feature:

1. **Update main documentation**
   - Add to user guide
   - Update changelog
   - Document migration paths

2. **Monitor metrics**
   - Track save success rate
   - Monitor quota exceeded errors
   - Collect user feedback

3. **Future improvements**
   - Consider IndexedDB for larger storage
   - Add compression for large drafts
   - Implement cross-tab sync (if needed)

---

**Happy coding!** 🚀

For questions or issues, refer to the [Feature Specification](./spec.md) or [Research Document](./research.md).
