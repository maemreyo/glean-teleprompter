---

description: "Task list for Teleprompter Preview Synchronization feature"
---

# Tasks: Teleprompter Preview Synchronization

**Input**: Design documents from `specs/014-teleprompter-preview-sync/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)
**Tests**: Tests are included as this is a critical bug fix feature

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js 14+ application with TypeScript:
- Types: `lib/story/types.ts`, `lib/story-builder/types.ts`
- Components: `app/story-builder/components/`, `components/story/`
- Hooks: `lib/story-builder/hooks/`, `lib/story/hooks/`
- Store: `lib/stores/`, `lib/story-builder/store.ts`
- Tests: `__tests__/unit/`, `__tests__/integration/`, `__tests__/e2e/playwright/`

---

## Phase 1: Setup (Type System Foundation)

**Purpose**: Establish the type system foundation that all user stories depend on

- [x] T001 Add `focalPoint?: number` property to TeleprompterSlide interface in lib/story/types.ts with JSDoc (range: 0-100)
- [x] T002 Add `fontSize?: number` property to TeleprompterSlide interface in lib/story/types.ts with JSDoc (range: 16-72)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core validation utilities and store defaults that MUST be complete before user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create validation utilities in lib/story/validation.ts with clampFocalPoint, clampFontSize functions
- [x] T004 Add default focalPoint: 50 to slide creation in lib/story-builder/store.ts
- [x] T005 Add default fontSize: 24 to slide creation in lib/story-builder/store.ts
- [x] T006 Update convertBuilderSlideToStorySlide in app/story-preview/page.tsx to preserve focalPoint from builderSlide.content.focalPoint
- [x] T007 Update convertBuilderSlideToStorySlide in app/story-preview/page.tsx to preserve fontSize from builderSlide.content.fontSize

**Checkpoint**: Type system foundation and conversion pipeline ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Real-time Focal Point Preview (Priority: P1) 🎯 MVP

**Goal**: Focal point adjustments in builder reflect in preview within 100ms

**Independent Test**: Open story builder with teleprompter slide, adjust focal point slider, verify yellow indicator moves to matching position in preview iframe within 100ms

### Tests for User Story 1

- [x] T008 [P] [US1] Unit test for focalPoint type compilation in __tests__/unit/story/types.test.ts
- [x] T009 [P] [US1] Unit test for clampFocalPoint boundary validation in __tests__/unit/story/validation.test.ts
- [x] T010 [P] [US1] Integration test for builder-to-preview focal point sync in __tests__/integration/story-builder/preview-sync.test.tsx
- [x] T011 [P] [US1] E2E test for focal point real-time preview in __tests__/e2e/playwright/014-teleprompter-preview-sync/focal-point-sync.spec.ts

### Implementation for User Story 1

- [x] T012 [US1] Verify usePreviewSync hook includes focalPoint in postMessage payload in lib/story-builder/hooks/usePreviewSync.ts
- [x] T013 [US1] Add focalPoint prop to FocalPointIndicator component in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T014 [US1] Add optional focalPoint prop to TeleprompterContent component in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T015 [US1] Pass focalPoint from slide data to TeleprompterContent in app/story-preview/page.tsx
- [x] T016 [US1] Apply debouncing (100ms target) to focal point sync in lib/story-builder/hooks/usePreviewSync.ts

**Checkpoint**: Focal point adjustments sync to preview in <100ms - User Story 1 fully functional

---

## Phase 4: User Story 2 - Font Size Preview Synchronization (Priority: P2)

**Goal**: Font size changes in builder reflect in preview within 100ms

**Independent Test**: Adjust font size control in teleprompter slide editor, verify text in preview iframe renders at matching size

### Tests for User Story 2

- [x] T017 [P] [US2] Unit test for fontSize type compilation in __tests__/unit/story/types.test.ts
- [x] T018 [P] [US2] Unit test for clampFontSize boundary validation in __tests__/unit/story/validation.test.ts
- [x] T019 [P] [US2] Integration test for font size preview sync in __tests__/integration/story-builder/preview-sync.test.tsx
- [x] T020 [P] [US2] E2E test for font size preview synchronization in __tests__/e2e/playwright/014-teleprompter-preview-sync/font-size-sync.spec.ts

### Implementation for User Story 2

- [x] T021 [US2] Verify usePreviewSync hook includes fontSize in postMessage payload in lib/story-builder/hooks/usePreviewSync.ts
- [x] T022 [US2] Initialize TeleprompterSlideEditor with fontSize from slide prop in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T023 [US2] Add optional fontSize prop to TeleprompterContent component in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T024 [US2] Pass fontSize from slide data to TeleprompterContent in app/story-preview/page.tsx
- [x] T025 [US2] Apply fontSize to text styling in TeleprompterContent component in components/story/Teleprompter/TeleprompterContent.tsx

**Checkpoint**: Font size changes sync to preview in <100ms - User Story 2 fully functional

---

## Phase 5: User Story 3 - Persistent Settings Across Slide Navigation (Priority: P1)

**Goal**: Settings persist when switching between slides without data loss

**Independent Test**: Create teleprompter slide, set focal point to 60 and fontSize to 30, switch to different slide and back, verify both values persist

### Tests for User Story 3

- [x] T026 [P] [US3] Unit test for store defaults applied on new slide creation in __tests__/unit/story-builder/store.test.ts
- [x] T027 [P] [US3] Integration test for slide navigation persistence in __tests__/integration/story-builder/slide-navigation.test.tsx
- [x] T028 [P] [US3] E2E test for settings persistence across navigation in __tests__/e2e/playwright/014-teleprompter-preview-sync/settings-persistence.spec.ts

### Implementation for User Story 3

- [x] T029 [US3] Verify TeleprompterSlideEditor initializes focalPoint from slide prop in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T030 [US3] Add useEffect to update editor when slide prop changes in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T031 [US3] Ensure values persist to store on change in lib/story-builder/store.ts
- [x] T032 [US3] Verify preview page handles missing values with fallbacks (50, 24) in app/story-preview/page.tsx

**Checkpoint**: Settings persist across slide navigation with zero data loss - User Story 3 fully functional

---

## Phase 6: User Story 4 - Focal Point Indicator Clarity (Priority: P3)

**Goal**: Users understand what the yellow line indicator represents

**Independent Test**: Hover over focal point indicator in builder, verify tooltip appears explaining its purpose

### Tests for User Story 4

- [x] T033 [P] [US4] Unit test for FocalPointIndicator tooltip in __tests__/unit/story/Teleprompter/FocalPointIndicator.test.tsx
- [x] T034 [P] [US4] Accessibility test for tooltip keyboard navigation in __tests__/a11y/story/focal-point-indicator-a11y.test.tsx
- [x] T035 [P] [US4] Visual test for tooltip appearance in __tests__/visual/story/focal-point-indicator-tooltip.test.tsx

### Implementation for User Story 4

- [x] T036 [US4] Add shadcn/ui Tooltip component to FocalPointIndicator in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T037 [US4] Add label prop for dynamic tooltip text in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T038 [US4] Show "Focal Point - Optimal reading area during recording" on hover in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T039 [US4] Show percentage value when adjusting in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T040 [US4] Hide tooltip during playback in components/story/Teleprompter/FocalPointIndicator.tsx

**Checkpoint**: Tooltip provides clear explanation of focal point indicator - User Story 4 fully functional

---

## Phase 7: User Story 5 - Enhanced Teleprompter Settings (Priority: P2)

**Goal**: Comprehensive customization options for typography, display, styling, and layout

**Independent Test**: Adjust each enhanced setting in builder, verify changes reflect in preview within 100ms

### Tests for User Story 5

- [x] T041 [P] [US5] Unit test for enhanced type definitions in __tests__/unit/story/types.test.ts
- [x] T042 [P] [US5] Unit test for enhanced validation functions in __tests__/unit/story/validation.test.ts
- [x] T043 [P] [US5] Integration test for enhanced settings sync in __tests__/integration/story-builder/enhanced-settings-sync.test.tsx
- [x] T044 [P] [US5] E2E test for enhanced teleprompter settings in __tests__/e2e/playwright/014-teleprompter-preview-sync/enhanced-settings.spec.ts

### Implementation for User Story 5 - Type Definitions

- [x] T045 [US5] Add textAlign property to TeleprompterSlide in lib/story/types.ts
- [x] T046 [US5] Add lineHeight property to TeleprompterSlide in lib/story/types.ts
- [x] T047 [US5] Add letterSpacing property to TeleprompterSlide in lib/story/types.ts
- [x] T048 [US5] Add scrollSpeed property to TeleprompterSlide in lib/story/types.ts
- [x] T049 [US5] Add mirrorHorizontal property to TeleprompterSlide in lib/story/types.ts
- [x] T050 [US5] Add mirrorVertical property to TeleprompterSlide in lib/story/types.ts
- [x] T051 [US5] Add backgroundColor property to TeleprompterSlide in lib/story/types.ts
- [x] T052 [US5] Add backgroundOpacity property to TeleprompterSlide in lib/story/types.ts
- [x] T053 [US5] Add safeAreaPadding property to TeleprompterSlide in lib/story/types.ts

### Implementation for User Story 5 - Store Defaults

- [x] T054 [US5] Add textAlign: 'left' default to slide creation in lib/story-builder/store.ts
- [x] T055 [US5] Add lineHeight: 1.4 default to slide creation in lib/story-builder/store.ts
- [x] T056 [US5] Add letterSpacing: 0 default to slide creation in lib/story-builder/store.ts
- [x] T057 [US5] Add scrollSpeed: 'medium' default to slide creation in lib/story-builder/store.ts
- [x] T058 [US5] Add mirrorHorizontal: false default to slide creation in lib/story-builder/store.ts
- [x] T059 [US5] Add mirrorVertical: false default to slide creation in lib/story-builder/store.ts
- [x] T060 [US5] Add backgroundColor: '#000000' default to slide creation in lib/story-builder/store.ts
- [x] T061 [US5] Add backgroundOpacity: 100 default to slide creation in lib/story-builder/store.ts
- [x] T062 [US5] Add safeAreaPadding: {top:0,right:0,bottom:0,left:0} default to slide creation in lib/story-builder/store.ts

### Implementation for User Story 5 - Validation

- [x] T063 [P] [US5] Add clampLineHeight function in lib/story/validation.ts
- [x] T064 [P] [US5] Add clampLetterSpacing function in lib/story/validation.ts
- [x] T065 [P] [US5] Add clampBackgroundOpacity function in lib/story/validation.ts
- [x] T066 [P] [US5] Add clampSafeAreaPadding function in lib/story/validation.ts
- [x] T067 [P] [US5] Add isValidHexColor function in lib/story/validation.ts

### Implementation for User Story 5 - Control Components

- [x] T068 [P] [US5] Create TypographyControls component in app/story-builder/components/slides/editors/controls/TypographyControls.tsx
- [x] T069 [P] [US5] Create DisplayControls component in app/story-builder/components/slides/editors/controls/DisplayControls.tsx
- [x] T070 [P] [US5] Create StylingControls component in app/story-builder/components/slides/editors/controls/StylingControls.tsx
- [x] T071 [P] [US5] Create LayoutControls component in app/story-builder/components/slides/editors/controls/LayoutControls.tsx

### Implementation for User Story 5 - Conversion & Sync

- [x] T072 [US5] Update convertBuilderSlideToStorySlide to preserve all enhanced settings in app/story-preview/page.tsx
- [x] T073 [US5] Verify usePreviewSync includes all enhanced settings in postMessage in lib/story-builder/hooks/usePreviewSync.ts

### Implementation for User Story 5 - Preview Rendering

- [x] T074 [US5] Add textAlign prop and styling to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T075 [US5] Add lineHeight prop and styling to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T076 [US5] Add letterSpacing prop and styling to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T077 [US5] Add scrollSpeed prop and logic to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T078 [US5] Add mirrorHorizontal prop and transform to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T079 [US5] Add mirrorVertical prop and transform to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T080 [US5] Add backgroundColor prop and styling to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T081 [US5] Add backgroundOpacity prop and styling to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx
- [x] T082 [US5] Add safeAreaPadding prop and styling to TeleprompterContent in components/story/Teleprompter/TeleprompterContent.tsx

### Implementation for User Story 5 - Editor Integration

- [x] T083 [US5] Import all control components in TeleprompterSlideEditor in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T084 [US5] Add state for all 9 enhanced settings in TeleprompterSlideEditor in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T085 [US5] Initialize enhanced settings from slide props in TeleprompterSlideEditor in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T086 [US5] Wire up change handlers for all enhanced settings in TeleprompterSlideEditor in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T087 [US5] Organize controls into sections (tabs/accordions) in TeleprompterSlideEditor in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx

**Checkpoint**: All enhanced settings sync to preview in <100ms - User Story 5 fully functional

---

## Phase 8: UX Improvements (User Story 4 Continuation)

**Purpose**: Enhanced visual clarity for focal point indicator

- [x] T088 [P] [US4] Add dashed line style to FocalPointIndicator in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T089 [P] [US4] Add glow effect or animation to FocalPointIndicator in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T090 [P] [US4] Add position label (percentage) when near indicator in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T091 [P] [US4] Ensure contrast with various backgrounds in components/story/Teleprompter/FocalPointIndicator.tsx
- [x] T092 [US4] Add help icon next to focal point slider in TeleprompterSlideEditor in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx
- [x] T093 [US4] Add popover with explanation and diagram in TeleprompterSlideEditor in app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx

**Checkpoint**: Visual indicators clear and user education added

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final testing, documentation, and quality assurance

- [x] T094 [P] Run comprehensive test suite (unit, integration, E2E) with npm test
- [x] T095 [P] Verify 95%+ code coverage for modified files
- [x] T096 [P] Run linting with npm run lint and fix issues
- [x] T097 [P] Verify backward compatibility with existing stories
- [x] T098 [P] Performance test for <100ms sync requirement
- [x] T099 [P] Visual regression tests for all settings combinations
- [x] T100 Update changelog with feature changes
- [x] T101 Update component documentation for new props

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - creates type definitions
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Phase 2 completion
  - User stories can proceed in parallel or sequentially in priority order
  - Priority order: US1 (P1) → US3 (P1) → US2 (P2) → US5 (P2) → US4 (P3)
- **UX Improvements (Phase 8)**: Depends on Phase 4 (US4) foundation
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phases 1-2 - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Phases 1-2 - No dependencies on other stories
- **User Story 3 (P1)**: Depends on Phases 1-2 - No dependencies on other stories
- **User Story 4 (P3)**: Depends on Phases 1-2 - No dependencies on other stories
- **User Story 5 (P2)**: Depends on Phases 1-2 - No dependencies on other stories

### Critical Path

```
Phase 1 (Type Definitions)
  ↓
