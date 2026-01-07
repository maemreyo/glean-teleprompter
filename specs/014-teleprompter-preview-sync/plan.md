# Implementation Plan: Teleprompter Preview Synchronization

**Feature Branch**: `014-teleprompter-preview-sync`
**Created**: 2026-01-07
**Status**: Ready for Implementation
**Specification**: [`spec.md`](spec.md)

## Executive Summary

This plan implements comprehensive teleprompter preview synchronization across 32 functional requirements organized into 5 user stories. The implementation is divided into 3 phases:

- **Phase 1 (P1)**: Core synchronization fixes - focal point, font size, and persistence
- **Phase 2 (P2)**: Enhanced teleprompter settings - typography, display, styling
- **Phase 3 (P3)**: UX improvements - focal point indicator clarity

**Estimated Total Effort**: 24-32 hours
**Testing Coverage Target**: 95%+ across all phases

---

## Phase 1: Core Synchronization Fixes (Priority: P1)

**Objective**: Fix critical data loss bugs and ensure real-time synchronization of focal point and font size.

**Estimated Effort**: 10-14 hours

### Task 1.1: Update Type Definitions

**Files**: [`lib/story/types.ts`](../../lib/story/types.ts)

**Description**: Extend `TeleprompterSlide` type to include missing properties.

**Implementation Steps**:
1. Add `focalPoint?: number` to `TeleprompterSlide` interface
2. Add `fontSize?: number` to `TeleprompterSlide` interface
3. Add JSDoc comments documenting ranges (focalPoint: 0-100, fontSize: 16-72)
4. Ensure backward compatibility with optional properties

**Dependencies**: None (can start immediately)

**Testing Requirements**:
- Unit test: Verify type compilation with and without new properties
- Unit test: Verify default values when properties are undefined

**Acceptance Criteria**:
- [ ] `focalPoint` property defined with optional `number` type
- [ ] `fontSize` property defined with optional `number` type
- [ ] JSDoc comments included with valid ranges
- [ ] TypeScript compilation passes
- [ ] Existing slides without properties remain functional

**Risk Assessment**: Low
- **Risk**: Breaking existing code that depends on type structure
- **Mitigation**: Use optional properties (`?`) to ensure backward compatibility

---

### Task 1.2: Update Story Builder Store Defaults

**Files**: [`lib/story-builder/store.ts`](../../lib/story-builder/store.ts)

**Description**: Add default values when creating new teleprompter slides.

**Implementation Steps**:
1. Locate `createTeleprompterSlide` function or slide creation logic
2. Add default `focalPoint: 50` to new slide creation
3. Add default `fontSize: 24` to new slide creation
4. Ensure defaults are applied before persistence

**Dependencies**: Task 1.1 (type definitions must exist first)

**Testing Requirements**:
- Unit test: Verify new slides have correct default values
- Unit test: Verify defaults don't override existing values when editing

**Acceptance Criteria**:
- [ ] New teleprompter slides initialize with `focalPoint: 50`
- [ ] New teleprompter slides initialize with `fontSize: 24`
- [ ] Default values are constants (not magic numbers)
- [ ] Store tests pass

**Risk Assessment**: Low
- **Risk**: Accidentally overriding existing slide values
- **Mitigation**: Only apply defaults on new slide creation, not on updates

---

### Task 1.3: Fix Preview Conversion Function

**Files**: [`app/story-preview/page.tsx`](../../app/story-preview/page.tsx)

**Description**: Update `convertBuilderSlideToStorySlide` to preserve focal point and font size.

**Implementation Steps**:
1. Locate `convertBuilderSlideToStorySlide` function
2. Extract `focalPoint` from `builderSlide.content.focalPoint`
3. Extract `fontSize` from `builderSlide.content.fontSize`
4. Pass values to `TeleprompterSlide` output
5. Add fallback defaults for backward compatibility

**Dependencies**: Task 1.1 (type definitions must exist first)

**Testing Requirements**:
- Unit test: Verify focal point is preserved during conversion
- Unit test: Verify font size is preserved during conversion
- Unit test: Verify backward compatibility with missing properties
- Integration test: Verify full conversion pipeline

**Acceptance Criteria**:
- [ ] `focalPoint` value preserved in converted slide
- [ ] `fontSize` value preserved in converted slide
- [ ] Missing properties fall back to defaults (50, 24)
- [ ] No data loss during conversion
- [ ] Function handles undefined values gracefully

**Risk Assessment**: Medium
- **Risk**: Introducing breaking changes to existing conversion logic
- **Mitigation**: Use optional chaining and fallbacks, add comprehensive tests

---

### Task 1.4: Update Preview Sync Hook

**Files**: [`lib/story-builder/hooks/usePreviewSync.ts`](../../lib/story-builder/hooks/usePreviewSync.ts)

**Description**: Ensure focal point and font size are included in postMessage synchronization.

**Implementation Steps**:
1. Review `usePreviewSync` hook implementation
2. Verify slide data structure includes `focalPoint` and `fontSize`
3. Ensure properties are serialized in message payload
4. Add debouncing if not present (100ms target)

**Dependencies**: Task 1.1 (type definitions), Task 1.3 (conversion function)

**Testing Requirements**:
- Integration test: Verify postMessage includes focal point and font size
- Performance test: Verify <100ms synchronization latency
- Integration test: Verify rapid adjustments are handled correctly

**Acceptance Criteria**:
- [ ] `focalPoint` included in sync messages
- [ ] `fontSize` included in sync messages
- [ ] Messages debounced appropriately
- [ ] Synchronization latency <100ms for 95% of updates
- [ ] Rapid adjustments (5+ changes/sec) handled without performance issues

