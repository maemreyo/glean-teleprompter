# Tasks: Unified State Architecture

**Input**: Design documents from `/specs/007-unified-state-architecture/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as this is a refactoring of existing code with comprehensive test requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a single web application with frontend/backend in monorepo:
- Source code: `lib/stores/`, `components/teleprompter/`, `stores/`
- Tests: `__tests__/unit/`, `__tests__/integration/`, `__tests__/mocks/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create new store files lib/stores/useContentStore.ts and lib/stores/usePlaybackStore.ts
- [ ] T002 Verify existing stores lib/stores/useConfigStore.ts and stores/useUIStore.ts are present
- [ ] T003 Install Radix UI dependencies if not present: @radix-ui/react-dialog, @radix-ui/react-slider
- [ ] T004 Verify Sonner toast library is installed for error notifications

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create useContentStore with state (text, bgUrl, musicUrl, isReadOnly) and actions in lib/stores/useContentStore.ts
- [ ] T006 [P] Create usePlaybackStore with state (isPlaying, currentTime, scrollSpeed) and actions in lib/stores/usePlaybackStore.ts
- [ ] T007 Extend useUIStore with mode property ('setup' | 'running') and setMode action in stores/useUIStore.ts
- [ ] T008 Extend useConfigStore with overlayOpacity property in effects in lib/stores/useConfigStore.ts
- [ ] T009 [P] Create store mock for useContentStore in __tests__/mocks/stores/content-store.mock.ts
- [ ] T010 [P] Create store mock for usePlaybackStore in __tests__/mocks/stores/playback-store.mock.ts
- [ ] T011 Update existing store mocks to remove useTeleprompterStore references with deprecation warnings

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Consistent Visual Preview (Priority: P1) 🎯 MVP

**Goal**: Ensure Editor preview exactly matches Runner display by having both use useConfigStore for styling

**Independent Test**: Configure font size to 60px in Editor, switch to Runner, verify text displays at 60px with identical styling

### Tests for User Story 1

- [ ] T012 [P] [US1] Unit test for useContentStore actions in __tests__/unit/stores/content-store.test.ts
- [ ] T013 [P] [US1] Unit test for usePlaybackStore actions in __tests__/unit/stores/playback-store.test.ts
- [ ] T014 [P] [US1] Integration test for Editor-Runner visual consistency in __tests__/integration/unified-state/visual-consistency.test.tsx
- [ ] T015 [P] [US1] Test state synchronization between Editor and Runner in __tests__/integration/unified-state/state-sync.test.tsx

### Implementation for User Story 1

- [ ] T016 [P] [US1] Update ContentPanel to use useContentStore instead of useTeleprompterStore in components/teleprompter/editor/ContentPanel.tsx
- [ ] T017 [P] [US1] Update PreviewPanel to use useContentStore for content and useConfigStore for styling in components/teleprompter/editor/PreviewPanel.tsx
- [ ] T018 [US1] Update Runner to use useContentStore for content, useConfigStore for styling, usePlaybackStore for playback state, and useUIStore for mode in components/teleprompter/Runner.tsx
- [ ] T019 [US1] Verify TeleprompterText uses useConfigStore for all styling (no changes needed if already correct) in components/teleprompter/display/TeleprompterText.tsx
- [ ] T020 [US1] Update all existing tests that reference useTeleprompterStore to use new store mocks in __tests__/ (update incrementally as code is migrated)
- [ ] T021 [US1] Remove legacy useTeleprompterStore file stores/useTeleprompterStore.ts after all references are migrated

**Checkpoint**: At this point, Editor preview and Runner display should match 100% for all styling properties

---

## Phase 4: User Story 2 - Quick Adjustments in Runner (Priority: P2)

**Goal**: Add Quick Settings panel in Runner for scroll speed, font size, alignment, and background adjustments

**Independent Test**: Start teleprompter in Runner mode, use Quick Settings to adjust settings, verify changes apply immediately and persist in Editor

### Tests for User Story 2

