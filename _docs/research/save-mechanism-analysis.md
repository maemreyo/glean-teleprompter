# Save Mechanism Analysis - Teleprompter Application

**Research Date:** 2026-01-01  
**Researcher:** Claude (Documentation Writer Mode)  
**Scope:** Auto-save mechanism, local draft storage, UI feedback, and user experience evaluation

---

## Executive Summary

The teleprompter application implements a **dual auto-save system** with overlapping mechanisms, providing robust local draft persistence but with some redundancy and potential edge cases. The system saves user content to localStorage every 5 seconds in setup mode, with clear visual feedback through status indicators. However, there are opportunities to improve error handling, mobile experience, and code maintainability.

### Key Findings
- ✅ **Strong**: Clear visual feedback with status indicators and relative timestamps
- ✅ **Strong:** Non-blocking saves using `requestIdleCallback`
- ⚠️ **Concern:** Dual auto-save mechanisms creating redundancy
- ⚠️ **Concern:** Limited error recovery for quota exceeded scenarios
- ❌ **Gap:** No data migration strategy for localStorage schema changes
- ❌ **Gap:** Manual save to cloud doesn't trigger auto-sync of auto-save status

---

## Table of Contents

1. [Current Implementation Overview](#current-implementation-overview)
2. [Auto-Save Mechanism](#auto-save-mechanism)
3. [Local Draft Storage](#local-draft-storage)
4. [Store Integration](#store-integration)
5. [User Experience Evaluation](#user-experience-evaluation)
6. [Potential Issues & Edge Cases](#potential-issues--edge-cases)
7. [Recommendations](#recommendations)
8. [Flow Diagrams](#flow-diagrams)

---

## 1. Current Implementation Overview

The save mechanism consists of two parallel systems:

### System A: useAutoSave Hook (ContentPanel)
- **Location:** [`components/teleprompter/editor/ContentPanel.tsx:127-138`](components/teleprompter/editor/ContentPanel.tsx:127-138)
- **Hook:** [`hooks/useAutoSave.ts`](hooks/useAutoSave.ts:1-214)
- **Data Saved:** `{ text, bgUrl, musicUrl }` (partial data)
- **Interval:** 5000ms (5 seconds)
- **Debounce:** 1000ms (1 second)
- **Status Tracking:** ✅ Yes (via useUIStore)

### System B: setInterval (Studio Page)
- **Location:** [`app/studio/page.tsx:407-424`](app/studio/page.tsx:407-424)
- **Data Saved:** Full teleprompter state (11 properties)
- **Interval:** 5000ms (5 seconds)
- **Debounce:** ❌ No
- **Status Tracking:** ❌ No

### Data Structure Saved

```typescript
interface LocalDraft {
  text: string              // Script content
  bgUrl: string            // Background image URL
  musicUrl: string         // Background music URL
  font: FontStyle          // 'Classic' | 'Modern' | 'Typewriter' | 'Novel' | 'Neon'
  colorIndex: number       // Color scheme index (0-3)
  speed: number            // Teleprompter scroll speed (1-5)
  fontSize: number         // Font size in pixels
  align: TextAlign         // 'left' | 'center'
  lineHeight: number       // Line height multiplier (1.0-2.0)
  margin: number           // Margin in pixels
  overlayOpacity: number   // Background overlay opacity (0.0-1.0)
}
```

---

## 2. Auto-Save Mechanism

### 2.1 useAutoSave Hook

The [`useAutoSave`](hooks/useAutoSave.ts:39-214) hook provides a sophisticated auto-save solution:

#### Configuration Options
```typescript
interface UseAutoSaveOptions {
  interval?: number      // Default: 5000ms
  enabled?: boolean      // Default: true
  storageKey?: string    // Default: 'teleprompter_draft'
  debounceMs?: number    // Default: 1000ms
}
```

#### Key Features

**Debounced Saves**
- Triggers on data changes
- Waits 1000ms after last change before saving
- Prevents excessive localStorage writes during rapid editing

**Periodic Saves**
- Runs every 5000ms regardless of changes
- Ensures data is saved even if user stops typing
- Independent of debounced saves

**Non-Blocking Saves**
```typescript
// Line 88-94 in hooks/useAutoSave.ts
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  (window as any).requestIdleCallback(
    () => { saveData() },
    { timeout: 2000 }
  )
}
```
- Uses `requestIdleCallback` when available
- Falls back to immediate save if not supported
- 2-second timeout prevents indefinite delays

**Status Tracking**
- Updates [`useUIStore.setAutoSaveStatus()`](stores/useUIStore.ts:318-322)
- Provides real-time feedback to UI components
- Tracks: `idle | saving | saved | error`

### 2.2 Direct setInterval Implementation

The studio page implements a simpler auto-save:

```typescript
// Lines 397-427 in app/studio/page.tsx
useEffect(() => {
  const interval = setInterval(() => {
    const currentState = useTeleprompterStore.getState();
    if (currentState.mode === 'setup' && !currentState.isReadOnly) {
      localStorage.setItem('teleprompter_draft', JSON.stringify({
        text: currentState.text,
        bgUrl: currentState.bgUrl,
        // ... all 11 properties
      }));
    }
  }, 5000);

  return () => clearInterval(interval);
}, [store.mode, store.isReadOnly]);
```

**Characteristics:**
- Only saves when in `setup` mode and not `readOnly`
- No debouncing - saves every 5 seconds regardless
- No error handling
- No status tracking
- Saves complete teleprompter state

### 2.3 Auto-Save Conditions

| Condition | System A (useAutoSave) | System B (setInterval) |
|-----------|------------------------|------------------------|
| Setup mode | ✅ Always | ✅ Yes |
| Running mode | ✅ Always | ❌ No |
| Read-only mode | ✅ Always | ❌ No |
| Debounced saves | ✅ Yes (1000ms) | ❌ No |
| Periodic saves | ✅ Yes (5000ms) | ✅ Yes (5000ms) |

---

## 3. Local Draft Storage

### 3.1 Saving to localStorage

**Storage Key:** `'teleprompter_draft'`

**Save Locations:**
1. [`useAutoSave` hook](hooks/useAutoSave.ts:79) - Partial data
2. [`app/studio/page.tsx`](app/studio/page.tsx:410) - Full data

**Save Format:**
```javascript
localStorage.setItem('teleprompter_draft', JSON.stringify({
  text: "User's script content",
  bgUrl: "https://example.com/bg.jpg",
  musicUrl: "https://example.com/music.mp3",
  font: "Modern",
  colorIndex: 2,
  speed: 3,
  fontSize: 52,
  align: "center",
  lineHeight: 1.6,
  margin: 10,
  overlayOpacity: 0.6
}))
```

### 3.2 Loading from localStorage

**Location:** [`app/studio/page.tsx:373-387`](app/studio/page.tsx:373-387)

```typescript
// Only load once to prevent infinite loops
if (!localDraftLoadedRef.current) {
  localDraftLoadedRef.current = true;
  const localDraft = localStorage.getItem('teleprompter_draft');
  if (localDraft) {
    try {
      const parsed = JSON.parse(localDraft);
      store.setAll({
        ...parsed,
        mode: 'setup'  // Always restore in setup mode
      });
    } catch (e) {
      console.error('Error loading local draft', e);
    }
  }
}
```

**Load Behavior:**
- Only loads when no `?template=` or `?script=` URL parameters present
- Uses [`localDraftLoadedRef`](app/studio/page.tsx:49) to prevent infinite loops
- Forces `mode: 'setup'` on restoration
- Catches JSON parse errors but doesn't alert user

**Priority Order:**
1. URL parameter `?template={id}` (highest)
2. URL parameter `?script={id}`
3. LocalStorage draft
4. Default/empty state (lowest)

### 3.3 Data Persistence

**Storage Location:** Browser localStorage  
**Persistence Scope:** Per-origin, per-device  
**Sync:** ❌ Does NOT sync across devices  
**Expiration:** ❌ No expiration (persists until cleared)

**Browser Limits:**
- Chrome/Edge: ~10MB total per origin
- Firefox: ~10MB total per origin
- Safari: ~5MB total per origin
- Mobile browsers: Varies, typically less

### 3.4 Error Handling

**Quota Exceeded Error**
```typescript
// Lines 119-125 in hooks/useAutoSave.ts
const isQuotaError = 
  err instanceof DOMException && err.name === 'QuotaExceededError'
const errorMessage = isQuotaError
  ? 'Storage full. Some browsers limit storage. Try saving to your account instead.'
  : err instanceof Error
  ? err.message
  : 'Unknown error occurred'
```

**Current Handling:**
- ✅ Detects `QuotaExceededError`
- ✅ Shows user-friendly message
- ❌ No automatic cleanup of old data
- ❌ No fallback storage mechanism
- ❌ No retry logic

**Corrupted Data:**
```typescript
// Lines 378-385 in app/studio/page.tsx
try {
  const parsed = JSON.parse(localDraft);
  store.setAll({ ...parsed, mode: 'setup' });
} catch (e) {
  console.error('Error loading local draft', e);
  // Page continues with default state
}
```

---

## 4. Store Integration

### 4.1 useTeleprompterStore

**Location:** [`stores/useTeleprompterStore.ts`](stores/useTeleprompterStore.ts:1-105)

**State Managed:**
```typescript
interface TeleprompterState {
  text: string
  bgUrl: string
  musicUrl: string
  font: FontStyle
  colorIndex: number
  align: TextAlign
  speed: number
  fontSize: number
  overlayOpacity: number
  isReadOnly: boolean
  mode: 'setup' | 'running'
  lineHeight: number
  margin: number
  
  // Actions
  setText: (text: string) => void
  setBgUrl: (url: string) => void
  setMusicUrl: (url: string) => void
  setFont: (font: FontStyle) => void
  setColorIndex: (index: number) => void
  setAlign: (align: TextAlign) => void
  setSpeed: (speed: number) => void
  setFontSize: (size: number) => void
  setLineHeight: (height: number) => void
  setMargin: (margin: number) => void
  setMode: (mode: 'setup' | 'running') => void
  setIsReadOnly: (api: boolean) => void
  reset: () => void
  setAll: (state: Partial<TeleprompterState>) => void
}
```

**Integration with Auto-Save:**
- Auto-save reads from store state
- [`setAll()`](stores/useTeleprompterStore.ts:72-91) used to restore drafts
- No direct save methods in store (delegated to hooks/page)

### 4.2 useUIStore

**Location:** [`stores/useUIStore.ts`](stores/useUIStore.ts:1-420)

**Auto-Save State:**
```typescript
interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt?: number
  errorMessage?: string
  retryCount?: number
}
```

**Actions:**
```typescript
setAutoSaveStatus: (status: Partial<AutoSaveStatus>) => void
```

**Usage in ContentPanel:**
```typescript
// Lines 127-138 in components/teleprompter/editor/ContentPanel.tsx
const { status: autoSaveStatus, lastSavedAt, error: autoSaveError, saveNow } = useAutoSave(
  {
    text: store.text,
    bgUrl: store.bgUrl,
    musicUrl: store.musicUrl,
  },
  {
    storageKey: 'teleprompter_draft',
    interval: 5000,
    enabled: true,
  }
);
```

**Status Flow:**
1. User types → Status: `'idle'`
2. Save triggered → Status: `'saving'`
3. Save success → Status: `'saved'` + `lastSavedAt`
4. Save error → Status: `'error'` + `errorMessage`

---

## 5. User Experience Evaluation

### 5.1 Visual Feedback

**AutoSaveStatus Component**

**Location:** [`components/teleprompter/config/ui/AutoSaveStatus.tsx`](components/teleprompter/config/ui/AutoSaveStatus.tsx:1-111)

**Status Indicators:**

| Status | Icon | Color | Text |
|--------|------|-------|------|
| `idle` | None | N/A | Hidden |
| `saving` | 🔄 Spinner | Blue | "Saving..." |
| `saved` | ✓ Checkmark | Green | "Saved {relative_time}" |
| `error` | ⚠ Alert | Red | Error message + retry button |

**Relative Time Display:**
```typescript
// From lib/utils/formatRelativeTime.ts
"Just now"  // < 1 minute
"5m ago"    // < 1 hour
"2h ago"    // < 1 day
"3d ago"    // >= 1 day
```

**Placement:**
- Header of ContentPanel
- Visible on desktop and mobile
- Next to theme switcher and auth buttons

### 5.2 User Experience Strengths

✅ **Clear Status Indication**
- Users can see when saves are happening
- Visual feedback with icons and colors
- Relative time helps users understand recency

✅ **Non-Blocking UI**
- Saves don't interrupt typing
- `requestIdleCallback` prevents UI jank
- 1000ms debounce prevents excessive updates

✅ **Automatic Persistence**
- No manual save required for drafts
- Survives page refreshes
- Works offline

✅ **Error Recovery**
- Retry button on error
- User-friendly error messages
- Specific quota exceeded guidance

### 5.3 User Experience Weaknesses

❌ **Conflicting Auto-Save Systems**
- Two systems saving to same key
- Different data saved by each
- Hard to predict which save wins

❌ **Limited Error Context**
- No explanation of *why* quota exceeded
- No guidance on clearing space
- No indication of storage usage

❌ **No Save Progress**
- "Saving..." doesn't show progress
- Large drafts could take time
- No indication of data size

❌ **Mobile Considerations**
- Small status indicator on mobile
- Could be missed during editing
- No persistent "last saved" indicator

❌ **No Draft Management**
- Can't see multiple drafts
- Can't manually delete drafts
- All-or-nothing restoration

### 5.4 User Scenarios

#### Scenario 1: Normal Editing Flow
```
User types → Wait 1s → Status: "Saving..." → Wait ~100ms → Status: "Saved Just now"
            ↓ Wait 5s
            Status: "Saved 5m ago"
```
**Experience:** ✅ Smooth, clear feedback

#### Scenario 2: Rapid Typing
```
User types rapidly → Debounced (no save yet)
User stops → Wait 1s → Status: "Saving..." → Status: "Saved Just now"
```
**Experience:** ✅ Debounce prevents excessive saves

#### Scenario 3: Page Close
```
User types → Close tab immediately
             ↓
Last save: 5 seconds ago
             ↓
Data saved from periodic save
```
**Experience:** ⚠️ Could lose up to 5 seconds of work

#### Scenario 4: Quota Exceeded
```
User types → Save fails → Status: "Storage full. Some browsers limit storage. Try saving to your account instead." + [Retry]
```
**Experience:** ⚠️ Clear message but no action to clear space

#### Scenario 5: Mobile Usage
```
User types on phone → Status indicator in header (small)
                     ↓
User may not notice status while typing on keyboard
```
**Experience:** ⚠️ Easy to miss status indicator

---

## 6. Potential Issues & Edge Cases

### 6.1 Critical Issues

#### Issue 1: Dual Auto-Save Race Condition
**Severity:** ⚠️ Medium  
**Location:** [`ContentPanel.tsx:127`](components/teleprompter/editor/ContentPanel.tsx:127) vs [`page.tsx:407`](app/studio/page.tsx:407)

**Problem:**
- Both systems write to `'teleprompter_draft'` key
- System A saves partial data (text, bgUrl, musicUrl)
- System B saves full data (all 11 properties)
- Timing overlap could cause data loss

**Scenario:**
```
T+0s: User changes font from 'Classic' to 'Modern'
T+1s: System A debounced save triggers → saves {text, bgUrl, musicUrl}
T+2s: User changes text
T+5s: System B periodic save triggers → saves all properties including font='Modern'
T+6s: User changes font to 'Neon'
T+7s: System A debounced save triggers → saves {text, bgUrl, musicUrl}
Result: localStorage has partial data from System A, losing the 'Neon' font change
```

**Impact:** User changes could be lost if System A save overwrites System B save

#### Issue 2: No Migration Strategy
**Severity:** ⚠️ Medium  
**Location:** [`page.tsx:378`](app/studio/page.tsx:378)

**Problem:**
- No schema versioning in localStorage
- Future changes to data structure could break existing drafts
- No backward compatibility handling

**Scenario:**
```
Current: 11 properties
Future: Add new property 'theme'
Old User: Has draft with 11 properties
App loads: Expects 12 properties, gets 11
Result: Could crash or lose data
```

**Impact:** Breaking changes could corrupt user drafts

#### Issue 3: Quota Exceeded - No Recovery
**Severity:** ⚠️ Medium  
**Location:** [`useAutoSave.ts:119`](hooks/useAutoSave.ts:119)

**Problem:**
- Error message suggests "save to your account" but no clear path
- No automatic cleanup of old data
- No way to check storage usage

**Impact:** Users hit wall with no resolution

### 6.2 Edge Cases

#### Edge Case 1: Private/Incognito Mode
**Scenario:** User opens app in private browsing
```
localStorage is available but cleared when session ends
↓
User works for 30 minutes, closes tab
↓
All work lost
```
**Current Behavior:** ❌ No warning to user  
**Expected:** ⚠️ Warn user that drafts won't persist

#### Edge Case 2: Multiple Tabs Open
**Scenario:** User has 2+ tabs of the app open
```
Tab A: User types "Hello"
Tab B: User types "World"
↓
Both auto-save to same key
↓
Last save wins, overwrites other tab
```
**Current Behavior:** ❌ No cross-tab coordination  
**Expected:** ⚠️ Warn user or merge changes

#### Edge Case 3: Browser Crash/Force Quit
**Scenario:** Browser crashes while saving
```
User types → Save in progress → Browser crash
↓
localStorage write may be incomplete
↓
JSON.parse fails on next load
```
**Current Behavior:** ✅ Handled (try/catch in load)  
**Impact:** Draft lost, but app doesn't crash

#### Edge Case 4: Very Large Script
**Scenario:** User pastes 100,000 character script
```
Large script ~500KB
↓
Multiple saves fill localStorage quickly
↓
Quota exceeded error
```
**Current Behavior:** ⚠️ Error shown but no guidance  
**Expected:** Show script size, warn before quota full

#### Edge Case 5: Mobile Safari Storage Limit
**Scenario:** User on iPhone with other apps using localStorage
```
iOS Safari: ~5MB limit (or less with other apps)
↓
Teleprompter drafts fill remaining space
↓
Other sites/apps affected
```
**Current Behavior:** ❌ No quota monitoring  
**Expected:** Monitor usage, warn approaching limit

#### Edge Case 6: Network Offline vs Online
**Scenario:** User works offline, goes online
```
Offline: Auto-save to localStorage works
Online: Manual save to Supabase
↓
No sync between local draft and cloud save
```
**Current Behavior:** ⚠️ Two separate systems  
**Expected:** Sync local draft to cloud when online

#### Edge Case 7: Date/Time Changes
**Scenario:** User changes system clock
```
Last saved: 10:00 AM
User changes clock to 9:00 AM
↓
Relative time shows "Saved 1h ago" (actually just now)
```
**Current Behavior:** ⚠️ Misleading timestamps  
**Impact:** Minor UX confusion

### 6.3 Data Loss Scenarios

| Scenario | Can Lose Data? | Max Loss | Prevention |
|----------|----------------|----------|------------|
| Tab close | ⚠️ Yes | 5 seconds | Window beforeunload handler |
| Browser crash | ⚠️ Yes | 5 seconds | More frequent saves |
| Quota exceeded | ❌ No | 0 | Error before save |
| Corrupted JSON | ❌ No | 0 | Try/catch on load |
| Multiple tabs | ⚠️ Yes | All changes | Cross-tab sync |
| Private browsing | ⚠️ Yes | All work | Warning dialog |

---

## 7. Recommendations

### 7.1 Critical (Do First)

#### 1. Consolidate Auto-Save Systems
**Priority:** 🔴 High  
**Effort:** Medium

**Action:**
- Remove one of the dual systems (recommend keeping `useAutoSave` hook)
- Ensure single system saves complete data
- Add test coverage for save completeness

**Code:**
```typescript
// Keep useAutoSave in ContentPanel, but pass full state
const { status, saveNow } = useAutoSave(
  {
    ...store,  // All teleprompter state
  },
  {
    storageKey: 'teleprompter_draft',
    interval: 5000,
  }
);

// Remove setInterval from app/studio/page.tsx (lines 397-427)
```

**Benefit:** Eliminates race conditions, reduces complexity

#### 2. Add Data Migration System
**Priority:** 🔴 High  
**Effort:** Medium

**Action:**
- Add schema version to localStorage
- Implement migration functions
- Handle backward compatibility

**Code:**
```typescript
interface LocalDraft {
  version: '1.0' | '1.1' | '2.0'
  // ... existing properties
}

const migrations = {
  '1.0': (data: any) => ({
    ...data,
    version: '1.1',
    newProperty: defaultValue,
  }),
  '1.1': (data: any) => ({
    ...data,
    version: '2.0',
    anotherNewProperty: defaultValue,
  }),
};

function loadDraft(): LocalDraft | null {
  const raw = localStorage.getItem('teleprompter_draft');
  if (!raw) return null;
  
  let data = JSON.parse(raw);
  
  // Run migrations
  while (data.version < CURRENT_VERSION) {
    const nextVersion = getNextVersion(data.version);
    data = migrations[data.version](data);
  }
  
  return data;
}
```

**Benefit:** Future-proof, prevents data corruption

#### 3. Add beforeunload Handler
**Priority:** 🔴 High  
**Effort:** Low

**Action:**
- Save immediately before tab close
- Reduce max data loss from 5s to ~0s

**Code:**
```typescript
// In app/studio/page.tsx
useEffect(() => {
  const handleBeforeUnload = () => {
    if (store.mode === 'setup' && !store.isReadOnly) {
      localStorage.setItem('teleprompter_draft', JSON.stringify({
        ...store,
        lastSaved: Date.now(),
      }));
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [store]);
```

**Benefit:** Prevents data loss on tab close

### 7.2 Important (Do Soon)

#### 4. Improve Quota Exceeded Handling
**Priority:** 🟡 Medium  
**Effort:** Medium

**Actions:**
- Show current storage usage
- Provide "Clear Old Drafts" button
- Add compression for large texts
- Implement storage cleanup

**Code:**
```typescript
function getStorageUsage(): { used: number, total: number, percentage: number } {
  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }
  const total = 5 * 1024 * 1024; // 5MB estimate
  return { used, total, percentage: (used / total) * 100 };
}

// In AutoSaveStatus component
{status === 'error' && isQuotaError && (
  <div className="storage-warning">
    <p>Storage: {usage.percentage.toFixed(1)}% full</p>
    <button onClick={clearOldDrafts}>Clear Old Drafts</button>
  </div>
)}
```

**Benefit:** Better UX when storage full

#### 5. Add Private Browsing Detection
**Priority:** 🟡 Medium  
**Effort:** Low

**Action:**
- Detect if localStorage is session-only
- Show warning to user

**Code:**
```typescript
function isPrivateBrowsing(): Promise<boolean> {
  return new Promise((resolve) => {
    const testKey = 'test-' + Date.now();
    try {
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      resolve(false);
    } catch (e) {
      resolve(true);
    }
  });
}

// Show warning
{isPrivate && (
  <Alert>
    Private browsing detected: Drafts won't be saved after you close this session.
  </Alert>
)}
```

**Benefit:** Manages user expectations

#### 6. Add Draft Management UI
**Priority:** 🟡 Medium  
**Effort:** High

**Actions:**
- Show list of saved drafts
- Allow manual deletion
- Add "Restore from" functionality
- Show draft timestamps

**Benefit:** More control over drafts

### 7.3 Nice to Have (Do Later)

#### 7. Cross-Tab Synchronization
**Priority:** 🟢 Low  
**Effort:** High

**Actions:**
- Use BroadcastChannel API
- Sync changes across tabs
- Prevent concurrent edits

**Code:**
```typescript
const channel = new BroadcastChannel('teleprompter_drafts');

// Send updates
channel.postMessage({ type: 'UPDATE', data: draft });

// Receive updates
channel.onmessage = (event) => {
  if (event.data.type === 'UPDATE') {
    // Show notification: "Draft updated in another tab"
  }
};
```

**Benefit:** Prevents data loss in multi-tab scenarios

#### 8. Storage Compression
**Priority:** 🟢 Low  
**Effort:** Medium

**Actions:**
- Compress large text before saving
- Use LZ-string or similar library
- Reduce storage usage by ~60%

**Benefit:** Delay quota exceeded, store more drafts

#### 9: Auto-Sync to Cloud
**Priority:** 🟢 Low  
**Effort:** High

**Actions:**
- Automatically sync local draft to Supabase
- Debounce cloud saves (30s)
- Show "Syncing..." indicator
- Handle offline/online transitions

**Benefit:** Seamless backup to cloud

---

## 8. Flow Diagrams

### 8.1 User Typing Flow

```
User Types in Textarea
         ↓
   [Debounce: 1000ms]
         ↓
   User stops typing?
         ↓ No
   Reset debounce timer
         ↓ Yes
   Wait 1000ms
         ↓
   [Status: 'saving']
         ↓
   Check mode === 'setup' && !isReadOnly
         ↓ Yes
   useAutoSave.performSave()
         ↓
   requestIdleCallback(timeout: 2000ms)
         ↓
   localStorage.setItem('teleprompter_draft', JSON.stringify(data))
         ↓
   Success?
         ↓ Yes
   [Status: 'saved', lastSavedAt: timestamp]
         ↓
   UI shows: "Saved Just now"
         ↓
   Time passes...
         ↓
   UI updates: "Saved 5m ago"
         ↓ No
   [Status: 'error', errorMessage: "Quota exceeded..."]
         ↓
   UI shows: Error icon + message + [Retry] button
```

### 8.2 Page Load Flow

```
User Opens /studio
         ↓
   Check URL params
         ↓
   Has ?template={id}?
         ↓ Yes
   Load template from library
         ↓
   Skip localStorage draft
         ↓ No
   Has ?script={id}?
         ↓ Yes
   Load script from Supabase
         ↓
   Skip localStorage draft
         ↓ No
   Load from localStorage
         ↓
   localStorage.getItem('teleprompter_draft')
         ↓
   Data exists?
         ↓ Yes
   Try JSON.parse(data)
         ↓
   Parse success?
         ↓ Yes
   store.setAll({...parsed, mode: 'setup'})
         ↓
   Draft restored!
         ↓ No
   console.error('Error loading local draft')
         ↓
   Continue with default state
         ↓ No
   Use default/empty state
```

### 8.3 Save Error Flow

```
Auto-save triggered
         ↓
   localStorage.setItem()
         ↓
   Success?
         ↓ Yes
   Update status: 'saved'
         ↓ No
   Check error type
         ↓
   QuotaExceededError?
         ↓ Yes
   [Status: 'error']
   Message: "Storage full. Some browsers limit storage. Try saving to your account instead."
         ↓
   Show error icon + message + [Retry] button
         ↓
   User clicks [Retry]?
         ↓ Yes
   Trigger saveNow()
         ↓
   (Loop back to localStorage.setItem)
         ↓ No
   Different error?
         ↓ Yes
   [Status: 'error']
   Message: err.message
         ↓
   Show error icon + message
```

### 8.4 Dual System Race Condition

```
System A (useAutoSave)        System B (setInterval)
        |                              |
   User changes font            User changes font
        |                              |
   [Wait 1000ms debounce]        [Wait 5000ms periodic]
        |                              |
   Save partial data             Save full data
   {text, bgUrl, musicUrl}       {all 11 properties}
        |                              |
        └────── localStorage ←─────────┘
                    │
           Both write to 'teleprompter_draft'
                    │
           Last write wins!
                    │
        Potential data loss
```

---

## 9. Testing Coverage

### Current Tests

**Location:** [`__tests__/integration/studio/local-draft.test.tsx`](__tests__/integration/studio/local-draft.test.tsx:1-558)

**Test Coverage:**
- ✅ Auto-save after 5 seconds in setup mode
- ✅ No auto-save in run mode
- ✅ No auto-save in read-only mode
- ✅ All 11 properties persisted
- ✅ Draft restoration from localStorage
- ✅ Corrupted data handling
- ✅ Quota exceeded error handling
- ✅ Empty localStorage handling

**Missing Tests:**
- ❌ Dual system interaction
- ❌ Cross-tab synchronization
- ❌ Private browsing detection
- ❌ beforeunload handler
- ❌ Data migration
- ❌ Storage quota monitoring

### Recommended Additional Tests

```typescript
describe('Dual Auto-Save System', () => {
  it('should not cause data loss when both systems save');
  it('should prioritize complete data over partial data');
  it('should handle rapid mode switching');
});

describe('Edge Cases', () => {
  it('should handle private browsing mode');
  it('should detect and warn about storage quota');
  it('should sync across multiple tabs');
  it('should migrate old draft formats');
});
```

---

## 10. Performance Considerations

### Current Performance

**Memory:**
- Minimal - stores data in refs and state
- No memory leaks detected

**CPU:**
- `requestIdleCallback` prevents blocking
- Debouncing reduces save frequency
- 1000ms debounce is appropriate

**Storage:**
- localStorage writes are synchronous
- Large drafts (~500KB) could cause brief pauses
- No compression currently

### Optimization Opportunities

1. **Larger Debounce:** Consider 2000ms for very large scripts
2. **Compression:** Use LZ-string for large texts
3. **Batching:** Combine multiple changes into single save
4. **Worker:** Move save logic to Web Worker for very large data

---

## 11. Security Considerations

### Current Security

✅ **XSS Protection:** Data is JSON-encoded
✅ **No Script Injection:** Content treated as text
✅ **Same-Origin:** localStorage scoped to origin

### Potential Issues

⚠️ **Sensitive Data:** Scripts may contain sensitive information
⚠️ **No Encryption:** localStorage is plain text
⚠️ **Public Access:** Anyone with device access can read drafts

### Recommendations

1. **Avoid storing sensitive data** in localStorage
2. **Add encryption** for sensitive drafts (optional)
3. **Clear on logout** if user chooses
4. **Warn users** about local storage visibility

---

## 12. Accessibility

### Current Accessibility

✅ **ARIA Labels:** Status component has `role="status"` and `aria-live="polite"`
✅ **Color Coding:** Icons + colors (not color-only)
✅ **Error Messages:** Clear text descriptions

### Improvements Needed

⚠️ **Screen Reader:** "Saving..." may not convey enough context
⚠️ **Keyboard:** No keyboard shortcut to force save
⚠️ **Focus:** No focus management on status changes

### Recommended Enhancements

```typescript
// More descriptive ARIA labels
<div
  role="status"
  aria-live="polite"
  aria-label={`Auto-save status: ${status}`}
>
  Auto-save: {statusText}
</div>

// Keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveNow();
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [saveNow]);
```

---

## 13. Conclusion

### Summary

The teleprompter application has a **functional auto-save system** with good visual feedback, but suffers from **dual-system redundancy** that could cause data loss. The system works well for normal usage patterns but has several edge cases that need attention.

### Priority Actions

1. **Immediate:** Consolidate dual auto-save systems
2. **Immediate:** Add beforeunload handler
3. **Soon:** Implement data migration system
4. **Soon:** Improve quota exceeded handling
5. **Later:** Add private browsing detection
6. **Later:** Implement draft management UI

### Overall Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| **Functionality** | 7/10 | Works but has redundancy issues |
| **User Experience** | 8/10 | Clear feedback, good status indicators |
| **Reliability** | 6/10 | Race conditions possible |
| **Error Handling** | 7/10 | Handles errors but limited recovery |
| **Performance** | 8/10 | Non-blocking, good debouncing |
| **Accessibility** | 7/10 | Good ARIA, could be more descriptive |
| **Security** | 7/10 | Standard localStorage security |
| **Maintainability** | 5/10 | Dual systems increase complexity |

**Overall: 6.9/10** - Solid foundation, needs consolidation and edge case handling.

---

## 14. Related Files

### Implementation Files
- [`hooks/useAutoSave.ts`](hooks/useAutoSave.ts) - Auto-save hook implementation
- [`app/studio/page.tsx`](app/studio/page.tsx) - Studio page with setInterval auto-save
- [`components/teleprompter/editor/ContentPanel.tsx`](components/teleprompter/editor/ContentPanel.tsx) - Content panel with useAutoSave
- [`components/teleprompter/config/ui/AutoSaveStatus.tsx`](components/teleprompter/config/ui/AutoSaveStatus.tsx) - Status indicator component

### Store Files
- [`stores/useTeleprompterStore.ts`](stores/useTeleprompterStore.ts) - Main teleprompter state
- [`stores/useUIStore.ts`](stores/useUIStore.ts) - UI state including auto-save status

### Utility Files
- [`lib/utils/formatRelativeTime.ts`](lib/utils/formatRelativeTime.ts) - Relative time formatting
- [`lib/utils/secureStorage.ts`](lib/utils/secureStorage.ts) - Secure storage utilities

### Test Files
- [`__tests__/integration/studio/local-draft.test.tsx`](__tests__/integration/studio/local-draft.test.tsx) - Auto-save integration tests
- [`__tests__/fixtures/drafts.ts`](__tests__/fixtures/drafts.ts) - Test fixtures

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-01  
**Next Review:** After implementing priority recommendations