**Risk Assessment**: Medium
- **Risk**: Message payload size increases affecting performance
- **Mitigation**: Monitor performance, implement debouncing, test with rapid updates

---

### Task 1.5: Fix Teleprompter Slide Editor Initialization

**Files**: [`app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx`](../../app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx)

**Description**: Initialize editor with slide's actual values instead of hardcoded defaults.

**Implementation Steps**:
1. Locate component initialization logic
2. Extract `focalPoint` from slide prop (or use default 50)
3. Extract `fontSize` from slide prop (or use default 24)
4. Replace hardcoded initialization with prop-derived values
5. Ensure values update when switching slides

**Dependencies**: Task 1.2 (store defaults)

**Testing Requirements**:
- Unit test: Verify initialization from slide props
- Unit test: Verify fallback to defaults when props missing
- Integration test: Verify values persist when switching slides

**Acceptance Criteria**:
- [ ] Editor initializes with slide's `focalPoint` value
- [ ] Editor initializes with slide's `fontSize` value
- [ ] Missing values fall back to defaults
- [ ] Values persist when switching between slides
- [ ] No data loss on slide navigation

**Risk Assessment**: Low
- **Risk**: Breaking editor if props are undefined
- **Mitigation**: Use nullish coalescing for fallbacks, comprehensive testing

---

### Task 1.6: Update FocalPointIndicator Component

**Files**: [`components/story/Teleprompter/FocalPointIndicator.tsx`](../../components/story/Teleprompter/FocalPointIndicator.tsx)

**Description**: Add prop to receive focal point value from parent.

**Implementation Steps**:
1. Add `focalPoint` prop to component interface
2. Replace hardcoded values with prop value
3. Add validation to clamp value to valid range (0-100)
4. Update `top` style calculation to use prop

**Dependencies**: Task 1.1 (type definitions)

**Testing Requirements**:
- Unit test: Verify indicator position reflects prop value
- Unit test: Verify clamping for out-of-range values
- Visual test: Verify indicator renders correctly at different positions

**Acceptance Criteria**:
- [ ] `focalPoint` prop accepted by component
- [ ] Indicator position calculated from prop value
- [ ] Values clamped to valid range (0-100)
- [ ] Default value provided if prop not passed
- [ ] Component renders without errors

**Risk Assessment**: Low
- **Risk**: Breaking existing usage without prop
- **Mitigation**: Provide default value, maintain backward compatibility

---

### Task 1.7: Update TeleprompterContent Component

**Files**: [`components/story/Teleprompter/TeleprompterContent.tsx`](../../components/story/Teleprompter/TeleprompterContent.tsx)

**Description**: Add optional props to override store defaults in preview mode.

**Implementation Steps**:
1. Add optional `focalPoint` prop to interface
2. Add optional `fontSize` prop to interface
3. Use prop values if provided, otherwise fall back to store
4. Apply font size to text styling
5. Pass focal point to FocalPointIndicator

**Dependencies**: Task 1.6 (FocalPointIndicator updated)

**Testing Requirements**:
- Unit test: Verify focal point prop overrides store
- Unit test: Verify font size prop overrides store
- Unit test: Verify store fallback when props not provided
- Integration test: Verify preview mode uses props correctly

**Acceptance Criteria**:
- [ ] Optional `focalPoint` prop accepted
- [ ] Optional `fontSize` prop accepted
- [ ] Props override store values when provided
- [ ] Store values used when props not provided
- [ ] Font size applied to text styling
- [ ] Focal point passed to indicator

**Risk Assessment**: Low
- **Risk**: Confusion about which values take precedence
- **Mitigation**: Clear prop documentation, consistent fallback logic

---

### Task 1.8: Update Preview Page to Pass Props

**Files**: [`app/story-preview/page.tsx`](../../app/story-preview/page.tsx)

**Description**: Pass focal point and font size from slide data to TeleprompterContent.

**Implementation Steps**:
1. Locate TeleprompterContent rendering in preview
2. Extract `focalPoint` from slide data
3. Extract `fontSize` from slide data
4. Pass values as props to TeleprompterContent
5. Handle missing values with fallbacks

**Dependencies**: Task 1.3 (conversion function), Task 1.7 (TeleprompterContent props)

**Testing Requirements**:
- Integration test: Verify props passed correctly
- Integration test: Verify preview updates with slide changes
- E2E test: Verify full builder-to-preview flow

**Acceptance Criteria**:
- [ ] `focalPoint` passed to TeleprompterContent
- [ ] `fontSize` passed to TeleprompterContent
- [ ] Missing values handled with fallbacks
- [ ] Preview updates when slide changes
- [ ] Builder-to-preview sync works end-to-end

**Risk Assessment**: Low
- **Risk**: Props not reaching component due to rendering issues
- **Mitigation**: Trace data flow, add logging for debugging

---

### Task 1.9: Add Validation and Clamping

**Files**: [`lib/story/validation.ts`](../../lib/story/validation.ts) (new or existing)

**Description**: Add validation utilities for focal point and font size ranges.

**Implementation Steps**:
1. Create or update validation utilities
2. Add `clampFocalPoint(value: number): number` - clamps to 0-100
3. Add `clampFontSize(value: number): number` - clamps to 16-72
4. Add validation functions that return boolean and error message
5. Export utilities for use across components

**Dependencies**: None (can be done in parallel with other tasks)

**Testing Requirements**:
- Unit test: Verify clamping at boundaries (0, 100)
- Unit test: Verify clamping at boundaries (16, 72)
- Unit test: Verify out-of-range values are clamped correctly
- Unit test: Verify in-range values pass through unchanged