- [ ] T022 [P] [US2] Unit test for QuickSettingsPanel component in __tests__/unit/runner/quick-settings-panel.test.tsx
- [ ] T023 [P] [US2] Integration test for Quick Settings to Editor synchronization in __tests__/integration/runner/quick-settings-sync.test.tsx
- [ ] T024 [P] [US2] Test error handling with toast notifications in __tests__/integration/runner/quick-settings-errors.test.tsx

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create QuickSettingsPanel component with Radix UI Dialog in components/teleprompter/runner/QuickSettingsPanel.tsx
- [ ] T026 [P] [US2] Implement scroll speed slider (adjusts useConfigStore.animations.autoScrollSpeed) in QuickSettingsPanel
- [ ] T027 [P] [US2] Implement font size slider (adjusts useConfigStore.typography.fontSize) in QuickSettingsPanel
- [ ] T028 [P] [US2] Implement alignment buttons (adjusts useConfigStore.layout.textAlign) in QuickSettingsPanel
- [ ] T029 [P] [US2] Implement background URL input (adjusts useContentStore.bgUrl) in QuickSettingsPanel
- [ ] T030 [US2] Add error handling with try/catch blocks and toast notifications using Sonner in QuickSettingsPanel
- [ ] T031 [US2] Add visual indication tracking (modified settings state) in QuickSettingsPanel
- [ ] T032 [US2] Integrate QuickSettingsPanel into Runner component with floating trigger button in components/teleprompter/Runner.tsx

**Checkpoint**: At this point, Users can make quick adjustments in Runner and see changes reflected in Editor within 100ms

---

## Phase 5: User Story 3 - Clean State Architecture (Priority: P3)

**Goal**: Complete removal of useTeleprompterStore and ensure single responsibility for all stores

**Independent Test**: Code review confirms useTeleprompterStore no longer exists, each store has single responsibility

### Tests for User Story 3

- [ ] T033 [P] [US3] Verify all store tests pass with new architecture in __tests__/unit/stores/
- [ ] T034 [P] [US3] Integration test for complete state migration in __tests__/integration/unified-state/complete-migration.test.tsx
- [ ] T035 [P] [US3] Test that no useTeleprompterStore references remain in __tests__/integration/unified-state/no-legacy-references.test.tsx

### Implementation for User Story 3

- [ ] T036 [P] [US3] Search codebase for any remaining useTeleprompterStore imports using grep/search
- [ ] T037 [P] [US3] Update any remaining components that reference useTeleprompterStore
- [ ] T038 [P] [US3] Update any remaining test files that mock useTeleprompterStore
- [ ] T039 [US3] Delete stores/useTeleprompterStore.ts file
- [ ] T040 [US3] Delete __tests__/mocks/stores/teleprompter-store.mock.ts file
- [ ] T041 [US3] Add comments to each store documenting single responsibility in lib/stores/useContentStore.ts, lib/stores/usePlaybackStore.ts, lib/stores/useConfigStore.ts, stores/useUIStore.ts
- [ ] T042 [US3] Run full test suite to ensure 100% pass rate with new architecture

**Checkpoint**: At this point, useTeleprompterStore is completely removed, all stores follow single responsibility principle

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T043 [P] Update feature documentation in specs/007-unified-state-architecture/ with implementation notes
- [ ] T044 [P] Add JSDoc comments to all store actions for better IDE support in lib/stores/
- [ ] T045 [P] Performance optimization: verify state synchronization meets 100ms target in __tests__/performance/state-sync-latency.test.tsx
- [ ] T046 [P] Accessibility audit: ensure QuickSettingsPanel is keyboard navigable with proper ARIA labels
- [ ] T047 Run quickstart.md validation to verify all setup steps work correctly
- [ ] T048 Verify localStorage keys are properly namespaced (teleprompter-content, teleprompter-config, teleprompter-ui-store)
- [ ] T049 Add visual regression tests for Editor-Runner consistency if not already present
- [ ] T050 Final integration test: complete user journey from Editor to Runner and back

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion - No dependencies on other user stories
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (QuickSettingsPanel needs Runner to use new stores)
- **User Story 3 (Phase 5)**: Depends on User Story 1 and 2 completion (cleanup after all migrations done)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 - QuickSettingsPanel requires Runner to be updated with new stores first
- **User Story 3 (P3)**: Depends on User Story 1 and 2 - Complete cleanup requires all migrations to be done

