# Implementation Plan: Fix Runner Mode Settings Not Applying

**Feature**: `010-runner-settings`  
**Branch**: `010-runner-settings`  
**Created**: 2026-01-02  
**Status**: Draft  

## Overview

This plan addresses two critical bugs in Runner mode where user settings are not applied:
1. **P1 - Scroll Speed**: Hardcoded interval ignores `autoScrollSpeed` configuration
2. **P2 - Background URL**: Unstable style reference prevents re-rendering

## Root Causes (from Debug Analysis)

### Issue 1: Scroll Speed Not Applying
- **Location**: [`components/teleprompter/Runner.tsx:62-76`](components/teleprompter/Runner.tsx:62-76)
- **Problem**: Hardcoded `intervalMs = 50` and `scrollIncrement = 1`
- **Solution**: Calculate interval dynamically from `animations.autoScrollSpeed`
- **Formula**: `intervalMs = 1000 / autoScrollSpeed`

### Issue 2: Background URL Not Applying
- **Location**: [`components/teleprompter/Runner.tsx:95`](components/teleprompter/Runner.tsx:95)
- **Problem**: Inline style creates unstable object reference
- **Solution**: Use `useMemo` pattern (matching PreviewPanel.tsx:146-150)

---

## Implementation Strategy

### Phase 1: Scroll Speed Fix (P1 - High Priority)

**Target File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx)

#### 1.1 Add Dynamic Interval Calculation
```typescript
// Calculate interval based on autoScrollSpeed (pixels per second)
const intervalMs = animations.autoScrollSpeed > 0 
  ? 1000 / animations.autoScrollSpeed 
  : 50;
```

#### 1.2 Update useEffect Dependency Array
Add `animations.autoScrollSpeed` to dependency array to re-run effect on speed changes.

#### 1.3 Add Min Speed Auto-Pause
```typescript
// Pause when speed is below minimum threshold
if (animations.autoScrollSpeed < 10) {
  setIsPlaying(false);
}
```

#### 1.4 Add Debouncing for Rapid Changes
Implement 100ms debounce on speed slider input to prevent excessive interval recalculations.

#### 1.5 Add localStorage Persistence
Ensure `autoScrollSpeed` persists to localStorage key `'teleprompter-config'`.

### Phase 2: Background URL Fix (P2 - Medium Priority)

**Target File**: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx)

#### 2.1 Replace Inline Style with useMemo
```typescript
const backgroundStyle = useMemo(() => ({
  backgroundImage: `url('${bgUrl}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}), [bgUrl]);
```

#### 2.2 Update JSX to Use Memoized Style
Replace inline style with `style={backgroundStyle}`.

#### 2.3 Add Load Failure Handling
Implement `onError` handler to revert to previous valid URL on load failure.

#### 2.4 Add Previous URL Tracking
Store last valid background URL in state for fallback behavior.

---

## Component Changes

### File: [`components/teleprompter/Runner.tsx`](components/teleprompter/Runner.tsx)

**Changes Required**:
1. Import `useMemo` from React
2. Add `backgroundStyle` memoized variable (after hook declarations)
3. Modify scroll useEffect to calculate `intervalMs` dynamically
4. Add `autoScrollSpeed` to scroll useEffect dependency array
5. Add min speed check to pause auto-scroll
6. Add debouncing wrapper for speed slider onChange
7. Add `onError` handler for background image load failures
8. Add state tracking for previous valid background URL

### File: [`components/teleprompter/runner/QuickSettingsPanel.tsx`](components/teleprompter/runner/QuickSettingsPanel.tsx)

**Changes Required**:
1. Add debouncing to speed slider onChange handler
2. Add localStorage persistence for speed changes

---

## Testing Strategy

### Unit Tests
- Test dynamic interval calculation for various speed values
- Test min speed auto-pause behavior
- Test debouncing prevents excessive recalculations
- Test useMemo re-computation on bgUrl change
- Test load failure reverts to previous URL

### Integration Tests
- Test speed changes during active playback
- Test speed persists across pause/resume cycles
- Test speed persists across mode switches (Setup ↔ Runner)
- Test background changes in Runner mode
- Test background consistency between Setup Preview and Runner

### Edge Case Tests
- Speed set to 0 or below 10 → pause
- Speed set to 200 (max) → no performance issues
- Invalid background URL → revert to previous
- Network error on background load → revert to previous
- Rapid speed changes → debounced behavior
- Large background files (>5MB) → warning shown

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing scroll behavior | Low | High | Thorough testing of scroll speed calculations |
| Performance regression from debouncing | Low | Medium | 100ms debounce is imperceptible to users |
| Memory leaks from useMemo | Low | Medium | Follow React best practices for dependency arrays |
| localStorage quota exceeded | Low | Low | Existing quota warning system handles this |

---

## Success Metrics

- ✅ Scroll speed changes apply within 100ms (after debounce)
- ✅ Scroll rate accuracy within ±5% of configured value
- ✅ Background URL changes render within 200ms
- ✅ 100% visual consistency between Setup Preview and Runner
- ✅ Zero performance degradation from rapid changes
- ✅ Settings persist across 100% of mode switches
- ✅ 100% graceful handling of invalid URLs

---

## Dependencies

### Code Dependencies
- Existing `useConfigStore` for `autoScrollSpeed` access
- Existing `useContentStore` for `bgUrl` access
- Existing `usePlaybackStore` for `isPlaying` state
- Existing Sonner toast library for user notifications

### External Dependencies
- None (all existing dependencies)

---

## Rollout Plan

1. **Phase 1** (P1): Implement scroll speed fix
2. **Testing Phase**: Run all tests (unit, integration, edge cases)
3. **Phase 2** (P2): Implement background URL fix
4. **Testing Phase**: Run all tests (unit, integration, edge cases)
5. **Regression Testing**: Run full test suite
6. **Manual QA**: Verify both fixes in browser
7. **Merge**: Create PR and merge to main