**Acceptance Criteria**:
- [ ] `clampFocalPoint` function implemented
- [ ] `clampFontSize` function implemented
- [ ] Values < minimum clamp to minimum
- [ ] Values > maximum clamp to maximum
- [ ] In-range values unchanged
- [ ] Functions exported for reuse

**Risk Assessment**: Low
- **Risk**: Incorrect clamping logic
- **Mitigation**: Comprehensive unit tests, boundary testing

---

### Task 1.10: Phase 1 Testing

**Files**: Various test files

**Description**: Comprehensive testing for Phase 1 implementation.

**Implementation Steps**:
1. Create/update unit tests for all modified components
2. Create integration tests for builder-to-preview flow
3. Create E2E tests with Playwright for full user journeys
4. Add performance tests for synchronization latency
5. Add visual regression tests for preview rendering

**Dependencies**: All Phase 1 tasks (1.1-1.9)

**Testing Requirements**:
- Unit tests for all components (target: 95%+ coverage)
- Integration tests for data flow
- E2E tests for user stories 1-3
- Performance tests for <100ms sync requirement
- Visual tests for preview rendering

**Acceptance Criteria**:
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage ≥95% for modified files
- [ ] Synchronization latency <100ms for 95% of updates
- [ ] Zero data loss incidents in tests
- [ ] Backward compatibility verified

**Risk Assessment**: Medium
- **Risk**: Test flakiness or insufficient coverage
- **Mitigation**: Use reliable test patterns, run tests multiple times, manual verification

---

## Phase 2: Enhanced Teleprompter Settings (Priority: P2)

**Objective**: Add comprehensive teleprompter customization options for professional usage.

**Estimated Effort**: 10-14 hours

### Task 2.1: Extend Type Definitions for Enhanced Settings

**Files**: [`lib/story/types.ts`](../../lib/story/types.ts)

**Description**: Add new properties for enhanced teleprompter settings.

**Implementation Steps**:
1. Add typography properties:
   - `textAlign?: 'left' | 'center' | 'right'`
   - `lineHeight?: number` (1.0-2.0)
   - `letterSpacing?: number` (-2 to +10)
2. Add display properties:
   - `scrollSpeed?: 'slow' | 'medium' | 'fast'`
   - `mirrorHorizontal?: boolean`
   - `mirrorVertical?: boolean`
3. Add styling properties:
   - `backgroundColor?: string` (hex)
   - `backgroundOpacity?: number` (0-100)
4. Add layout properties:
   - `safeAreaPadding?: { top: number; right: number; bottom: number; left: number }`
5. Add JSDoc comments with valid ranges

**Dependencies**: Phase 1 complete (builds on existing type updates)

**Testing Requirements**:
- Unit test: Verify type compilation with all properties
- Unit test: Verify default values when properties undefined
- Type test: Verify TypeScript strict mode compliance

**Acceptance Criteria**:
- [ ] All 9 new properties defined with correct types
- [ ] Union types for enums (textAlign, scrollSpeed)
- [ ] Interface for safeAreaPadding object
- [ ] JSDoc comments with ranges
- [ ] TypeScript compilation passes
- [ ] Existing slides without properties remain functional

**Risk Assessment**: Low
- **Risk**: Type complexity increases compilation time
- **Mitigation**: Keep properties optional, use simple types

---

### Task 2.2: Update Store Defaults for Enhanced Settings

**Files**: [`lib/story-builder/store.ts`](../../lib/story-builder/store.ts)

**Description**: Add default values for all enhanced settings.

**Implementation Steps**:
1. Extend slide creation logic with new defaults:
   - `textAlign: 'left'`
   - `lineHeight: 1.4`
   - `letterSpacing: 0`
   - `scrollSpeed: 'medium'`
   - `mirrorHorizontal: false`
   - `mirrorVertical: false`
   - `backgroundColor: '#000000'`
   - `backgroundOpacity: 100`
   - `safeAreaPadding: { top: 0, right: 0, bottom: 0, left: 0 }`
2. Define constants for defaults (DRY principle)
3. Ensure defaults are applied on new slide creation only

**Dependencies**: Task 2.1 (type definitions)

**Testing Requirements**:
- Unit test: Verify all defaults applied correctly
- Unit test: Verify defaults don't override existing values

**Acceptance Criteria**:
- [ ] All 9 properties have correct defaults
- [ ] Defaults defined as constants
- [ ] Defaults applied on new slide creation
- [ ] Existing slides not affected
- [ ] Store tests pass

**Risk Assessment**: Low
- **Risk**: Accidentally overriding user values
- **Mitigation**: Only apply on creation, not updates

---

### Task 2.3: Update Conversion Function for Enhanced Settings

**Files**: [`app/story-preview/page.tsx`](../../app/story-preview/page.tsx)

**Description**: Extend conversion to preserve all enhanced settings.

**Implementation Steps**:
1. Extract all 9 new properties from builder slide
2. Pass properties to story slide output
3. Add fallback defaults for backward compatibility
4. Handle safeAreaPadding object destructuring

**Dependencies**: Task 2.1 (types), Task 2.2 (defaults)

**Testing Requirements**:
- Unit test: Verify all properties preserved
- Unit test: Verify backward compatibility
- Integration test: Verify full conversion pipeline

**Acceptance Criteria**:
- [ ] All 9 properties preserved in conversion
- [ ] Missing properties fall back to defaults
- [ ] SafeAreaPadding object handled correctly
- [ ] No data loss during conversion
- [ ] Backward compatibility maintained

