# Clarifications: Multi-Device Matrix Preview

**Created**: 2026-01-07
**Feature**: [spec.md](spec.md)
**Purpose**: Resolve vague or ambiguous points in the specification to make it more actionable for implementation.

## Clarification Summary

This document identifies 8 areas of ambiguity in the original specification and provides concrete resolutions for each.

---

## CLAR-001: Grid Configuration vs. Available Devices Mismatch

**Location**: FR-002, FR-007, User Story 2

**Ambiguity**: When a user selects a grid configuration (e.g., 3x2 = 6 slots) but has fewer device types enabled (e.g., only 3 devices), the behavior is undefined.

**Proposed Resolution**:
- Grid configuration specifies the **maximum number of device slots** available
- If fewer device types are enabled than grid slots, the empty slots display a placeholder prompting the user to enable more devices
- If more device types are enabled than grid slots, the system uses the grid configuration as a hard limit and only displays the first N devices (based on user's device priority order)
- **Rationale**: This provides clear, predictable behavior while maintaining user control

**Updated FR-002**: 
> System MUST support grid configurations including 1x, 2x, 2x2, and 3x2 layouts. Each configuration defines the maximum number of device slots. When fewer device types are enabled than available slots, empty slots display an enable prompt. When more device types are enabled than slots, only the first N devices (by user priority) are displayed.

---

## CLAR-002: Exact Device Frame Dimensions

**Location**: FR-010, Assumption #2

**Ambiguity**: "Appropriate device-specific dimensions" is subjective. The assumption mentions device names but doesn't specify exact dimensions.

**Proposed Resolution**:
Define exact device frame dimensions for the initial device registry:

| Device Type | Width | Height | Scale Factor | Notes |
|------------|-------|--------|--------------|-------|
| iPhone SE | 375px | 667px | 1.0 | Base reference device |
| iPhone 14 Pro | 393px | 852px | 1.0 | Modern tall phone |
| iPad Air | 820px | 1180px | 1.0 | Tablet reference |
| Desktop | 1920px | 1080px | 0.5 | Scaled to fit grid |

**Rationale**: Concrete dimensions enable consistent implementation and testing. Desktop is scaled to prevent overwhelming the grid layout.

**Add to Device Registry entity definition**:
> Device Registry includes: name (string), width (number, pixels), height (number, pixels), scale (number, default 1.0), category (mobile|tablet|desktop). Initial registry includes iPhone SE (375x667), iPhone 14 Pro (393x852), iPad Air (820x1180), Desktop (1920x1080 at 0.5x scale).

---

## CLAR-003: Memory Warning Threshold Definition

**Location**: FR-011, Edge Case #1, Assumption #1

**Ambiguity**: "Too many previews" is undefined. Assumption mentions 300MB for 6 devices but doesn't specify warning thresholds.

**Proposed Resolution**:
- **Warning threshold**: 250MB total memory (5 device frames)
- **Hard limit**: 350MB total memory (prevents enabling 7th device)
- **Memory estimation**: 50MB base per iframe + 5MB per 1000 characters of content
- **Warning behavior**: Show toast notification when approaching limit; disable additional device checkboxes when at hard limit

**Rationale**: Provides concrete boundaries while accounting for content size variability.

**Updated FR-011**:
> System MUST monitor iframe memory efficiency with a warning threshold at 250MB (5 devices) and hard limit at 350MB. Memory is calculated as 50MB base per iframe plus 5MB per 1000 characters of content. When approaching the warning threshold, display a toast notification. When at the hard limit, disable additional device selection checkboxes.

---

## CLAR-004: Sync Performance Measurement Methodology

**Location**: SC-002, Assumption #3

**Ambiguity**: "Content changes propagate to all device previews within 100ms" - unclear if this is per-iframe or total broadcast time.

**Proposed Resolution**:
- **Measurement**: Total broadcast time from state change to last iframe acknowledging receipt
- **Benchmark tested**: Up to 6 iframes (maximum grid configuration)
- **Test method**: Use `performance.mark()` before broadcast and measure time until all iframes return acknowledgment via postMessage
- **Acceptable degradation**: 100ms for ≤3 iframes, 150ms for 4-6 iframes

**Rationale**: Acknowledges that broadcasting to more recipients takes longer, but sets reasonable expectations.

**Updated SC-002**:
> Content changes propagate to all device previews within 100ms for ≤3 iframes or 150ms for 4-6 iframes. Timing is measured from state change to last iframe acknowledgment receipt using Performance API.

---

## CLAR-005: Device-Specific Content Editing

**Location**: Brainstorm proposal line 34, FR-004

**Ambiguity**: The brainstorm mentions "Apply changes to all devices OR target specific form factors" but this capability is not reflected in functional requirements.

**Proposed Resolution**:
- **P0 (MVP)**: All content changes apply to all device previews simultaneously (broadcast pattern)
- **P1 (Future enhancement)**: Device-specific content overrides (stored per-device, merged with base content)
- **Clarification scope**: This specification only covers P0 - all previews show identical content

**Rationale**: The core value proposition is seeing how the same content looks across devices, not managing device-specific variants. Device-specific content is a separate feature.

**Add to Assumptions section**:
> **Device-Specific Content**: This feature does NOT support device-specific content variants. All device previews display identical content synchronized via broadcast. Device-specific content editing is deferred to a future enhancement (P1).

---

## CLAR-006: Grid Layout Persistence Schema

**Location**: FR-009, User Story 2 Acceptance Scenario 3

**Ambiguity**: "Grid layout preferences persist" but the data structure is undefined.

**Proposed Resolution**:
Define the localStorage schema:

```typescript
interface MultiDevicePreviewPreferences {
  enabled: boolean;              // Multi-device mode toggle
  gridConfig: '1x' | '2x' | '2x2' | '3x2';
  enabledDeviceTypes: string[];  // Array of device IDs
  deviceOrder: string[];         // Priority order for display
  lastUpdated: number;           // Timestamp for migration
}

const STORAGE_KEY = 'teleprompter-multi-device-preview';
```

**Storage limit**: <1KB (well within localStorage quota)

**Rationale**: Explicit schema enables implementation and future migrations.

**Add to Key Entities section**:
> **Grid Configuration**: User's selected layout arrangement (1x, 2x, 2x2, 3x2), enabled device types (array of device IDs), device priority order, and mode toggle state. Stored in localStorage under key `teleprompter-multi-device-preview` with schema: `{ enabled: boolean, gridConfig: string, enabledDeviceTypes: string[], deviceOrder: string[], lastUpdated: number }`.

---

## CLAR-007: Minimum Viewport and Responsive Breakpoints

**Location**: FR-006, Edge Case #3

**Ambiguity**: "Responsive CSS Grid layout" doesn't specify minimum viewport size or what happens when viewport is too small.

**Proposed Resolution**:
- **Minimum viewport**: 1024px width (tablet portrait and below shows warning)
- **Breakpoints**:
  - ≥1280px: Full 3x2 grid (6 devices) with 2-column layout
  - ≥1024px: 2x2 grid (4 devices) maximum, stacks vertically if needed
  - <1024px: Show "Viewport too small" message with recommendation to rotate device or use single-device preview
- **Fallback**: When viewport is too small, automatically revert to single-device preview mode with toast notification

**Rationale**: Prevents unusable UI on small screens while providing graceful degradation.

**Updated FR-006**:
> System MUST implement responsive CSS Grid layout with minimum viewport width of 1024px. Breakpoints: ≥1280px supports up to 3x2 grid (6 devices), ≥1024px supports up to 2x2 grid (4 devices). Below 1024px, display a message recommending device rotation or single-device preview mode.

**Add to Edge Cases**:
> - What happens when the browser viewport is below 1024px? Show a message "Multi-device preview requires a larger screen. Rotate your device or use single-device preview."

---

## CLAR-008: Retry Logic Parameters

**Location**: FR-012, Edge Case #2

**Ambiguity**: "Retry logic with graceful handling" doesn't specify retry count, backoff strategy, or failure conditions.

**Proposed Resolution**:
- **Max retries**: 3 attempts
- **Backoff strategy**: Exponential - 1s, 2s, 4s delays
- **Failure conditions**:
  - iframe fails to load within 10 seconds
  - postMessage sync fails consecutively 3 times
  - iframe content crashes (detected via error boundary)
- **Recovery actions**:
  - After 3 failed retries: Show device frame in "unavailable" state with error icon and "Retry" button
  - Manual retry button resets retry counter
  - Transient errors (network timeout) show "Loading..." with spinner

**Rationale**: Provides clear retry boundaries while allowing manual recovery.

**Updated FR-012**:
> System MUST handle device frame loading errors with retry logic: max 3 attempts with exponential backoff (1s, 2s, 4s). After failed retries, display device frame in unavailable state with error icon and manual retry button. Transient errors show loading spinner. iframe load timeout is 10 seconds.

---

## Specification Updates Required

The following sections in [spec.md](spec.md) should be updated with these clarifications:

1. **FR-002**: Update with CLAR-001 resolution
2. **FR-006**: Update with CLAR-007 resolution  
3. **FR-009**: Update with CLAR-006 resolution
4. **FR-011**: Update with CLAR-003 resolution
5. **FR-012**: Update with CLAR-008 resolution
6. **FR-010**: Update with CLAR-002 resolution
7. **SC-002**: Update with CLAR-004 resolution
8. **Key Entities**: Add device registry details (CLAR-002) and storage schema (CLAR-006)
9. **Assumptions**: Add device-specific content clarification (CLAR-005)
10. **Edge Cases**: Add viewport size edge case (CLAR-007)

---

## Validation Checklist

- [x] All clarifications resolve ambiguity without adding implementation details
- [x] Clarifications are consistent with existing requirements
- [x] Success criteria remain measurable after updates
- [x] No contradictions introduced between clarifications
- [x] Clarifications align with brainstorm proposal intent
- [x] Technical feasibility verified against existing codebase

---

## Next Steps

After these clarifications are applied to the specification:

1. Update [spec.md](spec.md) with all 10 specification updates listed above
2. Re-run requirements checklist validation
3. Specification should be ready for `/zo.plan` phase

---

**Status**: ✅ Clarifications defined and ready for application to specification
