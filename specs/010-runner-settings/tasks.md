# Tasks: Fix Runner Mode Settings Not Applying

**Feature**: `010-runner-settings`  
**Branch**: `010-runner-settings`  
**Total Tasks**: 12

---

## Phase 1: Scroll Speed Fix (P1 - High Priority)

### Task 1.1 - Add Dynamic Interval Calculation
**File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx:62-76)  
**Priority**: P1  
**Estimate**: 1 hour

**Description**: Replace hardcoded `intervalMs = 50` with dynamic calculation based on `animations.autoScrollSpeed`.

**Implementation**:
```typescript
// In the scroll useEffect (around line 62-76)
const intervalMs = animations.autoScrollSpeed > 0 
  ? 1000 / animations.autoScrollSpeed 
  : 50;
```

**Acceptance Criteria**:
- ✅ Interval is calculated from `autoScrollSpeed` value
- ✅ Formula: `intervalMs = 1000 / autoScrollSpeed`
- ✅ Default fallback to 50ms if speed is 0 or invalid

---

### Task 1.2 - Update useEffect Dependency Array
**File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx:62-76)  
**Priority**: P1  
**Estimate**: 30 minutes

**Description**: Add `animations.autoScrollSpeed` to the scroll useEffect dependency array to re-calculate interval when speed changes.

**Implementation**:
```typescript
useEffect(() => {
  // ... existing scroll logic
}, [isPlaying, mode, setIsPlaying, animations.autoScrollSpeed]); // Add autoScrollSpeed
```

**Acceptance Criteria**:
- ✅ Effect re-runs when `autoScrollSpeed` changes
- ✅ Interval recalculates immediately on speed change
- ✅ No multiple intervals running simultaneously

---

### Task 1.3 - Add Min Speed Auto-Pause
**File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx:62-76)  
**Priority**: P1  
**Estimate**: 30 minutes

**Description**: Automatically pause auto-scroll when speed is set below minimum threshold (10 pixels/second).

**Implementation**:
```typescript
// Add check after speed change
if (animations.autoScrollSpeed < 10 && isPlaying) {
  setIsPlaying(false);
}
```

**Acceptance Criteria**:
- ✅ Auto-scroll pauses when speed < 10
- ✅ `isPlaying` set to false
- ✅ User can manually resume after pause

---

### Task 1.4 - Add Debouncing for Rapid Speed Changes
**File**: [`components/teleprompter/runner/QuickSettingsPanel.tsx`](components/teleprompter/runner/QuickSettingsPanel.tsx)  
**Priority**: P1  
**Estimate**: 1 hour

**Description**: Implement 100ms debounce on speed slider onChange to prevent excessive interval recalculations.

**Implementation**:
```typescript
// Add debounce utility or use lodash debounce
const handleSpeedChange = useCallback(
  debounce((value: number) => {
    setAnimations({ ...animations, autoScrollSpeed: value });
  }, 100),
  [animations]
);
```

**Acceptance Criteria**:
- ✅ Speed changes debounced with 100ms delay
- ✅ Rapid slider drags don't cause excessive recalculations
- ✅ Final value is applied correctly after debounce

---

### Task 1.5 - Add localStorage Persistence for Speed
**File**: [`lib/stores/useConfigStore.ts`](lib/stores/useConfigStore.ts)  
**Priority**: P1  
**Estimate**: 30 minutes

**Description**: Ensure `autoScrollSpeed` persists to localStorage key `'teleprompter-config'`.

**Verification**:
- ✅ Confirm `autoScrollSpeed` is in persisted config slice
- ✅ Speed survives browser close/reopen
- ✅ Speed persists across mode switches

---

## Phase 2: Background URL Fix (P2 - Medium Priority)

### Task 2.1 - Replace Inline Style with useMemo
**File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx:95)  
**Priority**: P2  
**Estimate**: 1 hour

**Description**: Replace inline style object with memoized style using `useMemo` pattern.