**Risk Assessment**: Medium
- **Risk**: Complex object handling (safeAreaPadding)
- **Mitigation**: Use destructuring with defaults, comprehensive tests

---

### Task 2.4: Update Preview Sync for Enhanced Settings

**Files**: [`lib/story-builder/hooks/usePreviewSync.ts`](../../lib/story-builder/hooks/usePreviewSync.ts)

**Description**: Include all enhanced settings in synchronization.

**Implementation Steps**:
1. Verify message payload includes all 9 new properties
2. Ensure proper serialization of object values
3. Maintain debouncing for performance
4. Test with rapid adjustments

**Dependencies**: Task 2.3 (conversion function)

**Testing Requirements**:
- Integration test: Verify all settings sync within 100ms
- Performance test: Verify no degradation with more properties
- Integration test: Verify rapid adjustments handled

**Acceptance Criteria**:
- [ ] All 9 properties included in sync
- [ ] Synchronization <100ms for 95% of updates
- [ ] No performance degradation
- [ ] Rapid adjustments handled correctly

**Risk Assessment**: Medium
- **Risk**: Increased payload size affects performance
- **Mitigation**: Monitor performance, optimize if needed

---

### Task 2.5: Create Typography Controls Component

**Files**: [`app/story-builder/components/slides/editors/controls/TypographyControls.tsx`](../../app/story-builder/components/slides/editors/controls/TypographyControls.tsx) (new)

**Description**: Create UI controls for typography settings.

**Implementation Steps**:
1. Create `TypographyControls` component
2. Add text alignment buttons (left, center, right)
3. Add line height slider (1.0-2.0)
4. Add letter spacing slider (-2 to +10)
5. Use shadcn/ui components (Slider, ButtonGroup)
6. Add labels and current value displays
7. Integrate with TeleprompterSlideEditor

**Dependencies**: Task 2.1 (types), Task 2.2 (defaults)

**Testing Requirements**:
- Unit test: Verify controls render correctly
- Unit test: Verify value changes propagate
- Integration test: Verify sync to preview
- Visual test: Verify UI appearance

**Acceptance Criteria**:
- [ ] Alignment buttons with icons
- [ ] Line height slider with value display
- [ ] Letter spacing slider with value display
- [ ] Changes sync to preview <100ms
- [ ] Controls accessible (keyboard, screen reader)
- [ ] Responsive design

**Risk Assessment**: Low
- **Risk**: UI clutter with too many controls
- **Mitigation**: Group controls logically, use collapsible sections

---

### Task 2.6: Create Display Controls Component

**Files**: [`app/story-builder/components/slides/editors/controls/DisplayControls.tsx`](../../app/story-builder/components/slides/editors/controls/DisplayControls.tsx) (new)

**Description**: Create UI controls for display settings.

**Implementation Steps**:
1. Create `DisplayControls` component
2. Add scroll speed preset selector (slow, medium, fast)
3. Add horizontal mirror toggle
4. Add vertical mirror toggle
5. Use shadcn/ui components (Select, Switch)
6. Add icons and labels
7. Integrate with TeleprompterSlideEditor

**Dependencies**: Task 2.1 (types), Task 2.2 (defaults)

**Testing Requirements**:
- Unit test: Verify controls render correctly
- Unit test: Verify value changes propagate
- Integration test: Verify sync to preview
- Visual test: Verify UI appearance

**Acceptance Criteria**:
- [ ] Scroll speed dropdown/presets
- [ ] Horizontal mirror toggle with label
- [ ] Vertical mirror toggle with label
- [ ] Changes sync to preview <100ms
- [ ] Controls accessible
- [ ] Mirroring preview shows correctly

**Risk Assessment**: Low
- **Risk**: Mirroring not visible in small preview
- **Mitigation**: Add visual indicator, tooltip explanation

---

### Task 2.7: Create Styling Controls Component

**Files**: [`app/story-builder/components/slides/editors/controls/StylingControls.tsx`](../../app/story-builder/components/slides/editors/controls/StylingControls.tsx) (new)

**Description**: Create UI controls for styling settings.

**Implementation Steps**:
1. Create `StylingControls` component
2. Add background color picker (use react-colorful)
3. Add background opacity slider (0-100)
4. Use shadcn/ui components (Popover, Slider)
5. Add hex color input for precision
6. Add preview swatch
7. Integrate with TeleprompterSlideEditor

**Dependencies**: Task 2.1 (types), Task 2.2 (defaults)

**Testing Requirements**:
- Unit test: Verify controls render correctly
- Unit test: Verify color picker updates
- Unit test: Verify opacity slider updates
- Integration test: Verify sync to preview
- Visual test: Verify color rendering

**Acceptance Criteria**:
- [ ] Color picker with hex input
- [ ] Opacity slider with percentage display
- [ ] Preview swatch updates live
- [ ] Changes sync to preview <100ms
- [ ] Controls accessible
- [ ] Valid hex validation

**Risk Assessment**: Medium
- **Risk**: Color picker complexity
- **Mitigation**: Use proven library (react-colorful), comprehensive testing

---

### Task 2.8: Create Layout Controls Component

**Files**: [`app/story-builder/components/slides/editors/controls/LayoutControls.tsx`](../../app/story-builder/components/slides/editors/controls/LayoutControls.tsx) (new)

**Description**: Create UI controls for layout settings.

**Implementation Steps**:
1. Create `LayoutControls` component
2. Add safe area padding inputs (top, right, bottom, left)
3. Use number inputs with range 0-100
4. Add presets (None, Notch, Bezel)
5. Use shadcn/ui components (Input, ButtonGroup)
6. Add visual preview of padding zones
7. Integrate with TeleprompterSlideEditor