Phase 2 (Foundational - BLOCKS ALL STORIES)
  ↓
┌─────────┬─────────┬─────────┬─────────┬─────────┐
│ US1 (P1)│ US2 (P2)│ US3 (P1)│ US5 (P2)│ US4 (P3)│
│ Focal   │ Font    │ Persist │Enhanced │ Tooltip │
│ Point   │ Size    │ Settings│ Settings │ Clarity │
└─────────┴─────────┴─────────┴─────────┴─────────┘
  ↓
Phase 8 (UX Improvements - extends US4)
  ↓
Phase 9 (Polish & Testing)
```

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T001, T002 can run in parallel (different properties in same file)

**Within Phase 2 (Foundational)**:
- T003 (validation) can run in parallel with T004-T005 (store defaults)
- T006, T007 (conversion updates) can run in parallel with T003

**Within User Story 1**:
- T008-T011 (tests) can all run in parallel
- T012-T016 (implementation) - T016 depends on T012

**Within User Story 2**:
- T017-T020 (tests) can all run in parallel
- T021-T025 (implementation) - sequential

**Within User Story 3**:
- T026-T028 (tests) can all run in parallel
- T029-T032 (implementation) - sequential

**Within User Story 4**:
- T033-T035 (tests) can all run in parallel
- T036-T040 (implementation) - sequential

**Within User Story 5**:
- T041-T044 (tests) can all run in parallel
- T045-T053 (type definitions) - sequential (same file)
- T054-T062 (store defaults) - sequential (same file)
- T063-T067 (validation) can all run in parallel
- T068-T071 (control components) can all run in parallel
- T074-T082 (preview rendering) - sequential (same file)
- T088-T091 (visual improvements) can run in parallel

**Within Phase 9 (Polish)**:
- T094-T097 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T008: Unit test for focalPoint type compilation
Task T009: Unit test for clampFocalPoint boundary validation
Task T010: Integration test for builder-to-preview focal point sync
Task T011: E2E test for focal point real-time preview

# Run implementation tasks:
Task T012: Verify usePreviewSync includes focalPoint
Task T013: Add focalPoint prop to FocalPointIndicator (parallel with T014)
Task T014: Add optional focalPoint prop to TeleprompterContent
Task T015: Pass focalPoint from slide data (depends on T014)
Task T016: Apply debouncing (depends on T012)
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 3 Only - P1)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T016)
4. Complete Phase 5: User Story 3 (T026-T032)
5. **STOP and VALIDATE**: Test focal point sync and settings persistence independently
6. Deploy/demo critical fixes

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Focal Point) → Test independently → Deploy/Demo (Critical Fix!)
3. Add US3 (Persistence) → Test independently → Deploy/Demo (Critical Fix!)
4. Add US2 (Font Size) → Test independently → Deploy/Demo
5. Add US5 (Enhanced Settings) → Test independently → Deploy/Demo
6. Add US4 (Tooltip Clarity) → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup (Phase 1) + Foundational (Phase 2) together
2. Once Foundational is done:
   - Developer A: US1 (Focal Point) + US3 (Persistence) - Critical path
   - Developer B: US2 (Font Size) + US5 (Enhanced Settings) - Enhanced features
   - Developer C: US4 (Tooltip Clarity) - UX improvements
3. Stories complete and integrate independently

---

## File-by-File Implementation Guide

### Type System Files

**lib/story/types.ts**
- Lines ~119-140: TeleprompterSlide interface
- Add 11 new properties (T001-T002, T045-T053)
- Add JSDoc comments with ranges

### Store Files

**lib/story-builder/store.ts**
- Lines ~106-114: Slide creation logic
- Add defaults for 11 properties (T004-T005, T054-T062)
- Ensure defaults only apply on creation

### Preview Files

**app/story-preview/page.tsx**
- Lines ~63-69: convertBuilderSlideToStorySlide function
- Preserve all 11 properties during conversion (T006-T007, T072)
- Add fallback defaults

### Hook Files

**lib/story-builder/hooks/usePreviewSync.ts**
- Verify message payload includes all properties (T012, T021, T073)
- Ensure proper serialization
- Maintain debouncing (T016)

### Component Files

**components/story/Teleprompter/FocalPointIndicator.tsx**
- Add focalPoint prop (T013)
- Add tooltip (T036-T040)
- Add visual enhancements (T088-T091)

**components/story/Teleprompter/TeleprompterContent.tsx**
- Add 11 optional props (T014, T023, T074-T082)
- Apply all settings to rendering
- Handle scroll speed presets

**app/story-builder/components/slides/editors/TeleprompterSlideEditor.tsx**
- Fix initialization (T022, T029-T032)
- Integrate control components (T083-T087)
- Add help text (T092-T093)

### New Component Files (User Story 5)

- app/story-builder/components/slides/editors/controls/TypographyControls.tsx (T068)
- app/story-builder/components/slides/editors/controls/DisplayControls.tsx (T069)
- app/story-builder/components/slides/editors/controls/StylingControls.tsx (T070)
- app/story-builder/components/slides/editors/controls/LayoutControls.tsx (T071)

### Validation Files

**lib/story/validation.ts** (new or extend existing)
- Add clamping functions for all numeric properties (T003, T063-T067)
- Add hex color validator
- Add comprehensive validation function

---

## Success Criteria Summary

### Quantitative Metrics

- **SC-001**: 95% of focal point adjustments sync within 100ms
- **SC-002**: 95% of font size adjustments sync within 100ms
- **SC-003**: 100% data retention when switching between 10 slides
- **SC-004**: 90% of new users understand focal point indicator (user testing)
- **SC-005**: Zero data loss incidents after implementation
- **SC-006**: Handles 5+ rapid adjustments/second without performance issues
- **SC-007**: 100% backward compatibility with existing stories
- **SC-008**: 95% of enhanced setting adjustments sync within 100ms
- **SC-009**: Creators can customize for mirror hardware
- **SC-010**: Creators can adjust background color/opacity
- **SC-011**: Creators can set safe area padding
- **SC-012**: 100% data retention for enhanced settings
- **SC-013**: 100% backward compatibility for enhanced properties

### Qualitative Metrics

- Improved WYSIWYG experience for teleprompter configuration
- Reduced support tickets for teleprompter preview issues
- Increased usage of enhanced settings (analytics)
- Positive user testing results for UX improvements

---

## Notes

- Tests are included for this critical bug fix feature
- Each user story should be independently completable and testable
- Tasks are numbered sequentially (T001-T101) for easy tracking
- [P] tasks within a story can be done in parallel
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group
- Target: 95%+ test coverage for all modified/new files
- Backward compatibility is critical - all existing stories must continue to work