**Implementation**:
```typescript
// Add after hook declarations (around line 39)
const backgroundStyle = useMemo(() => ({
  backgroundImage: `url('${bgUrl}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}), [bgUrl]);

// Then in JSX (line 95)
<div 
  className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 transform scale-105" 
  style={backgroundStyle} 
/>
```

**Acceptance Criteria**:
- ✅ Background style memoized with `bgUrl` dependency
- ✅ Style object reference stable across re-renders
- ✅ Background updates when `bgUrl` changes

---

### Task 2.2 - Add Previous URL Tracking State
**File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx)  
**Priority**: P2  
**Estimate**: 30 minutes

**Description**: Add state to track the last valid background URL for fallback behavior.

**Implementation**:
```typescript
const [previousValidBgUrl, setPreviousValidBgUrl] = useState(bgUrl);

useEffect(() => {
  if (bgUrl && bgUrl !== previousValidBgUrl) {
    setPreviousValidBgUrl(bgUrl);
  }
}, [bgUrl]);
```

**Acceptance Criteria**:
- ✅ Previous valid URL stored in state
- ✅ State updates when new URL loads successfully
- ✅ Used as fallback on load failure

---

### Task 2.3 - Add Load Failure Handler
**File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx:95)  
**Priority**: P2  
**Estimate**: 1 hour

**Description**: Implement `onError` handler on background image to revert to previous valid URL on load failure.

**Implementation**:
```typescript
const handleBackgroundError = () => {
  console.warn('Background image failed to load, reverting to previous URL');
  // Revert to previous valid URL via content store
};

// In JSX
<img 
  src={bgUrl} 
  onError={handleBackgroundError}
  // ... other props
/>
```

**Acceptance Criteria**:
- ✅ `onError` handler triggers on load failure
- ✅ Reverts to `previousValidBgUrl` on failure
- ✅ Logs warning for debugging

---

### Task 2.4 - Update Background Image JSX
**File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx:95)  
**Priority**: P2  
**Estimate**: 30 minutes

**Description**: Update background div to use memoized style and add error handling.

**Implementation**:
- Replace inline style with `backgroundStyle`
- Add `onError` handler for image load failures
- Ensure smooth 1-second transition

**Acceptance Criteria**:
- ✅ Uses memoized `backgroundStyle`
- ✅ Has `onError` handler
- ✅ Smooth CSS transition (1s duration)

---

## Testing Tasks

### Task 3.1 - Unit Tests for Scroll Speed
**File**: `__tests__/unit/runner/scroll-speed-fix.test.tsx`  
**Priority**: P1  
**Estimate**: 2 hours

**Test Cases**:
- ✅ Dynamic interval calculation (various speeds: 10, 50, 100, 200)
- ✅ Min speed auto-pause (< 10)
- ✅ Debouncing prevents excessive recalculations
- ✅ useEffect re-runs on speed change
- ✅ Speed persists across pause/resume

---

### Task 3.2 - Unit Tests for Background URL
**File**: `__tests__/unit/runner/background-url-fix.test.tsx`  
**Priority**: P2  
**Estimate**: 2 hours

**Test Cases**:
- ✅ useMemo re-computes on bgUrl change
- ✅ Style object reference stability
- ✅ Load failure reverts to previous URL
- ✅ Previous URL tracking state updates correctly

---

### Task 3.3 - Integration Tests
**File**: `__tests__/integration/runner/settings-sync.test.tsx`  
**Priority**: P1  
**Estimate**: 2 hours

**Test Cases**:
- ✅ Speed changes during active playback
- ✅ Speed persists across mode switches (Setup ↔ Runner)
- ✅ Background changes in Runner mode
- ✅ Background consistency between Setup Preview and Runner
- ✅ Settings persist across browser sessions

---

### Task 3.4 - Edge Case Tests
**File**: `__tests__/integration/runner/settings-edge-cases.test.tsx`  
**Priority**: P2  
**Estimate**: 2 hours

**Test Cases**:
- ✅ Speed at 0 → pause
- ✅ Speed at 200 (max) → no performance issues
- ✅ Invalid background URL → revert to previous
- ✅ Network error on background load → revert
- ✅ Rapid speed changes → debounced
- ✅ Large background files (>5MB) → warning

---

## Task Summary

| Phase | Tasks | Total Estimate |
|-------|-------|----------------|
| Phase 1 (P1): Scroll Speed Fix | 5 | 3.5 hours |
| Phase 2 (P2): Background URL Fix | 4 | 3 hours |
| Phase 3 (Testing) | 4 | 8 hours |
| **Total** | **13** | **14.5 hours** |

---

## Task Order (Recommended)

1. **Task 1.1** - Add Dynamic Interval Calculation (P1)
2. **Task 1.2** - Update useEffect Dependency Array (P1)
3. **Task 1.3** - Add Min Speed Auto-Pause (P1)
4. **Task 1.4** - Add Debouncing for Rapid Speed Changes (P1)
5. **Task 1.5** - Add localStorage Persistence for Speed (P1)
6. **Task 3.1** - Unit Tests for Scroll Speed (P1)
7. **Task 3.3** - Integration Tests (P1)
8. **Task 2.1** - Replace Inline Style with useMemo (P2)
9. **Task 2.2** - Add Previous URL Tracking State (P2)
10. **Task 2.3** - Add Load Failure Handler (P2)
11. **Task 2.4** - Update Background Image JSX (P2)
12. **Task 3.2** - Unit Tests for Background URL (P2)
13. **Task 3.4** - Edge Case Tests (P2)

**Note**: P1 tasks (1-7) should be completed first before starting P2 tasks (8-13).