**Dependencies**: Task 2.1 (types), Task 2.2 (defaults)

**Testing Requirements**:
- Unit test: Verify controls render correctly
- Unit test: Verify padding values update
- Unit test: Verify presets apply correctly
- Integration test: Verify sync to preview
- Visual test: Verify padding zones

**Acceptance Criteria**:
- [ ] Four padding inputs (TRBL)
- [ ] Values clamped to 0-100
- [ ] Preset buttons for common scenarios
- [ ] Visual preview of padding zones
- [ ] Changes sync to preview <100ms
- [ ] Controls accessible

**Risk Assessment**: Low
- **Risk**: Confusing UI with four separate inputs
- **Mitigation**: Use presets, visual preview, clear labels

---

### Task 2.9: Update TeleprompterContent for Enhanced Settings

**Files**: [`components/story/Teleprompter/TeleprompterContent.tsx`](../../components/story/Teleprompter/TeleprompterContent.tsx)

**Description**: Apply all enhanced settings in preview/runner.

**Implementation Steps**:
1. Add all 9 new optional props
2. Apply text alignment to container style
3. Apply line height and letter spacing to text
4. Apply background color and opacity to container
5. Apply mirroring transforms (scaleX, scaleY)
6. Apply safe area padding to container
7. Implement scroll speed presets in scroll logic

**Dependencies**: Tasks 2.5-2.8 (controls created)

**Testing Requirements**:
- Unit test: Verify all props applied correctly
- Unit test: Verify CSS transforms for mirroring
- Integration test: Verify preview updates
- Visual test: Verify rendering with all settings

**Acceptance Criteria**:
- [ ] Text alignment applied correctly
- [ ] Line height and letter spacing applied
- [ ] Background color/opacity rendered
- [ ] Horizontal mirroring works (scaleX(-1))
- [ ] Vertical mirroring works (scaleY(-1))
- [ ] Safe area padding respected
- [ ] Scroll speed presets adjust scroll rate
- [ ] All changes visible in preview <100ms

**Risk Assessment**: Medium
- **Risk**: CSS specificity issues
- **Mitigation**: Use inline styles or CSS-in-JS, test across browsers

---

### Task 2.10: Add Validation for Enhanced Settings

**Files**: [`lib/story/validation.ts`](../../lib/story/validation.ts)

**Description**: Add validation utilities for all enhanced settings.

**Implementation Steps**:
1. Add `clampLineHeight(value: number): number` - 1.0-2.0
2. Add `clampLetterSpacing(value: number): number` - -2 to +10
3. Add `clampBackgroundOpacity(value: number): number` - 0-100
4. Add `clampSafeAreaPadding(value: number): number` - 0-100
5. Add hex color validator `isValidHexColor(value: string): boolean`
6. Add comprehensive validation function

**Dependencies**: Task 2.1 (types)

**Testing Requirements**:
- Unit test: Verify all clamping functions
- Unit test: Verify hex validation
- Unit test: Verify comprehensive validation

**Acceptance Criteria**:
- [ ] All clamping functions implemented
- [ ] Hex color validator implemented
- [ ] Boundary values tested
- [ ] Error messages clear and actionable
- [ ] Functions exported for reuse

**Risk Assessment**: Low
- **Risk**: Incorrect validation logic
- **Mitigation**: Comprehensive unit tests, boundary testing

---

### Task 2.11: Update TeleprompterSlideEditor Integration

**Files**: [`app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx`](../../app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx)

**Description**: Integrate all control components into editor.

**Implementation Steps**:
1. Import all control components (2.5-2.8)
2. Add state for all 9 enhanced settings
3. Initialize state from slide props
4. Wire up change handlers
5. Organize controls into sections (tabs or accordions)
6. Ensure proper persistence to store

**Dependencies**: Tasks 2.5-2.9 (all controls and rendering)

**Testing Requirements**:
- Integration test: Verify all controls render
- Integration test: Verify state persistence
- Integration test: Verify slide navigation preserves values
- Visual test: Verify editor layout

**Acceptance Criteria**:
- [ ] All control components integrated
- [ ] State initialized from slide props
- [ ] Changes persist to store
- [ ] Values preserved on slide navigation
- [ ] UI organized and usable
- [ ] No performance issues

**Risk Assessment**: Medium
- **Risk**: Editor becomes cluttered
- **Mitigation**: Use tabs/accordions, collapsible sections

---

### Task 2.12: Phase 2 Testing

**Files**: Various test files

**Description**: Comprehensive testing for Phase 2 implementation.

**Implementation Steps**:
1. Create/update unit tests for all new components
2. Create integration tests for enhanced settings flow
3. Create E2E tests for user story 5
4. Add visual regression tests for all settings
5. Add performance tests for sync with more data

**Dependencies**: All Phase 2 tasks (2.1-2.11)

**Testing Requirements**:
- Unit tests for all components (target: 95%+ coverage)
- Integration tests for enhanced settings flow
- E2E tests for user story 5 scenarios
- Visual tests for all rendering combinations
- Performance tests for synchronization

**Acceptance Criteria**:
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Code coverage ≥95% for new files
- [ ] Synchronization <100ms for 95% of updates
- [ ] All enhanced settings persist correctly
- [ ] Backward compatibility verified
- [ ] Visual tests pass

**Risk Assessment**: Medium
- **Risk**: Visual test complexity with many combinations
- **Mitigation**: Use representative samples, manual verification

---

## Phase 3: UX Improvements (Priority: P3)