### Within Each User Story

- Tests marked [P] can run in parallel (different test files)
- Implementation tasks marked [P] can run in parallel (different components or independent features)
- Non-parallel tasks have explicit dependencies listed
- Story complete before moving to next priority

### Parallel Opportunities

- **Setup Phase**: All tasks can run in parallel (T001-T004)
- **Foundational Phase**: T006, T009, T010 can run in parallel (different store files and mocks)
- **User Story 1 Tests**: T012-T015 can run in parallel (different test files)
- **User Story 1 Implementation**: T016-T017 can run in parallel (different components)
- **User Story 2 Tests**: T022-T024 can run in parallel (different test files)
- **User Story 2 Implementation**: T026-T029 can run in parallel (different setting controls in same file)
- **User Story 3 Tests**: T033-T035 can run in parallel (different test files)
- **User Story 3 Implementation**: T036-T038 can run in parallel (different file searches/updates)
- **Polish Phase**: T043-T046 can run in parallel (different concerns)

---

## Parallel Example: User Story 2 (Quick Settings)

```bash
# Launch all tests for User Story 2 together:
Task: "Unit test for QuickSettingsPanel component in __tests__/unit/runner/quick-settings-panel.test.tsx"
Task: "Integration test for Quick Settings to Editor synchronization in __tests__/integration/runner/quick-settings-sync.test.tsx"
Task: "Test error handling with toast notifications in __tests__/integration/runner/quick-settings-errors.test.tsx"

# After tests pass, launch setting control implementations together (within QuickSettingsPanel.tsx):
Task: "Implement scroll speed slider in QuickSettingsPanel"
Task: "Implement font size slider in QuickSettingsPanel"
Task: "Implement alignment buttons in QuickSettingsPanel"
Task: "Implement background URL input in QuickSettingsPanel"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T011) - CRITICAL
3. Complete Phase 3: User Story 1 (T012-T021)
4. **STOP and VALIDATE**: Test Editor-Runner visual consistency independently
5. Verify 100% visual match between Editor preview and Runner display

### Incremental Delivery

1. **Foundation**: Complete Setup + Foundational phases → All new stores ready
2. **MVP**: Add User Story 1 → Test visual consistency → Editor and Runner now match perfectly
3. **Enhancement**: Add User Story 2 → Test Quick Settings → Users can adjust settings in Runner
4. **Cleanup**: Add User Story 3 → Test complete migration → Legacy store removed
5. **Polish**: Add Phase 6 → Complete feature with documentation and performance validation

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (all developers)
2. **Once Foundational is done:**
   - **Developer A**: User Story 1 (visual consistency) - T012-T021
   - **Developer B**: Prepare for User Story 2 (research Radix patterns) - waits for US1
3. **After User Story 1 complete:**
   - **Developer A**: User Story 3 (cleanup prep) - T036-T038
   - **Developer B**: User Story 2 (QuickSettingsPanel) - T022-T032
4. **Stories integrate and complete**

---

## Summary

- **Total Tasks**: 50 tasks across 6 phases
- **User Story 1 (P1)**: 10 tasks (4 tests, 6 implementation) - Core visual consistency
- **User Story 2 (P2)**: 11 tasks (3 tests, 8 implementation) - Quick Settings panel
- **User Story 3 (P3)**: 10 tasks (3 tests, 7 implementation) - Architecture cleanup
- **Parallel Opportunities**: 25 tasks marked [P] can run in parallel within their phases
- **Independent Test Criteria**: Each user story has clear independent test criteria defined
- **Suggested MVP Scope**: User Story 1 (visual consistency) provides immediate value - Editor and Runner will match perfectly

### Format Validation

✓ **ALL tasks follow checklist format:**
- Every task starts with `- [ ]` (checkbox)
- Sequential Task IDs (T001-T050)
- [P] marker on parallelizable tasks only
- [Story] label on all user story phase tasks ([US1], [US2], [US3])
- No story labels on Setup, Foundational, or Polish phases
- Every task includes clear description with exact file path

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are optional per spec but included here as this is a refactoring of existing code
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Migration from useTeleprompterStore to new stores should be done incrementally
- Update tests when code they test is migrated to new stores
