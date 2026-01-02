# Tasks: Fix Preview Inconsistency

**Input**: Design documents from `/specs/009-fix-preview/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: This feature requires comprehensive testing per the specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project preparation and initial verification

- [ ] T001 Verify TypeScript 5.3+ strict mode configuration in tsconfig.json
- [ ] T002 Verify required dependencies: React 18.2+, Zustand 4.4+, Jest 29+, React Testing Library 13+
- [ ] T003 [P] Review existing PreviewPanel component at components/teleprompter/editor/PreviewPanel.tsx for reference patterns
- [ ] T004 [P] Review existing FullPreviewDialog component at components/teleprompter/editor/FullPreviewDialog.tsx to understand current implementation
- [ ] T005 [P] Review useContentStore at lib/stores/useContentStore.ts to understand bgUrl state structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core testing infrastructure that MUST be complete before implementation

⚠️ **CRITICAL**: No implementation work can begin until this phase is complete

- [ ] T006 Setup test mocks for useContentStore in __tests__/utils/test-mocks.ts
- [ ] T007 [P] Create ConfigPreviewTestWrapper utility in __tests__/utils/ConfigPreviewTestWrapper.tsx (if not already present)
- [ ] T008 [P] Setup test helpers for preview component testing in __tests__/utils/test-helpers.tsx

**Checkpoint**: Testing infrastructure ready - implementation can now begin

---

## Phase 3: User Story 1 - Consistent Background Preview (Priority: P1) 🎯 MVP

**Goal**: Fix FullPreviewDialog to display background images identical to PreviewPanel

**Independent Test**: Open studio setup mode, upload or select a background image, observe both the inline preview panel and full preview dialog to verify identical background display

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T009 [P] [US1] Unit test for bgUrl store subscription in __tests__/unit/components/FullPreviewDialog.test.tsx
- [ ] T010 [P] [US1] Unit test for background style application with valid bgUrl in __tests__/unit/components/FullPreviewDialog.test.tsx
- [ ] T011 [P] [US1] Unit test for empty bgUrl handling in __tests__/unit/components/FullPreviewDialog.test.tsx
- [ ] T012 [P] [US1] Unit test for null/undefined bgUrl handling in __tests__/unit/components/FullPreviewDialog.test.tsx
- [ ] T013 [P] [US1] Integration test for visual consistency between PreviewPanel and FullPreviewDialog in __tests__/integration/preview-consistency.test.tsx

### Implementation for User Story 1

- [ ] T014 [US1] Add useMemo import to components/teleprompter/editor/FullPreviewDialog.tsx if not already imported
- [ ] T015 [US1] Extract bgUrl from useContentStore in components/teleprompter/editor/FullPreviewDialog.tsx (change: `const { text } = useContentStore()` to `const { text, bgUrl } = useContentStore()`)
- [ ] T016 [US1] Create memoized backgroundStyle using useMemo in components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T017 [US1] Apply backgroundStyle to background div in components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T018 [US1] Verify TypeScript compilation passes for components/teleprompter/editor/FullPreviewDialog.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - both previews show identical backgrounds

---

## Phase 4: User Story 2 - Real-time Preview Updates (Priority: P2)

**Goal**: Ensure both preview modes update immediately when background settings change

**Independent Test**: Change background image settings in studio setup mode and verify both preview panels update to reflect the new background immediately

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T019 [P] [US2] Unit test for bgUrl reactivity in __tests__/unit/components/FullPreviewDialog.test.tsx
- [ ] T020 [P] [US2] Integration test for real-time updates when bgUrl changes in __tests__/integration/preview-consistency.test.tsx
- [ ] T021 [P] [US2] Performance test for 100ms update latency requirement in __tests__/performance/state-sync-performance.test.ts

### Implementation for User Story 2

- [ ] T022 [US2] Verify Zustand reactivity by testing component re-render on bgUrl change in components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T023 [US2] Ensure useMemo dependency array includes bgUrl for proper reactivity in components/teleprompter/editor/FullPreviewDialog.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - previews are consistent AND update in real-time

---

## Phase 5: Edge Cases & Error Handling

**Goal**: Handle edge cases identified in spec.md (invalid URLs, empty states, large images, template switching)

**Independent Test**: Test each edge case scenario manually and verify graceful degradation

### Tests for Edge Cases

- [ ] T024 [P] [EDGE] Unit test for invalid background URL handling in __tests__/unit/components/FullPreviewDialog.test.tsx
- [ ] T025 [P] [EDGE] Unit test for large image loading state in __tests__/unit/components/FullPreviewDialog.test.tsx
- [ ] T026 [P] [EDGE] Integration test for template switching background updates in __tests__/integration/preview-consistency.test.tsx

### Implementation for Edge Cases

- [ ] T027 [EDGE] Add error handling state (hasError) to components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T028 [EDGE] Add loading state (isLoading) to components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T029 [EDGE] Implement handleMediaError callback in components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T030 [EDGE] Implement handleMediaLoad callback in components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T031 [EDGE] Add onError and onLoad handlers to background div in components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T032 [EDGE] Add error indicator UI (subtle "image failed to load" message) to components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T033 [EDGE] Add loading indicator UI to components/teleprompter/editor/FullPreviewDialog.tsx

**Checkpoint**: All edge cases handled gracefully with proper user feedback

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final quality checks

- [ ] T034 [P] Run ESLint on components/teleprompter/editor/FullPreviewDialog.tsx and fix any issues
- [ ] T035 [P] Run TypeScript type checking on components/teleprompter/editor/FullPreviewDialog.tsx
- [ ] T036 [P] Run all unit tests: npm test -- FullPreviewDialog
- [ ] T037 [P] Run all integration tests: npm test -- preview-consistency
- [ ] T038 [P] Run full test suite: npm test && npm run lint
- [ ] T039 [P] Manual testing: Verify default background displays correctly in both previews
- [ ] T040 [P] Manual testing: Verify custom background displays correctly in both previews
- [ ] T041 [P] Manual testing: Verify empty background state works correctly
- [ ] T042 [P] Manual testing: Verify invalid URL shows graceful degradation
- [ ] T043 [P] Manual testing: Verify real-time updates when background changes
- [ ] T044 [P] Manual testing: Verify large images (5MB) load and render correctly
- [ ] T045 [P] Manual testing: Verify template switching updates backgrounds immediately
- [ ] T046 Manual testing: Verify 100ms update latency performance requirement
- [ ] T047 [P] Visual regression testing: Compare screenshots of both preview modes with same configuration
- [ ] T048 [P] Accessibility check: Verify background changes don't affect screen reader experience
- [ ] T049 [P] Verify quickstart.md instructions work as documented
- [ ] T050 Update feature documentation if needed based on implementation learnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion - builds on US1 foundation
- **Edge Cases (Phase 5)**: Depends on User Story 2 completion - enhances core functionality
- **Polish (Phase 6)**: Depends on all implementation phases being complete

### Within Each Phase

**User Story 1 (Phase 3)**:
- Tests (T009-T013) MUST be written and FAIL before implementation (T014-T018)
- Tests can run in parallel (all marked [P])
- Implementation tasks must run sequentially (T014 → T015 → T016 → T017 → T018)

**User Story 2 (Phase 4)**:
- Tests (T019-T021) MUST be written and FAIL before implementation (T022-T023)
- Tests can run in parallel (all marked [P])
- Implementation tasks can run in parallel (both marked [P])

**Edge Cases (Phase 5)**:
- Tests (T024-T026) MUST be written and FAIL before implementation (T027-T033)
- Tests can run in parallel (all marked [P])
- Implementation tasks must run sequentially (state → callbacks → handlers → UI)

### Parallel Opportunities

**Setup (Phase 1)**:
- T003, T004, T005 can all run in parallel (different files, no dependencies)

**Foundational (Phase 2)**:
- T007, T008 can run in parallel (different files)

**User Story 1 Tests**:
- T009, T010, T011, T012, T013 can all run in parallel (all test files)

**User Story 2 Tests**:
- T019, T020, T021 can all run in parallel (all test files)

**Edge Cases Tests**:
- T024, T025, T026 can all run in parallel (all test files)

**Polish (Phase 6)**:
- T034-T045 can all run in parallel (different test scenarios)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008) - CRITICAL
3. Complete Phase 3: User Story 1 (T009-T018)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Manual verification: Both previews show identical backgrounds
6. Deploy/demonstrate if ready

### Incremental Delivery

1. Setup + Foundational → Testing infrastructure ready
2. Add User Story 1 → Test independently → Consistent previews (MVP!)
3. Add User Story 2 → Test independently → Real-time updates
4. Add Edge Cases → Test independently → Robust error handling
5. Polish → Full feature complete with quality assurance

Each phase adds value without breaking previous work.

---

## MVP Scope

### Minimum Viable Product = Phase 1 + Phase 2 + Phase 3 (User Story 1)

**What MVP delivers**:
- FullPreviewDialog displays background images identical to PreviewPanel
- Both preview modes show the same visual output for the same configuration
- Empty/null bgUrl handled correctly
- Core functional requirement (FR-001, FR-002, FR-005) satisfied

**What MVP does NOT include** (deferred to Phase 4+):
- Real-time update verification (User Story 2)
- Edge case handling (invalid URLs, loading states, errors)
- Performance optimization testing
- Full polish and documentation

### Success Criteria for MVP

- SC-001: FullPreviewDialog displays background images identical to PreviewPanel in 100% of test cases
- SC-003: No visual differences detectable between inline preview and full preview dialog
- Manual verification pass for default, custom, and empty background states

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label (US1, US2, EDGE) maps task to specific user story for traceability
- User Story 1 is independently testable and deliverable as MVP
- Tests MUST fail before implementation (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- 100ms update latency is a performance requirement to verify in Phase 6
- This is a minimal-scope bug fix with targeted changes to single component