**Objective**: Improve user understanding and onboarding for focal point indicator.

**Estimated Effort**: 4-6 hours

### Task 3.1: Add Tooltip to FocalPointIndicator

**Files**: [`components/story/Teleprompter/FocalPointIndicator.tsx`](../../components/story/Teleprompter/FocalPointIndicator.tsx)

**Description**: Add explanatory tooltip on hover.

**Implementation Steps**:
1. Add shadcn/ui Tooltip component
2. Add label prop for dynamic text
3. Show "Focal Point - Optimal reading area during recording" on hover
4. Show current percentage value when adjusting
5. Hide tooltip during playback

**Dependencies**: Phase 1 complete (FocalPointIndicator has focalPoint prop)

**Testing Requirements**:
- Unit test: Verify tooltip appears on hover
- Unit test: Verify tooltip content correct
- Accessibility test: Verify keyboard navigation
- Visual test: Verify tooltip appearance

**Acceptance Criteria**:
- [ ] Tooltip appears on hover
- [ ] Default text: "Focal Point - Optimal reading area during recording"
- [ ] Shows percentage when adjusting
- [ ] Hidden during playback
- [ ] Accessible via keyboard
- [ ] Good visual design

**Risk Assessment**: Low
- **Risk**: Tooltip clutter
- **Mitigation**: Only show on hover, dismiss automatically

---

### Task 3.2: Add Visual Indicator Styling

**Files**: [`components/story/Teleprompter/FocalPointIndicator.tsx`](../../components/story/Teleprompter/FocalPointIndicator.tsx)

**Description**: Enhance visual clarity of the indicator.

**Implementation Steps**:
1. Add dashed line style for better visibility
2. Add glow effect or animation
3. Add position label (percentage) visible when near
4. Ensure contrast with various backgrounds
5. Add transition animations for smooth movement

**Dependencies**: Task 3.1 (tooltip added)

**Testing Requirements**:
- Visual test: Verify visibility on different backgrounds
- Visual test: Verify animation smoothness
- Accessibility test: Verify contrast ratios

**Acceptance Criteria**:
- [ ] Indicator clearly visible
- [ ] Smooth animations when moving
- [ ] Percentage label visible when close
- [ ] Good contrast (WCAG AA)
- [ ] Professional appearance

**Risk Assessment**: Low
- **Risk**: Over-animating
- **Mitigation**: Use subtle animations, respect prefers-reduced-motion

---

### Task 3.3: Add User Education

**Files**: [`app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx`](../../app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx)

**Description**: Add inline help text for focal point setting.

**Implementation Steps**:
1. Add help icon next to focal point slider
2. Add popover with explanation
3. Add visual diagram showing how focal point works
4. Link to documentation
5. Show only on first visit or when requested

**Dependencies**: Task 3.1 (tooltip)

**Testing Requirements**:
- Unit test: Verify help renders
- Integration test: Verify help popover
- Visual test: Verify diagram appearance
- Usability test: Verify clarity

**Acceptance Criteria**:
- [ ] Help icon present
- [ ] Popover explains focal point clearly
- [ ] Visual diagram included
- [ ] Documentation link works
- [ ] Can be dismissed
- [ ] Doesn't disrupt workflow

**Risk Assessment**: Low
- **Risk**: Help content ignored
- **Mitigation**: Make it optional, keep it concise

---

### Task 3.4: Phase 3 Testing

**Files**: Various test files

**Description**: Testing for UX improvements.

**Implementation Steps**:
1. Create unit tests for tooltip behavior
2. Create accessibility tests
3. Create visual tests for indicator styling
4. Create user testing script for education

**Dependencies**: All Phase 3 tasks (3.1-3.3)

**Testing Requirements**:
- Unit tests for tooltip
- Accessibility tests (WCAG compliance)
- Visual tests for styling
- User testing for education clarity

**Acceptance Criteria**:
- [ ] All unit tests pass
- [ ] Accessibility tests pass
- [ ] Visual tests pass
- [ ] User testing positive (≥80% understand indicator)
- [ ] No regressions from Phase 1-2

**Risk Assessment**: Low
- **Risk**: Subjective user feedback
- **Mitigation**: Use multiple testers, iterate based on feedback

---

## Risk Assessment & Mitigation

### High-Level Risks

1. **Backward Compatibility Break**
   - **Impact**: High - could break existing stories
   - **Probability**: Low
   - **Mitigation**: Use optional properties, comprehensive fallbacks, extensive testing

2. **Performance Degradation**
   - **Impact**: Medium - poor user experience
   - **Probability**: Low
   - **Mitigation**: Debouncing, performance monitoring, optimization checkpoints

3. **Type System Complexity**
   - **Impact**: Medium - harder to maintain
   - **Probability**: Medium
   - **Mitigation**: Clear JSDoc, TypeScript strict mode, comprehensive tests

4. **UI/UX Clutter**
   - **Impact**: Medium - confusing interface
   - **Probability**: Medium
   - **Mitigation**: Progressive disclosure, tabs/accordions, user testing

5. **Test Coverage Gaps**
   - **Impact**: Medium - bugs in production
   - **Probability**: Low
   - **Mitigation**: Test-first approach, coverage targets, manual QA

---

## Dependencies & Execution Order

### Critical Path

```
Phase 1: Core Synchronization
├── Task 1.1 (Types) → START HERE
├── Task 1.2 (Defaults) → Depends on 1.1
├── Task 1.3 (Conversion) → Depends on 1.1
├── Task 1.4 (Sync) → Depends on 1.1, 1.3
├── Task 1.5 (Editor) → Depends on 1.2
├── Task 1.6 (Indicator) → Depends on 1.1
├── Task 1.7 (Content) → Depends on 1.6
├── Task 1.8 (Preview) → Depends on 1.3, 1.7
├── Task 1.9 (Validation) → Parallel to others
└── Task 1.10 (Testing) → Depends on 1.1-1.9

Phase 2: Enhanced Settings
├── Task 2.1 (Types) → After Phase 1 complete
├── Task 2.2 (Defaults) → Depends on 2.1
├── Task 2.3 (Conversion) → Depends on 2.1, 2.2
├── Task 2.4 (Sync) → Depends on 2.3
├── Task 2.5 (Typography) → Depends on 2.1, 2.2
├── Task 2.6 (Display) → Depends on 2.1, 2.2
├── Task 2.7 (Styling) → Depends on 2.1, 2.2
├── Task 2.8 (Layout) → Depends on 2.1, 2.2
├── Task 2.9 (Content) → Depends on 2.5-2.8
├── Task 2.10 (Validation) → Parallel to 2.5-2.8
├── Task 2.11 (Integration) → Depends on 2.5-2.9
└── Task 2.12 (Testing) → Depends on 2.1-2.11

Phase 3: UX Improvements
├── Task 3.1 (Tooltip) → After Phase 2 complete
├── Task 3.2 (Styling) → Depends on 3.1
├── Task 3.3 (Education) → Depends on 3.1
└── Task 3.4 (Testing) → Depends on 3.1-3.3
```

### Parallelizable Work

- **Task 1.9** (Validation) can be done in parallel with Tasks 1.2-1.8
- **Task 2.10** (Validation) can be done in parallel with Tasks 2.5-2.8
- Tasks 2.5-2.8 (Control components) can be done in parallel after 2.2

---

## Testing Strategy

### Unit Tests

**Target**: 95%+ code coverage for all modified/new files

**Key Areas**:
- Type system updates (validation, clamping)
- Store operations (creation, updates)
- Conversion functions
- Component rendering and state
- Validation utilities

**Tools**: Jest, React Testing Library

---

### Integration Tests

**Key Scenarios**:
- Builder to preview data flow
- Store to component state propagation
- Slide navigation persistence
- postMessage synchronization
- Cross-tab synchronization (BroadcastChannel)

**Tools**: Jest, React Testing Library, test utilities

---

### E2E Tests

**User Stories to Cover**:
- US1: Real-time focal point preview
- US2: Font size preview synchronization
- US3: Persistent settings across navigation
- US4: Focal point indicator clarity
- US5: Enhanced teleprompter settings

**Tools**: Playwright

**Key Scenarios**:
- Adjust focal point, verify preview updates
- Adjust font size, verify preview updates
- Switch slides, verify settings persist
- Hover indicator, verify tooltip appears
- Adjust all enhanced settings, verify preview

---

### Performance Tests

**Key Metrics**:
- Synchronization latency (<100ms target)
- Rapid adjustments handling (5+ changes/sec)
- Slide navigation performance
- Rendering performance with all settings

**Tools**: Jest performance tests, browser DevTools

---

### Visual Regression Tests

**Key Areas**:
- Focal point indicator at various positions
- Font size variations
- Text alignment options
- Background color/opacity combinations
- Mirroring transforms
- Safe area padding

**Tools**: Playwright screenshots, Percy (if available)

---

### Accessibility Tests

**Key Areas**:
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios (WCAG AA)
- Touch target sizes (44x44px minimum)
- Focus management

**Tools**: axe-core, jest-axe, manual testing

---

## Validation Checkpoints

### Checkpoint 1: Phase 1 Complete

**Criteria**:
- [ ] All focal point and font size issues resolved
- [ ] Real-time synchronization working (<100ms)
- [ ] Settings persist across slide navigation
- [ ] Zero data loss in tests
- [ ] 95%+ test coverage
- [ ] Backward compatibility verified

**Sign-off**: Manual testing + automated tests passing

---

### Checkpoint 2: Phase 2 Complete

**Criteria**:
- [ ] All 9 enhanced settings working
- [ ] All control components functional
- [ ] Synchronization maintained (<100ms)
- [ ] All settings persist correctly
- [ ] 95%+ test coverage
- [ ] Backward compatibility verified
- [ ] Performance acceptable

**Sign-off**: Manual testing + automated tests passing

---

### Checkpoint 3: Phase 3 Complete

**Criteria**:
- [ ] Tooltip working on hover
- [ ] Visual indicator clear and visible
- [ ] User education added
- [ ] Accessibility tests passing
- [ ] User testing positive (≥80% understanding)

**Sign-off**: Manual testing + user feedback

---

### Checkpoint 4: Feature Complete

**Criteria**:
- [ ] All 32 functional requirements met
- [ ] All 13 success criteria met
- [ ] All 13 edge cases handled
- [ ] All user stories validated
- [ ] No regressions
- [ ] Documentation updated

**Sign-off**: Product owner approval

---

## Rollout Strategy

### Phase 1 Rollout (P1 - Critical Fixes)

**Approach**: Immediate deployment after validation

**Steps**:
1. Complete all Phase 1 tasks
2. Run full test suite
3. Manual QA on staging
4. Deploy to production
5. Monitor for issues (first 24 hours critical)
6. Be ready to hotfix if needed

**Communication**: "Critical bug fixes for teleprompter preview"

---

### Phase 2 Rollout (P2 - Enhanced Features)

**Approach**: Feature flag or gradual rollout

**Steps**:
1. Complete all Phase 2 tasks
2. Run full test suite
3. Manual QA on staging
4. Beta test with small user group
5. Gather feedback
6. Full rollout
7. Monitor usage analytics

**Communication**: "New teleprompter customization options available"

---

### Phase 3 Rollout (P3 - UX Improvements)

**Approach**: Standard deployment

**Steps**:
1. Complete all Phase 3 tasks
2. Run full test suite
3. Manual QA on staging
4. Deploy to production
5. Monitor user engagement

**Communication**: "Improved teleprompter preview experience"

---

## Time Estimates Summary

| Phase | Tasks | Estimated Time | Buffer | Total |
|-------|-------|----------------|--------|-------|
| Phase 1 (P1) | 10 | 10-12 hours | 2 hours | 12-14 hours |
| Phase 2 (P2) | 12 | 10-12 hours | 2 hours | 12-14 hours |
| Phase 3 (P3) | 4 | 3-4 hours | 1 hour | 4-6 hours |
| **Total** | **26** | **23-28 hours** | **5 hours** | **28-34 hours** |

**Note**: Estimates assume familiarity with codebase. Unforeseen issues may require additional time.

---

## Success Metrics

### Quantitative Metrics

- **SC-001**: 95% of focal point adjustments sync within 100ms
- **SC-002**: 95% of font size adjustments sync within 100ms
- **SC-003**: 100% data retention when switching between 10 slides
- **SC-004**: 90% of new users understand focal point indicator (user testing)
- **SC-005**: Zero data loss incidents after implementation
- **SC-006**: Handles 5+ rapid adjustments/second without performance issues
- **SC-007**: 100% backward compatibility with existing stories
- **SC-008**: 95% of enhanced setting adjustments sync within 100ms
- **SC-012**: 100% data retention for enhanced settings
- **SC-013**: 100% backward compatibility for enhanced properties

### Qualitative Metrics

- User feedback on improved WYSIWYG experience
- Reduced support tickets for teleprompter issues
- Increased usage of enhanced settings (analytics)
- Positive user testing results for UX improvements

---

## Post-Implementation Tasks

### Documentation Updates

1. Update API documentation for type changes
2. Update user guide for new settings
3. Add component documentation
4. Update changelog

### Monitoring

1. Set up error tracking for new code
2. Monitor synchronization latency
3. Track usage of enhanced settings
4. Watch for data loss incidents

### Future Improvements (Out of Scope)

1. Multi-form factor support (responsive aspect ratios)
2. Adaptive typography based on screen size
3. Advanced scroll speed customization (continuous slider)
4. Preset templates for common scenarios
5. Import/export of teleprompter settings

---

## Appendix: File-by-File Implementation Guide

### Type System Files

**[`lib/story/types.ts`](../../lib/story/types.ts)**
- Lines ~119-123: Update `TeleprompterSlide` interface
- Add 11 new properties (2 from Phase 1, 9 from Phase 2)
- Add JSDoc comments with ranges

### Store Files

**[`lib/story-builder/store.ts`](../../lib/story-builder/store.ts)**
- Lines ~106-114: Update slide creation logic
- Add defaults for 11 properties
- Ensure defaults only apply on creation

### Preview Files

**[`app/story-preview/page.tsx`](../../app/story-preview/page.tsx)**
- Lines ~63-69: Update `convertBuilderSlideToStorySlide`
- Preserve all 11 properties during conversion
- Add fallback defaults

### Hook Files

**[`lib/story-builder/hooks/usePreviewSync.ts`](../../lib/story-builder/hooks/usePreviewSync.ts)**
- Verify message payload includes all properties
- Ensure proper serialization
- Maintain debouncing

### Component Files

**[`components/story/Teleprompter/FocalPointIndicator.tsx`](../../components/story/Teleprompter/FocalPointIndicator.tsx)**
- Add `focalPoint` prop (Phase 1)
- Add tooltip (Phase 3)
- Add visual enhancements (Phase 3)

**[`components/story/Teleprompter/TeleprompterContent.tsx`](../../components/story/Teleprompter/TeleprompterContent.tsx)**
- Add 11 optional props
- Apply all settings to rendering
- Handle scroll speed presets

**[`app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx`](../../app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx)**
- Fix initialization (Phase 1)
- Integrate control components (Phase 2)
- Add help text (Phase 3)

### New Component Files (Phase 2)

- `app/story-builder/components/slides/editors/controls/TypographyControls.tsx`
- `app/story-builder/components/slides/editors/controls/DisplayControls.tsx`
- `app/story-builder/components/slides/editors/controls/StylingControls.tsx`
- `app/story-builder/components/slides/editors/controls/LayoutControls.tsx`

### Validation Files

**[`lib/story/validation.ts`](../../lib/story/validation.ts)** (new or extend existing)
- Add clamping functions for all numeric properties
- Add hex color validator
- Add comprehensive validation function

---

## Sign-off Checklist

### Before Starting Implementation

- [ ] Specification reviewed and understood
- [ ] Implementation plan reviewed
- [ ] Development environment set up
- [ ] Test environment verified
- [ ] Branch created from main

### During Implementation

- [ ] Following task order
- [ ] Writing tests first (TDD)
- [ ] Running tests after each change
- [ ] Code reviewed by peer
- [ ] Documentation updated

### Before Merge

- [ ] All tasks complete
- [ ] All tests passing
- [ ] Code coverage ≥95%
- [ ] Manual QA complete
- [ ] Performance acceptable
- [ ] No regressions
- [ ] Documentation complete
- [ ] Changelog updated

---

**Document Version**: 1.0
**Last Updated**: 2026-01-07
**Next Review**: After Phase 1 completion
